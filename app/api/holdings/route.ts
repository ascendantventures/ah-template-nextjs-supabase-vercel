import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { CTHoldingRow, CTHolding } from '@/types/database';

export const runtime = 'nodejs';

function mapRow(row: CTHoldingRow): CTHolding {
  return {
    id: row.id,
    userId: row.user_id,
    coinId: row.coin_id,
    coinSymbol: row.coin_symbol,
    coinName: row.coin_name,
    coinImageUrl: row.coin_image_url,
    quantity: parseFloat(row.quantity),
    avgBuyPrice: parseFloat(row.avg_buy_price),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('ct_holdings')
    .select('id, user_id, coin_id, coin_symbol, coin_name, coin_image_url, quantity, avg_buy_price, created_at, updated_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ holdings: (data as CTHoldingRow[]).map(mapRow) });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { coinId, coinSymbol, coinName, coinImageUrl, quantity, avgBuyPrice } = body;

  if (!coinId || !coinSymbol || !coinName || quantity == null || avgBuyPrice == null) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('ct_holdings')
    .upsert(
      {
        user_id: user.id,
        coin_id: coinId,
        coin_symbol: coinSymbol,
        coin_name: coinName,
        coin_image_url: coinImageUrl || null,
        quantity: String(quantity),
        avg_buy_price: String(avgBuyPrice),
      },
      { onConflict: 'user_id,coin_id' }
    )
    .select('id, user_id, coin_id, coin_symbol, coin_name, coin_image_url, quantity, avg_buy_price, created_at, updated_at')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ holding: mapRow(data as CTHoldingRow) }, { status: 201 });
}
