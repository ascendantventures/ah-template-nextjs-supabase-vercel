import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const coinId = searchParams.get('id');
  if (!coinId) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const days = searchParams.get('days') || '7';

  const cgUrl = `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(coinId)}/market_chart?vs_currency=usd&days=${days}&interval=daily`;
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (process.env.COINGECKO_API_KEY) {
    headers['x-cg-demo-api-key'] = process.env.COINGECKO_API_KEY;
  }

  try {
    const res = await fetch(cgUrl, { headers, next: { revalidate: 300 } });
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch history' }, { status: 502 });
    }
    const data = await res.json();
    return NextResponse.json(
      { coinId, prices: data.prices || [] },
      { headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=60' } }
    );
  } catch {
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 502 });
  }
}
