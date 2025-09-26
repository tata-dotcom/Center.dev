import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name, description, subject, level, max_students, session_price, schedule_days, schedule_time, duration_minutes, teacher_id } = body

  if (!name || !subject || !level || !session_price || !schedule_days || !schedule_time) {
    return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })
  }

  try {
    const { data, error } = await supabase
      .from('groups')
      .insert({
        name,
        description,
        subject,
        level,
        max_students: max_students || 20,
        session_price,
        schedule_days,
        schedule_time,
        duration_minutes: duration_minutes || 60,
        teacher_id,
        created_by: session.user.id
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create group' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data, error } = await supabase
      .from('groups')
      .select(`
        *,
        profiles!groups_teacher_id_fkey(full_name),
        group_students(count)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 })
  }
}