// src/App.js
import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// ---------- Auth & Public ----------
import Login from "./Pages/Login";
import Signup from "./Pages/User/Signup";
import ForgetPassword from "./Pages/User/ForgetPassword";
import VerifyOTP from "./Pages/User/VerifyOTP";
import ResetPassword from "./Pages/User/ResetPassword";
import VendorSignup from "./Pages/Vendor/VendorSignup";

// ---------- User ----------
import Home from "./Pages/User/Home";
import UserProfile from "./Pages/User/UserProfile";
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


function App() {
  return (
    <Router>
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

            {/* User Routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="/profile" element={<UserProfile />} />
            </Route>

            {/* Vendor Routes - TEMPORARILY NO AUTH */}
            <Route path="/vendor/*" element={<VendorLayout />}>
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

            {/* Admin Routes - Keep as in main */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="user-management" element={<UserManagementTable />} />
              <Route path="profile" element={<AdminProfile />} />
              <Route path="vendor-management" element={<VendorManagementTable />}/>
              <Route path="payment-management" element={<PaymentManagement />} />
              <Route path="activities" element={<ActivitiesPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="settings" element={<AdminSetting />} />
            </Route>

            {/* Delivery Routes */}
            <Route path="/delivery" element={<DeliveryLayout />}>
              <Route index element={<OrderDeliveries />} />
              <Route path="profile" element={<DeliveryProfile />} />
              <Route path="deliveries" element={<DeliveryDashboard />} />
              <Route path="routes" element={<DeliveryRoutes />} />
              <Route path="schedule" element={<Schedules />} />
              <Route path="performance" element={<DeliveryPerformance />} />

            </Route>
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;