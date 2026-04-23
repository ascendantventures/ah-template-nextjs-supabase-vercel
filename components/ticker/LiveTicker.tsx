'use client';

import { useLivePrices } from '@/hooks/useLivePrices';
import { usePriceStore } from '@/lib/store/priceStore';
import { CoinIcon } from '@/components/shared/CoinIcon';
import { formatUSD, formatPercent } from '@/lib/utils/formatters';

const TICKER_COINS = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB' },
  { id: 'solana', symbol: 'SOL', name: 'Solana' },
  { id: 'ripple', symbol: 'XRP', name: 'XRP' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano' },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin' },
  { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche' },
  { id: 'polkadot', symbol: 'DOT', name: 'Polkadot' },
  { id: 'chainlink', symbol: 'LINK', name: 'Chainlink' },
];

const ids = TICKER_COINS.map((c) => c.id).join(',');

function TickerItem({ coinId, symbol }: { coinId: string; symbol: string }) {
  const prices = usePriceStore((s) => s.prices);
  const flashMap = usePriceStore((s) => s.flashMap);
  const price = prices[coinId];
  const flash = flashMap[coinId];

  const change = price?.usd_24h_change ?? 0;
  const isPos = change > 0;
  const isNeg = change < 0;
  const changeColor = isPos ? '#4ade80' : isNeg ? '#f87171' : '#94a3b8';

  return (
    <span
      className={
        flash === 'up' ? 'price-flash-gain' : flash === 'down' ? 'price-flash-loss' : ''
      }
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '0 20px',
        borderRight: '1px solid #1e293b',
        transition: 'background-color 800ms ease-out',
        borderRadius: 4,
      }}
    >
      <span style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '0.8rem' }}>{symbol}</span>
      {price ? (
        <>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.8rem',
              color: '#f1f5f9',
            }}
          >
            {formatUSD(price.usd)}
          </span>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.75rem',
              color: changeColor,
            }}
          >
            {formatPercent(change)}
          </span>
        </>
      ) : (
        <span style={{ color: '#475569', fontSize: '0.8rem' }}>—</span>
      )}
    </span>
  );
}

export function LiveTicker() {
  useLivePrices(ids);

  const items = [...TICKER_COINS, ...TICKER_COINS]; // duplicate for seamless loop

  return (
    <div
      style={{
        height: 36,
        background: '#0f172a',
        borderBottom: '1px solid #1e293b',
        overflow: 'hidden',
        position: 'relative',
      }}
      aria-label="Live price ticker"
    >
      <div
        className="ticker-track"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          height: '100%',
          whiteSpace: 'nowrap',
        }}
      >
        {items.map((coin, i) => (
          <TickerItem key={`${coin.id}-${i}`} coinId={coin.id} symbol={coin.symbol} />
        ))}
      </div>
    </div>
  );
}
