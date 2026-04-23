'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { usePriceStore } from '@/lib/store/priceStore';

const DEFAULT_COINS =
  'bitcoin,ethereum,binancecoin,solana,ripple,cardano,dogecoin,avalanche-2,polkadot,chainlink';

export function useLivePrices(coinIds?: string) {
  const ids = coinIds || DEFAULT_COINS;
  const setPrices = usePriceStore((s) => s.setPrices);

  const query = useQuery({
    queryKey: ['prices', ids],
    queryFn: async () => {
      const res = await fetch(`/api/prices?ids=${encodeURIComponent(ids)}`);
      if (!res.ok) throw new Error('Failed to fetch prices');
      return res.json();
    },
    staleTime: 20_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (query.data) setPrices(query.data);
  }, [query.data, setPrices]);

  return query;
}
