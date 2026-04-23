'use client';

import { useState } from 'react';
import { useWatchlist, useRemoveFromWatchlist } from '@/hooks/useWatchlist';
import { useHoldings } from '@/hooks/useHoldings';
import { usePriceStore } from '@/lib/store/priceStore';
import { useLivePrices } from '@/hooks/useLivePrices';
import { formatUSD } from '@/lib/utils/formatters';
import { CoinIcon } from '@/components/shared/CoinIcon';
import { PriceChange } from '@/components/shared/PriceChange';
import { PriceSparkline } from '@/components/shared/PriceSparkline';
import { EmptyState } from '@/components/shared/EmptyState';
import { TableRowSkeleton } from '@/components/shared/LoadingSkeleton';
import { AddToWatchlistModal } from './AddToWatchlistModal';
import { AddHoldingModal } from '@/components/portfolio/AddHoldingModal';
import { Plus, Trash2, Eye, ShoppingCart } from 'lucide-react';

function formatMarketCap(value: number | undefined): string {
  if (!value) return '—';
  if (value >= 1_000_000_000_000) return `$${(value / 1_000_000_000_000).toFixed(2)}T`;
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  return formatUSD(value);
}

export function WatchlistTable() {
  const { data, isLoading } = useWatchlist();
  const { data: holdingsData } = useHoldings();
  const removeFromWatchlist = useRemoveFromWatchlist();
  const prices = usePriceStore((s) => s.prices);
  const [showAddModal, setShowAddModal] = useState(false);
  const [buyPrefill, setBuyPrefill] = useState<{ id: string; name: string; symbol: string; thumb: string } | null>(null);

  const watchlist = data?.watchlist || [];
  const holdingCoinIds = new Set(holdingsData?.holdings?.map((h) => h.coinId) || []);

  const coinIds = watchlist.map((w) => w.coinId).join(',');
  useLivePrices(coinIds || undefined);

  return (
    <>
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Watchlist {watchlist.length > 0 && <span style={{ color: '#475569' }}>({watchlist.length})</span>}
          </h2>
          <button onClick={() => setShowAddModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#0052ff', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, minHeight: 36 }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#578bfa'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#0052ff'; }}>
            <Plus size={15} /> Add Coin
          </button>
        </div>

        {isLoading ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>{Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} cols={8} />)}</tbody>
          </table>
        ) : watchlist.length === 0 ? (
          <EmptyState
            icon={Eye}
            title="Your watchlist is empty"
            description="Add coins you're interested in to monitor their prices and trends before investing."
            action={
              <button onClick={() => setShowAddModal(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: '#0052ff', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
                <Plus size={16} /> Add Coin
              </button>
            }
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 820 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1e293b' }}>
                  {[
                    { label: 'Coin', align: 'left' },
                    { label: 'Price', align: 'right' },
                    { label: '24h Change', align: 'right' },
                    { label: '7-Day', align: 'left' },
                    { label: 'Market Cap', align: 'right' },
                    { label: '24h Volume', align: 'right' },
                    { label: 'Status', align: 'left' },
                    { label: '', align: 'right' },
                  ].map(({ label, align }) => (
                    <th key={label} style={{ padding: '12px 16px', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#475569', textAlign: align as 'left' | 'right', whiteSpace: 'nowrap' }}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {watchlist.map((item) => {
                  const price = prices[item.coinId];
                  const inPortfolio = holdingCoinIds.has(item.coinId);
                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid #1e293b', transition: 'background 150ms' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = '#1e293b40'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}>
                      {/* Coin */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <CoinIcon src={item.coinImageUrl} alt={item.coinName} size={28} />
                          <div>
                            <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.875rem' }}>{item.coinName}</div>
                            <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{item.coinSymbol}</div>
                          </div>
                        </div>
                      </td>
                      {/* Price */}
                      <td style={{ padding: '12px 16px', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.875rem', color: '#f1f5f9', textAlign: 'right' }}>
                        {price ? formatUSD(price.usd) : <span style={{ color: '#475569' }}>—</span>}
                      </td>
                      {/* 24h Change */}
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        {price ? <PriceChange value={price.usd_24h_change} /> : <span style={{ color: '#475569', fontSize: '0.875rem' }}>—</span>}
                      </td>
                      {/* 7-Day Sparkline */}
                      <td style={{ padding: '8px 16px' }}>
                        <PriceSparkline coinId={item.coinId} width={100} height={36} />
                      </td>
                      {/* Market Cap */}
                      <td style={{ padding: '12px 16px', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', color: '#94a3b8', textAlign: 'right' }}>
                        {formatMarketCap(price?.usd_market_cap)}
                      </td>
                      {/* 24h Volume */}
                      <td style={{ padding: '12px 16px', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', color: '#94a3b8', textAlign: 'right' }}>
                        {formatMarketCap(price?.usd_24h_vol)}
                      </td>
                      {/* Status */}
                      <td style={{ padding: '12px 16px' }}>
                        {inPortfolio && (
                          <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 700, background: 'rgba(0,82,255,0.15)', color: '#60a5fa', border: '1px solid rgba(0,82,255,0.3)', whiteSpace: 'nowrap' }}>
                            In Portfolio
                          </span>
                        )}
                      </td>
                      {/* Actions */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => setBuyPrefill({ id: item.coinId, name: item.coinName, symbol: item.coinSymbol, thumb: item.coinImageUrl || '' })}
                            aria-label={`Buy ${item.coinName}`}
                            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', background: 'rgba(0,82,255,0.15)', color: '#60a5fa', border: '1px solid rgba(0,82,255,0.3)', borderRadius: 6, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, minHeight: 32, transition: 'all 150ms' }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,82,255,0.25)'; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,82,255,0.15)'; }}>
                            <ShoppingCart size={12} /> Buy
                          </button>
                          <button onClick={() => { if (confirm(`Remove ${item.coinName} from watchlist?`)) removeFromWatchlist.mutate(item.id); }}
                            aria-label={`Remove ${item.coinName} from watchlist`}
                            style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid transparent', borderRadius: 6, cursor: 'pointer', color: '#475569', transition: 'all 150ms' }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(248,113,113,0.3)'; (e.currentTarget as HTMLButtonElement).style.color = '#f87171'; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#475569'; }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddToWatchlistModal open={showAddModal} onClose={() => setShowAddModal(false)} />
      {buyPrefill && (
        <AddHoldingModal open={!!buyPrefill} onClose={() => setBuyPrefill(null)} prefill={buyPrefill} />
      )}
    </>
  );
}
