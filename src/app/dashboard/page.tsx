'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) {
      router.push('/');
    }
  }, [currentUser, router]);

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-4 mb-6">
            {currentUser.photoURL && (
              <img
                src={currentUser.photoURL}
                alt="Profile"
                className="w-12 h-12 rounded-full"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome, {currentUser.displayName || currentUser.email}!
              </h1>
              <p className="text-gray-600">{currentUser.email}</p>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Your Account Details</h2>
            <div className="space-y-2 text-gray-600">
              <p>User ID: {currentUser.uid}</p>
              <p>Email verified: {currentUser.emailVerified ? 'Yes' : 'No'}</p>
              <p>Account created: {currentUser.metadata.creationTime}</p>
              <p>Last sign in: {currentUser.metadata.lastSignInTime}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 