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
  const { student_id, session_id } = body

  if (!student_id) {
    return NextResponse.json({ error: 'Student ID required' }, { status: 400 })
  }

  try {
    // Verify student exists and has sessions
    const { data: student } = await supabase
      .from('students')
      .select('sessions_remaining, full_name')
      .eq('id', student_id)
      .single()

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    if (student.sessions_remaining <= 0) {
      return NextResponse.json({ error: 'No sessions remaining' }, { status: 400 })
    }

    // Generate signed student QR token
    const qrPayload = {
      student_id,
      session_id,
      student_name: student.full_name,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours expiry
    }
    
    const qrToken = jwt.sign(qrPayload, process.env.JWT_SECRET || 'fallback-secret')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Store QR code record
    const { data, error } = await supabase
      .from('qr_codes')
      .insert({
        student_id,
        token: qrToken,
        expires_at: expiresAt.toISOString(),
        session_id
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      qr_token: qrToken,
      expires_at: expiresAt.toISOString(),
      student_name: student.full_name,
      sessions_remaining: student.sessions_remaining
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate QR code' }, { status: 500 })
  }
}