import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { CTWatchlistRow, CTWatchlistItem } from '@/types/database';

export const runtime = 'nodejs';

function mapRow(row: CTWatchlistRow): CTWatchlistItem {
  return {
    id: row.id,
    userId: row.user_id,
    coinId: row.coin_id,
    coinSymbol: row.coin_symbol,
    coinName: row.coin_name,
    coinImageUrl: row.coin_image_url,
    addedAt: row.added_at,
  };
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('ct_watchlist')
    .select('id, user_id, coin_id, coin_symbol, coin_name, coin_image_url, added_at')
    .eq('user_id', user.id)
    .order('added_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ watchlist: (data as CTWatchlistRow[]).map(mapRow) });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { coinId, coinSymbol, coinName, coinImageUrl } = body;

  if (!coinId || !coinSymbol || !coinName) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('ct_watchlist')
    .upsert(
      {
        user_id: user.id,
        coin_id: coinId,
        coin_symbol: coinSymbol,
        coin_name: coinName,
        coin_image_url: coinImageUrl || null,
      },
      { onConflict: 'user_id,coin_id' }
    )
    .select('id, user_id, coin_id, coin_symbol, coin_name, coin_image_url, added_at')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ item: mapRow(data as CTWatchlistRow) }, { status: 201 });
}
