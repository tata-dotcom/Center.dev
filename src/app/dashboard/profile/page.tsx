'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useUserStore } from '@/store/userStore';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function ProfilePage() {
  const { user, initialize, isLoading } = useUserStore();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/auth/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      setFirstName(user.user_metadata?.first_name || '');
      setLastName(user.user_metadata?.last_name || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsUpdating(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          full_name: `${firstName.trim()} ${lastName.trim()}`
        }
      });

      if (error) {
        setMessage(`Error: ${error.message}`);
      } else {
        setMessage('Profile updated successfully!');
        setIsEditing(false);
      }
    } catch {
      setMessage('An unexpected error occurred');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-8 w-8 border-2 border-t-transparent border-indigo-500 rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="text-gray-400 hover:text-white mr-4"
              >
                ← Back
              </button>
              <h1 className="text-xl font-semibold">Profile Settings</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-800 rounded-lg p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Profile Information</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>

          {message && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={`mb-4 p-3 rounded-md ${
                message.includes('Error') 
                  ? 'bg-red-500/10 border border-red-500 text-red-500'
                  : 'bg-green-500/10 border border-green-500 text-green-500'
              }`}
            >
              {message}
            </motion.div>
          )}

          {isEditing ? (
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-md border border-gray-600 bg-gray-700 px-4 py-2 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-md border border-gray-600 bg-gray-700 px-4 py-2 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={user.email || ''}
                  disabled
                  className="w-full rounded-md border border-gray-600 bg-gray-600 px-4 py-2 text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 px-6 py-2 rounded-md font-medium transition-colors"
                >
                  {isUpdating ? 'Updating...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFirstName(user.user_metadata?.first_name || '');
                    setLastName(user.user_metadata?.last_name || '');
                    setMessage('');
                  }}
                  className="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded-md font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">First Name</label>
                <p className="text-lg">{user.user_metadata?.first_name || 'Not set'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Last Name</label>
                <p className="text-lg">{user.user_metadata?.last_name || 'Not set'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                <p className="text-lg">{user.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">User ID</label>
                <p className="text-sm font-mono bg-gray-700 p-2 rounded">{user.id}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Account Created</label>
                <p className="text-lg">{new Date(user.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}