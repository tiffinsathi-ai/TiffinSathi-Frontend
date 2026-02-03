import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import authStorage from '../helpers/authStorage';
import { isTokenExpired } from '../helpers/authUtils';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();
  const isAuthenticated = authStorage.isAuthenticated();
  const userRole = authStorage.getUserRole();
  
  useEffect(() => {
    // Check token on every protected route access
    const token = authStorage.getToken();
    if (token && isTokenExpired(token)) {
      authStorage.clearAuth();
      // Redirect will happen in the render below
    }
  }, [location]);

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return (
      <Navigate 
        to={`/login?message=${encodeURIComponent('Please login to continue')}&redirect=${encodeURIComponent(location.pathname)}`} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // If roles are specified and user doesn't have required role
  if (allowedRoles.length > 0 && userRole && !allowedRoles.includes(userRole.toUpperCase())) {
    // Redirect to appropriate dashboard based on role
    const redirectPath = userRole === 'ADMIN' ? '/admin' : 
                        userRole === 'VENDOR' ? '/vendor/dashboard' :
                        userRole === 'DELIVERY' ? '/delivery/deliveries' : '/';
    
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;