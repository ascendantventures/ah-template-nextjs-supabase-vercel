'use client';

import { useState, useCallback } from 'react';
import { useAddToWatchlist } from '@/hooks/useWatchlist';
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
}

export function AddToWatchlistModal({ open, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CoinResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const addToWatchlist = useAddToWatchlist();

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

  const handleAdd = async (coin: CoinResult) => {
    setError('');
    try {
      await addToWatchlist.mutateAsync({ coinId: coin.id, coinSymbol: coin.symbol, coinName: coin.name, coinImageUrl: coin.thumb });
      onClose();
      setQuery('');
      setResults([]);
    } catch {
      setError('Failed to add. Try again.');
    }
  };

  const handleClose = () => {
    setQuery(''); setResults([]); setError('');
    onClose();
  };

  if (!open) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
      <div role="dialog" aria-modal="true" aria-label="Add to watchlist"
        style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 16, padding: 28, width: '100%', maxWidth: 440 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1.1rem' }}>Add to Watchlist</h2>
          <button onClick={handleClose} aria-label="Close" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
        </div>

        <div style={{ position: 'relative', marginBottom: 16 }}>
          <Search size={15} color="#475569" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); search(e.target.value); }}
            placeholder="Search Bitcoin, Ethereum..."
            autoFocus
            style={{ width: '100%', height: 44, background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '0 12px 0 34px', fontSize: '0.875rem', color: '#f1f5f9', outline: 'none', boxSizing: 'border-box' }}
            onFocus={(e) => { e.target.style.borderColor = '#0052ff'; }}
            onBlur={(e) => { e.target.style.borderColor = '#334155'; }}
          />
          {searching && <Loader2 size={14} color="#475569" className="animate-spin" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }} />}
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, padding: '10px 12px', marginBottom: 12, color: '#f87171', fontSize: '0.875rem' }} role="alert">
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <div style={{ maxHeight: 320, overflow: 'auto' }}>
          {results.length === 0 && query && !searching && (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#475569', fontSize: '0.875rem' }}>No coins found for &ldquo;{query}&rdquo;</div>
          )}
          {results.map((coin) => (
            <button key={coin.id} onClick={() => handleAdd(coin)} disabled={addToWatchlist.isPending}
              style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 8, textAlign: 'left', transition: 'background 150ms', minHeight: 56 }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#1e293b'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}>
              <CoinIcon src={coin.thumb} alt={coin.name} size={32} />
              <div style={{ flex: 1 }}>
                <div style={{ color: '#f1f5f9', fontWeight: 600 }}>{coin.name}</div>
                <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{coin.symbol}</div>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#0052ff', fontWeight: 600 }}>+ Add</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
