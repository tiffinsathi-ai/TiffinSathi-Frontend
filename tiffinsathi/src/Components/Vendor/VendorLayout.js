import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import VendorNavbar from './VendorNavbar';
import VendorSidebar from './VendorSidebar';
import VendorFooter from './VendorFooter';

const designTokens = {
  colors: {
    background: {
      secondary: '#F8F9FA'
    }
  }
};

const VendorLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div 
      className="h-screen flex flex-col" 
      style={{ backgroundColor: designTokens.colors.background.secondary }}
    >
      <VendorNavbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
    
      <div className="flex flex-1 h-full overflow-hidden">
        
        <div className="h-full sticky top-0 overflow-y-auto">
          <VendorSidebar isOpen={sidebarOpen} />
        </div>
        
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
            <Outlet />
          </div>
          
          <VendorFooter />
        </main>
      </div>
    </div>
  );
};

export default VendorLayout;
