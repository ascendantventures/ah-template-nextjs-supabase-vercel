'use client';

import { useState, type FormEvent } from 'react';
import { Loader2, Mail } from 'lucide-react';

type Status = 'idle' | 'loading' | 'success' | 'duplicate' | 'error';

export default function CTASection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === 'loading') return;

    setStatus('loading');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'cta_section' }),
      });

      if (res.ok) {
        setStatus('success');
      } else if (res.status === 409) {
        setStatus('duplicate');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  return (
    <section
      id="signup"
      className="py-24 px-6 relative overflow-hidden bg-[#0E0D0B]"
      aria-labelledby="cta-heading"
    >
      {/* Subtle background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(99,102,241,0.12) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        {/* Heading */}
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium">
          <Mail className="w-4 h-4" aria-hidden="true" />
          Early Access
        </div>

        <h2
          id="cta-heading"
          className="font-bold text-white tracking-tight mb-4"
          style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            letterSpacing: '-0.02em',
          }}
        >
          Start writing smarter today
        </h2>
        <p
          className="text-white/60 text-lg mb-10 leading-relaxed font-editorial"
          style={{ fontFamily: "'Newsreader', 'Georgia', serif" }}
        >
          Join thousands of writers who have already unlocked the power of AI.
          Free to start — no credit card required.
        </p>

        {/* Form or success state */}
        {status === 'success' ? (
          <div
            className="flex flex-col items-center gap-3 py-6"
            role="status"
            aria-live="polite"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-2xl">
              🎉
            </div>
            <p className="text-lg font-semibold text-white">You&apos;re on the list!</p>
            <p className="text-white/60">Check your inbox for a welcome message.</p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="w-full"
            noValidate
            aria-label="Email signup form"
          >
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <label htmlFor="signup-email" className="sr-only">
                Email address
              </label>
              <input
                id="signup-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                disabled={status === 'loading'}
                className="flex-1 px-5 py-4 text-base bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:border-transparent transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed min-h-[52px]"
                autoComplete="email"
                aria-required="true"
                aria-describedby={
                  status === 'duplicate' || status === 'error' ? 'signup-message' : undefined
                }
              />
              <button
                type="submit"
                disabled={status === 'loading' || !email}
                className="sm:whitespace-nowrap flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0E0D0B] disabled:opacity-50 disabled:cursor-not-allowed min-h-[52px] shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 disabled:shadow-none"
                aria-label={status === 'loading' ? 'Submitting...' : 'Get early access'}
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    Submitting...
                  </>
                ) : (
                  'Get Early Access'
                )}
              </button>
            </div>

            {/* Status messages */}
            {status === 'duplicate' && (
              <p
                id="signup-message"
                className="mt-3 text-sm text-amber-400"
                role="alert"
                aria-live="polite"
              >
                You&apos;re already signed up! Check your inbox.
              </p>
            )}
            {status === 'error' && (
              <p
                id="signup-message"
                className="mt-3 text-sm text-red-400"
                role="alert"
                aria-live="polite"
              >
                Something went wrong. Please try again.
              </p>
            )}
          </form>
        )}

        <p className="mt-6 text-xs text-white/30">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </div>
    </section>
  );
}
