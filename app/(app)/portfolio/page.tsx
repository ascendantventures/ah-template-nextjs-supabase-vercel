export const dynamic = 'force-dynamic';
import { unstable_noStore as noStore } from 'next/cache';
import { HoldingsTable } from '@/components/portfolio/HoldingsTable';

export default function PortfolioPage() {
  noStore();
  return (
    <div className="page-enter">
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 24 }}>
        Portfolio
      </h1>
      <HoldingsTable />
    </div>
  );
}
