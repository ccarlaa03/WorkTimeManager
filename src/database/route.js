import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children, roles }) => {
  const { userRole } = useAuth();

  return roles.includes(userRole) ? children : <Navigate to="/" />;
};

export default ProtectedRoute;
