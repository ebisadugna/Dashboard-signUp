'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import GoogleSignInButton from './GoogleSignInButton';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login({ email, password });
      router.push('/dashboard');
    } catch (err: any) {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result.user) {
        const { displayName, email, photoURL, uid } = result.user;
        console.log('Google Sign-In successful:', { displayName, email, photoURL, uid });
        router.push('/dashboard');
      }
    } catch (err: any) {
      if (err.message) {
        setError(err.message);
      } else {
        setError('Failed to sign in with Google');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1579547621113-e4bb2a19bdd6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
      </div>

      {/* Login Form Card */}
      <div className="w-full max-w-md px-6 py-8 bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-gray-200">Sign in to continue to your account</p>
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-100 border border-red-400">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-200">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              className="mt-1 block w-full px-4 py-3 bg-white bg-opacity-20 border border-gray-300 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-200">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              className="mt-1 block w-full px-4 py-3 bg-white bg-opacity-20 border border-gray-300 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-gray-200">Or continue with</span>
            </div>
          </div>

          <GoogleSignInButton
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full"
          />

          <p className="mt-4 text-center text-sm text-gray-200">
            Don't have an account?{' '}
            <button
              onClick={() => router.push('/register')}
              className="font-medium text-indigo-400 hover:text-indigo-300 transition duration-150"
            >
              Sign up
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login; 