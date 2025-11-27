// src/App.js
import React, { useEffect } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";

// ---------- Auth & Public ----------
import Login from "./Pages/Auth/Login";
import RegisterUser from "./Pages/Auth/RegisterUser";
import RegisterVendor from "./Pages/Auth/RegisterVendor";

// ---------- User ----------
import Home from "./Pages/Home";
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

function App() {
  return (
    <Router>
      <RedirectAfterLogin />
      <div className="App flex flex-col min-h-screen">
        <main className="flex-grow">
          <Routes>
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
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;