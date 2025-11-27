// src/App.js
import React, { useEffect } from "react";
import "./App.css";
<<<<<<< HEAD
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";

// ---------- Auth & Public ----------
import Login from "./Pages/Auth/Login";
import RegisterUser from "./Pages/Auth/RegisterUser";
import RegisterVendor from "./Pages/Auth/RegisterVendor";

// ---------- User ----------
import Home from "./Pages/Home";
=======
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Pages/User/Home";
import Login from "./Pages/Login";
import Signup from "./Pages/User/Signup";
import ForgetPassword from "./Pages/User/ForgetPassword";
import VerifyOTP from "./Pages/User/VerifyOTP";
import ResetPassword from "./Pages/User/ResetPassword";
>>>>>>> 12ee76fb8ea2c55f29c2526202536502d5042465
import Layout from "./Components/Users/Layout";

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

// ---------- Admin ----------
import AdminLayout from "./Components/Admin/AdminLayout";
import AdminDashboard from "./Pages/Admin/AdminDashboard";
import UserManagementTable from "./Pages/Admin/UserManagement";
import VendorManagementTable from "./Pages/Admin/VendorManagement";
import VendorApprovalTable from "./Pages/Admin/VendorApproval";
<<<<<<< HEAD
import AdminOrders from "./Pages/Admin/AdminOrders";
import AdminReports from "./Pages/Admin/AdminReports";
import AdminSettings from "./Pages/Admin/AdminSettings";
import AdminLogin from "./Pages/Admin/AdminLogin";

// ---------- Helpers ----------
import { authStorage } from "./helpers/api";

// ---------- Role Guard ----------
const RequireAuth = ({ children, role }) => {
  const token = authStorage.getToken();
  const userRole = (authStorage.getRole() || "").toLowerCase();
  const isDevMode = process.env.REACT_APP_DEV === "true";

  if (!token && !isDevMode) return <Navigate to="/login" replace />;

  if (role && userRole !== role) return <Navigate to="/login" replace />;

  return children;
};

// ---------- Auto Redirect After Login ----------
const RedirectAfterLogin = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = authStorage.getToken();
  const role = (authStorage.getRole() || "").toLowerCase();

  useEffect(() => {
    if (token && location.pathname === "/login") {
      if (role === "admin") navigate("/admin/dashboard", { replace: true });
      else if (role === "vendor") navigate("/vendor/dashboard", { replace: true });
      else navigate("/", { replace: true });
    }
  }, [token, role, location.pathname, navigate]);

  return null;
};
=======
import VendorSignup from "./Pages/Vendor/VendorSignup";
import DeliveryLayout from "./Components/Delivery/DeliveryLayout";
import UserProfile from "./Pages/User/UserProfile";
import VendorProfile from "./Pages/Vendor/VendorProfile";
import DeliveryProfile from "./Pages/Delivery/DeliveryProfile";
import MealManagement from "./Pages/Vendor/MealManagement";
import DeliveryPartnersPage from "./Pages/Vendor/DeliveryPartnerPage";
>>>>>>> 12ee76fb8ea2c55f29c2526202536502d5042465

function App() {
  return (
    <Router>
      <RedirectAfterLogin />
      <div className="App flex flex-col min-h-screen">
        <main className="flex-grow">
          <Routes>
<<<<<<< HEAD
            {/* Public & User */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="register-user" element={<RegisterUser />} />
              <Route path="register-vendor" element={<RegisterVendor />} />
            </Route>

            {/* Admin Login */}
            <Route path="/admin-login" element={<AdminLogin />} />

            {/* Vendor (Protected) */}
            <Route path="/vendor/*" element={<RequireAuth role="vendor"><VendorLayout /></RequireAuth>}>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="tiffins" element={<Tiffins />} />
              <Route path="orders" element={<Orders />} />
              <Route path="customers" element={<Customers />} />
              <Route path="delivery-partners" element={<DeliveryPartners />} />
              <Route path="reviews" element={<Reviews />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="earnings" element={<Earnings />} />
              <Route path="settings" element={<Settings />} />
              <Route path="subscriptions" element={<Subscriptions />} />
            </Route>

            {/* Admin (Protected) */}
            <Route path="/admin/*" element={<RequireAuth role="admin"><AdminLayout /></RequireAuth>}>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="user-management" element={<UserManagementTable />} />
              <Route path="vendors-management" element={<VendorManagementTable />} />
              <Route path="vendor-approval" element={<VendorApprovalTable />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
=======
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgetPassword />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/vendor-signup" element={<VendorSignup />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="/profile" element={<UserProfile />} />
            </Route>

            <Route path="/vendor" element={<VendorLayout />}>
              <Route path="profile" element={<VendorProfile />} />
              <Route path="meal" element={<MealManagement />} />
              <Route path="delivery-partner" element={<DeliveryPartnersPage />} />
            </Route>

            <Route path="/admin" element={<AdminLayout />}>
              <Route path="user-management" element={<UserManagementTable />} />
              <Route path="profile" element={<UserProfile />} />
              <Route path="vendors-management" element={<VendorManagementTable />}/>
              <Route path="vendor-approval" element={<VendorApprovalTable />} />
            </Route>

            <Route path="/delivery" element={<DeliveryLayout />}>
              <Route path="profile" element={<DeliveryProfile />} />
            </Route>
>>>>>>> 12ee76fb8ea2c55f29c2526202536502d5042465
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;