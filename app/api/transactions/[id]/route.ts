import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

async function recalcHolding(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  coinId: string
) {
  const { data: txs } = await supabase
    .from('ct_transactions')
    .select('transaction_type, quantity, price_per_coin, coin_symbol, coin_name, coin_image_url')
    .eq('user_id', userId)
    .eq('coin_id', coinId)
    .order('transacted_at', { ascending: true });

  if (!txs || txs.length === 0) {
    await supabase
      .from('ct_holdings')
      .delete()
      .eq('user_id', userId)
      .eq('coin_id', coinId);
    return null;
  }

  let qty = 0;
  let avg = 0;
  let coinSymbol = '';
  let coinName = '';
  let coinImageUrl: string | null = null;

  for (const tx of txs) {
    coinSymbol = tx.coin_symbol;
    coinName = tx.coin_name;
    coinImageUrl = tx.coin_image_url;
    const txQty = parseFloat(tx.quantity);
    const txPrice = parseFloat(tx.price_per_coin);

    if (tx.transaction_type === 'BUY') {
      const newQty = qty + txQty;
      avg = newQty > 0 ? (qty * avg + txQty * txPrice) / newQty : 0;
      qty = newQty;
    } else if (tx.transaction_type === 'SELL') {
      qty = Math.max(0, qty - txQty);
    } else if (tx.transaction_type === 'TRANSFER_IN') {
      qty += txQty;
    } else if (tx.transaction_type === 'TRANSFER_OUT') {
      qty = Math.max(0, qty - txQty);
    }
  }

  qty = Math.max(0, qty);

  const { data: holding } = await supabase
    .from('ct_holdings')
    .upsert(
      {
        user_id: userId,
        coin_id: coinId,
        coin_symbol: coinSymbol,
        coin_name: coinName,
        coin_image_url: coinImageUrl,
        quantity: String(qty),
        avg_buy_price: String(avg),
      },
      { onConflict: 'user_id,coin_id' }
    )
    .select()
    .single();

  return holding;
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

  // Get transaction details before deleting
  const { data: tx, error: fetchError } = await supabase
    .from('ct_transactions')
    .select('coin_id, user_id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !tx) {
    return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
  }

  const { error: delError } = await supabase
    .from('ct_transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (delError) return NextResponse.json({ error: delError.message }, { status: 500 });

  const holding = await recalcHolding(supabase, user.id, tx.coin_id);

  return NextResponse.json({ deletedId: id, holding });
}
