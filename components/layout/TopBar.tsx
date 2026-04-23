'use client';

import { UserMenu } from './UserMenu';

interface Props {
  email?: string | null;
}

export function TopBar({ email }: Props) {
  return (
    <header
      style={{
        height: 56,
        background: '#0f172a',
        borderBottom: '1px solid #1e293b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 24px',
        position: 'fixed',
        top: 36,
        right: 0,
        left: 220,
        zIndex: 30,
      }}
    >
      <UserMenu email={email} />
    </header>
  );
}
