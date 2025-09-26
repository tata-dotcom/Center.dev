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
    const { student_id, session_id } = body

    if (!student_id) {
      return NextResponse.json({ error: 'Student ID required' }, { status: 400 })
    }

    // Verify student exists and has sessions
    const { data: student } = await supabase
      .from('students')
      .select('current_sessions, name_student')
      .eq('id', student_id)
      .single()

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    if (student.current_sessions <= 0) {
      return NextResponse.json({ error: 'No sessions remaining' }, { status: 400 })
    }

    // Generate signed student QR token using jose
    const qrToken = await new SignJWT({
      student_id,
      session_id,
      student_name: student.name_student,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .setIssuedAt()
      .sign(JWT_SECRET)

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
      student_name: student.name_student,
      sessions_remaining: student.current_sessions
    })
  } catch (error) {
    console.error('QR generation error:', error)
    return NextResponse.json({ error: 'Failed to generate QR code' }, { status: 500 })
  }
}