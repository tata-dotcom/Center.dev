import { Suspense } from 'react'
import { Users, DollarSign, CreditCard, Clock } from 'lucide-react'
import { StatCard } from './StatCard'
import { supabase } from '@/lib/supabaseClient'

async function fetchDashboardStats() {

  const [studentsResult, paymentsResult, remainingResult, sessionsResult] = await Promise.all([
    supabase.from('students').select('*', { count: 'exact', head: true }),
    supabase.from('students').select('paid_amount'),
    supabase.from('students').select('remaining_amount'),
    supabase.from('subscriptions').select('remaining_sessions')
  ])

  const totalStudents = studentsResult.count || 0
  const totalPayments = paymentsResult.data?.reduce((sum, student) => sum + Number(student.paid_amount), 0) || 0
  const totalRemaining = remainingResult.data?.reduce((sum, student) => sum + Number(student.remaining_amount), 0) || 0
  const totalSessions = sessionsResult.data?.reduce((sum, sub) => sum + Number(sub.remaining_sessions), 0) || 0

  return {
    totalStudents,
    totalPayments,
    totalRemaining,
    totalSessions
  }
}

function formatCurrency(amount: number) {
  return `${amount.toFixed(2)} EGP`
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  )
}

async function StatsContent() {
  const stats = await fetchDashboardStats()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Students"
        value={stats.totalStudents}
        icon={<Users className="h-8 w-8" />}
      />
      <StatCard
        title="Total Payments"
        value={formatCurrency(stats.totalPayments)}
        icon={<DollarSign className="h-8 w-8" />}
      />
      <StatCard
        title="Remaining Balance"
        value={formatCurrency(stats.totalRemaining)}
        icon={<CreditCard className="h-8 w-8" />}
      />
      <StatCard
        title="Sessions Left"
        value={stats.totalSessions}
        icon={<Clock className="h-8 w-8" />}
      />
    </div>
  )
}

export function DashboardStats() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <StatsContent />
    </Suspense>
  )
}