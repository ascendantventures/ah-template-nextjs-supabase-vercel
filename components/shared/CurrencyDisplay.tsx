'use client';

import { formatUSD } from '@/lib/utils/formatters';

interface Props {
  value: number;
  className?: string;
  compact?: boolean;
}

export function CurrencyDisplay({ value, className, compact }: Props) {
  return (
    <span
      className={className}
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      {formatUSD(value, compact)}
    </span>
  );
}
