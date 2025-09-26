import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  
  // Check authentication
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const range = searchParams.get('range') || 'today'
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  // Calculate date range
  let startDate: string
  let endDate: string
  const now = new Date()

  switch (range) {
    case 'yesterday':
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)
      startDate = yesterday.toISOString().split('T')[0]
      endDate = yesterday.toISOString().split('T')[0]
      break
    case 'last7':
      const last7 = new Date(now)
      last7.setDate(last7.getDate() - 7)
      startDate = last7.toISOString().split('T')[0]
      endDate = now.toISOString().split('T')[0]
      break
    case 'custom':
      if (!from || !to) {
        return NextResponse.json({ error: 'Custom range requires from and to dates' }, { status: 400 })
      }
      startDate = from
      endDate = to
      break
    default: // today
      startDate = now.toISOString().split('T')[0]
      endDate = now.toISOString().split('T')[0]
  }

  try {
    // Get total students count
    const { count: totalStudents } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    // Get total groups count
    const { count: totalGroups } = await supabase
      .from('groups')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    // Get payments in date range
    const { data: payments, count: totalPayments } = await supabase
      .from('payments')
      .select('amount', { count: 'exact' })
      .gte('created_at', `${startDate}T00:00:00`)
      .lte('created_at', `${endDate}T23:59:59`)

    // Calculate total revenue
    const totalRevenue = payments?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0

    return NextResponse.json({
      totalStudents: totalStudents || 0,
      totalGroups: totalGroups || 0,
      totalPayments: totalPayments || 0,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      dateRange: { from: startDate, to: endDate }
    })

  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}