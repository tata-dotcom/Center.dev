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
  const { qr_token, group_session_id } = body

  if (!qr_token || !group_session_id) {
    return NextResponse.json({ error: 'QR token and session ID required' }, { status: 400 })
  }

  try {
    // Verify QR token
    const decoded = jwt.verify(qr_token, process.env.JWT_SECRET || 'fallback-secret') as any
    const studentId = decoded.student_id

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
      .select('sessions_remaining, full_name')
      .eq('id', studentId)
      .single()

    if (!student || student.sessions_remaining <= 0) {
      return NextResponse.json({ error: 'No sessions remaining' }, { status: 400 })
    }

    // Check if already attended this session
    const { data: existingAttendance } = await supabase
      .from('attendances')
      .select('id')
      .eq('student_id', studentId)
      .eq('group_session_id', group_session_id)
      .single()

    if (existingAttendance) {
      return NextResponse.json({ error: 'Already marked present for this session' }, { status: 400 })
    }

    // Mark attendance (trigger will deduct session)
    const { data: attendance, error } = await supabase
      .from('attendances')
      .insert({
        student_id: studentId,
        group_session_id,
        scanned_by: session.user.id,
        status: 'present',
        sessions_deducted: 1
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
      .select('sessions_remaining')
      .eq('id', studentId)
      .single()

    return NextResponse.json({
      ok: true,
      student_id: studentId,
      student_name: student.full_name,
      sessions_remaining: updatedStudent?.sessions_remaining || 0,
      attendance_id: attendance.id,
      attended_at: attendance.attended_at
    })

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid QR token' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to process attendance' }, { status: 500 })
  }
}