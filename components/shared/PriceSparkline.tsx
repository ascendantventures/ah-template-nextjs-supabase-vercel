'use client';

import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { useSparkline } from '@/hooks/useSparkline';
import { SparklineSkeleton } from './LoadingSkeleton';

interface Props {
  coinId: string;
  width?: number;
  height?: number;
}

export function PriceSparkline({ coinId, width = 120, height = 40 }: Props) {
  const { data, isLoading, isError } = useSparkline(coinId);

  if (isLoading) return <SparklineSkeleton />;
  if (isError || !data || data.length < 2) {
    return (
      <div
        style={{
          width,
          height,
          opacity: 0.3,
          background: '#1e293b',
          borderRadius: 4,
        }}
      />
    );
  }

  const chartData = data.map(([, price]) => ({ price }));
  const isUp = data[data.length - 1][1] >= data[0][1];
  const color = isUp ? '#4ade80' : '#f87171';
  const gradientId = `sg-${coinId.replace(/[^a-zA-Z0-9]/g, '_')}`;

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#${gradientId})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
