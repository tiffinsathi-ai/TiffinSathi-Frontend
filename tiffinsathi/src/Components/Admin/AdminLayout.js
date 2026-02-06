import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';
import AdminFooter from './AdminFooter';
import authStorage from '../../helpers/authStorage';
import { isTokenExpired } from '../../helpers/authUtils';

const AdminLayout = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check authentication on mount and when token changes
  useEffect(() => {
    const checkAuth = () => {
      const token = authStorage.getToken();
      const userRole = authStorage.getUserRole();
      
      // Check if token exists and is not expired
      if (!token || isTokenExpired(token)) {
        authStorage.clearAuth();
        navigate(`/login?message=${encodeURIComponent('Session expired. Please login again.')}`);
        return;
      }
      
      // Check if user has admin role
      if (userRole !== 'ADMIN') {
        // Redirect based on actual role
        const redirectPath = userRole === 'VENDOR' ? '/vendor/dashboard' :
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
        navigate(`/login?message=${encodeURIComponent('Session expired. Please login again.')}`);
      }
    }, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, [navigate]);

  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      // On desktop, keep sidebar open by default
      if (!mobile) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // useEffect(() => {
  //   const token = localStorage.getItem('token');
  //   if (!token) {
  //     navigate('/login');
  //   }
  // }, []);   

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebarOnMobile = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 1. Navbar - Fixed at the top */}
      <div className="fixed top-0 left-0 right-0 z-50 h-16">
        <AdminNavbar 
          onToggleSidebar={toggleSidebar} 
          isMobile={isMobile}
        />
      </div>
    
      {/* Container for Sidebar and Main Content */}
      <div className="flex flex-1 pt-16"> 
        
        {/* 2. Sidebar - Fixed Left, height calculated to fill space below navbar */}
        <div 
          className={`fixed inset-y-0 left-0 z-30 pt-16 lg:pt-0
            transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
            lg:translate-x-0 transition-transform duration-300 ease-in-out
            lg:top-16 lg:bottom-0 lg:h-[calc(100vh-4rem)]`}
        >
          <div className={`${sidebarOpen ? 'w-64' : 'w-0'} h-full`}>
            <AdminSidebar 
              isOpen={sidebarOpen} 
              onItemClick={closeSidebarOnMobile}
            />
          </div>
        </div>
        
        {/* Backdrop for mobile sidebar */}
        {sidebarOpen && isMobile && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* 3. Main content - Pushed right by sidebar width on desktop */}
        <main 
          className={`flex-1 flex flex-col min-h-[calc(100vh-4rem)] transition-all duration-300 ease-in-out
          ${sidebarOpen && !isMobile ? 'lg:ml-64' : ''}`}
        >
          <div className="flex-1 p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
          
          <AdminFooter />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;