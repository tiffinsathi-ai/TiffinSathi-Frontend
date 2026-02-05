import React, { useEffect } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import ScrollToTop from "./Components/ScrollToTop";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./Pages/User/Home";
import Packages from "./Pages/User/Packages";
import Restaurant from "./Pages/User/Restaurant";
import Login from "./Pages/Login";
import Signup from "./Pages/User/Signup";
import ForgetPassword from "./Pages/User/ForgetPassword";
import VerifyOTP from "./Pages/User/VerifyOTP";
import ResetPassword from "./Pages/User/ResetPassword";
import VendorSignup from "./Pages/Vendor/VendorSignup";

// ---------- User ----------
import UserProfile from "./Pages/User/UserProfile";
import Layout from "./Components/Users/Layout";
import ScheduleCustomization from "./Pages/User/ScheduleCustomization";
import Checkout from "./Pages/User/Checkout";
import MySubscription from "./Pages/User/MySubscription";
import PaymentSuccess from "./Pages/Payment/PaymentSuccess";
import PaymentFailure from "./Pages/Payment/PaymentFailure";
import PaymentStatus from "./Pages/Payment/PaymentStatus";

// ---------- Vendor ----------
import VendorLayout from "./Components/Vendor/VendorLayout";
import Dashboard from "./Pages/Vendor/Dashboard";
import Analytics from "./Pages/Vendor/Analytics";
import Earnings from "./Pages/Vendor/Earnings";
import Orders from "./Pages/Vendor/Orders";
import Tiffins from "./Pages/Vendor/Tiffins";
import Settings from "./Pages/Vendor/Settings";
import DeliveryPartners from "./Pages/Vendor/DeliveryPartners";
import Customers from "./Pages/Vendor/Customers";
import Subscriptions from "./Pages/Vendor/Subscriptions";
import Reviews from "./Pages/Vendor/Reviews";
import VendorProfile from "./Pages/Vendor/VendorProfile";
import MealManagement from "./Pages/Vendor/MealManagement";
import DeliveryPartnersPage from "./Pages/Vendor/DeliveryPartnerPage";

// ---------- Admin ----------
import AdminLayout from "./Components/Admin/AdminLayout";
import UserManagementTable from "./Pages/Admin/UserManagement";
import VendorManagementTable from "./Pages/Admin/VendorManagement";
import AdminDashboard from "./Pages/Admin/AdminDashboard";
import AdminProfile from "./Pages/Admin/AdminProfile";
import PaymentManagement from "./Pages/Admin/PaymentManagement";
import ActivitiesPage from "./Pages/Admin/ActivitiesPage";
import AnalyticsPage from "./Pages/Admin/Analytics";
import AdminSetting from "./Pages/Admin/AdminSetting";

// ---------- Delivery ----------
import DeliveryLayout from "./Components/Delivery/DeliveryLayout";
import DeliveryProfile from "./Pages/Delivery/DeliveryProfile";
import DeliveryDashboard from "./Pages/Delivery/DeliveryDashboard";
import OrderDeliveries from "./Pages/Delivery/OrderDeliveries";
import DeliveryRoutes from "./Pages/Delivery/DeliveryRoutes";
import Schedules from "./Pages/Delivery/Schedules";
import DeliveryPerformance from "./Pages/Delivery/DeliveryPerformance";
import EditSchedule from "./Pages/User/EditSchedule";
import EditCheckout from "./Pages/User/EditCheckout";
import EditSuccess from "./Pages/User/EditSuccess";

// Import authStorage and utilities
import authStorage from "./helpers/authStorage";
import { isTokenExpired } from "./helpers/authUtils";

// Navigation Guard Component
const NavigationGuard = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const currentPath = location.pathname;
      const token = authStorage.getToken();
      
      // Public routes that don't require authentication
      const publicRoutes = [
        '/login',
        '/signup',
        '/forgot-password',
        '/reset-password',
        '/verify-otp',
        '/vendor-signup',
        '/',
        '/restaurants',
        '/packages',
        '/payment/success',
        '/payment/failure',
        '/payment/status'
      ];

      // Check if current route is public
      const isPublicRoute = publicRoutes.some(route => 
        currentPath === route || currentPath.startsWith(route + '/')
      );

      // If it's a public route, no need to check auth
      if (isPublicRoute) return;

      // Check if token exists
      if (!token) {
        // Redirect to login with redirect URL
        navigate(`/login?message=${encodeURIComponent('Please login to continue')}&redirect=${encodeURIComponent(currentPath)}`, {
          replace: true
        });
        return;
      }

      // Check if token is expired
      if (isTokenExpired(token)) {
        authStorage.clearAuth();
        navigate(`/login?message=${encodeURIComponent('Session expired. Please login again.')}&redirect=${encodeURIComponent(currentPath)}`, {
          replace: true
        });
        return;
      }

      // Get user role
      const userRole = authStorage.getUserRole();
      if (!userRole) {
        authStorage.clearAuth();
        navigate(`/login?message=${encodeURIComponent('User role not found. Please login again.')}`, {
          replace: true
        });
        return;
      }

      // Role-based route protection
      const roleRoutes = {
        'VENDOR': ['/vendor', '/vendor/dashboard', '/vendor/tiffins', '/vendor/orders', '/vendor/subscriptions', '/vendor/earnings', '/vendor/analytics', '/vendor/customers', '/vendor/delivery-partners', '/vendor/reviews', '/vendor/settings', '/vendor/profile', '/vendor/meal', '/vendor/delivery-partner'],
        'ADMIN': ['/admin', '/admin/dashboard', '/admin/analytics', '/admin/users', '/admin/vendors', '/admin/payments', '/admin/settings', '/admin/activities', '/admin/profile'],
        'DELIVERY': ['/delivery', '/delivery/dashboard', '/delivery/orders', '/delivery/routes', '/delivery/schedule', '/delivery/performance', '/delivery/profile', '/delivery/deliveries'],
        'USER': ['/user', '/user/profile', '/user/subscriptions', '/user/checkout', '/payment', '/schedule-customization', '/checkout']
      };

      const allowedRoutes = roleRoutes[userRole.toUpperCase()] || [];
      
      // Check if current route is allowed for user's role
      const isRouteAllowed = allowedRoutes.some(route => 
        currentPath.startsWith(route)
      );

      // Allow all routes starting with /user/ for USER role
      if (userRole.toUpperCase() === 'USER' && currentPath.startsWith('/user/')) {
        // Already allowed in the array
      } 
      // Allow all routes starting with /vendor/ for VENDOR role
      else if (userRole.toUpperCase() === 'VENDOR' && currentPath.startsWith('/vendor/')) {
        // Already allowed in the array
      }
      // Allow all routes starting with /admin/ for ADMIN role
      else if (userRole.toUpperCase() === 'ADMIN' && currentPath.startsWith('/admin/')) {
        // Already allowed in the array
      }
      // Allow all routes starting with /delivery/ for DELIVERY role
      else if (userRole.toUpperCase() === 'DELIVERY' && currentPath.startsWith('/delivery/')) {
        // Already allowed in the array
      }
      else if (!isRouteAllowed) {
        // Redirect to appropriate dashboard based on role
        const dashboardRoutes = {
          'VENDOR': '/vendor/dashboard',
          'ADMIN': '/admin',
          'DELIVERY': '/delivery', // CHANGED: Now points to /delivery (which will show DeliveryDashboard)
          'USER': '/'
        };
        
        navigate(dashboardRoutes[userRole.toUpperCase()] || '/', {
          replace: true
        });
      }
    };

    // Check authentication on route change
    checkAuth();

    // Set up interval to check token expiry every 30 seconds
    const intervalId = setInterval(() => {
      const token = authStorage.getToken();
      if (token && isTokenExpired(token)) {
        clearInterval(intervalId);
        authStorage.clearAuth();
        const currentPath = window.location.pathname;
        
        // Only redirect if not already on login page
        if (!currentPath.includes('/login')) {
          navigate(`/login?message=${encodeURIComponent('Session expired. Please login again.')}&redirect=${encodeURIComponent(currentPath)}`, {
            replace: true
          });
        }
      }
    }, 30000);

    return () => clearInterval(intervalId);
  }, [location.pathname, navigate]);

  return children;
};

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = authStorage.getToken();
    
    // Check if token exists
    if (!token) {
      navigate(`/login?message=${encodeURIComponent('Please login to access this page')}&redirect=${encodeURIComponent(location.pathname)}`, {
        replace: true
      });
      return;
    }

    // Check if token is expired
    if (isTokenExpired(token)) {
      authStorage.clearAuth();
      navigate(`/login?message=${encodeURIComponent('Session expired. Please login again.')}&redirect=${encodeURIComponent(location.pathname)}`, {
        replace: true
      });
      return;
    }

    // Check if user has the required role
    if (allowedRoles.length > 0) {
      const userRole = authStorage.getUserRole();
      if (!userRole || !allowedRoles.map(r => r.toUpperCase()).includes(userRole.toUpperCase())) {
        navigate('/unauthorized', {
          replace: true
        });
      }
    }
  }, [navigate, location.pathname, allowedRoles]);

  // If not authenticated, don't render anything (will redirect)
  const token = authStorage.getToken();
  if (!token || isTokenExpired(token)) {
    return null;
  }

  return children;
};

// Main App Component
function App() {
  return (
    <Router>
      <NavigationGuard>
        <ScrollToTop />
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="App flex flex-col min-h-screen">
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgetPassword />} />
              <Route path="/verify-otp" element={<VerifyOTP />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/vendor-signup" element={<VendorSignup />} />
              <Route path="/payment/success" element={<PaymentSuccess />} />
              <Route path="/payment/failure" element={<PaymentFailure />} />
              <Route path="/payment/status/:paymentId" element={<PaymentStatus />} />

              {/* User Routes */}
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="restaurants" element={<Restaurant />} />
                <Route path="packages" element={<Packages />} />
                <Route path="checkout" element={<Checkout />} />
                <Route path="user/profile" element={
                  <ProtectedRoute allowedRoles={['USER']}>
                    <UserProfile />
                  </ProtectedRoute>
                } />
                <Route path="user/subscriptions" element={
                  <ProtectedRoute allowedRoles={['USER']}>
                    <MySubscription />
                  </ProtectedRoute>
                } />
                <Route path="schedule-customization" element={<ScheduleCustomization />} />
              </Route>

              {/* Vendor Routes - PROTECTED */}
              <Route path="/vendor/*" element={
                <ProtectedRoute allowedRoles={['VENDOR']}>
                  <VendorLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />  {/* This is for /vendor */}
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="tiffins" element={<Tiffins />} />
                <Route path="orders" element={<Orders />} />
                <Route path="customers" element={<Customers />} />
                <Route path="delivery-partners" element={<DeliveryPartnersPage />} />
                <Route path="reviews" element={<Reviews />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="earnings" element={<Earnings />} />
                <Route path="settings" element={<Settings />} />
                <Route path="subscriptions" element={<Subscriptions />} />
                <Route path="profile" element={<VendorProfile />} />
                <Route path="meal" element={<MealManagement />} />
                <Route path="delivery-partner" element={<DeliveryPartners />} />
              </Route>

              {/* Admin Routes - PROTECTED */}
              <Route path="/admin/*" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="user-management" element={<UserManagementTable />} />
                <Route path="profile" element={<AdminProfile />} />
                <Route path="vendor-management" element={<VendorManagementTable />} />
                <Route path="payment-management" element={<PaymentManagement />} />
                <Route path="activities" element={<ActivitiesPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="settings" element={<AdminSetting />} />
              </Route>

              {/* Delivery Routes - PROTECTED */}
              {/* CHANGED: Made DeliveryDashboard the index route for better UX */}
              <Route path="/delivery/*" element={
                <ProtectedRoute allowedRoles={['DELIVERY']}>
                  <DeliveryLayout />
                </ProtectedRoute>
              }>
                <Route index element={<DeliveryDashboard />} /> {/* CHANGED: Now DeliveryDashboard is the main page */}
                <Route path="profile" element={<DeliveryProfile />} />
                <Route path="orders" element={<OrderDeliveries />} /> {/* Added explicit orders route */}
                <Route path="routes" element={<DeliveryRoutes />} />
                <Route path="schedule" element={<Schedules />} />
                <Route path="performance" element={<DeliveryPerformance />} />
              </Route>

              {/* 404 Route */}
              <Route path="*" element={
                <div className="flex items-center justify-center h-screen">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                    <p className="text-gray-600 mb-8">Page not found</p>
                    <button 
                      onClick={() => window.history.back()}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Go Back
                    </button>
                  </div>
                </div>
              } />
            </Routes>
          </main>
        </div>
      </NavigationGuard>
    </Router>
  );
}

export default App;