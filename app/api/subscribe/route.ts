export const runtime = 'nodejs'; // PATTERN 20: Next.js 16+ with Supabase needs nodejs runtime

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createHash } from 'crypto';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { checkRateLimit } from '@/lib/rate-limiter';

// ── Request validation schema ───────────────────────────────────────────────
const subscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
  source: z.enum(['hero', 'cta_section']).default('cta_section'),
});

// ── Resend welcome email (fire-and-forget) ──────────────────────────────────
function sendWelcomeEmail(email: string): void {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!resendApiKey || !fromEmail) return;

  // Dynamic import for fire-and-forget
  import('resend')
    .then(({ Resend }) => {
      const resend = new Resend(resendApiKey);
      return resend.emails.send({
        from: fromEmail,
        to: email,
        subject: "Welcome to Quill — You're on the list!",
        html: `
          <!DOCTYPE html>
          <html>
            <head><meta charset="utf-8"><title>Welcome to Quill</title></head>
            <body style="font-family: Georgia, serif; background: #0E0D0B; color: #F2EDE4; padding: 40px 20px; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #F2EDE4; font-size: 28px; margin-bottom: 16px;">Welcome to Quill ✍️</h1>
              <p style="color: #B5AD9E; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
                You're on the early access list! We'll notify you as soon as Quill is ready for you.
              </p>
              <p style="color: #B5AD9E; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                In the meantime, get ready to write smarter and publish faster.
              </p>
              <p style="color: #7A7265; font-size: 14px;">
                — The Quill team
              </p>
            </body>
          </html>
        `,
      });
    })
    .catch((err) => {
      console.error('[Quill] Welcome email failed (non-blocking):', err);
    });
}

// ── POST /api/subscribe ─────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  // 1. Extract client IP
  const forwarded = request.headers.get('x-forwarded-for');
  const rawIp = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';

  // 2. Rate limiting — 5 requests per 60 seconds per IP
  const isAllowed = checkRateLimit(rawIp, 5, 60_000);
  if (!isAllowed) {
    return NextResponse.json(
      { success: false, message: 'Too many requests' },
      { status: 429 }
    );
  }

  // 3. Parse and validate request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid request body' },
      { status: 400 }
    );
  }

  const parsed = subscribeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: 'Invalid email address' },
      { status: 422 }
    );
  }

  const { email, source } = parsed.data;

  // 4. Hash IP for abuse review (privacy-preserving)
  const ipHash = createHash('sha256').update(rawIp).digest('hex');

  // 5. Upsert into Supabase — ignoreDuplicates handles the 409 case
  const { error, data } = await supabaseAdmin
    .from('quill_email_signups')
    .upsert(
      { email, source, ip_hash: ipHash },
      { onConflict: 'email', ignoreDuplicates: true }
    )
    .select('id');

  if (error) {
    console.error('[Quill] Supabase upsert error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }

  // 6. If no rows returned → email already existed (duplicate ignored)
  if (!data || data.length === 0) {
    return NextResponse.json(
      { success: false, message: 'Already subscribed' },
      { status: 409 }
    );
  }

  // 7. Send welcome email (fire-and-forget — does not block response)
  sendWelcomeEmail(email);

  // 8. Return success
  return NextResponse.json(
    { success: true, message: 'Subscribed!' },
    { status: 200 }
  );
}
