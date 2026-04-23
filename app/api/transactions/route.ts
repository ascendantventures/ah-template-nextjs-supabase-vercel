import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { CTTransactionRow, CTTransaction } from '@/types/database';

export const runtime = 'nodejs';

function mapTxRow(row: CTTransactionRow): CTTransaction {
  return {
    id: row.id,
    userId: row.user_id,
    coinId: row.coin_id,
    coinSymbol: row.coin_symbol,
    coinName: row.coin_name,
    coinImageUrl: row.coin_image_url,
    transactionType: row.transaction_type,
    quantity: parseFloat(row.quantity),
    pricePerCoin: parseFloat(row.price_per_coin),
    totalValue: parseFloat(row.total_value),
    fee: parseFloat(row.fee),
    notes: row.notes,
    transactedAt: row.transacted_at,
    createdAt: row.created_at,
  };
}

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

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '25')));
  const coinId = searchParams.get('coinId');
  const type = searchParams.get('type');
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  let query = supabase
    .from('ct_transactions')
    .select(
      'id, user_id, coin_id, coin_symbol, coin_name, coin_image_url, transaction_type, quantity, price_per_coin, total_value, fee, notes, transacted_at, created_at',
      { count: 'exact' }
    )
    .eq('user_id', user.id)
    .order('transacted_at', { ascending: false });

  if (coinId) query = query.eq('coin_id', coinId);
  if (type) query = query.eq('transaction_type', type);
  if (from) query = query.gte('transacted_at', from);
  if (to) query = query.lte('transacted_at', to);

  const from_ = (page - 1) * limit;
  query = query.range(from_, from_ + limit - 1);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    transactions: (data as CTTransactionRow[]).map(mapTxRow),
    total: count ?? 0,
    page,
    limit,
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const {
    coinId,
    coinSymbol,
    coinName,
    coinImageUrl,
    transactionType,
    quantity,
    pricePerCoin,
    fee = 0,
    notes,
    transactedAt,
  } = body;

  if (!coinId || !coinSymbol || !coinName || !transactionType || quantity == null || pricePerCoin == null) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const totalValue = parseFloat(quantity) * parseFloat(pricePerCoin);

  const { data: tx, error: txError } = await supabase
    .from('ct_transactions')
    .insert({
      user_id: user.id,
      coin_id: coinId,
      coin_symbol: coinSymbol,
      coin_name: coinName,
      coin_image_url: coinImageUrl || null,
      transaction_type: transactionType,
      quantity: String(quantity),
      price_per_coin: String(pricePerCoin),
      total_value: String(totalValue),
      fee: String(fee),
      notes: notes || null,
      transacted_at: transactedAt || new Date().toISOString(),
    })
    .select()
    .single();

  if (txError) return NextResponse.json({ error: txError.message }, { status: 500 });

  const holding = await recalcHolding(supabase, user.id, coinId);

  return NextResponse.json(
    { transaction: mapTxRow(tx as CTTransactionRow), holding },
    { status: 201 }
  );
}
