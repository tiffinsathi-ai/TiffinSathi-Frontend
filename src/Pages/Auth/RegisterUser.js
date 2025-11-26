// src/Pages/Auth/RegisterUser.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../helpers/api";

const RegisterUser = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", phoneNumber: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    // small validation
    if (!form.name || !form.email || !form.password || !form.phoneNumber) {
      setError("Please fill all fields.");
      return;
    }

    setLoading(true);
    const res = await api.registerUser(form);
    setLoading(false);
    if (res.ok) {
      setMsg("Registered successfully. Please login.");
      setTimeout(() => navigate("/login"), 900);
    } else {
      setError((res.data && res.data.message) || "Registration failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-orange-50 p-4">
      <div className="max-w-lg w-full bg-white p-8 rounded-2xl shadow-lg border border-orange-100">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-extrabold text-orange-600">Create your account</h2>
          <p className="text-sm text-gray-500">Sign up to order or manage your tiffin subscriptions.</p>
        </div>

        {msg && <div className="mb-4 text-sm text-green-700 bg-green-50 p-2 rounded">{msg}</div>}
        {error && <div className="mb-4 text-sm text-red-700 bg-red-50 p-2 rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700">Full name</label>
            <input name="name" value={form.name} onChange={onChange} className="w-full input px-4 py-2 rounded-lg border focus:ring-2 focus:ring-orange-200" placeholder="Your full name" />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input name="email" type="email" value={form.email} onChange={onChange} className="w-full input px-4 py-2 rounded-lg border focus:ring-2 focus:ring-orange-200" placeholder="you@example.com" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Phone</label>
              <input name="phoneNumber" value={form.phoneNumber} onChange={onChange} className="w-full input px-4 py-2 rounded-lg border focus:ring-2 focus:ring-orange-200" placeholder="98xxxxxxxx" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Password</label>
              <input name="password" type="password" value={form.password} onChange={onChange} className="w-full input px-4 py-2 rounded-lg border focus:ring-2 focus:ring-orange-200" placeholder="Choose a secure password" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-orange-500 to-yellow-400 text-white px-4 py-3 rounded-lg font-semibold shadow">
            {loading ? "Registering..." : "Create account"}
          </button>
        </form>

        <div className="mt-4 text-sm text-gray-600 text-center">
          Already registered? <a href="/login" className="text-orange-600 font-medium">Sign in</a>
        </div>
      </div>
    </div>
  );
};

export default RegisterUser;