import { supabaseServer } from '@/lib/supabaseServer'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = supabaseServer()

  const { data, error } = await supabase
    .from('hosts')
    .select('*')
    .limit(1)

  if (error) {
    return NextResponse.json({ success: false, error: error.message })
  }

  return NextResponse.json({ success: true, message: 'Supabase connected successfully!' })
}
