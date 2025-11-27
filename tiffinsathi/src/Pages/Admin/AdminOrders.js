// src/Pages/Admin/AdminOrders.js
import React, { useEffect, useState } from "react";
import { api } from "../../helpers/api";

const STATUS_OPTIONS = ["pending","preparing","out_for_delivery","delivered","cancelled"];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const list = await api.getOrders();
    setOrders(Array.isArray(list) ? list : []);
    setLoading(false);
  };

  useEffect(()=> { load(); }, []);

  const changeStatus = async (order, status) => {
    if (!window.confirm(`Change status to "${status}"?`)) return;
    const res = await api.updateOrderStatus(order.order_id || order.id, status);
    if (res.ok) {
      // optimistic update
      setOrders(prev => prev.map(o => (o.order_id === order.order_id || o.id === order.id) ? { ...o, status } : o));
      alert("Status updated");
    } else {
      alert("Failed to update status");
    }
  };

  const filtered = orders.filter(o => filter === "All" ? true : (o.status || "").toLowerCase() === filter.toLowerCase());

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Orders</h1>

      <div className="mb-4 flex items-center gap-4">
        <select value={filter} onChange={e=>setFilter(e.target.value)} className="px-3 py-2 border rounded">
          <option value="All">All Status</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={load} className="px-3 py-2 bg-gray-100 rounded">Refresh</button>
      </div>

      <div className="bg-white rounded shadow overflow-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Order</th>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Vendor</th>
              <th className="p-3 text-left">Total</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="6" className="p-6 text-center">Loading...</td></tr> : (
              filtered.length === 0 ? <tr><td colSpan="6" className="p-6 text-center">No orders found.</td></tr> :
              filtered.map(o => (
                <tr key={o.order_id || o.id} className="hover:bg-gray-50">
                  <td className="p-3"><div className="font-medium">#{o.order_id || o.id}</div><div className="text-xs text-gray-500">{new Date(o.order_date || o.created_at || Date.now()).toLocaleString()}</div></td>
                  <td className="p-3">{o.user_email || o.userName || (o.user && o.user.email) || "-"}</td>
                  <td className="p-3">{o.vendor_name || o.vendorId || o.vendor?.business_name || "-"}</td>
                  <td className="p-3">Rs {o.total_amount ?? o.total ?? "-"}</td>
                  <td className="p-3">{o.status}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      {STATUS_OPTIONS.map(s => (
                        <button onClick={()=>changeStatus(o, s)} key={s} disabled={o.status === s} className={`px-2 py-1 border rounded text-xs ${o.status===s?"bg-blue-600 text-white":""}`}>{s}</button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;