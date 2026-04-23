'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TrendingUp, Mail, Lock, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        return;
      }
      router.push('/dashboard');
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      setError('Enter your email address first');
      return;
    }
    setMagicLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/dashboard` },
      });
      if (error) {
        setError(error.message);
      } else {
        setMagicSent(true);
      }
    } finally {
      setMagicLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#020617',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div
            style={{
              width: 56,
              height: 56,
              background: '#0052ff',
              borderRadius: 14,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <TrendingUp size={28} color="white" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>
            Welcome back
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Sign in to your portfolio dashboard
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: 16,
            padding: '32px',
          }}
        >
          {magicSent ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <CheckCircle size={40} color="#4ade80" style={{ marginBottom: 16 }} />
              <h2 style={{ color: '#f1f5f9', fontWeight: 600, marginBottom: 8 }}>
                Check your inbox
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                We sent a magic link to <strong style={{ color: '#f1f5f9' }}>{email}</strong>
              </p>
            </div>
          ) : (
            <form onSubmit={handleLogin}>
              {/* Email */}
              <div style={{ marginBottom: 16 }}>
                <label
                  htmlFor="email"
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#94a3b8',
                    marginBottom: 6,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  Email address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={16}
                    color="#475569"
                    style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    style={{
                      width: '100%',
                      height: 44,
                      background: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: 8,
                      padding: '0 12px 0 38px',
                      fontSize: '0.875rem',
                      color: '#f1f5f9',
                      outline: 'none',
                      transition: 'border-color 150ms',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#0052ff';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#334155';
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: 20 }}>
                <label
                  htmlFor="password"
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#94a3b8',
                    marginBottom: 6,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={16}
                    color="#475569"
                    style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      height: 44,
                      background: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: 8,
                      padding: '0 12px 0 38px',
                      fontSize: '0.875rem',
                      color: '#f1f5f9',
                      outline: 'none',
                      transition: 'border-color 150ms',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#0052ff';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#334155';
                    }}
                  />
                </div>
              </div>

              {error && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'rgba(248,113,113,0.1)',
                    border: '1px solid rgba(248,113,113,0.3)',
                    borderRadius: 8,
                    padding: '10px 12px',
                    marginBottom: 16,
                    color: '#f87171',
                    fontSize: '0.875rem',
                  }}
                  role="alert"
                >
                  <AlertCircle size={15} />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  height: 46,
                  background: loading ? '#334155' : '#0052ff',
                  color: 'white',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background 150ms',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  marginBottom: 12,
                }}
                onMouseEnter={(e) => {
                  if (!loading) (e.currentTarget as HTMLButtonElement).style.background = '#578bfa';
                }}
                onMouseLeave={(e) => {
                  if (!loading) (e.currentTarget as HTMLButtonElement).style.background = '#0052ff';
                }}
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? 'Signing in…' : 'Sign in'}
              </button>

              <button
                type="button"
                onClick={handleMagicLink}
                disabled={magicLoading}
                style={{
                  width: '100%',
                  height: 44,
                  background: 'transparent',
                  color: '#94a3b8',
                  border: '1px solid #334155',
                  borderRadius: 10,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: magicLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 150ms',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
                onMouseEnter={(e) => {
                  if (!magicLoading) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = '#475569';
                    (e.currentTarget as HTMLButtonElement).style.color = '#f1f5f9';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!magicLoading) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = '#334155';
                    (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8';
                  }
                }}
              >
                {magicLoading && <Loader2 size={14} className="animate-spin" />}
                <Mail size={14} />
                {magicLoading ? 'Sending…' : 'Send magic link'}
              </button>
            </form>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, color: '#94a3b8', fontSize: '0.875rem' }}>
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            style={{ color: '#0052ff', fontWeight: 600, textDecoration: 'none' }}
            onMouseEnter={(e) => ((e.target as HTMLAnchorElement).style.color = '#578bfa')}
            onMouseLeave={(e) => ((e.target as HTMLAnchorElement).style.color = '#0052ff')}
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
