import React, { useState } from 'react';
import { BarChart3, Users, UtensilsCrossed, Package, FileText, Settings, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const designTokens = {
  colors: {
    primary: {
      main: '#E85D2C'
    },
    accent: {
      red: '#D94826'
    },
    neutral: {
      gray400: '#CED4DA',
      gray800: '#343A40'
    },
    background: {
      dark: '#2D2D2D'
    },
    text: {
      inverse: '#FFFFFF'
    }
  }
};

const AdminSidebar = ({ isOpen }) => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', icon: BarChart3, label: 'Dashboard', path: '/admin/dashboard' },
    { id: 'users', icon: Users, label: 'Users', path: '/admin/user-management' },
    { id: 'vendors', icon: UtensilsCrossed, label: 'Vendors', path: '/admin/vendors-management' },
    { id: 'orders', icon: Package, label: 'Orders', path: '/admin/orders' },
    { id: 'reports', icon: FileText, label: 'Reports', path: '/admin/reports' },
    { id: 'settings', icon: Settings, label: 'Settings', path: '/admin/settings' }
  ];

  if (!isOpen) return null;

  return (
    <aside
      className="w-64 h-screen sticky top-16 overflow-y-auto"
      style={{ backgroundColor: designTokens.colors.background.dark }}
    >
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          const isHovered = hoveredItem === item.id;
          
          return (
            <Link
              key={item.id}
              to={item.path}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200"
              style={{
                backgroundColor: isActive 
                  ? designTokens.colors.primary.main 
                  : (isHovered ? designTokens.colors.neutral.gray800 : 'transparent'),
                color: isActive || isHovered 
                  ? designTokens.colors.text.inverse 
                  : designTokens.colors.neutral.gray400,
                textDecoration: 'none'
              }}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}

      </nav>
    </aside>
  );
};

export default AdminSidebar;
