'use client';

import { useState, useCallback } from 'react';
import { useAddTransaction } from '@/hooks/useTransactions';
import { Search, X, Loader2, AlertCircle } from 'lucide-react';
import { CoinIcon } from '@/components/shared/CoinIcon';

interface CoinResult {
  id: string;
  name: string;
  symbol: string;
  thumb: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  prefill?: CoinResult | null;
}

const TX_TYPES = ['BUY', 'SELL', 'TRANSFER_IN', 'TRANSFER_OUT'] as const;

export function AddTransactionModal({ open, onClose, prefill }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CoinResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<CoinResult | null>(prefill || null);
  const [txType, setTxType] = useState<string>('BUY');
  const [quantity, setQuantity] = useState('');
  const [pricePerCoin, setPricePerCoin] = useState('');
  const [fee, setFee] = useState('0');
  const [notes, setNotes] = useState('');
  const [transactedAt, setTransactedAt] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');

  const addTx = useAddTransaction();

  const totalValue =
    parseFloat(quantity) > 0 && parseFloat(pricePerCoin) > 0
      ? (parseFloat(quantity) * parseFloat(pricePerCoin)).toFixed(2)
      : '—';

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`/api/coins/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.coins || []);
      }
    } finally {
      setSearching(false);
    }
  }, []);

  const handleClose = () => {
    setQuery(''); setResults([]); setSelected(null);
    setTxType('BUY'); setQuantity(''); setPricePerCoin('');
    setFee('0'); setNotes('');
    setTransactedAt(new Date().toISOString().split('T')[0]);
    setError('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) { setError('Select a coin'); return; }
    const qty = parseFloat(quantity);
    const price = parseFloat(pricePerCoin);
    if (isNaN(qty) || qty <= 0) { setError('Enter a valid quantity'); return; }
    if (isNaN(price) || price < 0) { setError('Enter a valid price'); return; }
    setError('');
    try {
      await addTx.mutateAsync({
        coinId: selected.id,
        coinSymbol: selected.symbol,
        coinName: selected.name,
        coinImageUrl: selected.thumb,
        transactionType: txType,
        quantity: qty,
        pricePerCoin: price,
        fee: parseFloat(fee) || 0,
        notes: notes || undefined,
        transactedAt: new Date(transactedAt).toISOString(),
      });
      handleClose();
    } catch {
      setError('Failed to add transaction. Please try again.');
    }
  };

  if (!open) return null;

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: 42,
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: 8,
    padding: '0 12px',
    fontSize: '0.875rem',
    color: '#f1f5f9',
    outline: 'none',
    transition: 'border-color 150ms',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
      <div role="dialog" aria-modal="true" aria-label="Add transaction"
        style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 16, padding: 28, width: '100%', maxWidth: 520, maxHeight: '90vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1.1rem' }}>Add Transaction</h2>
          <button onClick={handleClose} aria-label="Close" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Coin */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Coin</label>
            {selected ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '8px 12px' }}>
                <CoinIcon src={selected.thumb} alt={selected.name} size={26} />
                <div>
                  <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.875rem' }}>{selected.name}</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{selected.symbol}</div>
                </div>
                <button type="button" onClick={() => setSelected(null)} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', cursor: 'pointer', color: '#475569' }} aria-label="Change coin"><X size={14} /></button>
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                <Search size={15} color="#475569" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
                <input type="text" value={query} onChange={(e) => { setQuery(e.target.value); search(e.target.value); }} placeholder="Search coin..." style={{ ...inputStyle, paddingLeft: 32 }}
                  onFocus={(e) => { e.target.style.borderColor = '#0052ff'; }} onBlur={(e) => { e.target.style.borderColor = '#334155'; }} />
                {searching && <Loader2 size={14} color="#475569" className="animate-spin" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }} />}
                {results.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#1e293b', border: '1px solid #334155', borderRadius: 8, marginTop: 4, maxHeight: 180, overflow: 'auto', zIndex: 10 }}>
                    {results.map((coin) => (
                      <button key={coin.id} type="button" onClick={() => { setSelected(coin); setQuery(''); setResults([]); }}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 12px', background: 'transparent', border: 'none', cursor: 'pointer', minHeight: 40 }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#263245'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}>
                        <CoinIcon src={coin.thumb} alt={coin.name} size={22} />
                        <div>
                          <div style={{ color: '#f1f5f9', fontSize: '0.8rem', fontWeight: 600 }}>{coin.name}</div>
                          <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>{coin.symbol}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Type */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Type</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {TX_TYPES.map((t) => (
                <button key={t} type="button" onClick={() => setTxType(t)}
                  style={{ flex: 1, height: 38, borderRadius: 6, border: txType === t ? '1px solid #0052ff' : '1px solid #334155', background: txType === t ? 'rgba(0,82,255,0.15)' : 'transparent', color: txType === t ? '#60a5fa' : '#94a3b8', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'all 150ms' }}>
                  {t.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Grid: qty + price */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Quantity</label>
              <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="0.00" min="0" step="any" required style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = '#0052ff'; }} onBlur={(e) => { e.target.style.borderColor = '#334155'; }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Price / Coin (USD)</label>
              <input type="number" value={pricePerCoin} onChange={(e) => setPricePerCoin(e.target.value)} placeholder="0.00" min="0" step="any" required style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = '#0052ff'; }} onBlur={(e) => { e.target.style.borderColor = '#334155'; }} />
            </div>
          </div>

          {/* Total auto */}
          <div style={{ background: '#1e293b', borderRadius: 8, padding: '10px 12px', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Total</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: '#f1f5f9', fontSize: '0.9rem' }}>
              {totalValue !== '—' ? `$${totalValue}` : '—'}
            </span>
          </div>

          {/* Grid: fee + date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Fee (USD)</label>
              <input type="number" value={fee} onChange={(e) => setFee(e.target.value)} placeholder="0.00" min="0" step="any" style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = '#0052ff'; }} onBlur={(e) => { e.target.style.borderColor = '#334155'; }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Date</label>
              <input type="date" value={transactedAt} onChange={(e) => setTransactedAt(e.target.value)} required style={{ ...inputStyle, colorScheme: 'dark' }}
                onFocus={(e) => { e.target.style.borderColor = '#0052ff'; }} onBlur={(e) => { e.target.style.borderColor = '#334155'; }} />
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Notes (optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Bought on Coinbase..." rows={2}
              style={{ ...inputStyle, height: 'auto', padding: '10px 12px', resize: 'vertical' }}
              onFocus={(e) => { e.target.style.borderColor = '#0052ff'; }} onBlur={(e) => { e.target.style.borderColor = '#334155'; }} />
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, padding: '10px 12px', marginBottom: 16, color: '#f87171', fontSize: '0.875rem' }} role="alert">
              <AlertCircle size={15} /> {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={handleClose} style={{ flex: 1, height: 44, background: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: 8, cursor: 'pointer', fontSize: '0.875rem' }}>
              Cancel
            </button>
            <button type="submit" disabled={addTx.isPending}
              style={{ flex: 2, height: 44, background: addTx.isPending ? '#334155' : '#0052ff', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              onMouseEnter={(e) => { if (!addTx.isPending) (e.currentTarget as HTMLButtonElement).style.background = '#578bfa'; }}
              onMouseLeave={(e) => { if (!addTx.isPending) (e.currentTarget as HTMLButtonElement).style.background = '#0052ff'; }}>
              {addTx.isPending && <Loader2 size={14} className="animate-spin" />}
              {addTx.isPending ? 'Adding…' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
