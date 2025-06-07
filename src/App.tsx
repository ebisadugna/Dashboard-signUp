'use client';

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from '../frontend/src/pages/Login';
import Register from '../frontend/src/pages/Register';
import Dashboard from '../frontend/src/pages/Dashboard';
import AdminDashboard from '../frontend/src/pages/AdminDashboard';
import PrivateRoute from './components/PrivateRoute';
import { useAuth } from './contexts/AuthContext';

const RedirectBasedOnRole = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (currentUser?.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  return null;
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RedirectBasedOnRole />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
          
          <Route element={<PrivateRoute adminOnly />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          <Route path="/unauthorized" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App; 