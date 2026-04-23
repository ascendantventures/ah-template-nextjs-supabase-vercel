export interface CoinGeckoPrice {
  usd: number;
  usd_24h_change: number;
}

export type CoinGeckoPriceMap = Record<string, CoinGeckoPrice>;

export interface CoinGeckoSearchResult {
  id: string;
  name: string;
  symbol: string;
  thumb: string;
  market_cap_rank: number | null;
}

export interface CoinGeckoSearchResponse {
  coins: CoinGeckoSearchResult[];
}

export interface CoinGeckoMarketChart {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export interface CoinGeckoMarket {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
}
