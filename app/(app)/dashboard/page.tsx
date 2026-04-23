export const dynamic = 'force-dynamic';
import { unstable_noStore as noStore } from 'next/cache';
import { PortfolioSummary } from '@/components/dashboard/PortfolioSummary';
import { AllocationChart } from '@/components/dashboard/AllocationChart';
import { HoldingsTable } from '@/components/portfolio/HoldingsTable';

export default function DashboardPage() {
  noStore();
  return (
    <div className="page-enter">
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 24 }}>
        Dashboard
      </h1>

      {/* Portfolio stats */}
      <PortfolioSummary />

      {/* Chart + Holdings in 2-col */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '360px 1fr',
          gap: 20,
          marginBottom: 24,
          alignItems: 'start',
        }}
      >
        <AllocationChart />
        <HoldingsTable compact />
      </div>
    </div>
  );
}
