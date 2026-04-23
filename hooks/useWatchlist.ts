'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CTWatchlistItem } from '@/types/database';

export function useWatchlist() {
  return useQuery<{ watchlist: CTWatchlistItem[] }>({
    queryKey: ['watchlist'],
    queryFn: async () => {
      const res = await fetch('/api/watchlist');
      if (!res.ok) throw new Error('Failed to fetch watchlist');
      return res.json();
    },
    staleTime: 60_000,
  });
}

export function useAddToWatchlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      coinId: string;
      coinSymbol: string;
      coinName: string;
      coinImageUrl?: string | null;
    }) => {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to add to watchlist');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['watchlist'] }),
  });
}

export function useRemoveFromWatchlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/watchlist/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove from watchlist');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['watchlist'] }),
  });
}
