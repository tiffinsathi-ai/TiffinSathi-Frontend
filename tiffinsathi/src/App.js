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
import VendorApprovalTable from "./Pages/Admin/VendorApproval";

// ---------- Delivery ----------
import DeliveryLayout from "./Components/Delivery/DeliveryLayout";
import DeliveryProfile from "./Pages/Delivery/DeliveryProfile";

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
              <Route path="delivery-partner" element={<DeliveryPartnersPage />} />
            </Route>

            {/* Admin Routes - Keep as in main */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="user-management" element={<UserManagementTable />} />
              <Route path="profile" element={<UserProfile />} />
              <Route path="vendors-management" element={<VendorManagementTable />}/>
              <Route path="vendor-approval" element={<VendorApprovalTable />} />
            </Route>

            {/* Delivery Routes */}
            <Route path="/delivery" element={<DeliveryLayout />}>
              <Route path="profile" element={<DeliveryProfile />} />
            </Route>
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;