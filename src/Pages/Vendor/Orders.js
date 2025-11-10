// src/Pages/Vendor/Orders.js
import React, { useEffect, useMemo, useState } from 'react';
import { readData, writeData } from '../../helpers/storage';
import '../../Components/Styles/vendor.css';

function downloadCSV(filename, rows) {
  const keys = Object.keys(rows[0] || {});
  const csv = [keys.join(',')].concat(rows.map(r => keys.map(k => `"${String(r[k] ?? '')}"`).join(','))).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function Orders(){
  const [data, setData] = useState(readData());
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(8);
  const [selected, setSelected] = useState(null);
  const [assignPartnerId, setAssignPartnerId] = useState('');

  useEffect(()=> writeData(data), [data]);

  // search + filter
  const filtered = useMemo(() => {
    return data.orders.filter(o => {
      if(query){
        const q = query.toLowerCase();
        if(!(`${o.id} ${o.userName} ${o.address}`.toLowerCase().includes(q))) return false;
      }
      if(statusFilter !== 'all' && o.status !== statusFilter) return false;
      if(paymentFilter !== 'all' && o.paymentStatus !== paymentFilter) return false;
      return true;
    }).sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));
  }, [data.orders, query, statusFilter, paymentFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(()=> { if(page > totalPages) setPage(totalPages); }, [page, totalPages]);

  function changeStatus(orderId, nextStatus){
    const copy = JSON.parse(JSON.stringify(data));
    const o = copy.orders.find(x=>x.id===orderId);
    if(o){ o.status = nextStatus; setData(copy); }
  }

  function assignPartner(orderId){
    if(!assignPartnerId) return alert('Choose partner');
    const copy = JSON.parse(JSON.stringify(data));
    const o = copy.orders.find(x=>x.id===orderId);
    if(o){ o.deliveryPartnerId = assignPartnerId; setData(copy); alert('Assigned'); }
  }

  function exportShown(){
    if(filtered.length === 0) return alert('No data to export');
    const rows = filtered.map(o => ({
      id: o.id,
      customer: o.userName,
      items: (o.items||[]).map(i=> `${i.name} x${i.qty}`).join('; '),
      status: o.status,
      payment: o.paymentStatus,
      total: o.total,
      date: o.createdAt
    }));
    downloadCSV('orders.csv', rows);
  }

  // pagination slice
  const pageItems = filtered.slice((page-1)*pageSize, page*pageSize);

  return (
    <div className="vendor-page container mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Orders</h1>
        <div className="flex gap-2">
          <button onClick={exportShown} className="btn">Export CSV</button>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow mb-4">
        <div className="grid md:grid-cols-4 gap-3">
          <input placeholder="Search orders or customer" className="input" value={query} onChange={e=> setQuery(e.target.value)} />
          <select value={statusFilter} onChange={e=> setStatusFilter(e.target.value)} className="input-small">
            <option value="all">All Status</option>
            <option value="pending">pending</option>
            <option value="preparing">preparing</option>
            <option value="out_for_delivery">out_for_delivery</option>
            <option value="delivered">delivered</option>
            <option value="cancelled">cancelled</option>
          </select>
          <select value={paymentFilter} onChange={e=> setPaymentFilter(e.target.value)} className="input-small">
            <option value="all">All Payment</option>
            <option value="paid">paid</option>
            <option value="pending">pending</option>
          </select>
          <div className="text-right muted">Showing {filtered.length} orders</div>
        </div>
      </div>

      <div className="bg-white rounded shadow">
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr>
              <th className="py-2">Order</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Total</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 && <tr><td colSpan="8" className="py-6 text-center muted">No orders found</td></tr>}
            {pageItems.map(o => (
              <tr key={o.id} className="border-b">
                <td className="py-2">{o.id}</td>
                <td>{o.userName}</td>
                <td>{(o.items||[]).map(it=> `${it.name} x${it.qty}`).join(', ')}</td>
                <td><span className={`status ${o.status}`}>{o.status.replace(/_/g,' ')}</span></td>
                <td>{o.paymentStatus}</td>
                <td>NPR {o.total}</td>
                <td>{new Date(o.createdAt).toLocaleString()}</td>
                <td>
                  <button onClick={()=> setSelected(o)} className="text-blue mr-2">View</button>
                  <select value={o.status} onChange={(e)=> changeStatus(o.id, e.target.value)} className="input-small">
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

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="muted">Page {page} of {totalPages}</div>
        <div className="flex gap-2">
          <button onClick={()=> setPage(p => Math.max(1, p-1))} className="btn">Prev</button>
          <button onClick={()=> setPage(p => Math.min(totalPages, p+1))} className="btn">Next</button>
        </div>
      </div>

      {/* Assign partner area (for selected) */}
      {selected && (
        <div className="modal-backdrop">
          <div className="modal max-w-2xl">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold">Order {selected.id}</h3>
              <button onClick={()=> setSelected(null)} className="btn">Close</button>
            </div>
            <div className="mb-2"><strong>Customer:</strong> {selected.userName}</div>
            <div className="mb-2"><strong>Address:</strong> {selected.address}</div>
            <div className="mb-2"><strong>Items:</strong></div>
            <ul className="mb-3">{(selected.items||[]).map((it,idx)=>(<li key={idx}>{it.name} — {it.qty} × NPR {it.price}</li>))}</ul>
            <div className="mb-3"><strong>Total:</strong> NPR {selected.total}</div>

            <div className="grid md:grid-cols-3 gap-3 mt-3">
              <select className="input-small" value={assignPartnerId} onChange={e=> setAssignPartnerId(e.target.value)}>
                <option value="">Assign Delivery Partner</option>
                {data.deliveryPartners.map(dp => <option key={dp.id} value={dp.id}>{dp.name} — {dp.status}</option>)}
              </select>
              <button onClick={()=> assignPartner(selected.id)} className="btn">Assign</button>
              <button onClick={()=> { setSelected(null); setAssignPartnerId(''); }} className="btn">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}