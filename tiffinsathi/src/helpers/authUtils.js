import authStorage from './authStorage';
import { jwtDecode } from 'jwt-decode';

// Flag to prevent multiple simultaneous redirects
let isHandlingExpiry = false;

// Install jwt-decode if not already installed: npm install jwt-decode

export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Convert to seconds
    return decoded.exp < currentTime;
  } catch (error) {
    console.error('Error decoding token:', error);
    return true;
  }
};

export const getTokenExpiryTime = (token) => {
  if (!token) return null;
  
  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000; // Convert to milliseconds
  } catch (error) {
    console.error('Error getting token expiry:', error);
    return null;
  }
};

export const getTokenRemainingTime = (token) => {
  const expiryTime = getTokenExpiryTime(token);
  if (!expiryTime) return 0;
  
  return expiryTime - Date.now();
};

export const shouldRefreshToken = (token) => {
  const remainingTime = getTokenRemainingTime(token);
  // Refresh if token expires in less than 5 minutes
  return remainingTime > 0 && remainingTime < 5 * 60 * 1000;
};

export const getRedirectPath = (role) => {
  switch (role?.toUpperCase()) {
    case 'ADMIN':
      return '/admin';
    case 'DELIVERY':
      return '/delivery';  // ✅ CHANGED: Fixed to just "/delivery"
    case 'VENDOR':
      return '/vendor/dashboard';
    case 'USER':
    default:
      return '/';
  }
};

export const handleTokenExpiration = () => {
  // Prevent multiple simultaneous redirects
  if (isHandlingExpiry) return;
  
  isHandlingExpiry = true;
  authStorage.clearAuth();
  
  const currentPath = window.location.pathname;
  
  // Only redirect if not already on login page
  if (!currentPath.includes('/login')) {
    const loginUrl = `/login?message=${encodeURIComponent('Session expired. Please login again.')}&redirect=${encodeURIComponent(currentPath)}`;
    window.location.href = loginUrl;
  }
  
  // Reset flag after 2 seconds
  setTimeout(() => {
    isHandlingExpiry = false;
  }, 2000);
};