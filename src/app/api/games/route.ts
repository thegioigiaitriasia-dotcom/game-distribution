import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '16', 10);
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';

  let query = supabase.from('games').select('*');

  if (q) {
    query = query.ilike('title', `%${q}%`);
  } else if (category) {
    query = query.contains('tags', [category]);
  }

  // Calculate range
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data: games, error } = await query
    .range(from, to)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ games });
}
