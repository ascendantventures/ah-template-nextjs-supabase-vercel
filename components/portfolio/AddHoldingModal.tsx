'use client';

import { useState, useCallback } from 'react';
import { useAddHolding } from '@/hooks/useHoldings';
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

export function AddHoldingModal({ open, onClose, prefill }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CoinResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<CoinResult | null>(prefill || null);
  const [quantity, setQuantity] = useState('');
  const [avgBuyPrice, setAvgBuyPrice] = useState('');
  const [error, setError] = useState('');

  const addHolding = useAddHolding();

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

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    search(e.target.value);
  };

  const selectCoin = (coin: CoinResult) => {
    setSelected(coin);
    setQuery('');
    setResults([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) { setError('Select a coin'); return; }
    const qty = parseFloat(quantity);
    const price = parseFloat(avgBuyPrice);
    if (isNaN(qty) || qty <= 0) { setError('Enter a valid quantity'); return; }
    if (isNaN(price) || price < 0) { setError('Enter a valid price'); return; }

    setError('');
    try {
      await addHolding.mutateAsync({
        coinId: selected.id,
        coinSymbol: selected.symbol,
        coinName: selected.name,
        coinImageUrl: selected.thumb,
        quantity: qty,
        avgBuyPrice: price,
      });
      handleClose();
    } catch {
      setError('Failed to add holding. Please try again.');
    }
  };

  const handleClose = () => {
    setQuery('');
    setResults([]);
    setSelected(null);
    setQuantity('');
    setAvgBuyPrice('');
    setError('');
    onClose();
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
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(2,6,23,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Add holding"
        style={{
          background: '#0f172a',
          border: '1px solid #334155',
          borderRadius: 16,
          padding: 28,
          width: '100%',
          maxWidth: 480,
          maxHeight: '90vh',
          overflow: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1.1rem' }}>Add Holding</h2>
          <button
            onClick={handleClose}
            aria-label="Close"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4, borderRadius: 6 }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Coin search */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Coin
            </label>
            {selected ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '8px 12px' }}>
                <CoinIcon src={selected.thumb} alt={selected.name} size={28} />
                <div>
                  <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.875rem' }}>{selected.name}</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{selected.symbol}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  style={{ marginLeft: 'auto', background: 'transparent', border: 'none', cursor: 'pointer', color: '#475569' }}
                  aria-label="Change coin"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                <Search size={15} color="#475569" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  value={query}
                  onChange={handleQueryChange}
                  placeholder="Search Bitcoin, ETH..."
                  style={{ ...inputStyle, paddingLeft: 32 }}
                  onFocus={(e) => { e.target.style.borderColor = '#0052ff'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#334155'; }}
                />
                {searching && <Loader2 size={14} color="#475569" className="animate-spin" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }} />}
                {results.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#1e293b', border: '1px solid #334155', borderRadius: 8, marginTop: 4, maxHeight: 200, overflow: 'auto', zIndex: 10 }}>
                    {results.map((coin) => (
                      <button
                        key={coin.id}
                        type="button"
                        onClick={() => selectCoin(coin)}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 150ms', minHeight: 44 }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#263245'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                      >
                        <CoinIcon src={coin.thumb} alt={coin.name} size={24} />
                        <div>
                          <div style={{ color: '#f1f5f9', fontSize: '0.85rem', fontWeight: 600 }}>{coin.name}</div>
                          <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{coin.symbol}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quantity */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Quantity
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0.00"
              min="0"
              step="any"
              required
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = '#0052ff'; }}
              onBlur={(e) => { e.target.style.borderColor = '#334155'; }}
            />
          </div>

          {/* Avg Buy Price */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Avg Buy Price (USD)
            </label>
            <input
              type="number"
              value={avgBuyPrice}
              onChange={(e) => setAvgBuyPrice(e.target.value)}
              placeholder="0.00"
              min="0"
              step="any"
              required
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = '#0052ff'; }}
              onBlur={(e) => { e.target.style.borderColor = '#334155'; }}
            />
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, padding: '10px 12px', marginBottom: 16, color: '#f87171', fontSize: '0.875rem' }} role="alert">
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={handleClose}
              style={{ flex: 1, height: 44, background: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: 8, cursor: 'pointer', fontSize: '0.875rem', transition: 'all 150ms' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#475569'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#334155'; }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addHolding.isPending}
              style={{ flex: 2, height: 44, background: addHolding.isPending ? '#334155' : '#0052ff', color: 'white', border: 'none', borderRadius: 8, cursor: addHolding.isPending ? 'not-allowed' : 'pointer', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 150ms' }}
              onMouseEnter={(e) => { if (!addHolding.isPending) (e.currentTarget as HTMLButtonElement).style.background = '#578bfa'; }}
              onMouseLeave={(e) => { if (!addHolding.isPending) (e.currentTarget as HTMLButtonElement).style.background = '#0052ff'; }}
            >
              {addHolding.isPending && <Loader2 size={14} className="animate-spin" />}
              {addHolding.isPending ? 'Adding…' : 'Add Holding'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
