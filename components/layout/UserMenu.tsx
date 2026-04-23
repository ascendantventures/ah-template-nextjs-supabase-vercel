'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User, LogOut, ChevronDown } from 'lucide-react';

interface Props {
  email?: string | null;
}

export function UserMenu({ email }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const initials = email ? email.slice(0, 2).toUpperCase() : '??';

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="User menu"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'transparent',
          border: '1px solid #334155',
          borderRadius: 8,
          padding: '6px 12px',
          cursor: 'pointer',
          color: '#f1f5f9',
          transition: 'all 150ms ease-out',
          minHeight: 44,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = '#475569';
          (e.currentTarget as HTMLButtonElement).style.background = '#1e293b';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = '#334155';
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            background: '#0052ff',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.7rem',
            fontWeight: 700,
            color: 'white',
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
        <span style={{ fontSize: '0.85rem', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {email || 'User'}
        </span>
        <ChevronDown size={14} color="#94a3b8" />
      </button>

      {open && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 49 }}
            onClick={() => setOpen(false)}
          />
          <div
            role="menu"
            style={{
              position: 'absolute',
              right: 0,
              top: '100%',
              marginTop: 6,
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 10,
              minWidth: 180,
              zIndex: 50,
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '8px 0' }}>
              <div
                style={{
                  padding: '8px 14px',
                  fontSize: '0.75rem',
                  color: '#475569',
                  borderBottom: '1px solid #334155',
                  marginBottom: 4,
                }}
              >
                {email}
              </div>
              <button
                role="menuitem"
                onClick={handleSignOut}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  padding: '10px 14px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#f87171',
                  fontSize: '0.875rem',
                  textAlign: 'left',
                  transition: 'background 150ms ease-out',
                  minHeight: 44,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#334155';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                }}
              >
                <LogOut size={15} />
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
