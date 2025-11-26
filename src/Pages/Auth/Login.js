// src/Pages/Auth/Login.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, authStorage } from "../../helpers/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function resolveRoleFromMe(token) {
    // try to get profile/role from /auth/me — fallback if login response misses role
    try {
      const r = await api.fetchJson("/auth/me", { headers: { Authorization: `Bearer ${token}` } });
      if (r && r.ok && r.data && r.data.role) return r.data.role;
      // some backends send user object: r.data.user.role
      if (r && r.ok && r.data && r.data.user && r.data.user.role) return r.data.user.role;
    } catch (e) {
      // ignore
    }
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await api.login(email, password);
    setLoading(false);

    if (res && res.ok && res.data) {
      // save token first
      // const token = res.data.token || res.data.accessToken || null;  This line may be needed later 
            const token =
        res.data.token ||
        res.data.accessToken ||
        res.data.jwt ||
        res.data.authToken ||
        (res.data.user && res.data.user.token) ||
        null;

      // determine role - prefer res.data.role but try /auth/me as fallback
      let role = (res.data.role || "").toLowerCase();
      if (!role && token) {
        const maybe = await resolveRoleFromMe(token);
        if (maybe) role = (maybe || "").toLowerCase();
      }

      // final fallback: keep 'user' to avoid blocking; admin/vendor must be set server-side.
      if (!role) role = "user";

      // Save auth details (token, role, name/email if provided)
      // authStorage.saveAuth({ ...res.data, role });   This line may be needed later 
            authStorage.saveAuth({
        ...res.data,
        token,     // <-- ensures token is saved regardless of backend format
        role,
      });


      // redirect according to role
      if (role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else if (role === "vendor") {
        navigate("/vendor/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } else {
      // backend may return message or error body
      const msg =
        res && res.data && (res.data.message || res.data.error)
          ? res.data.message || res.data.error
          : "Login failed. Check credentials.";
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-white p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-orange-100">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-extrabold text-orange-600">Sign in</h2>
          <p className="text-sm text-gray-500 mt-1">Vendor / User sign in — welcome back!</p>
        </div>

        {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            required
            placeholder="you@restaurant.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200"
          />

          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-yellow-400 text-white px-4 py-3 rounded-lg font-semibold shadow hover:opacity-95"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-4 text-sm text-gray-600 text-center">
          Don't have an account?{" "}
          <a href="/register-user" className="text-orange-600 font-medium hover:underline">
            Register
          </a>
          {" • "}
          <a href="/register-vendor" className="text-orange-600 font-medium hover:underline">
            Register Vendor
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;