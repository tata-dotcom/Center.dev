import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import { supabase } from '@/lib/supabaseClient'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key-min-32-chars'
)

export async function POST(request: NextRequest) {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { group_id, session_date, start_time, notes } = body

    if (!group_id || !session_date || !start_time) {
      return NextResponse.json({ error: 'Group ID, date and time required' }, { status: 400 })
    }

    // Generate signed QR token using jose
    const qrToken = await new SignJWT({
      group_id,
      session_date,
      start_time,
      created_by: session.user.id,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('4h')
      .setIssuedAt()
      .sign(JWT_SECRET)

    const qrExpiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000) // 4 hours

    // Create group session
    const { data, error } = await supabase
      .from('group_sessions')
      .insert({
        group_id,
        session_date,
        start_time,
        status: 'active',
        qr_token: qrToken,
        qr_expires_at: qrExpiresAt.toISOString(),
        notes,
        created_by: session.user.id
      })
      .select(`
        *,
        groups!inner(name, subject)
      `)
      .single()

    if (error) throw error

    return NextResponse.json({
      session: data,
      qr_token: qrToken,
      qr_expires_at: qrExpiresAt.toISOString()
    })
  } catch (error) {
    console.error('Session start error:', error)
    return NextResponse.json({ error: 'Failed to start session' }, { status: 500 })
  }
}