import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Pages/User/Home";
import Login from "./Pages/Login";
import Signup from "./Pages/User/Signup";
import Layout from "./Components/Users/Layout";
import VendorLayout from "./Components/Vendor/VendorLayout";
import AdminLayout from "./Components/Admin/AdminLayout";
import UserManagementTable from "./Pages/Admin/UserManagement";
import VendorManagementTable from "./Pages/Admin/VendorManagement";
import VendorApprovalTable from "./Pages/Admin/VendorApproval";
import VendorSignup from "./Pages/Vendor/VendorSignup";

function App() {
  return (
    <Router>
      <div className="App flex flex-col min-h-screen">
        <main className="flex-grow">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/vendor-signup" element={<VendorSignup />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
            </Route>

            <Route path="/vendor" element={<VendorLayout />}></Route>

            <Route path="/admin" element={<AdminLayout />}>
              <Route path="user-management" element={<UserManagementTable />} />
              <Route
                path="vendors-management"
                element={<VendorManagementTable />}
              />
              <Route path="vendor-approval" element={<VendorApprovalTable />} />
            </Route>
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
