import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell, User, Settings, LogOut, UserCircle, Shield } from 'lucide-react';

const designTokens = {
  colors: {
    primary: {
      main: '#E85D2C',
      hover: '#D45426'
    },
    accent: {
      red: '#D94826'
    },
    background: {
      primary: '#FFFFFF'
    },
    text: {
      primary: '#212529',
      secondary: '#6C757D'
    },
    border: {
      light: '#E9ECEF'
    }
  }
};

const AdminNavbar = ({ onToggleSidebar }) => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav style={{ backgroundColor: designTokens.colors.primary.main, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} className="sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={onToggleSidebar}
              className="p-2 rounded-lg transition-all duration-200 text-white"
              style={{ backgroundColor: hoveredItem === 'menu' ? designTokens.colors.primary.hover : 'transparent' }}
              onMouseEnter={() => setHoveredItem('menu')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-white">Tiffin Sathi Admin</h1>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button 
              className="relative p-2 rounded-lg transition-all duration-200 text-white"
              style={{ backgroundColor: hoveredItem === 'bell' ? designTokens.colors.primary.hover : 'transparent' }}
              onMouseEnter={() => setHoveredItem('bell')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Bell size={24} />
              <span className="absolute -top-1 -right-1 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center text-white"
                style={{ backgroundColor: designTokens.colors.accent.red }}>
                5
              </span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-white transition-all duration-200" 
                style={{ backgroundColor: isDropdownOpen ? designTokens.colors.primary.hover : designTokens.colors.primary.hover }}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                  <User size={20} />
                </div>
                <span className="text-sm font-medium hidden sm:inline">Admin User</span>
                <svg 
                  className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg overflow-hidden"
                  style={{ 
                    backgroundColor: designTokens.colors.background.primary,
                    border: `1px solid ${designTokens.colors.border.light}`
                  }}
                >
                  {/* User Info Section */}
                  <div className="px-4 py-3 border-b" style={{ borderColor: designTokens.colors.border.light }}>
                    <p className="text-sm font-semibold" style={{ color: designTokens.colors.text.primary }}>
                      Admin User
                    </p>
                    <p className="text-xs" style={{ color: designTokens.colors.text.secondary }}>
                      admin@tiffinsathi.com
                    </p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <a 
                      href="#profile"
                      className="flex items-center gap-3 px-4 py-2 transition-colors"
                      style={{ color: designTokens.colors.text.primary }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8F9FA'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <UserCircle size={18} />
                      <span className="text-sm">My Profile</span>
                    </a>

                    <a 
                      href="#settings"
                      className="flex items-center gap-3 px-4 py-2 transition-colors"
                      style={{ color: designTokens.colors.text.primary }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8F9FA'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Settings size={18} />
                      <span className="text-sm">Settings</span>
                    </a>

                    <a 
                      href="#admin-panel"
                      className="flex items-center gap-3 px-4 py-2 transition-colors"
                      style={{ color: designTokens.colors.text.primary }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8F9FA'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Shield size={18} />
                      <span className="text-sm">Admin Panel</span>
                    </a>
                  </div>

                  {/* Logout Section */}
                  <div className="border-t" style={{ borderColor: designTokens.colors.border.light }}>
                    <button 
                      className="flex items-center gap-3 w-full px-4 py-2 transition-colors"
                      style={{ color: designTokens.colors.accent.red }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <LogOut size={18} />
                      <span className="text-sm font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
