'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CTTransaction } from '@/types/database';

export interface TransactionFilters {
  coinId?: string;
  type?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export function useTransactions(filters: TransactionFilters = {}) {
  const params = new URLSearchParams();
  if (filters.coinId) params.set('coinId', filters.coinId);
  if (filters.type) params.set('type', filters.type);
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  params.set('page', String(filters.page || 1));
  params.set('limit', String(filters.limit || 25));

  return useQuery<{ transactions: CTTransaction[]; total: number; page: number; limit: number }>({
    queryKey: ['transactions', filters],
    queryFn: async () => {
      const res = await fetch(`/api/transactions?${params}`);
      if (!res.ok) throw new Error('Failed to fetch transactions');
      return res.json();
    },
    staleTime: 30_000,
  });
}

export function useAddTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      coinId: string;
      coinSymbol: string;
      coinName: string;
      coinImageUrl?: string | null;
      transactionType: string;
      quantity: number;
      pricePerCoin: number;
      fee?: number;
      notes?: string;
      transactedAt: string;
    }) => {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to add transaction');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['holdings'] });
    },
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete transaction');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['holdings'] });
    },
  });
}
