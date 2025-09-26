import Navbar from '@/components/Navbar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="bg-gray-50">
        {children}
      </main>
    </div>
  )
}