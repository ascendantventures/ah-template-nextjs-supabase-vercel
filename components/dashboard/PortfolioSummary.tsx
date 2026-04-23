'use client';

import { useHoldings } from '@/hooks/useHoldings';
import { usePortfolioStats } from '@/hooks/usePortfolioStats';
import { formatUSD, formatPercent } from '@/lib/utils/formatters';
import { TrendingUp, TrendingDown, DollarSign, BarChart2 } from 'lucide-react';
import { useLivePrices } from '@/hooks/useLivePrices';

function StatCard({
  label,
  value,
  sub,
  isPositive,
  isNegative,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  isPositive?: boolean;
  isNegative?: boolean;
  icon?: React.ComponentType<{ size: number; color: string }>;
}) {
  const valueColor = isPositive ? '#4ade80' : isNegative ? '#f87171' : '#f1f5f9';

  return (
    <div
      style={{
        background: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: 12,
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </span>
        {Icon && <Icon size={16} color="#475569" />}
      </div>
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '1.5rem',
          fontWeight: 600,
          color: valueColor,
          lineHeight: 1.2,
        }}
      >
        {value}
      </span>
      {sub && (
        <span
          style={{
            fontSize: '0.8rem',
            color: isPositive ? '#4ade80' : isNegative ? '#f87171' : '#94a3b8',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {sub}
        </span>
      )}
    </div>
  );
}

export function PortfolioSummary() {
  const { data: holdingsData } = useHoldings();
  const holdings = holdingsData?.holdings;

  // Ensure prices are loaded for held coins
  const coinIds = holdings?.map((h) => h.coinId).join(',') || '';
  useLivePrices(coinIds || undefined);

  const stats = usePortfolioStats(holdings);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 24,
      }}
    >
      <StatCard
        label="Total Portfolio Value"
        value={formatUSD(stats.totalValue)}
        icon={DollarSign}
      />
      <StatCard
        label="24h Change"
        value={formatUSD(stats.change24hAmount)}
        sub={formatPercent(stats.change24hPercent)}
        isPositive={stats.change24hAmount > 0}
        isNegative={stats.change24hAmount < 0}
        icon={stats.change24hAmount >= 0 ? TrendingUp : TrendingDown}
      />
      <StatCard
        label="Total Cost Basis"
        value={formatUSD(stats.totalCost)}
        icon={BarChart2}
      />
      <StatCard
        label="Total P&L"
        value={formatUSD(stats.totalPnl)}
        sub={formatPercent(stats.totalPnlPercent)}
        isPositive={stats.totalPnl > 0}
        isNegative={stats.totalPnl < 0}
        icon={stats.totalPnl >= 0 ? TrendingUp : TrendingDown}
      />
    </div>
  );
}
