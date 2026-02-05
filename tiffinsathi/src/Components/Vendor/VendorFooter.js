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
      style={{ borderColor: designTokens.colors.border.light }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-2">
        <p 
          className="text-xs sm:text-sm text-center sm:text-left" 
          style={{ color: designTokens.colors.text.secondary }}
        >
          © {currentYear} Tiffin Sathi Vendor Panel. All rights reserved.
        </p>
        <div className="flex items-center gap-3">
          <a 
            href="#help" 
            className="text-xs sm:text-sm font-medium transition-colors hover:underline"
            style={{ color: designTokens.colors.secondary.main }}
          >
            Help
          </a>
          <a 
            href="#terms" 
            className="text-xs sm:text-sm font-medium transition-colors hover:underline"
            style={{ color: designTokens.colors.secondary.main }}
          >
            Terms
          </a>
          <a 
            href="#privacy" 
            className="text-xs sm:text-sm font-medium transition-colors hover:underline"
            style={{ color: designTokens.colors.secondary.main }}
          >
            Privacy
          </a>
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