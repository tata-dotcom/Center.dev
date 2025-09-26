import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
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
    const { qr_token, group_session_id } = body

    if (!qr_token || !group_session_id) {
      return NextResponse.json({ error: 'QR token and session ID required' }, { status: 400 })
    }

    // Verify QR token using jose
    const { payload } = await jwtVerify(qr_token, JWT_SECRET)
    const studentId = payload.student_id as string

    if (!studentId) {
      return NextResponse.json({ error: 'Invalid QR token' }, { status: 400 })
    }

    // Check if QR code exists and not used
    const { data: qrCode } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('token', qr_token)
      .eq('used', false)
      .single()

    if (!qrCode || new Date(qrCode.expires_at) < new Date()) {
      return NextResponse.json({ error: 'QR code expired or already used' }, { status: 400 })
    }

    // Verify student has sessions remaining
    const { data: student } = await supabase
      .from('students')
      .select('current_sessions, name_student')
      .eq('id', studentId)
      .single()

    if (!student || student.current_sessions <= 0) {
      return NextResponse.json({ error: 'No sessions remaining' }, { status: 400 })
    }

    // Check if already attended this session
    const { data: existingAttendance } = await supabase
      .from('attendance_logs')
      .select('id')
      .eq('student_id', studentId)
      .eq('subscription_id', group_session_id)
      .single()

    if (existingAttendance) {
      return NextResponse.json({ error: 'Already marked present for this session' }, { status: 400 })
    }

    // Mark attendance (trigger will deduct session)
    const { data: attendance, error } = await supabase
      .from('attendance_logs')
      .insert({
        student_id: studentId,
        subscription_id: group_session_id,
        note: 'QR scan attendance'
      })
      .select()
      .single()

    if (error) throw error

    // Mark QR code as used
    await supabase
      .from('qr_codes')
      .update({ used: true })
      .eq('id', qrCode.id)

    // Get updated student sessions
    const { data: updatedStudent } = await supabase
      .from('students')
      .select('current_sessions')
      .eq('id', studentId)
      .single()

    return NextResponse.json({
      ok: true,
      student_id: studentId,
      student_name: student.name_student,
      sessions_remaining: updatedStudent?.current_sessions || 0,
      attendance_id: attendance.id,
      attended_at: attendance.scan_time
    })

  } catch (error) {
    console.error('QR scan error:', error)
    if (error instanceof Error && error.name === 'JWTExpired') {
      return NextResponse.json({ error: 'QR token expired' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to process attendance' }, { status: 500 })
  }
}