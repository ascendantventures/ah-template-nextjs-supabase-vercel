export const dynamic = 'force-dynamic';
import { unstable_noStore as noStore } from 'next/cache';
import { Suspense } from 'react';
import { TransactionHistory } from '@/components/transactions/TransactionHistory';

function TransactionSkeleton() {
  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 24, height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: '#475569', fontSize: '0.875rem' }}>Loading transactions…</span>
    </div>
  );
}

export default function TransactionsPage() {
  noStore();
  return (
    <div className="page-enter">
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 24 }}>
        Transaction History
      </h1>
      <Suspense fallback={<TransactionSkeleton />}>
        <TransactionHistory />
      </Suspense>
    </div>
  );
}
