'use client';

import { useState } from 'react';
import { useUpdateHolding } from '@/hooks/useHoldings';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { CoinIcon } from '@/components/shared/CoinIcon';
import type { CTHolding } from '@/types/database';

interface Props {
  open: boolean;
  onClose: () => void;
  holding: CTHolding | null;
}

export function EditHoldingModal({ open, onClose, holding }: Props) {
  const [quantity, setQuantity] = useState(holding ? String(holding.quantity) : '');
  const [avgBuyPrice, setAvgBuyPrice] = useState(holding ? String(holding.avgBuyPrice) : '');
  const [error, setError] = useState('');
  const updateHolding = useUpdateHolding();

  // Sync state when holding changes
  if (holding && quantity === '' && avgBuyPrice === '') {
    setQuantity(String(holding.quantity));
    setAvgBuyPrice(String(holding.avgBuyPrice));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holding) return;
    const qty = parseFloat(quantity);
    const price = parseFloat(avgBuyPrice);
    if (isNaN(qty) || qty <= 0) { setError('Enter a valid quantity'); return; }
    if (isNaN(price) || price < 0) { setError('Enter a valid price'); return; }
    setError('');
    try {
      await updateHolding.mutateAsync({ id: holding.id, quantity: qty, avgBuyPrice: price });
      onClose();
    } catch {
      setError('Failed to update. Try again.');
    }
  };

  if (!open || !holding) return null;

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
    boxSizing: 'border-box',
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div role="dialog" aria-modal="true" aria-label="Edit holding" style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 16, padding: 28, width: '100%', maxWidth: 420 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1.1rem' }}>Edit Holding</h2>
          <button onClick={onClose} aria-label="Close" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
            <X size={20} />
          </button>
        </div>

        {/* Coin info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#1e293b', borderRadius: 8, padding: '10px 12px', marginBottom: 20 }}>
          <CoinIcon src={holding.coinImageUrl} alt={holding.coinName} size={28} />
          <div>
            <div style={{ color: '#f1f5f9', fontWeight: 600 }}>{holding.coinName}</div>
            <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{holding.coinSymbol}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Quantity
            </label>
            <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} min="0" step="any" required style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = '#0052ff'; }} onBlur={(e) => { e.target.style.borderColor = '#334155'; }} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Avg Buy Price (USD)
            </label>
            <input type="number" value={avgBuyPrice} onChange={(e) => setAvgBuyPrice(e.target.value)} min="0" step="any" required style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = '#0052ff'; }} onBlur={(e) => { e.target.style.borderColor = '#334155'; }} />
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, padding: '10px 12px', marginBottom: 16, color: '#f87171', fontSize: '0.875rem' }} role="alert">
              <AlertCircle size={15} /> {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, height: 44, background: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: 8, cursor: 'pointer', fontSize: '0.875rem' }}>
              Cancel
            </button>
            <button type="submit" disabled={updateHolding.isPending} style={{ flex: 2, height: 44, background: updateHolding.isPending ? '#334155' : '#0052ff', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {updateHolding.isPending && <Loader2 size={14} className="animate-spin" />}
              {updateHolding.isPending ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
