import React from 'react';

const designTokens = {
  colors: {
    secondary: { main: '#16A34A' },
    background: { secondary: '#F8FAFC' },
    text: { secondary: '#475569', tertiary: '#64748B' },
    border: { light: '#E2E8F0' }
  }
};

const VendorFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      className="py-4 px-4 sm:px-6 lg:px-8 border-t bg-white mt-auto"
      style={{ 
        backgroundColor: designTokens.colors.background.secondary,
        borderColor: designTokens.colors.border.light 
      }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-2">
        <div className="flex items-center gap-2">
          <span 
            className="text-xs sm:text-sm font-semibold"
            style={{ color: designTokens.colors.secondary.main }}
          >
            Tiffin Sathi
          </span>
          <span 
            className="text-xs sm:text-sm"
            style={{ color: designTokens.colors.text.secondary }}
          >
            © {currentYear} Vendor Panel. All rights reserved.
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <a 
            href="/vendor/support" 
            className="text-xs sm:text-sm font-medium transition-colors hover:underline"
            style={{ color: designTokens.colors.secondary.main }}
          >
            Help Center
          </a>
          <span className="text-gray-300">|</span>
          <a 
            href="/vendor/terms" 
            className="text-xs sm:text-sm font-medium transition-colors hover:underline"
            style={{ color: designTokens.colors.text.secondary }}
          >
            Terms
          </a>
          <span className="text-gray-300">|</span>
          <a 
            href="/vendor/privacy" 
            className="text-xs sm:text-sm font-medium transition-colors hover:underline"
            style={{ color: designTokens.colors.text.secondary }}
          >
            Privacy
          </a>
        </div>
      </div>
      
      <div className="mt-2 text-center">
        <span 
          className="text-xs"
          style={{ color: designTokens.colors.text.tertiary }}
        >
          Version 2.0.0 • Last updated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      </div>
    </footer>
  );
};

export default VendorFooter;