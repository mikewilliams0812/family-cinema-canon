import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const TABLES = ['cc_families', 'cc_kids', 'cc_watches', 'cc_custom_movies'];

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const status: Record<string, boolean> = {};
  for (const table of TABLES) {
    const { error } = await supabase.from(table).select('id').limit(1);
    status[table] = !error || !error.message.includes('does not exist');
  }

  const allReady = Object.values(status).every(Boolean);

  return NextResponse.json({
    ok: allReady,
    tables: status,
    message: allReady
      ? 'All tables exist. App is ready.'
      : 'Some tables are missing. Run supabase/cinema_schema.sql in your Supabase SQL Editor at https://supabase.com/dashboard/project/xcfavvsdsqpxtkkekmmu/sql/new',
  });
}
