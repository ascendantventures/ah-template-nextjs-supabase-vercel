'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  Star,
  TrendingUp,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/portfolio', label: 'Portfolio', icon: Wallet },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/watchlist', label: 'Watchlist', icon: Star },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: 220,
        minWidth: 220,
        background: '#0f172a',
        borderRight: '1px solid #1e293b',
        display: 'flex',
        flexDirection: 'column',
        padding: '0',
        height: '100%',
        position: 'fixed',
        left: 0,
        top: 36,
        bottom: 0,
        zIndex: 40,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            background: '#0052ff',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <TrendingUp size={18} color="white" />
        </div>
        <span style={{ fontWeight: 700, fontSize: '1rem', color: '#f1f5f9' }}>
          CryptoTrack
        </span>
      </div>

      {/* Nav links */}
      <nav style={{ padding: '12px 0', flex: 1 }} aria-label="Main navigation">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 20px',
                color: isActive ? '#f1f5f9' : '#94a3b8',
                background: isActive ? '#1e293b' : 'transparent',
                borderLeft: isActive ? '2px solid #0052ff' : '2px solid transparent',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: isActive ? 600 : 400,
                transition: 'all 150ms ease-out',
                minHeight: 44,
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLAnchorElement).style.color = '#f1f5f9';
                  (e.currentTarget as HTMLAnchorElement).style.background = '#1e293b80';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLAnchorElement).style.color = '#94a3b8';
                  (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                }
              }}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
