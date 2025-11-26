// src/Pages/Admin/AdminSettings.js
import React, { useState } from "react";
import { authStorage } from "../../helpers/api";
import { useNavigate } from "react-router-dom";

const AdminSettings = () => {
  const user = authStorage.getUser();
  const [name, setName] = useState(user.name || "");
  const [email] = useState(user.email || "");
  const navigate = useNavigate();

  const logout = () => {
    authStorage.clearAuth();
    navigate("/login");
  };

  const saveProfile = (e) => {
    e.preventDefault();
    alert("Profile update via backend not implemented here — add endpoint to save.");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>

      <div className="bg-white rounded shadow p-6 max-w-xl">
        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="text-sm block mb-1">Name</label>
            <input value={name} onChange={(e)=>setName(e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="text-sm block mb-1">Email</label>
            <input value={email} disabled className="w-full px-3 py-2 border rounded bg-gray-50" />
          </div>

          <div className="flex gap-3">
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Save</button>
            <button type="button" onClick={logout} className="px-4 py-2 border rounded">Logout</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;