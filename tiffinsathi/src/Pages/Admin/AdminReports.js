// src/Pages/Admin/AdminReports.js
import React, { useEffect, useState, useMemo } from "react";
import { api } from "../../helpers/api";

function toCSV(rows) {
  if (!rows || rows.length === 0) return "";
  const keys = Object.keys(rows[0]);
  const header = keys.join(",");
  const body = rows.map(r => keys.map(k => `"${String(r[k] ?? "").replace(/"/g,'""')}"`).join(",")).join("\n");
  return `${header}\n${body}`;
}

const AdminReports = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=> {
    (async ()=>{
      setLoading(true);
      const list = await api.getOrders();
      setOrders(Array.isArray(list) ? list : []);
      setLoading(false);
    })();
  }, []);

  const topVendors = useMemo(() => {
    const map = {};
    (orders||[]).forEach(o => {
      const v = o.vendor_name || o.vendor?.business_name || o.vendorId || o.vendor_id || "Unknown";
      map[v] = (map[v]||0) + 1;
    });
    return Object.entries(map).map(([vendor, count]) => ({ vendor, orders: count })).sort((a,b)=>b.orders-a.orders).slice(0,10);
  }, [orders]);

  const exportTopVendors = () => {
    const csv = toCSV(topVendors);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `top_vendors_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Reports</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Top Vendors (by orders)</h3>
            <button className="px-3 py-1 border rounded" onClick={exportTopVendors}>Export CSV</button>
          </div>

          {loading ? <div>Loading...</div> : (
            <ul className="space-y-2">
              {topVendors.map((t,i)=>(
                <li key={i} className="flex justify-between items-center">
                  <div>{i+1}. {t.vendor}</div>
                  <div className="font-medium">{t.orders} orders</div>
                </li>
              ))}
              {topVendors.length === 0 && <div className="text-sm text-gray-500">No data</div>}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-3">Orders Snapshot</h3>
          <div className="text-sm text-gray-500 mb-4">Quick export of all orders</div>
          <div className="flex gap-3">
            <button onClick={()=>{
              const csv = toCSV(orders);
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url; a.download = `orders_${Date.now()}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }} className="px-4 py-2 bg-indigo-600 text-white rounded">Export Orders CSV</button>
            <button onClick={()=>navigator.clipboard.writeText(JSON.stringify(orders)).then(()=>alert("Copied JSON to clipboard"))} className="px-4 py-2 border rounded">Copy JSON</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;