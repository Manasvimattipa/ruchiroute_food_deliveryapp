import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminProtectedRoute = ({ children }) => {
  const { adminUser, adminLoading } = useAuth();

  if (adminLoading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Checking Permissions...</div>;
  }

  if (!adminUser) {
    return <Navigate to="/admin" />;
  }

  return children;
};

export default AdminProtectedRoute;
