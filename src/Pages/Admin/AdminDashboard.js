// src/Pages/Admin/AdminDashboard.js
import React, { useEffect, useState, useMemo } from "react";
import { api } from "../../helpers/api";
import { Users, UtensilsCrossed, Clock, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";

const StatCard = ({ title, value, icon }) => (
  <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
    <div className="p-3 rounded-md bg-orange-50 text-orange-600">{icon}</div>
    <div>
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  </div>
);

const SmallBar = ({ data = [] }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex gap-3 items-end h-28">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center">
          <div title={`${d.label}: ${d.value}`} style={{ height: `${(d.value / max) * 100}%` }} className="w-10 rounded-t-md bg-gradient-to-t from-blue-600 to-indigo-500" />
          <div className="text-xs mt-2">{d.label}</div>
        </div>
      ))}
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({ usersCount: 0, vendorsCount: 0, pendingVendorsCount: 0, ordersCount: 0, orders: [] });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const s = await api.getAdminStats();
      if (mounted) setStats(s || {});
      setLoading(false);
    })();
    return () => (mounted = false);
  }, []);

  const ordersByStatus = useMemo(() => {
    const map = {};
    (stats.orders || []).forEach(o => {
      const st = (o.status || "pending").toLowerCase();
      map[st] = (map[st] || 0) + 1;
    });
    const keys = ["pending", "preparing", "out_for_delivery", "delivered", "cancelled"];
    return keys.map(k => ({ label: k.split("_").join(" "), value: map[k] || 0 }));
  }, [stats.orders]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      {loading ? (
        <div className="p-8 text-center">Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard title="Total Users" value={stats.usersCount || 0} icon={<Users size={20} />} />
            <StatCard title="Total Vendors" value={stats.vendorsCount || 0} icon={<UtensilsCrossed size={20} />} />
            <StatCard title="Pending Vendors" value={stats.pendingVendorsCount || 0} icon={<Clock size={20} />} />
            <StatCard title="Total Orders" value={stats.ordersCount || 0} icon={<Package size={20} />} />
          </div>

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Orders by status</h2>
              <div className="text-sm text-gray-500">Summary of all orders</div>
            </div>
            <SmallBar data={ordersByStatus} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Recent Orders</h3>
                <button className="text-sm text-blue-600" onClick={() => navigate("/admin/orders")}>View all</button>
              </div>
              <div>
                {(stats.orders || []).slice(0, 6).map((o) => (
                  <div key={o.order_id || o.orderId || o.id} className="flex items-center justify-between py-2 border-b last:border-0 text-sm">
                    <div>
                      <div className="font-medium">{o.order_id || o.orderId || `#${o.id || ""}`}</div>
                      <div className="text-xs text-gray-500">{o.userName || o.user_email || o.user?.email || "-"}</div>
                    </div>
                    <div className="text-xs">{o.status || "pending"}</div>
                  </div>
                ))}
                {(!stats.orders || stats.orders.length === 0) && <div className="text-sm text-gray-500">No recent orders.</div>}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Quick Actions</h3>
                <div className="text-sm text-gray-500">Admin tools</div>
              </div>

              <div className="flex flex-col gap-3">
                <button onClick={() => navigate("/admin/user-management")} className="w-full text-left px-4 py-2 border rounded hover:bg-gray-50">Manage Users</button>
                <button onClick={() => navigate("/admin/vendors-management")} className="w-full text-left px-4 py-2 border rounded hover:bg-gray-50">Manage Vendors</button>
                <button onClick={() => navigate("/admin/vendor-approval")} className="w-full text-left px-4 py-2 border rounded hover:bg-gray-50">Vendor Approval Queue</button>
                <button onClick={() => navigate("/admin/reports")} className="w-full text-left px-4 py-2 border rounded hover:bg-gray-50">Reports & Exports</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;