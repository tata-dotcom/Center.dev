import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { group_id, session_date, start_time, notes } = body

  if (!group_id || !session_date || !start_time) {
    return NextResponse.json({ error: 'Group ID, date and time required' }, { status: 400 })
  }

  try {
    // Generate signed QR token
    const qrPayload = {
      group_id,
      session_date,
      start_time,
      created_by: session.user.id,
      exp: Math.floor(Date.now() / 1000) + (4 * 60 * 60) // 4 hours expiry
    }
    
    const qrToken = jwt.sign(qrPayload, process.env.JWT_SECRET || 'fallback-secret')
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
    return NextResponse.json({ error: 'Failed to start session' }, { status: 500 })
  }
}