// src/Components/Vendor/VendorLayout.js
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import VendorNavbar from "./VendorNavbar";
import VendorSidebar from "./VendorSidebar";
import VendorFooter from "./VendorFooter";
import "../../Components/Styles/vendor.css"; // Fixed path

const VendorLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
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