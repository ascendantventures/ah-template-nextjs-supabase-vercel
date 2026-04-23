export const dynamic = 'force-dynamic';
import { unstable_noStore as noStore } from 'next/cache';
import { WatchlistTable } from '@/components/watchlist/WatchlistTable';

export default function WatchlistPage() {
  noStore();
  return (
    <div className="page-enter">
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 24 }}>
        Watchlist
      </h1>
      <WatchlistTable />
    </div>
  );
}
