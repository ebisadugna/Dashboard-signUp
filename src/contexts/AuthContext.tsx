'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

// Define the User type
export interface User {
  id: string
  role: 'admin' | 'user'
  email: string
  name: string
}

// Define the AuthContextType
export interface AuthContextType {
  currentUser: User | null
  isAuthenticated: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
}

// Create the context with the defined type
const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isAuthenticated: false,
  error: null,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
})

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Check if user is stored in localStorage
        const storedUser = localStorage.getItem('currentUser')
        if (storedUser) {
          const user = JSON.parse(storedUser)
          setCurrentUser(user)
        }
        setError(null)
      } catch (err) {
        setError('Failed to fetch user')
        console.error('Auth error:', err)
      }
    }

    fetchUser()
  }, [])

  const login = async (email: string, password: string) => {
    setError(null)
    try {
      // Simulate API call - replace with your actual login logic
      const user = await mockLogin(email, password)
      setCurrentUser(user)
      localStorage.setItem('currentUser', JSON.stringify(user))
    } catch (err) {
      setError('Login failed')
      throw err
    }
  }

  const register = async (email: string, password: string, name: string) => {
    setError(null)
    try {
      // Simulate API call - replace with your actual register logic
      const user = await mockRegister(email, password, name)
      setCurrentUser(user)
      localStorage.setItem('currentUser', JSON.stringify(user))
    } catch (err) {
      setError('Registration failed')
      throw err
    }
  }

  const logout = async () => {
    setCurrentUser(null)
    localStorage.removeItem('currentUser')
  }

  const value: AuthContextType = {
    currentUser,
    isAuthenticated: !!currentUser,
    error,
    login,
    logout,
    register
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Mock functions - replace with real API calls
const mockLogin = async (email: string, password: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email === 'admin@example.com' && password === 'admin') {
        resolve({ id: '1', role: 'admin', email, name: 'Admin User' })
      } else if (email === 'user@example.com' && password === 'user') {
        resolve({ id: '2', role: 'user', email, name: 'Regular User' })
      } else {
        reject(new Error('Invalid credentials'))
      }
    }, 1000)
  })
}

const mockRegister = async (email: string, password: string, name: string): Promise<User> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ 
        id: Math.random().toString(36).substr(2, 9), 
        role: 'user', 
        email, 
        name 
      })
    }, 1000)
  })
}
