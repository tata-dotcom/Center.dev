"use client";

import React, { useState, useEffect } from "react";
import { supabase } from '@/lib/supabaseClient';
import { Student, Subscription } from '@/types/database';

export default function StudentsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // fetch students and subscriptions
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Starting to fetch data...");
        
        // جلب بيانات الطلاب أولاً
        const studentsResult = await supabase
          .from("students")
          .select("*")
          .order("created_at", { ascending: false });
        
        console.log("Students result:", studentsResult);
        
        if (studentsResult.error) {
          console.error("Error fetching students:", studentsResult.error);
        } else {
          console.log("Students data:", studentsResult.data);
          console.log("First student:", studentsResult.data?.[0]);
          setStudents(studentsResult.data || []);
        }
        
        // جلب بيانات الاشتراكات
        const subscriptionsResult = await supabase
          .from("subscriptions")
          .select("*")
          .eq("status", "active");
        
        console.log("Subscriptions result:", subscriptionsResult);
        
        if (subscriptionsResult.error) {
          console.error("Error fetching subscriptions:", subscriptionsResult.error);
        } else {
          console.log("Subscriptions data:", subscriptionsResult.data);
          setSubscriptions(subscriptionsResult.data || []);
        }
      } catch (err) {
        console.error("Unexpected error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // add student
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const name_student = (form.elements.namedItem("name") as HTMLInputElement).value;
    const phone_number = (form.elements.namedItem("phone") as HTMLInputElement).value;
    const academic_year = (form.elements.namedItem("grade") as HTMLInputElement).value;
    const paid_amount = Number((form.elements.namedItem("total_paid") as HTMLInputElement).value) || 0;
    const remaining_amount = Number((form.elements.namedItem("remaining") as HTMLInputElement).value) || 0;
    const current_sessions = Number((form.elements.namedItem("sessions_left") as HTMLInputElement).value) || 0;

    try {
      const { data, error } = await supabase
        .from("students")
        .insert([{ name_student, phone_number, academic_year, paid_amount, remaining_amount, current_sessions }])
        .select();

      if (error) {
        console.error("Error adding student:", error.message || error);
        // You could add user-facing error notification here
      } else if (data) {
        setStudents([data[0], ...students]);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setIsOpen(false);
      form.reset();
    }
  };

  // delete student
  const handleDeleteStudent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    
    try {
      const { error } = await supabase.from("students").delete().eq("id", id);
      if (error) {
        console.error("Error deleting student:", error.message || error);
      } else {
        setStudents(students.filter((s) => s.id !== id));
      }
    } catch (err) {
      console.error("Unexpected error deleting student:", err);
    }
  };

  // edit student
  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const form = e.target as HTMLFormElement;
    const paid_amount = Number((form.elements.namedItem("total_paid") as HTMLInputElement).value) || 0;
    const remaining_amount = Number((form.elements.namedItem("remaining") as HTMLInputElement).value) || 0;
    const current_sessions = Number((form.elements.namedItem("sessions_left") as HTMLInputElement).value) || 0;

    try {
      const { data, error } = await supabase
        .from("students")
        .update({ paid_amount, remaining_amount, current_sessions })
        .eq("id", selectedStudent.id)
        .select();

      if (error) {
        console.error("Error updating student:", error.message || error);
      } else if (data) {
        setStudents(students.map((s) => (s.id === selectedStudent.id ? data[0] : s)));
      }
    } catch (err) {
      console.error("Unexpected error updating student:", err);
    } finally {
      setEditOpen(false);
      setSelectedStudent(null);
    }
  };

  // دالة للحصول على بيانات الاشتراك لطالب معين
  const getStudentSubscription = (studentId: string) => {
    return subscriptions.find(sub => sub.student_id === studentId);
  };

  const filteredStudents = students.filter((s) =>
    s.name_student?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Student Management</h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">Manage all student records in one place</p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 flex items-center shadow-md hover:shadow-lg transition-all duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add New Student
        </button>
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
              <h3 className="text-gray-600 text-sm font-medium">Total Students</h3>
              <p className="text-2xl font-bold text-gray-800 mt-1">{students.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="rounded-full bg-green-100 p-2 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-gray-600 text-sm font-medium">Total Paid</h3>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {students.reduce((sum, s) => sum + (s.paid_amount || 0), 0).toLocaleString("en-US", {
                  style: "currency",
                  currency: "EGP",
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="rounded-full bg-blue-100 p-2 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-gray-600 text-sm font-medium">Total Sessions Left</h3>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {subscriptions.reduce((sum, sub) => sum + (sub.remaining_sessions || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 md:px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center">
          <h2 className="text-lg font-semibold text-gray-800 mb-2 md:mb-0">All Students</h2>
          
          {/* Search */}
          <div className="relative w-full md:w-auto">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search students by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full md:w-64"
            />
          </div>
        </div>

        <div className="p-4 md:p-6">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search or add a new student.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Sessions</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sessions Left</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((s) => {
                    console.log("Rendering student:", s);
                    return (
                    <tr key={s.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="font-medium text-indigo-800">{s.name_student?.charAt(0) || 'N'}</span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{s.name_student}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{s.phone_number}</td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {s.academic_year}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                        EGP{s.paid_amount ?? 'N/A'}
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                        EGP{s.remaining_amount ?? 'N/A'}
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                        {getStudentSubscription(s.id)?.total_sessions || 0}
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${(getStudentSubscription(s.id)?.remaining_sessions || 0) > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {getStudentSubscription(s.id)?.remaining_sessions || 0}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded-md text-sm flex items-center"
                            onClick={() => {
                              setSelectedStudent(s);
                              setEditOpen(true);
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded-md text-sm flex items-center"
                            onClick={() => handleDeleteStudent(s.id)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Student Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add New Student</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  name="name" 
                  placeholder="Full Name" 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input 
                  name="phone" 
                  placeholder="Phone" 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                <input 
                  name="grade" 
                  placeholder="Grade" 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Paid (ُEGP)</label>
                <input 
                  name="total_paid" 
                  type="number" 
                  placeholder="Total Paid" 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remaining Amount (EGP)</label>
                <input 
                  name="remaining" 
                  type="number" 
                  placeholder="Remaining Amount" 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Sessions</label>
                <input 
                  name="sessions_left" 
                  type="number" 
                  placeholder="Current Sessions" 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)} 
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Edit Student Payment</h2>
              <button onClick={() => setEditOpen(false)} className="text-gray-400 hover:text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <p className="font-medium">{selectedStudent.name_student}</p>
              <p className="text-sm text-gray-600">{selectedStudent.phone_number} • Grade: {selectedStudent.academic_year}</p>
            </div>
            <form onSubmit={handleEditStudent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Paid (EGP)</label>
                <input
                  name="total_paid"
                  type="number"
                  defaultValue={selectedStudent.paid_amount}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remaining Amount (EGP)</label>
                <input
                  name="remaining"
                  type="number"
                  defaultValue={selectedStudent.remaining_amount}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Sessions</label>
                <input
                  name="sessions_left"
                  type="number"
                  defaultValue={selectedStudent.current_sessions}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setEditOpen(false)} 
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}