'use client';

import { TrendingUp, LucideIcon } from 'lucide-react';

interface Props {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon = TrendingUp, title, description, action }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 16px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: '#1e293b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}
      >
        <Icon size={28} color="#94a3b8" />
      </div>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#f1f5f9', marginBottom: 8 }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.875rem', color: '#94a3b8', maxWidth: 280, marginBottom: 24 }}>
        {description}
      </p>
      {action}
    </div>
  );
}
