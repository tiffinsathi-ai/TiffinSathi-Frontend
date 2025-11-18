import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Pages/User/Home";
import Login from "./Pages/Login";
import Signup from "./Pages/User/Signup";
import ForgetPassword from "./Pages/User/ForgetPassword";
import VerifyOTP from "./Pages/User/VerifyOTP";
import ResetPassword from "./Pages/User/ResetPassword";
import Layout from "./Components/Users/Layout";
import VendorLayout from "./Components/Vendor/VendorLayout";
import AdminLayout from "./Components/Admin/AdminLayout";
import UserManagementTable from "./Pages/Admin/UserManagement";
import VendorManagementTable from "./Pages/Admin/VendorManagement";
import VendorApprovalTable from "./Pages/Admin/VendorApproval";
import VendorSignup from "./Pages/Vendor/VendorSignup";
import DeliveryLayout from "./Components/Delivery/DeliveryLayout";
import UserProfile from "./Pages/User/UserProfile";
import VendorProfile from "./Pages/Vendor/VendorProfile";
import DeliveryProfile from "./Pages/Delivery/DeliveryProfile";

function App() {
  return (
    <Router>
      <div className="App flex flex-col min-h-screen">
        <main className="flex-grow">
          <Routes>
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
            </Route>

            <Route path="/admin" element={<AdminLayout />}>
              <Route path="user-management" element={<UserManagementTable />} />
              <Route path="profile" element={<UserProfile />} />
              <Route
                path="vendors-management"
                element={<VendorManagementTable />}
              />
              <Route path="vendor-approval" element={<VendorApprovalTable />} />
            </Route>

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
