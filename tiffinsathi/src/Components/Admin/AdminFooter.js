import React from 'react';

const designTokens = {
  colors: {
    secondary: { main: '#6DB33F' },
    background: { secondary: '#F8F9FA' },
    text: { secondary: '#6C757D', tertiary: '#ADB5BD' },
    border: { light: '#E9ECEF' }
  }
};

const AdminFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      className="py-4 px-4 sm:px-6 lg:px-8 border-t bg-white mt-auto" // mt-auto reinforces sticky bottom behavior
      style={{ borderColor: designTokens.colors.border.light }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-2">
        <p 
          className="text-xs sm:text-sm text-center sm:text-left" 
          style={{ color: designTokens.colors.text.secondary }}
        >
          © {currentYear} Tiffin Sathi Admin Panel. All rights reserved.
        </p>
        <p 
          className="text-xs sm:text-sm text-center" 
          style={{ color: designTokens.colors.text.tertiary }}
        >
          Need help?{' '}
          <a 
            href="#support" 
            className="font-medium transition-colors hover:underline"
            style={{ color: designTokens.colors.secondary.main }}
          >
            Contact Support
          </a>
        </p>
      </div>
    </footer>
  );
};

export default AdminFooter;