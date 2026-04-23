'use client';

import { useMemo } from 'react';
import { usePriceStore } from '@/lib/store/priceStore';
import { calcPortfolioStats } from '@/lib/utils/calculations';
import type { CTHolding } from '@/types/database';

export function usePortfolioStats(holdings: CTHolding[] | undefined) {
  const prices = usePriceStore((s) => s.prices);

  return useMemo(() => {
    if (!holdings || holdings.length === 0) {
      return {
        totalValue: 0,
        totalCost: 0,
        totalPnl: 0,
        totalPnlPercent: 0,
        change24hAmount: 0,
        change24hPercent: 0,
        prevTotalValue: 0,
      };
    }
    const enriched = holdings.map((h) => ({
      quantity: h.quantity,
      avgBuyPrice: h.avgBuyPrice,
      currentPrice: prices[h.coinId]?.usd ?? 0,
      change24h: prices[h.coinId]?.usd_24h_change ?? 0,
    }));
    return calcPortfolioStats(enriched);
  }, [holdings, prices]);
}
