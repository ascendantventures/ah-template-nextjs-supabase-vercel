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
  const q = searchParams.get('q');
  if (!q) return NextResponse.json({ error: 'Missing q' }, { status: 400 });

  const cgUrl = `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(q)}`;
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (process.env.COINGECKO_API_KEY) {
    headers['x-cg-demo-api-key'] = process.env.COINGECKO_API_KEY;
  }

  try {
    const res = await fetch(cgUrl, { headers, next: { revalidate: 60 } });
    if (!res.ok) {
      return NextResponse.json({ error: 'Search failed' }, { status: 502 });
    }
    const data = await res.json();
    const coins = (data.coins || []).slice(0, 10).map(
      (c: { id: string; name: string; symbol: string; thumb: string; market_cap_rank?: number }) => ({
        id: c.id,
        name: c.name,
        symbol: c.symbol.toUpperCase(),
        thumb: c.thumb,
        market_cap_rank: c.market_cap_rank ?? null,
      })
    );
    return NextResponse.json({ coins }, {
      headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=30' },
    });
  } catch {
    return NextResponse.json({ error: 'Search failed' }, { status: 502 });
  }
}
