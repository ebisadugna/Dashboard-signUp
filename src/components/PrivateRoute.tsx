import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  adminOnly?: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ adminOnly = false }) => {
  const { currentUser, isAuthenticated } = useAuth();

  // Redirect to login if not authenticated
  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Redirect non-admin users from admin-only routes
  if (adminOnly && currentUser.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // Render the protected route
  return <Outlet />;
};

export default PrivateRoute;
