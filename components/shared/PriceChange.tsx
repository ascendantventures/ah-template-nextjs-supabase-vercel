'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatPercent } from '@/lib/utils/formatters';

interface Props {
  value: number;
  className?: string;
  showIcon?: boolean;
}

export function PriceChange({ value, className, showIcon = true }: Props) {
  const isPositive = value > 0;
  const isNegative = value < 0;
  const color = isPositive ? '#4ade80' : isNegative ? '#f87171' : '#94a3b8';
  const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        color,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.875rem',
      }}
    >
      {showIcon && <Icon size={13} />}
      {formatPercent(value)}
    </span>
  );
}
