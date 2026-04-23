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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const updates: Record<string, string> = {};
  if (body.quantity != null) updates.quantity = String(body.quantity);
  if (body.avgBuyPrice != null) updates.avg_buy_price = String(body.avgBuyPrice);

  const { data, error } = await supabase
    .from('ct_holdings')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select('id, user_id, coin_id, coin_symbol, coin_name, coin_image_url, quantity, avg_buy_price, created_at, updated_at')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ holding: mapRow(data as CTHoldingRow) });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const { error } = await supabase
    .from('ct_holdings')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deleted: true });
}
