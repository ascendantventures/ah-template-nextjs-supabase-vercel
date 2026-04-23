CREATE TABLE IF NOT EXISTS ct_profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  currency    TEXT        NOT NULL DEFAULT 'USD',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ct_profiles_id_idx ON ct_profiles (id);

CREATE OR REPLACE FUNCTION ct_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER ct_profiles_updated_at
  BEFORE UPDATE ON ct_profiles
  FOR EACH ROW EXECUTE FUNCTION ct_set_updated_at();

CREATE OR REPLACE FUNCTION handle_ct_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO ct_profiles (id, display_name, currency)
  VALUES (
    NEW.id,
    split_part(NEW.email, '@', 1),
    'USD'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_ct_auth_user_created ON auth.users;
CREATE TRIGGER on_ct_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_ct_new_user();

CREATE TABLE IF NOT EXISTS ct_holdings (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coin_id         TEXT        NOT NULL,
  coin_symbol     TEXT        NOT NULL,
  coin_name       TEXT        NOT NULL,
  coin_image_url  TEXT,
  quantity        DECIMAL(24,12) NOT NULL DEFAULT 0,
  avg_buy_price   DECIMAL(24,8)  NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ct_holdings_user_coin_unique UNIQUE (user_id, coin_id)
);

CREATE INDEX IF NOT EXISTS ct_holdings_user_id_idx ON ct_holdings (user_id);
CREATE INDEX IF NOT EXISTS ct_holdings_coin_id_idx ON ct_holdings (coin_id);

CREATE TRIGGER ct_holdings_updated_at
  BEFORE UPDATE ON ct_holdings
  FOR EACH ROW EXECUTE FUNCTION ct_set_updated_at();

CREATE TABLE IF NOT EXISTS ct_transactions (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coin_id          TEXT        NOT NULL,
  coin_symbol      TEXT        NOT NULL,
  coin_name        TEXT        NOT NULL,
  coin_image_url   TEXT,
  transaction_type TEXT        NOT NULL
                   CHECK (transaction_type IN ('BUY','SELL','TRANSFER_IN','TRANSFER_OUT')),
  quantity         DECIMAL(24,12) NOT NULL,
  price_per_coin   DECIMAL(24,8)  NOT NULL,
  total_value      DECIMAL(24,8)  NOT NULL,
  fee              DECIMAL(24,8)  NOT NULL DEFAULT 0,
  notes            TEXT,
  transacted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ct_transactions_user_id_idx    ON ct_transactions (user_id);
CREATE INDEX IF NOT EXISTS ct_transactions_coin_id_idx    ON ct_transactions (coin_id);
CREATE INDEX IF NOT EXISTS ct_transactions_transacted_idx ON ct_transactions (transacted_at DESC);
CREATE INDEX IF NOT EXISTS ct_transactions_user_coin_idx  ON ct_transactions (user_id, coin_id);

CREATE TABLE IF NOT EXISTS ct_watchlist (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coin_id        TEXT        NOT NULL,
  coin_symbol    TEXT        NOT NULL,
  coin_name      TEXT        NOT NULL,
  coin_image_url TEXT,
  added_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ct_watchlist_user_coin_unique UNIQUE (user_id, coin_id)
);

CREATE INDEX IF NOT EXISTS ct_watchlist_user_id_idx ON ct_watchlist (user_id);

CREATE TABLE IF NOT EXISTS ct_price_snapshots (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  coin_id          TEXT        NOT NULL,
  price_usd        DECIMAL(24,8)  NOT NULL,
  price_change_24h DECIMAL(10,4),
  market_cap       DECIMAL(30,2),
  volume_24h       DECIMAL(30,2),
  snapped_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ct_price_snapshots_coin_time_idx
  ON ct_price_snapshots (coin_id, snapped_at DESC);

ALTER TABLE ct_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY ct_profiles_select ON ct_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY ct_profiles_insert ON ct_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY ct_profiles_update ON ct_profiles
  FOR UPDATE USING (auth.uid() = id);

ALTER TABLE ct_holdings ENABLE ROW LEVEL SECURITY;

CREATE POLICY ct_holdings_all ON ct_holdings
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

ALTER TABLE ct_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY ct_transactions_all ON ct_transactions
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

ALTER TABLE ct_watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY ct_watchlist_all ON ct_watchlist
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

ALTER TABLE ct_price_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY ct_price_snapshots_select ON ct_price_snapshots
  FOR SELECT USING (auth.role() = 'authenticated');
