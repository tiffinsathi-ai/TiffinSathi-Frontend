// src/Pages/Admin/AdminLogin.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, authStorage } from "../../helpers/api";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await api.login(email, password);
    setLoading(false);

    if (res && res.ok && res.data) {
      authStorage.saveAuth(res.data);
      const role = (res.data.role || "").toLowerCase();
      if (role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        setError("Access denied: not an admin account");
      }
    } else {
      setError((res && res.data && (res.data.message || res.data.error)) || "Login failed. Check credentials.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Admin Sign in</h2>
        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" required placeholder="Admin Email" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full px-3 py-2 border rounded" />
          <input type="password" required placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full px-3 py-2 border rounded" />
          <button type="submit" disabled={loading} className="w-full bg-gray-800 text-white px-3 py-2 rounded hover:bg-black">
            {loading ? "Signing in..." : "Sign in as Admin"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;