import React, { type JSX } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 *
 * Wraps around routes that require authentication.
 * - If the authentication state is still being resolved, it shows a loading indicator.
 * - If the user is not authenticated, it redirects to the login page.
 * - If authenticated, it renders the protected content.
 */
const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { isAuthenticated, ready } = useAuth();
  if (!ready) return <div style={{ padding: 20 }}>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

export default ProtectedRoute;
