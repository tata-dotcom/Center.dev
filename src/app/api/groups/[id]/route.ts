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
    // Get group details
    const { data: group, error } = await supabase
      .from('groups')
      .select(`
        *,
        profiles!groups_teacher_id_fkey(full_name, phone)
      `)
      .eq('id', params.id)
      .single()

    if (error) throw error

    // Get enrolled students
    const { data: enrollments } = await supabase
      .from('group_students')
      .select(`
        *,
        students!inner(
          id,
          full_name,
          phone,
          sessions_remaining,
          status
        )
      `)
      .eq('group_id', params.id)
      .eq('status', 'active')

    return NextResponse.json({
      group,
      students: enrollments?.map(e => e.students) || []
    })
  } catch (error) {
    return NextResponse.json({ error: 'Group not found' }, { status: 404 })
  }
}