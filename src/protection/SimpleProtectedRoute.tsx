import React, { type JSX } from 'react';
import { Navigate } from 'react-router-dom';

type SimpleProtectedRouteProps = {
  children: JSX.Element;
};

/**
 * I only use it for gallery paths, as I also show the password on the main page and it
 * is just for the experience that the user must enter the date of our relationship.
 *
 */
const SimpleProtectedRoute: React.FC<SimpleProtectedRouteProps> = ({ children }) => {
  const auth = sessionStorage.getItem('auth');

  if (auth !== 'true') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default SimpleProtectedRoute;
