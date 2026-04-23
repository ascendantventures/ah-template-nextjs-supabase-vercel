'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useHoldings } from '@/hooks/useHoldings';
import { usePriceStore } from '@/lib/store/priceStore';
import { useLivePrices } from '@/hooks/useLivePrices';
import { formatUSD, formatPercent } from '@/lib/utils/formatters';
import { getChartColor } from '@/lib/utils/chartColors';

interface ChartEntry {
  name: string;
  symbol: string;
  value: number;
  percent: number;
  color: string;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChartEntry }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div
      style={{
        background: '#1e293b',
        border: '1px solid #334155',
        borderRadius: 8,
        padding: '10px 14px',
        fontSize: '0.8rem',
        color: '#f1f5f9',
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{d.name}</div>
      <div style={{ color: '#94a3b8' }}>Value: {formatUSD(d.value)}</div>
      <div style={{ color: '#94a3b8' }}>Allocation: {d.percent.toFixed(2)}%</div>
    </div>
  );
}

function CustomLabel({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  payload,
}: {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  payload: ChartEntry;
}) {
  if (percent < 0.03) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      style={{ fontSize: '0.65rem', fontWeight: 600 }}
    >
      {payload.symbol}
    </text>
  );
}

export function AllocationChart() {
  const { data: holdingsData } = useHoldings();
  const holdings = holdingsData?.holdings || [];
  const prices = usePriceStore((s) => s.prices);
  const coinIds = holdings.map((h) => h.coinId).join(',');
  useLivePrices(coinIds || undefined);

  const entries: ChartEntry[] = holdings
    .map((h, i) => {
      const price = prices[h.coinId]?.usd ?? 0;
      const value = h.quantity * price;
      return { name: h.coinName, symbol: h.coinSymbol, value, percent: 0, color: getChartColor(i) };
    })
    .filter((e) => e.value > 0);

  const total = entries.reduce((s, e) => s + e.value, 0);
  entries.forEach((e) => {
    e.percent = total > 0 ? (e.value / total) * 100 : 0;
  });

  const isEmpty = entries.length === 0 || total === 0;

  return (
    <div
      style={{
        background: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: 12,
        padding: '20px 24px',
      }}
    >
      <h2 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#94a3b8', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Portfolio Allocation
      </h2>

      {isEmpty ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              border: '8px solid #1e293b',
              margin: '0 auto 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: '0.75rem', color: '#475569' }}>No data</span>
          </div>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={entries}
                cx="50%"
                cy="50%"
                innerRadius="58%"
                outerRadius="88%"
                dataKey="value"
                labelLine={false}
                label={(props) => <CustomLabel {...props} />}
              >
                {entries.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px 16px',
              marginTop: 12,
            }}
          >
            {entries.map((e, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{ width: 10, height: 10, borderRadius: '50%', background: e.color, flexShrink: 0 }}
                />
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  {e.symbol} <span style={{ color: '#475569' }}>{e.percent.toFixed(1)}%</span>
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
