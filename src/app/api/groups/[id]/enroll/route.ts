import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies })
  
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { student_ids } = body

  if (!student_ids || !Array.isArray(student_ids) || student_ids.length === 0) {
    return NextResponse.json({ error: 'Student IDs required' }, { status: 400 })
  }

  try {
    // Check group capacity
    const { data: group } = await supabase
      .from('groups')
      .select('max_students')
      .eq('id', params.id)
      .single()

    const { count: currentEnrollments } = await supabase
      .from('group_students')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', params.id)
      .eq('status', 'active')

    if ((currentEnrollments || 0) + student_ids.length > (group?.max_students || 20)) {
      return NextResponse.json({ error: 'Group capacity exceeded' }, { status: 400 })
    }

    // Enroll students
    const enrollments = student_ids.map(student_id => ({
      group_id: params.id,
      student_id
    }))

    const { data, error } = await supabase
      .from('group_students')
      .insert(enrollments)
      .select(`
        *,
        students!inner(full_name, phone)
      `)

    if (error) throw error

    return NextResponse.json({
      message: `${student_ids.length} students enrolled successfully`,
      enrollments: data
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to enroll students' }, { status: 500 })
  }
}