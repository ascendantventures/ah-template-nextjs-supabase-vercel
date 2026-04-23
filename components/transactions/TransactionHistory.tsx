'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTransactions, useDeleteTransaction, type TransactionFilters } from '@/hooks/useTransactions';
import { formatUSD, formatQuantity, formatDate } from '@/lib/utils/formatters';
import { CoinIcon } from '@/components/shared/CoinIcon';
import { TableRowSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { AddTransactionModal } from './AddTransactionModal';
import { Plus, Trash2, Download, ArrowLeftRight, ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { CTTransaction } from '@/types/database';

const TX_TYPE_COLORS: Record<string, string> = {
  BUY: '#4ade80',
  SELL: '#f87171',
  TRANSFER_IN: '#94a3b8',
  TRANSFER_OUT: '#94a3b8',
};

const TX_TYPE_BG: Record<string, string> = {
  BUY: 'rgba(74,222,128,0.1)',
  SELL: 'rgba(248,113,113,0.1)',
  TRANSFER_IN: 'rgba(148,163,184,0.1)',
  TRANSFER_OUT: 'rgba(148,163,184,0.1)',
};

function TxTypeBadge({ type }: { type: string }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 4,
      fontSize: '0.7rem',
      fontWeight: 700,
      letterSpacing: '0.06em',
      background: TX_TYPE_BG[type] || 'rgba(148,163,184,0.1)',
      color: TX_TYPE_COLORS[type] || '#94a3b8',
    }}>
      {type.replace('_', ' ')}
    </span>
  );
}

export function TransactionHistory() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial filter values from URL
  const [coinFilter, setCoinFilter] = useState(searchParams.get('coinId') || '');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || '');
  const [fromFilter, setFromFilter] = useState(searchParams.get('from') || '');
  const [toFilter, setToFilter] = useState(searchParams.get('to') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [showAddModal, setShowAddModal] = useState(false);

  const LIMIT = 25;

  const filters: TransactionFilters = {
    coinId: searchParams.get('coinId') || undefined,
    type: searchParams.get('type') || undefined,
    from: searchParams.get('from') || undefined,
    to: searchParams.get('to') || undefined,
    page: parseInt(searchParams.get('page') || '1'),
    limit: LIMIT,
  };

  const { data, isLoading } = useTransactions(filters);
  const deleteTx = useDeleteTransaction();
  const transactions = data?.transactions || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / LIMIT);
  const currentPage = filters.page || 1;

  const updateURL = useCallback((updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, val] of Object.entries(updates)) {
      if (val) {
        params.set(key, val);
      } else {
        params.delete(key);
      }
    }
    router.push(`/transactions?${params.toString()}`, { scroll: false });
  }, [searchParams, router]);

  const applyFilters = () => {
    updateURL({
      coinId: coinFilter || undefined,
      type: typeFilter || undefined,
      from: fromFilter || undefined,
      to: toFilter || undefined,
      page: '1',
    });
  };

  const clearFilters = () => {
    setCoinFilter(''); setTypeFilter(''); setFromFilter(''); setToFilter('');
    router.push('/transactions', { scroll: false });
  };

  const handlePageChange = (newPage: number) => {
    updateURL({ page: String(newPage) });
  };

  const hasActiveFilters = !!(filters.coinId || filters.type || filters.from || filters.to);

  const handleExport = async () => {
    const params = new URLSearchParams();
    if (filters.coinId) params.set('coinId', filters.coinId);
    if (filters.type) params.set('type', filters.type);
    if (filters.from) params.set('from', filters.from);
    if (filters.to) params.set('to', filters.to);
    const res = await fetch(`/api/transactions/export?${params}`);
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ct-transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const inputStyle: React.CSSProperties = {
    height: 36,
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: 6,
    padding: '0 10px',
    fontSize: '0.8rem',
    color: '#f1f5f9',
    outline: 'none',
  };

  return (
    <>
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Transactions {total > 0 && <span style={{ color: '#475569' }}>({total})</span>}
          </h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleExport}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: 8, cursor: 'pointer', fontSize: '0.8rem', minHeight: 36, transition: 'all 150ms' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#475569'; (e.currentTarget as HTMLButtonElement).style.color = '#f1f5f9'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#334155'; (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8'; }}
              aria-label="Export CSV">
              <Download size={14} /> Export CSV
            </button>
            <button onClick={() => setShowAddModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#0052ff', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, minHeight: 36 }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#578bfa'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#0052ff'; }}>
              <Plus size={15} /> Add Transaction
            </button>
          </div>
        </div>

        {/* Filters */}
        <div style={{ padding: '12px 24px', borderBottom: '1px solid #1e293b', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Coin ID (e.g. bitcoin)"
            value={coinFilter}
            onChange={(e) => setCoinFilter(e.target.value)}
            style={{ ...inputStyle, width: 160 }}
            onFocus={(e) => { e.target.style.borderColor = '#0052ff'; }}
            onBlur={(e) => { e.target.style.borderColor = '#334155'; }}
          />
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
            style={{ ...inputStyle, width: 130, cursor: 'pointer', colorScheme: 'dark' }}>
            <option value="">All Types</option>
            <option value="BUY">BUY</option>
            <option value="SELL">SELL</option>
            <option value="TRANSFER_IN">TRANSFER IN</option>
            <option value="TRANSFER_OUT">TRANSFER OUT</option>
          </select>
          <input type="date" value={fromFilter} onChange={(e) => setFromFilter(e.target.value)}
            style={{ ...inputStyle, width: 140, colorScheme: 'dark' }}
            onFocus={(e) => { e.target.style.borderColor = '#0052ff'; }}
            onBlur={(e) => { e.target.style.borderColor = '#334155'; }} />
          <span style={{ color: '#475569', fontSize: '0.8rem' }}>to</span>
          <input type="date" value={toFilter} onChange={(e) => setToFilter(e.target.value)}
            style={{ ...inputStyle, width: 140, colorScheme: 'dark' }}
            onFocus={(e) => { e.target.style.borderColor = '#0052ff'; }}
            onBlur={(e) => { e.target.style.borderColor = '#334155'; }} />
          <button onClick={applyFilters}
            style={{ height: 36, padding: '0 16px', background: '#0052ff', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, minHeight: 36 }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#578bfa'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#0052ff'; }}>
            Apply
          </button>
          {hasActiveFilters && (
            <button onClick={clearFilters}
              style={{ height: 36, padding: '0 12px', background: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}>
              <X size={12} /> Clear
            </button>
          )}
        </div>

        {isLoading ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>{Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={9} />)}</tbody>
          </table>
        ) : transactions.length === 0 ? (
          hasActiveFilters ? (
            <EmptyState
              icon={ArrowLeftRight}
              title="No matching transactions"
              description="Try adjusting your filters or date range."
              action={
                <button onClick={clearFilters}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: 8, cursor: 'pointer', fontSize: '0.875rem' }}>
                  <X size={14} /> Clear Filters
                </button>
              }
            />
          ) : (
            <EmptyState
              icon={ArrowLeftRight}
              title="No transactions recorded"
              description="Log your buy and sell transactions to track cost basis and calculate profit & loss."
              action={
                <button onClick={() => setShowAddModal(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: '#0052ff', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
                  <Plus size={16} /> Add Transaction
                </button>
              }
            />
          )
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1e293b' }}>
                  {['Date', 'Type', 'Coin', 'Quantity', 'Price/Coin', 'Total', 'Fee', 'Notes', ''].map((h) => (
                    <th key={h} style={{ padding: '12px 16px', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#475569', textAlign: h === '' ? 'center' : 'left', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx: CTTransaction) => (
                  <tr key={tx.id}
                    style={{ borderBottom: '1px solid #1e293b', borderLeft: `2px solid ${TX_TYPE_COLORS[tx.transactionType] || '#334155'}`, transition: 'background 150ms' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = '#1e293b40'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}>
                    <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{formatDate(tx.transactedAt)}</td>
                    <td style={{ padding: '12px 16px' }}><TxTypeBadge type={tx.transactionType} /></td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CoinIcon src={tx.coinImageUrl} alt={tx.coinName} size={24} />
                        <div>
                          <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.8rem' }}>{tx.coinName}</div>
                          <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>{tx.coinSymbol}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', color: '#94a3b8', textAlign: 'right' }}>{formatQuantity(tx.quantity)}</td>
                    <td style={{ padding: '12px 16px', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', color: '#f1f5f9', textAlign: 'right' }}>{formatUSD(tx.pricePerCoin)}</td>
                    <td style={{ padding: '12px 16px', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', color: '#f1f5f9', fontWeight: 600, textAlign: 'right' }}>{formatUSD(tx.totalValue)}</td>
                    <td style={{ padding: '12px 16px', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', color: '#475569', textAlign: 'right' }}>{formatUSD(tx.fee)}</td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#94a3b8', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.notes || '—'}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <button onClick={() => { if (confirm('Delete this transaction?')) deleteTx.mutate(tx.id); }}
                        aria-label="Delete transaction"
                        style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid transparent', borderRadius: 6, cursor: 'pointer', color: '#475569', transition: 'all 150ms' }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(248,113,113,0.3)'; (e.currentTarget as HTMLButtonElement).style.color = '#f87171'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#475569'; }}>
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: '#475569' }}>
              Showing {((currentPage - 1) * LIMIT) + 1}–{Math.min(currentPage * LIMIT, total)} of {total}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
                style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid #334155', borderRadius: 6, cursor: currentPage <= 1 ? 'not-allowed' : 'pointer', color: currentPage <= 1 ? '#334155' : '#94a3b8', transition: 'all 150ms' }}
                aria-label="Previous page">
                <ChevronLeft size={14} />
              </button>
              <span style={{ display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: '0.8rem', color: '#94a3b8' }}>
                {currentPage} / {totalPages}
              </span>
              <button onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages}
                style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid #334155', borderRadius: 6, cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer', color: currentPage >= totalPages ? '#334155' : '#94a3b8', transition: 'all 150ms' }}
                aria-label="Next page">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      <AddTransactionModal open={showAddModal} onClose={() => setShowAddModal(false)} />
    </>
  );
}
