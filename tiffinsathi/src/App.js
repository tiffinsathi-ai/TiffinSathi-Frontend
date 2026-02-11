// src/App.js
import React from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useSearchParams,
} from "react-router-dom";
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

// Redirect subscription edit failure URL (from backend/gateway) to payment failure page
function SubscriptionEditFailureRedirect() {
  const [searchParams] = useSearchParams();
  const error = searchParams.get("error");
  const type = searchParams.get("type");
  const subscriptionId = searchParams.get("subscriptionId");
  const params = new URLSearchParams();
  if (error) params.set("error", error);
  if (type) params.set("type", type);
  if (subscriptionId) params.set("subscriptionId", subscriptionId);
  params.set("from", "edit");
  return <Navigate to={`/payment/failure?${params.toString()}`} replace />;
}

function App() {
  return (
    <Router>
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

            {/* User Routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="restaurants" element={<Restaurant />} />
              <Route path="packages" element={<Packages />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="user/profile" element={<UserProfile />} />
              <Route path="user/subscriptions" element={<MySubscription />} />
              <Route
                path="user/subscriptions/:subscriptionId/edit"
                element={<EditSchedule />}
              />
              <Route path="payment/success" element={<PaymentSuccess />} />
              <Route path="payment/failure" element={<PaymentFailure />} />
              <Route
                path="payment/status/:paymentId"
                element={<PaymentStatus />}
              />
              <Route
                path="schedule-customization"
                element={<ScheduleCustomization />}
              />
              <Route path="/subscription/edit" element={<EditSchedule />} />
              <Route
                path="/subscription/edit/checkout"
                element={<EditCheckout />}
              />
              <Route
                path="/subscription/edit/failure"
                element={<SubscriptionEditFailureRedirect />}
              />
              <Route
                path="/subscription/edit/success"
                element={<EditSuccess />}
              />
            </Route>

            {/* Vendor Routes - TEMPORARILY NO AUTH */}
            <Route path="/vendor/*" element={<VendorLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="tiffins" element={<Tiffins />} />
              <Route path="orders" element={<Orders />} />
              <Route path="customers" element={<Customers />} />
              <Route
                path="delivery-partners"
                element={<DeliveryPartnersPage />}
              />
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
              <Route
                path="vendor-management"
                element={<VendorManagementTable />}
              />
              <Route
                path="payment-management"
                element={<PaymentManagement />}
              />
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
