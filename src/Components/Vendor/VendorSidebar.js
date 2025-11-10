import React, { useState } from 'react';
import { BarChart3, UtensilsCrossed, Package, FileText, Settings, Users, Truck, Star } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const designTokens = {
  colors: {
    secondary: { main: '#6DB33F' },
    neutral: { gray400: '#CED4DA', gray800: '#343A40' },
    background: { dark: '#2D2D2D' },
    text: { inverse: '#FFFFFF' }
  }
};

const VendorSidebar = ({ isOpen }) => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', icon: BarChart3, label: 'Dashboard', path: '/vendor/dashboard' },
    { id: 'tiffins', icon: UtensilsCrossed, label: 'My Tiffins', path: '/vendor/tiffins' },
    { id: 'orders', icon: Package, label: 'Orders', path: '/vendor/orders' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics', path: '/vendor/analytics' },
    { id: 'earnings', icon: FileText, label: 'Earnings', path: '/vendor/earnings' },
    { id: 'customers', icon: Users, label: 'Customers', path: '/vendor/customers' },
    { id: 'delivery-partners', icon: Truck, label: 'Delivery Partners', path: '/vendor/delivery-partners' },
    { id: 'reviews', icon: Star, label: 'Reviews', path: '/vendor/reviews' },
    { id: 'settings', icon: Settings, label: 'Settings', path: '/vendor/settings' },
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
                  ? designTokens.colors.secondary.main 
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

export default VendorSidebar;