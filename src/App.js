import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// User and main pages
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Layout from "./Components/Users/Layout";

// Vendor components
import VendorLayout from "./Components/Vendor/VendorLayout";
import Dashboard from "./Pages/Vendor/Dashboard";
import Analytics from "./Pages/Vendor/Analytics";
import Earnings from "./Pages/Vendor/Earnings";
import Orders from "./Pages/Vendor/Orders";
import Tiffins from "./Pages/Vendor/Tiffins";
import Settings from "./Pages/Vendor/Settings";
import DeliveryPartners from "./Pages/Vendor/DeliveryPartners";
import Customers from "./Pages/Vendor/Customers";
import Reviews from "./Pages/Vendor/Reviews";

// Admin components
import AdminLayout from "./Components/Admin/AdminLayout";
import UserManagementTable from "./Pages/Admin/UserManagement";
import VendorManagementTable from "./Pages/Admin/VendorManagement";
import VendorApprovalTable from "./Pages/Admin/VendorApproval";

function App() {
  return (
    <Router>
      <div className="App flex flex-col min-h-screen">
        <main className="flex-grow">
          <Routes>
            {/* USER */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
            </Route>

            {/* VENDOR */}
            <Route path="/vendor" element={<VendorLayout />}>
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
            </Route>

            {/* ADMIN */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="user-management" element={<UserManagementTable />} />
              <Route path="vendors-management" element={<VendorManagementTable />} />
              <Route path="vendor-approval" element={<VendorApprovalTable />} />
            </Route>
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;