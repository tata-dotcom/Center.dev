import { DashboardStats } from '@/components/dashboard/DashboardStats'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-2 text-sm md:text-base">Comprehensive statistics and insights for your educational center</p>
          
          {/* Date and Quick Actions */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-4 gap-4">
            <div className="flex items-center bg-white rounded-lg shadow-sm py-2 px-4 border border-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm text-gray-700">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="bg-white text-gray-700 border border-gray-300 rounded-lg px-3 py-2 text-sm flex items-center hover:bg-gray-50 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Generate Report
              </button>
              <button className="bg-indigo-600 text-white rounded-lg px-3 py-2 text-sm flex items-center hover:bg-indigo-700 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Data
              </button>
            </div>
          </div>
        </div>
        
        {/* Stats Section */}
        <DashboardStats />
        
        {/* Additional Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Recent Activity Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
              <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">View All</button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-green-100 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">New student registration</p>
                  <p className="text-xs text-gray-500">Sarah Johnson joined Grade 10 Mathematics</p>
                  <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Payment received</p>
                  <p className="text-xs text-gray-500">Michael Thompson completed payment for Science classes</p>
                  <p className="text-xs text-gray-400 mt-1">5 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-purple-100 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Grades updated</p>
                  <p className="text-xs text-gray-500">Final exam results for Physics class have been published</p>
                  <p className="text-xs text-gray-400 mt-1">Yesterday</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Upcoming Events Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Upcoming Events</h2>
              <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">View Calendar</button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded mr-3">
                  <span className="block">JUN</span>
                  <span className="block text-center">15</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">End of Semester Exams</p>
                  <p className="text-xs text-gray-500">All classes</p>
                </div>
                <span className="text-xs text-gray-400">9:00 AM</span>
              </div>
              
              <div className="flex items-center">
                <div className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded mr-3">
                  <span className="block">JUN</span>
                  <span className="block text-center">20</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Parent-Teacher Meeting</p>
                  <p className="text-xs text-gray-500">Main conference room</p>
                </div>
                <span className="text-xs text-gray-400">2:00 PM</span>
              </div>
              
              <div className="flex items-center">
                <div className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded mr-3">
                  <span className="block">JUN</span>
                  <span className="block text-center">25</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Science Fair</p>
                  <p className="text-xs text-gray-500">School gymnasium</p>
                </div>
                <span className="text-xs text-gray-400">10:00 AM</span>
              </div>
            </div>
            
            <button className="w-full mt-6 bg-gray-100 text-gray-700 rounded-lg py-2 text-sm flex items-center justify-center hover:bg-gray-200 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Event
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}