import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies })
  
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { amount, sessions_added, payment_method, reference_number, notes } = body

  if (!amount || !sessions_added || amount <= 0 || sessions_added <= 0) {
    return NextResponse.json({ error: 'Valid amount and sessions required' }, { status: 400 })
  }

  try {
    // Insert payment record (trigger will update student sessions)
    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        student_id: params.id,
        amount,
        sessions_added,
        payment_method: payment_method || 'cash',
        reference_number,
        notes,
        processed_by: session.user.id
      })
      .select()
      .single()

    if (error) throw error

    // Get updated student data
    const { data: student } = await supabase
      .from('students')
      .select('sessions_remaining, total_sessions_purchased')
      .eq('id', params.id)
      .single()

    return NextResponse.json({
      payment,
      student: {
        sessions_remaining: student?.sessions_remaining,
        total_sessions_purchased: student?.total_sessions_purchased
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 })
  }
}