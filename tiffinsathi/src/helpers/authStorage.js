import { jwtDecode } from 'jwt-decode';

const decodeToken = (token) => {
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

const authStorage = {
  // Token management
  getToken: () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  },

  setToken: (token, remember = true) => {
    if (remember) {
      localStorage.setItem('token', token);
    } else {
      sessionStorage.setItem('token', token);
    }
  },

  clearToken: () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
  },

  // User management
  getUser: () => {
    try {
      const user = localStorage.getItem('user') || sessionStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },

  // Get vendor data specifically
  getVendor: () => {
    try {
      const user = localStorage.getItem('user') || sessionStorage.getItem('user');
      const parsedUser = user ? JSON.parse(user) : null;
      
      // Check if user is a vendor
      if (parsedUser && (parsedUser.role === 'VENDOR' || parsedUser.role === 'vendor')) {
        return parsedUser;
      }
      return null;
    } catch (error) {
      console.error('Error parsing vendor data:', error);
      return null;
    }
  },

  // NEW: Set vendor data (calls setUser internally)
  setVendor: (vendorData, remember = true) => {
    // Ensure the data has vendor role
    const vendorWithRole = {
      ...vendorData,
      role: 'VENDOR'
    };
    return authStorage.setUser(vendorWithRole, remember);
  },

  setUser: (user, remember = true) => {
    const userString = JSON.stringify(user);
    if (remember) {
      localStorage.setItem('user', userString);
    } else {
      sessionStorage.setItem('user', userString);
    }
  },

  clearUser: () => {
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
  },

  // Check if user is authenticated and token is valid
  isAuthenticated: () => {
    const token = authStorage.getToken();
    if (!token) return false;
    
    try {
      const decoded = decodeToken(token);
      if (!decoded) return false;
      
      const expiryTime = decoded.exp * 1000;
      const currentTime = Date.now();
      
      // Check if token is expired
      if (currentTime >= expiryTime) {
        // Auto-clear expired token
        authStorage.clearAuth();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking token:', error);
      return false;
    }
  },

  // Get user role from stored user data
  getUserRole: () => {
    const user = authStorage.getUser();
    return user?.role || null;
  },

  // Get user ID
  getUserId: () => {
    const user = authStorage.getUser();
    return user?.userId || user?.id || null;
  },

  // Get vendor ID (if user is a vendor)
  getVendorId: () => {
    const user = authStorage.getUser();
    if (user && (user.role === 'VENDOR' || user.role === 'vendor')) {
      return user?.vendorId || user?.id || null;
    }
    return null;
  },

  // Clear all authentication data
  clearAuth: () => {
    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    // Clear sessionStorage
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    
    // Clear other legacy items
    localStorage.removeItem("rememberedEmail");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    localStorage.removeItem("userRole");
    localStorage.removeItem("username");
  },

  // Check token expiry (returns true if valid, false if expired)
  checkTokenExpiry: () => {
    const token = authStorage.getToken();
    if (!token) return false;

    try {
      const decoded = decodeToken(token);
      if (!decoded) return false;

      const expiryTime = decoded.exp * 1000;
      const currentTime = Date.now();
      
      return currentTime < expiryTime;
    } catch (error) {
      console.error('Error checking token expiry:', error);
      return false;
    }
  },

  // Get token expiry time in milliseconds
  getTokenExpiryTime: () => {
    const token = authStorage.getToken();
    if (!token) return null;
    
    try {
      const decoded = decodeToken(token);
      return decoded.exp * 1000;
    } catch (error) {
      console.error('Error getting token expiry:', error);
      return null;
    }
  }
};

export default authStorage;