import React, { useEffect } from 'react'
import Header from './Header'
import { Outlet, useNavigate } from 'react-router-dom'
import Footer from './Footer'
import authStorage from '../../helpers/authStorage';
import { isTokenExpired } from '../../helpers/authUtils';

const Layout = () => {
  const navigate = useNavigate();

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      const token = authStorage.getToken();
      const userRole = authStorage.getUserRole();
      
      // If token exists and is expired, clear it
      if (token && isTokenExpired(token)) {
        authStorage.clearAuth();
      }
      
      // If user is not a regular user, redirect to appropriate portal
      if (userRole && !['USER', null].includes(userRole)) {
        const redirectPath = userRole === 'ADMIN' ? '/admin' :
                            userRole === 'VENDOR' ? '/vendor/dashboard' :
                            userRole === 'DELIVERY' ? '/delivery/deliveries' : '/';
        navigate(redirectPath);
      }
    };

    checkAuth();

    // Set up interval to check token expiration every minute
    const intervalId = setInterval(() => {
      const token = authStorage.getToken();
      if (token && isTokenExpired(token)) {
        authStorage.clearAuth();
      }
    }, 60000);

    return () => clearInterval(intervalId);
  }, [navigate]);

  return (
    <div className='min-h-screen flex flex-col'>
        <Header />
        
        <main className='flex-1 w-full'>
            <Outlet />
        </main>

        <Footer />
    </div>
  )
}

export default Layout