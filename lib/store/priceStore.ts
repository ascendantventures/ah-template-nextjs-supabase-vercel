import { create } from 'zustand';

export interface PriceData {
  usd: number;
  usd_24h_change: number;
  usd_market_cap?: number;
  usd_24h_vol?: number;
}

interface PriceStore {
  prices: Record<string, PriceData>;
  flashMap: Record<string, 'up' | 'down' | null>;
  setPrices: (incoming: Record<string, PriceData>) => void;
}

export const usePriceStore = create<PriceStore>((set, get) => ({
  prices: {},
  flashMap: {},
  setPrices: (incoming) => {
    const current = get().prices;
    const newFlash: Record<string, 'up' | 'down' | null> = {};

    for (const coinId of Object.keys(incoming)) {
      const prev = current[coinId];
      const next = incoming[coinId];
      if (prev && next.usd !== prev.usd) {
        newFlash[coinId] = next.usd > prev.usd ? 'up' : 'down';
      }
    }

    set({ prices: incoming, flashMap: newFlash });

    if (Object.keys(newFlash).length > 0) {
      setTimeout(() => {
        set((s) => {
          const cleared: Record<string, 'up' | 'down' | null> = {};
          for (const k of Object.keys(newFlash)) cleared[k] = null;
          return { flashMap: { ...s.flashMap, ...cleared } };
        });
      }, 800);
    }
  },
}));
