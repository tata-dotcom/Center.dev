import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const body = await request.json()
  const { role, assigned_groups, max_uses, expires_in_hours } = body

  if (!role || !['secretary', 'teacher'].includes(role)) {
    return NextResponse.json({ error: 'Valid role required (secretary/teacher)' }, { status: 400 })
  }

  try {
    // Generate random invite code
    const code = Math.random().toString(36).substring(2, 10).toUpperCase()
    const expiresAt = new Date(Date.now() + (expires_in_hours || 24) * 60 * 60 * 1000)

    const { data, error } = await supabase
      .from('invite_codes')
      .insert({
        code,
        role,
        assigned_groups: assigned_groups || [],
        max_uses: max_uses || 1,
        expires_at: expiresAt.toISOString(),
        created_by: session.user.id
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create invite code' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  try {
    const { data, error } = await supabase
      .from('invite_codes')
      .select(`
        *,
        profiles!invite_codes_created_by_fkey(full_name)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch invite codes' }, { status: 500 })
  }
}