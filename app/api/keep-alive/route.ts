import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '../../../utils/supabase/server'

export async function GET(_req: NextRequest) {
  const supabase = await createClient()

  // ping sin necesidad de auth; usa la tabla que prefieras
  const { error } = await supabase
    .from('profiles')
    .select('id')
    .limit(1)

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}