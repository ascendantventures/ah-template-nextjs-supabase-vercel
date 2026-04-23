'use client';

import { useQuery } from '@tanstack/react-query';

export function useSparkline(coinId: string | null) {
  return useQuery({
    queryKey: ['sparkline', coinId],
    queryFn: async () => {
      const res = await fetch(`/api/prices/history?id=${coinId}`);
      if (!res.ok) throw new Error('Failed to fetch sparkline');
      const data = await res.json();
      return data.prices as [number, number][];
    },
    enabled: !!coinId,
    staleTime: 5 * 60 * 1000,
    refetchInterval: false,
  });
}
