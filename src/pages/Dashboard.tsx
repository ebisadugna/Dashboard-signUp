'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
    } else {
      setLoading(false);
    }
  }, [currentUser, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      setError('Failed to log out');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <div className="flex items-center">
              {currentUser && (
                <div className="flex items-center space-x-4">
                  {currentUser.photoURL && (
                    <img
                      src={currentUser.photoURL}
                      alt="Profile"
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <span className="text-gray-700">
                    Welcome, {currentUser.displayName || currentUser.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              {currentUser.photoURL && (
                <img
                  src={currentUser.photoURL}
                  alt="Profile"
                  className="w-20 h-20 rounded-full"
                />
              )}
              <div>
                <p className="text-lg font-medium">{currentUser.displayName || 'No name set'}</p>
                <p className="text-gray-600">{currentUser.email}</p>
              </div>
            </div>
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-2">Account Details</h3>
              <div className="space-y-2 text-gray-600">
                <p>Email verified: {currentUser.emailVerified ? 'Yes' : 'No'}</p>
                <p>Account created: {currentUser.metadata.creationTime}</p>
                <p>Last sign in: {currentUser.metadata.lastSignInTime}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 