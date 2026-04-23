export interface CTProfileRow {
  id: string;
  display_name: string | null;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface CTProfile {
  id: string;
  displayName: string | null;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface CTHoldingRow {
  id: string;
  user_id: string;
  coin_id: string;
  coin_symbol: string;
  coin_name: string;
  coin_image_url: string | null;
  quantity: string;
  avg_buy_price: string;
  created_at: string;
  updated_at: string;
}

export interface CTHolding {
  id: string;
  userId: string;
  coinId: string;
  coinSymbol: string;
  coinName: string;
  coinImageUrl: string | null;
  quantity: number;
  avgBuyPrice: number;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = 'BUY' | 'SELL' | 'TRANSFER_IN' | 'TRANSFER_OUT';

export interface CTTransactionRow {
  id: string;
  user_id: string;
  coin_id: string;
  coin_symbol: string;
  coin_name: string;
  coin_image_url: string | null;
  transaction_type: TransactionType;
  quantity: string;
  price_per_coin: string;
  total_value: string;
  fee: string;
  notes: string | null;
  transacted_at: string;
  created_at: string;
}

export interface CTTransaction {
  id: string;
  userId: string;
  coinId: string;
  coinSymbol: string;
  coinName: string;
  coinImageUrl: string | null;
  transactionType: TransactionType;
  quantity: number;
  pricePerCoin: number;
  totalValue: number;
  fee: number;
  notes: string | null;
  transactedAt: string;
  createdAt: string;
}

export interface CTWatchlistRow {
  id: string;
  user_id: string;
  coin_id: string;
  coin_symbol: string;
  coin_name: string;
  coin_image_url: string | null;
  added_at: string;
}

export interface CTWatchlistItem {
  id: string;
  userId: string;
  coinId: string;
  coinSymbol: string;
  coinName: string;
  coinImageUrl: string | null;
  addedAt: string;
}
