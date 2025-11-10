import React from 'react';

const designTokens = {
  colors: {
    background: {
      secondary: '#F8F9FA'
    },
    text: {
      secondary: '#6C757D',
      tertiary: '#ADB5BD'
    },
    border: {
      light: '#E9ECEF'
    }
  }
};

const AdminFooter = () => {
  return (
    <footer 
      className="py-4 px-6 border-t mt-auto" 
      style={{ 
        backgroundColor: designTokens.colors.background.secondary,
        borderColor: designTokens.colors.border.light 
      }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
        <p className="text-sm" style={{ color: designTokens.colors.text.secondary }}>
          © 2025 Tiffin Sathi Admin Panel
        </p>
        <p className="text-sm" style={{ color: designTokens.colors.text.tertiary }}>
          Version 1.0.0
        </p>
      </div>
    </footer>
  );
};

export default AdminFooter;
