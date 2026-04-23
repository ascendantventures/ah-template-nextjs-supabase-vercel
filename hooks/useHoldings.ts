'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CTHolding } from '@/types/database';

export function useHoldings() {
  return useQuery<{ holdings: CTHolding[] }>({
    queryKey: ['holdings'],
    queryFn: async () => {
      const res = await fetch('/api/holdings');
      if (!res.ok) throw new Error('Failed to fetch holdings');
      return res.json();
    },
    staleTime: 60_000,
  });
}

export function useAddHolding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      coinId: string;
      coinSymbol: string;
      coinName: string;
      coinImageUrl: string | null;
      quantity: number;
      avgBuyPrice: number;
    }) => {
      const res = await fetch('/api/holdings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to add holding');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['holdings'] }),
  });
}

export function useUpdateHolding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      quantity?: number;
      avgBuyPrice?: number;
    }) => {
      const res = await fetch(`/api/holdings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update holding');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['holdings'] }),
  });
}

export function useDeleteHolding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/holdings/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete holding');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['holdings'] }),
  });
}
