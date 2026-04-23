'use client';

import { useState } from 'react';
import { useHoldings, useDeleteHolding } from '@/hooks/useHoldings';
import { usePriceStore } from '@/lib/store/priceStore';
import { useLivePrices } from '@/hooks/useLivePrices';
import { calcPnl } from '@/lib/utils/calculations';
import { formatUSD, formatQuantity, formatPercent } from '@/lib/utils/formatters';
import { CoinIcon } from '@/components/shared/CoinIcon';
import { PriceChange } from '@/components/shared/PriceChange';
import { PriceSparkline } from '@/components/shared/PriceSparkline';
import { SortableHeader } from '@/components/shared/SortableHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { TableRowSkeleton } from '@/components/shared/LoadingSkeleton';
import { AddHoldingModal } from './AddHoldingModal';
import { EditHoldingModal } from './EditHoldingModal';
import { AddTransactionModal } from '@/components/transactions/AddTransactionModal';
import { Pencil, Trash2, ChevronDown, ChevronRight, Plus, Wallet } from 'lucide-react';
import type { CTHolding } from '@/types/database';

type SortKey = 'coinName' | 'currentPrice' | 'change24h' | 'quantity' | 'currentValue' | 'avgBuyPrice' | 'pnlAmount' | 'pnlPercent';

type EnrichedHolding = CTHolding & {
  currentPrice: number;
  change24h: number;
  currentValue: number;
  pnlAmount: number;
  pnlPercent: number;
};

function ExpandedRow({ holding, onAddTx }: { holding: EnrichedHolding; onAddTx: () => void }) {
  return (
    <tr style={{ background: '#0a1628' }}>
      <td colSpan={11} style={{ padding: '16px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>7-Day Chart (Expanded)</div>
            <PriceSparkline coinId={holding.coinId} width={240} height={80} />
          </div>
          <button
            onClick={onAddTx}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#0052ff', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, minHeight: 36 }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#578bfa'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#0052ff'; }}
          >
            <Plus size={14} /> Add Transaction
          </button>
        </div>
      </td>
    </tr>
  );
}

interface Props {
  compact?: boolean;
}

export function HoldingsTable({ compact = false }: Props) {
  const { data, isLoading } = useHoldings();
  const holdings = data?.holdings || [];
  const prices = usePriceStore((s) => s.prices);
  const flashMap = usePriceStore((s) => s.flashMap);
  const deleteHolding = useDeleteHolding();

  const coinIds = holdings.map((h) => h.coinId).join(',');
  useLivePrices(coinIds || undefined);

  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'currentValue', dir: 'desc' });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editHolding, setEditHolding] = useState<CTHolding | null>(null);
  const [addTxForCoin, setAddTxForCoin] = useState<EnrichedHolding | null>(null);

  const handleSort = (key: string) => {
    setSort((prev) =>
      prev.key === key
        ? { key: key as SortKey, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key: key as SortKey, dir: 'desc' }
    );
  };

  const enriched: EnrichedHolding[] = holdings.map((h) => {
    const price = prices[h.coinId];
    const currentPrice = price?.usd ?? 0;
    const change24h = price?.usd_24h_change ?? 0;
    const { currentValue, pnlAmount, pnlPercent } = calcPnl(h.quantity, h.avgBuyPrice, currentPrice);
    return { ...h, currentPrice, change24h, currentValue, pnlAmount, pnlPercent };
  });

  const sorted = [...enriched].sort((a, b) => {
    const mul = sort.dir === 'asc' ? 1 : -1;
    const av = a[sort.key as keyof typeof a];
    const bv = b[sort.key as keyof typeof b];
    if (typeof av === 'string' && typeof bv === 'string') return mul * av.localeCompare(bv);
    return mul * ((av as number) - (bv as number));
  });

  const displayHoldings = compact ? sorted.slice(0, 5) : sorted;

  return (
    <>
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Holdings {holdings.length > 0 && <span style={{ color: '#475569' }}>({holdings.length})</span>}
          </h2>
          {!compact && (
            <button
              onClick={() => setShowAddModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#0052ff', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, minHeight: 36 }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#578bfa'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#0052ff'; }}
            >
              <Plus size={15} /> Add Holding
            </button>
          )}
        </div>

        {isLoading ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>{Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} cols={11} />)}</tbody>
          </table>
        ) : holdings.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="No holdings yet"
            description="Add your first cryptocurrency holding to start tracking your portfolio."
            action={
              <button
                onClick={() => setShowAddModal(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: '#0052ff', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}
              >
                <Plus size={16} /> Add your first holding
              </button>
            }
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1e293b' }}>
                  <th style={{ width: 32, padding: '12px 8px' }} />
                  <SortableHeader label="Coin" sortKey="coinName" currentSort={sort} onSort={handleSort} />
                  <SortableHeader label="Price" sortKey="currentPrice" currentSort={sort} onSort={handleSort} align="right" />
                  <SortableHeader label="24h" sortKey="change24h" currentSort={sort} onSort={handleSort} align="right" />
                  <SortableHeader label="Amount" sortKey="quantity" currentSort={sort} onSort={handleSort} align="right" />
                  <SortableHeader label="Value" sortKey="currentValue" currentSort={sort} onSort={handleSort} align="right" />
                  <SortableHeader label="Avg Buy" sortKey="avgBuyPrice" currentSort={sort} onSort={handleSort} align="right" />
                  <SortableHeader label="P&L ($)" sortKey="pnlAmount" currentSort={sort} onSort={handleSort} align="right" />
                  <SortableHeader label="P&L %" sortKey="pnlPercent" currentSort={sort} onSort={handleSort} align="right" />
                  {!compact && (
                    <th style={{ padding: '12px 16px', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#475569', whiteSpace: 'nowrap' }}>
                      7d
                    </th>
                  )}
                  {!compact && <th style={{ padding: '12px 16px', width: 80 }} />}
                </tr>
              </thead>
              <tbody>
                {displayHoldings.map((h) => {
                  const flash = flashMap[h.coinId];
                  const isExpanded = expandedId === h.id;
                  const pnlPos = h.pnlAmount > 0;
                  const pnlNeg = h.pnlAmount < 0;

                  return (
                    <>
                      <tr
                        key={h.id}
                        className={flash === 'up' ? 'price-flash-gain' : flash === 'down' ? 'price-flash-loss' : ''}
                        style={{
                          borderBottom: isExpanded ? 'none' : '1px solid #1e293b',
                          cursor: 'pointer',
                          transition: 'background 150ms',
                        }}
                        onClick={() => setExpandedId(isExpanded ? null : h.id)}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = '#1e293b40'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}
                      >
                        {/* Expand toggle */}
                        <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                          {isExpanded ? <ChevronDown size={14} color="#94a3b8" /> : <ChevronRight size={14} color="#475569" />}
                        </td>
                        {/* Coin */}
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <CoinIcon src={h.coinImageUrl} alt={h.coinName} size={28} />
                            <div>
                              <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.875rem' }}>{h.coinName}</div>
                              <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{h.coinSymbol}</div>
                            </div>
                          </div>
                        </td>
                        {/* Price */}
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.875rem', color: '#f1f5f9' }}>
                          {formatUSD(h.currentPrice)}
                        </td>
                        {/* 24h */}
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <PriceChange value={h.change24h} />
                        </td>
                        {/* Amount */}
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.875rem', color: '#94a3b8' }}>
                          {formatQuantity(h.quantity)}
                        </td>
                        {/* Value */}
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.875rem', color: '#f1f5f9', fontWeight: 600 }}>
                          {formatUSD(h.currentValue)}
                        </td>
                        {/* Avg Buy */}
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.875rem', color: '#94a3b8' }}>
                          {formatUSD(h.avgBuyPrice)}
                        </td>
                        {/* P&L $ */}
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.875rem', color: pnlPos ? '#4ade80' : pnlNeg ? '#f87171' : '#94a3b8' }}>
                          {pnlPos ? '+' : ''}{formatUSD(h.pnlAmount)}
                        </td>
                        {/* P&L % */}
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <PriceChange value={h.pnlPercent} showIcon={false} />
                        </td>
                        {/* 7d Sparkline */}
                        {!compact && (
                          <td style={{ padding: '8px 16px' }} onClick={(e) => e.stopPropagation()}>
                            <PriceSparkline coinId={h.coinId} width={120} height={40} />
                          </td>
                        )}
                        {/* Actions */}
                        {!compact && (
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', gap: 4 }} onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => setEditHolding(h)}
                                aria-label={`Edit ${h.coinName}`}
                                style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid transparent', borderRadius: 6, cursor: 'pointer', color: '#475569', transition: 'all 150ms' }}
                                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#334155'; (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8'; }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#475569'; }}
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                onClick={() => { if (confirm(`Delete ${h.coinName} holding?`)) deleteHolding.mutate(h.id); }}
                                aria-label={`Delete ${h.coinName}`}
                                style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid transparent', borderRadius: 6, cursor: 'pointer', color: '#475569', transition: 'all 150ms' }}
                                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(248,113,113,0.3)'; (e.currentTarget as HTMLButtonElement).style.color = '#f87171'; }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#475569'; }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                      {isExpanded && (
                        <ExpandedRow
                          key={`${h.id}-expanded`}
                          holding={h}
                          onAddTx={() => setAddTxForCoin(h)}
                        />
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddHoldingModal open={showAddModal} onClose={() => setShowAddModal(false)} />
      <EditHoldingModal open={!!editHolding} onClose={() => setEditHolding(null)} holding={editHolding} />
      {addTxForCoin && (
        <AddTransactionModal
          open={true}
          onClose={() => setAddTxForCoin(null)}
          prefill={{ id: addTxForCoin.coinId, name: addTxForCoin.coinName, symbol: addTxForCoin.coinSymbol, thumb: addTxForCoin.coinImageUrl || '' }}
        />
      )}
    </>
  );
}
