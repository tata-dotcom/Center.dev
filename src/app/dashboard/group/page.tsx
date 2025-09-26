"use client";

import { useEffect, useState } from "react";
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';

import { Group } from '@/types/database';

interface GroupWithMembers extends Group {
  members: number;
  profiles?: { full_name: string };
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<GroupWithMembers[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { user, permissions, loading: authLoading } = useAuth();

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("groups")
      .select(`
        *,
        group_students(count),
        profiles!groups_teacher_id_fkey(full_name)
      `);

    if (error) {
      console.error("Error fetching groups:", error.message);
    } else {
      const mapped = (data || []).map((g: any) => ({
        ...g,
        members: g.group_students?.[0]?.count || 0,
      }));
      setGroups(mapped);
    }
    setLoading(false);
  };

  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!permissions.canCreateGroups) {
      showError('You are not authorized to perform this action');
      return;
    }

    const form = e.target as HTMLFormElement;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const description = (form.elements.namedItem("description") as HTMLInputElement).value;
    const subject = (form.elements.namedItem("subject") as HTMLInputElement).value;
    const level = (form.elements.namedItem("level") as HTMLInputElement).value;
    const max_students = parseInt((form.elements.namedItem("max_students") as HTMLInputElement).value);
    const session_price = parseFloat((form.elements.namedItem("session_price") as HTMLInputElement).value);
    const schedule_time = (form.elements.namedItem("schedule_time") as HTMLInputElement).value;
    const duration_minutes = parseInt((form.elements.namedItem("duration_minutes") as HTMLInputElement).value);
    
    const schedule_days = Array.from(form.querySelectorAll('input[name="schedule_days"]:checked'))
      .map((input: any) => input.value);

    const { data, error } = await supabase
      .from("groups")
      .insert([{ 
        name, 
        description, 
        subject, 
        level, 
        max_students, 
        session_price, 
        schedule_days, 
        schedule_time, 
        duration_minutes,
        teacher_id: user?.id,
        created_by: user?.id
      }])
      .select();

    if (error) {
      showError(`Error adding group: ${error.message}`);
    } else if (data) {
      setGroups([
        ...groups,
        { ...data[0], members: 0 },
      ]);
      setIsModalOpen(false);
      form.reset();
    }
  };

  const filteredGroups = groups.filter(
    (group) =>
      group.name?.toLowerCase().includes(search.toLowerCase()) ||
      group.subject?.toLowerCase().includes(search.toLowerCase()) ||
      group.level?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Group Management</h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">Manage all teaching groups in one place</p>
        </div>
        {permissions.canCreateGroups && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 flex items-center shadow-md hover:shadow-lg transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add New Group
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 mb-6 md:mb-8">
        <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="rounded-full bg-indigo-100 p-2 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-gray-600 text-sm font-medium">Total Groups</h3>
              <p className="text-2xl font-bold text-gray-800 mt-1">{groups.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="rounded-full bg-green-100 p-2 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-gray-600 text-sm font-medium">Total Members</h3>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {groups.reduce((sum, group) => sum + group.members, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="rounded-full bg-blue-100 p-2 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0v6" />
              </svg>
            </div>
            <div>
              <h3 className="text-gray-600 text-sm font-medium">Average per Group</h3>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {groups.length > 0
                  ? Math.round(groups.reduce((sum, group) => sum + group.members, 0) / groups.length)
                  : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Groups Section */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 md:px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center">
          <h2 className="text-lg font-semibold text-gray-800 mb-2 md:mb-0">All Groups</h2>
          
          {/* Search */}
          <div className="relative w-full md:w-auto">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search groups..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full md:w-64"
            />
          </div>
        </div>

        <div className="p-4 md:p-6">
          {authLoading || loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No groups found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search or add a new group.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredGroups.map((group) => (
                <div
                  key={group.id}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                      <p className="text-sm text-gray-600">{group.subject} - {group.level}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      group.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {group.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><span className="font-medium">Price:</span> ${group.session_price}</p>
                    <p><span className="font-medium">Duration:</span> {group.duration_minutes} min</p>
                    <p><span className="font-medium">Schedule:</span> {group.schedule_time}</p>
                    <p><span className="font-medium">Days:</span> {group.schedule_days?.join(', ')}</p>
                    <p><span className="font-medium">Members:</span> {group.members}/{group.max_students}</p>
                    {group.profiles && (
                      <p><span className="font-medium">Teacher:</span> {group.profiles.full_name}</p>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <p className="text-xs text-gray-500">
                      Created {new Date(group.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex space-x-2">
                      {(permissions.canEditGroups && (user?.role === 'admin' || group.teacher_id === user?.id)) && (
                        <button 
                          onClick={() => showError('Edit functionality not implemented yet')}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Edit
                        </button>
                      )}
                      {permissions.canDeleteGroups && (
                        <button 
                          onClick={() => showError('Delete functionality not implemented yet')}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Delete
                        </button>
                      )}
                      {permissions.canManageRegistrations && (
                        <button 
                          onClick={() => showError('Manage functionality not implemented yet')}
                          className="text-green-600 hover:text-green-800 text-sm font-medium"
                        >
                          Manage
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-semibold text-gray-800">Add New Group</h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleAddGroup} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  name="name" 
                  placeholder="Group Name" 
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                  required 
                />
                <input 
                  name="subject" 
                  placeholder="Subject" 
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                  required 
                />
              </div>
              
              <textarea 
                name="description" 
                placeholder="Description" 
                rows={3}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  name="level" 
                  placeholder="Level (e.g., Beginner, Intermediate)" 
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                  required 
                />
                <input 
                  name="max_students" 
                  type="number" 
                  placeholder="Max Students" 
                  min="1"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                  required 
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  name="session_price" 
                  type="number" 
                  step="0.01" 
                  placeholder="Session Price" 
                  min="0"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                  required 
                />
                <input 
                  name="duration_minutes" 
                  type="number" 
                  placeholder="Duration (minutes)" 
                  min="1"
                  defaultValue="60"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                  required 
                />
              </div>
              
              <input 
                name="schedule_time" 
                type="time" 
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                required 
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Days</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                    <label key={day} className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        name="schedule_days" 
                        value={day}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm capitalize">{day}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Add Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}