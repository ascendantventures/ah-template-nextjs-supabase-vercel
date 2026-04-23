import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { CTTransactionRow } from '@/types/database';

export const runtime = 'nodejs';

function toCSV(rows: CTTransactionRow[]): string {
  const headers = ['Date', 'Type', 'Coin', 'Symbol', 'Quantity', 'Price/Coin', 'Total', 'Fee', 'Notes'];
  const lines = [headers.join(',')];
  for (const r of rows) {
    lines.push(
      [
        new Date(r.transacted_at).toISOString().split('T')[0],
        r.transaction_type,
        `"${r.coin_name.replace(/"/g, '""')}"`,
        r.coin_symbol,
        r.quantity,
        r.price_per_coin,
        r.total_value,
        r.fee,
        `"${(r.notes || '').replace(/"/g, '""')}"`,
      ].join(',')
    );
  }
  return lines.join('\n');
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const coinId = searchParams.get('coinId');
  const type = searchParams.get('type');
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  let query = supabase
    .from('ct_transactions')
    .select(
      'id, user_id, coin_id, coin_symbol, coin_name, coin_image_url, transaction_type, quantity, price_per_coin, total_value, fee, notes, transacted_at, created_at'
    )
    .eq('user_id', user.id)
    .order('transacted_at', { ascending: false });

  if (coinId) query = query.eq('coin_id', coinId);
  if (type) query = query.eq('transaction_type', type);
  if (from) query = query.gte('transacted_at', from);
  if (to) query = query.lte('transacted_at', to);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const csv = toCSV((data as CTTransactionRow[]) || []);
  const today = new Date().toISOString().split('T')[0];

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="ct-transactions-${today}.csv"`,
    },
  });
}
