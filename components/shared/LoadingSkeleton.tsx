'use client';

interface Props {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className, style }: Props) {
  return (
    <div
      className={`animate-pulse rounded ${className || ''}`}
      style={{ background: '#1e293b', ...style }}
    />
  );
}

export function TableRowSkeleton({ cols = 8 }: { cols?: number }) {
  return (
    <tr style={{ borderBottom: '1px solid #1e293b' }}>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: '12px 16px' }}>
          <Skeleton style={{ height: 16, width: '80%' }} />
        </td>
      ))}
    </tr>
  );
}

export function CardSkeleton() {
  return <Skeleton style={{ height: 96, width: '100%', borderRadius: 12 }} />;
}

export function SparklineSkeleton() {
  return <Skeleton style={{ height: 40, width: 120, borderRadius: 4 }} />;
}
