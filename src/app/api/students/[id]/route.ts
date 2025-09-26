import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies })
  
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get student details
    const { data: student, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) throw error

    // Get payment history
    const { data: payments } = await supabase
      .from('payments')
      .select('*')
      .eq('student_id', params.id)
      .order('created_at', { ascending: false })

    // Get attendance history
    const { data: attendances } = await supabase
      .from('attendances')
      .select(`
        *,
        group_sessions!inner(
          session_date,
          groups!inner(name, subject)
        )
      `)
      .eq('student_id', params.id)
      .order('attended_at', { ascending: false })

    return NextResponse.json({
      student,
      payments: payments || [],
      attendances: attendances || []
    })
  } catch (error) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 })
  }
}