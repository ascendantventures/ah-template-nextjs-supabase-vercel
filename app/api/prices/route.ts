import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const DEFAULT_IDS =
  'bitcoin,ethereum,binancecoin,solana,ripple,cardano,dogecoin,avalanche-2,polkadot,chainlink';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const ids = searchParams.get('ids') || DEFAULT_IDS;

  const cgUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(ids)}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`;
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (process.env.COINGECKO_API_KEY) {
    headers['x-cg-demo-api-key'] = process.env.COINGECKO_API_KEY;
  }

  try {
    const res = await fetch(cgUrl, { headers, next: { revalidate: 20 } });
    if (res.status === 429) {
      return NextResponse.json(
        { error: 'Rate limited' },
        { status: 503, headers: { 'X-Cache-Status': 'STALE' } }
      );
    }
    if (!res.ok) {
      return NextResponse.json({ error: 'Price fetch failed' }, { status: 502 });
    }
    const data = await res.json();
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 's-maxage=20, stale-while-revalidate=30' },
    });
  } catch {
    return NextResponse.json({ error: 'Price fetch failed' }, { status: 502 });
  }
}
