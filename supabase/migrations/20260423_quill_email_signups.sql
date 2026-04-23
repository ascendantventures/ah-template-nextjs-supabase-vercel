CREATE TABLE IF NOT EXISTS public.quill_email_signups (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT          NOT NULL UNIQUE,
  source        TEXT          NOT NULL DEFAULT 'cta_section'
                              CHECK (source IN ('hero', 'cta_section')),
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
  confirmed_at  TIMESTAMPTZ,
  metadata      JSONB         NOT NULL DEFAULT '{}',
  ip_hash       TEXT
);

CREATE INDEX IF NOT EXISTS idx_quill_email_signups_created_at
  ON public.quill_email_signups (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_quill_email_signups_ip_hash
  ON public.quill_email_signups (ip_hash)
  WHERE ip_hash IS NOT NULL;

ALTER TABLE public.quill_email_signups ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'quill_email_signups'
      AND policyname = 'quill_signup_insert_anon'
  ) THEN
    EXECUTE 'CREATE POLICY quill_signup_insert_anon
      ON public.quill_email_signups
      FOR INSERT
      TO anon
      WITH CHECK (true)';
  END IF;
END
$$;
