// src/Pages/Auth/RegisterVendor.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../helpers/api";

const RegisterVendor = () => {
  const [form, setForm] = useState({
    ownerName: "",
    businessName: "",
    phone: "",
    businessEmail: "",
    businessAddress: "",
    capacity: "",
    yearsInBusiness: "",
    cuisineType: "",
    description: "",
    bankName: "",
    accountNumber: "",
    branchName: "",
    accountHolderName: "",
    panNumber: "",
    termsAccepted: true,
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  // helper: simple cuisine parsing (comma separated)
  function sanitizeCuisine(input) {
    if (!input) return [];
    return input.split(",").map(s => s.trim()).filter(Boolean);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");

    // basic validation
    if (!form.ownerName || !form.businessName || !form.phone || !form.businessEmail) {
      setError("Please fill name, business name, phone and business email.");
      return;
    }
    if (!form.termsAccepted) {
      setError("Please accept terms & conditions.");
      return;
    }

    // prepare payload (cuisine as array)
    const payload = {
      ...form,
      cuisineType: JSON.stringify(sanitizeCuisine(form.cuisineType)),
      yearsInBusiness: Number(form.yearsInBusiness) || 0,
      capacity: Number(form.capacity) || 0,
    };

    setLoading(true);
    const res = await api.registerVendor(payload);
    setLoading(false);

    if (res.ok) {
      setMsg("Vendor registered — pending admin approval.");
      setTimeout(() => navigate("/login"), 900);
    } else {
      setError((res.data && res.data.message) || "Vendor registration failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-orange-50 p-4">
      <div className="max-w-3xl w-full bg-white p-8 rounded-2xl shadow-lg border border-orange-100">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-extrabold text-orange-600">Register Your Kitchen</h2>
          <p className="text-sm text-gray-500 mt-1">Join Tiffin Sathi — reach customers nearby.</p>
        </div>

        {msg && <div className="mb-4 text-sm text-green-700 bg-green-50 p-2 rounded">{msg}</div>}
        {error && <div className="mb-4 text-sm text-red-700 bg-red-50 p-2 rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* left column */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Owner / Contact person</label>
            <input name="ownerName" value={form.ownerName} onChange={onChange} className="w-full input px-4 py-2 rounded-lg border" placeholder="Full name" />

            <label className="text-sm font-medium text-gray-700">Business name</label>
            <input name="businessName" value={form.businessName} onChange={onChange} className="w-full input px-4 py-2 rounded-lg border" placeholder="e.g. Mom's Kitchen" />

            <label className="text-sm font-medium text-gray-700">Phone</label>
            <input name="phone" value={form.phone} onChange={onChange} className="w-full input px-4 py-2 rounded-lg border" placeholder="98xxxxxxxx" />

            <label className="text-sm font-medium text-gray-700">Business email</label>
            <input name="businessEmail" type="email" value={form.businessEmail} onChange={onChange} className="w-full input px-4 py-2 rounded-lg border" placeholder="contact@yourkitchen.com" />

            <label className="text-sm font-medium text-gray-700">Business address</label>
            <input name="businessAddress" value={form.businessAddress} onChange={onChange} className="w-full input px-4 py-2 rounded-lg border" placeholder="Street, City, Region" />
          </div>

          {/* right column */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Capacity (how many tiffins / day)</label>
            <input name="capacity" type="number" min="0" value={form.capacity} onChange={onChange} className="w-full input px-4 py-2 rounded-lg border" placeholder="e.g. 100" />

            <label className="text-sm font-medium text-gray-700">Years in business</label>
            <input name="yearsInBusiness" type="number" min="0" value={form.yearsInBusiness} onChange={onChange} className="w-full input px-4 py-2 rounded-lg border" placeholder="e.g. 3" />

            <label className="text-sm font-medium text-gray-700">Cuisine types (comma separated)</label>
            <input name="cuisineType" value={form.cuisineType} onChange={onChange} className="w-full input px-4 py-2 rounded-lg border" placeholder="North Indian, Nepali, Chinese" />

            <label className="text-sm font-medium text-gray-700">Short description</label>
            <textarea name="description" value={form.description} onChange={onChange} className="w-full input px-4 py-2 rounded-lg border" placeholder="Short description for customers (max 200 chars)" rows={3} />

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm font-medium text-gray-700">Bank name</label>
                <input name="bankName" value={form.bankName} onChange={onChange} className="w-full input px-4 py-2 rounded-lg border" placeholder="Bank" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Account number</label>
                <input name="accountNumber" value={form.accountNumber} onChange={onChange} className="w-full input px-4 py-2 rounded-lg border" placeholder="Account #" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm font-medium text-gray-700">Branch</label>
                <input name="branchName" value={form.branchName} onChange={onChange} className="w-full input px-4 py-2 rounded-lg border" placeholder="Branch" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Account holder</label>
                <input name="accountHolderName" value={form.accountHolderName} onChange={onChange} className="w-full input px-4 py-2 rounded-lg border" placeholder="Name on account" />
              </div>
            </div>

            <label className="text-sm font-medium text-gray-700">PAN (optional)</label>
            <input name="panNumber" value={form.panNumber} onChange={onChange} className="w-full input px-4 py-2 rounded-lg border" placeholder="PAN / Tax ID" />
          </div>

          {/* full width row */}
          <div className="col-span-1 md:col-span-2 flex items-center gap-3 mt-2">
            <input id="terms" name="termsAccepted" type="checkbox" checked={form.termsAccepted} onChange={onChange} className="h-4 w-4" />
            <label htmlFor="terms" className="text-sm text-gray-700">I accept terms & conditions and permit Tiffin Sathi to share contact details with customers.</label>
          </div>

          <div className="col-span-1 md:col-span-2 text-right">
            <button type="submit" disabled={loading} className="inline-block bg-gradient-to-r from-orange-500 to-yellow-400 text-white px-6 py-3 rounded-lg font-semibold shadow">
              {loading ? "Registering..." : "Register Vendor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterVendor;