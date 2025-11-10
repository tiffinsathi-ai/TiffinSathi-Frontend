// src/Pages/Vendor/Dashboard.js
import React, { useEffect, useMemo, useState } from 'react';
import { readData, writeData } from '../../helpers/storage';
import '../../Components/Styles/vendor.css'; // update path if your CSS lives elsewhere

// Recharts
import {
  ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#6DB33F', '#FF9F43', '#4F46E5', '#FF6B6B', '#38BDF8', '#F59E0B'];

function formatDateKey(date){
  return date.toISOString().slice(0,10); // YYYY-MM-DD
}

function lastNDates(n){
  const arr = [];
  const now = new Date();
  for(let i=n-1;i>=0;i--){
    const d = new Date(now.getTime() - i*24*60*60*1000);
    arr.push(formatDateKey(d));
  }
  return arr;
}

export default function Dashboard(){
  const [data, setData] = useState(readData());
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [quickModalOpen, setQuickModalOpen] = useState(false);
  const [quickForm, setQuickForm] = useState({ name:'', price:0, plan_type:'7 days', image:'/src/assets/meal1.jpg', description:'' });

  // persist
  useEffect(()=> { writeData(data); }, [data]);

  // Derived KPIs
  const totalTiffins = data.tiffins.length;
  const activePlans = data.tiffins.filter(t => t.active).length;
  const pendingOrders = data.orders.filter(o => o.status === 'pending').length;
  const monthlyEarnings = data.orders
    .filter(o => o.paymentStatus === 'paid' && (new Date(o.createdAt) >= new Date(Date.now() - 30*24*60*60*1000)))
    .reduce((s,o)=> s + (o.total||0), 0);

  // Recent orders (most recent 6)
  const recentOrders = data.orders.slice().sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt)).slice(0,6);

  // Revenue trend data (last 30 days)
  const revenueTrend = useMemo(()=>{
    const keys = lastNDates(30);
    const map = {};
    keys.forEach(k=> map[k]=0);
    data.orders.forEach(o => {
      const k = (o.createdAt||'').slice(0,10);
      if(k in map && o.paymentStatus==='paid') map[k] += (o.total||0);
    });
    return keys.map(k => ({ date: k.slice(5), revenue: Math.round(map[k]) }));
  }, [data.orders]);

  // Top selling tiffins (by quantity sold)
  const topTiffins = useMemo(()=>{
    const counts = {};
    data.orders.forEach(o=>{
      (o.items||[]).forEach(it=>{
        counts[it.tiffinId] = (counts[it.tiffinId]||0) + (it.qty||1);
      });
    });
    const arr = Object.keys(counts).map(id=>{
      const t = data.tiffins.find(x=>x.id===id);
      return { id, name: t ? t.name : id, value: counts[id] };
    }).sort((a,b)=> b.value - a.value);
    // if empty, show tiffins with zero
    if(arr.length===0){
      return data.tiffins.slice(0,5).map((t,i)=> ({ id: t.id, name: t.name, value: 0 }));
    }
    return arr.slice(0,6);
  }, [data.orders, data.tiffins]);

  function quickAddTiffin(){
    if(!quickForm.name) return alert('Enter name');
    const copy = JSON.parse(JSON.stringify(data));
    const id = 't'+Date.now().toString(36);
    copy.tiffins.push({ id, ...quickForm, active: true, createdAt: new Date().toISOString() });
    setData(copy);
    setQuickForm({ name:'', price:0, plan_type:'7 days', image:'/src/assets/meal1.jpg', description:'' });
    setQuickModalOpen(false);
  }

  function viewOrder(o){
    setSelectedOrder(o);
  }

  function changeOrderStatus(orderId, newStatus){
    const copy = JSON.parse(JSON.stringify(data));
    const idx = copy.orders.findIndex(x=>x.id===orderId);
    if(idx >= 0){
      copy.orders[idx].status = newStatus;
      setData(copy);
    }
  }

  return (
    <div className="vendor-page container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Vendor Dashboard</h1>
        <div className="flex items-center gap-3">
          <button onClick={()=> setQuickModalOpen(true)} className="btn-primary">Quick Add Tiffin</button>
          <button onClick={()=> { window.location.href = '/vendor/tiffins'; }} className="btn">Manage Tiffins</button>
          <button onClick={()=> { window.location.href = '/vendor/orders'; }} className="btn">View Orders</button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <div className="muted">Total Tiffins</div>
          <div className="card-value">{totalTiffins}</div>
        </div>
        <div className="card">
          <div className="muted">Active Plans</div>
          <div className="card-value">{activePlans}</div>
        </div>
        <div className="card">
          <div className="muted">Monthly Earnings</div>
          <div className="card-value">NPR {monthlyEarnings}</div>
        </div>
        <div className="card">
          <div className="muted">Pending Orders</div>
          <div className="card-value">{pendingOrders}</div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="card md:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Revenue Trend (30 days)</h3>
            <div className="muted text-sm">Paid orders only</div>
          </div>
          <div style={{ width:'100%', height:240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueTrend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(v)=> `NPR ${v}`} />
                <Line type="monotone" dataKey="revenue" stroke="#6DB33F" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Top Tiffins</h3>
            <div className="muted text-sm">By qty sold</div>
          </div>
          <div style={{ width:'100%', height:240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={topTiffins} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                  {topTiffins.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white p-4 rounded shadow">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Recent Orders</h3>
          <div className="muted text-sm">Latest 6 orders</div>
        </div>

        <table className="w-full text-sm">
          <thead className="border-b">
            <tr>
              <th className="py-2">Order</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Status</th>
              <th>Total</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.length === 0 && (
              <tr><td colSpan="7" className="py-6 text-center muted">No recent orders</td></tr>
            )}
            {recentOrders.map(o => (
              <tr key={o.id} className="border-b">
                <td className="py-2">{o.id}</td>
                <td>{o.userName}</td>
                <td>
                  {(o.items||[]).map(it=> `${it.name} x${it.qty}`).join(', ')}
                </td>
                <td><span className={`status ${o.status}`}>{o.status.replace(/_/g,' ')}</span></td>
                <td>NPR {o.total}</td>
                <td>{new Date(o.createdAt).toLocaleString()}</td>
                <td>
                  <button onClick={()=> viewOrder(o)} className="text-blue mr-2">View</button>
                  <select value={o.status} onChange={(e)=> changeOrderStatus(o.id, e.target.value)} className="input-small">
                    <option value="pending">pending</option>
                    <option value="preparing">preparing</option>
                    <option value="out_for_delivery">out_for_delivery</option>
                    <option value="delivered">delivered</option>
                    <option value="cancelled">cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order modal */}
      {selectedOrder && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold">Order {selectedOrder.id}</h3>
              <button onClick={()=> setSelectedOrder(null)} className="btn">Close</button>
            </div>
            <div className="mb-2"><strong>Customer:</strong> {selectedOrder.userName}</div>
            <div className="mb-2"><strong>Address:</strong> {selectedOrder.address}</div>
            <div className="mb-2"><strong>Items:</strong></div>
            <ul className="mb-3">
              {(selectedOrder.items||[]).map((it,idx)=> <li key={idx}>{it.name} — {it.qty} × NPR {it.price}</li>)}
            </ul>
            <div className="mb-3"><strong>Total:</strong> NPR {selectedOrder.total}</div>
            <div className="flex gap-3 justify-end">
              <button onClick={()=> setSelectedOrder(null)} className="btn">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Modal */}
      {quickModalOpen && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3 className="font-semibold mb-3">Quick Add Tiffin</h3>
            <div className="grid gap-3">
              <input className="input" placeholder="Name" value={quickForm.name} onChange={e=>setQuickForm({...quickForm, name:e.target.value})} />
              <input className="input" placeholder="Price" type="number" value={quickForm.price} onChange={e=>setQuickForm({...quickForm, price: Number(e.target.value)})} />
              <input className="input" placeholder="Image path (e.g. /src/assets/meal1.jpg)" value={quickForm.image} onChange={e=>setQuickForm({...quickForm, image:e.target.value})} />
              <textarea className="input" placeholder="Short description" value={quickForm.description} onChange={e=>setQuickForm({...quickForm, description:e.target.value})} />
              <div className="flex justify-end gap-3">
                <button onClick={()=> setQuickModalOpen(false)} className="btn">Cancel</button>
                <button onClick={quickAddTiffin} className="btn-primary">Add</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}