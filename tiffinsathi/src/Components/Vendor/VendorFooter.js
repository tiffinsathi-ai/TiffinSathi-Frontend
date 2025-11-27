// src/Components/Vendor/VendorFooter.js
import React from "react";

const VendorFooter = () => {
  return (
    <footer className="border-t bg-white p-4">
      <div className="max-w-7xl mx-auto text-sm text-gray-600 flex justify-between items-center">
        <div>© {new Date().getFullYear()} Tiffin Sathi</div>
        <div>
          <a href="#help" className="text-green-600">Help</a> · <a href="#terms" className="text-green-600">Terms</a>
        </div>
      </div>
    </footer>
  );
};

export default VendorFooter;