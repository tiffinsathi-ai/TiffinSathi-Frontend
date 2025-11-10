// src/Pages/Vendor/Customers.js
import React, { useEffect, useState } from 'react';
import { readData, writeData } from '../../helpers/storage';
import '../../Components/Styles/vendor.css';

export default function Customers(){
  const [data] = useState(readData()); 
  const [query, setQuery] = useState('');

  useEffect(()=> writeData(data), [data]);

  const list = data.customers.filter(c => {
    if(!query) return true;
    const q = query.toLowerCase();
    return (c.name && c.name.toLowerCase().includes(q)) || (c.email && c.email.toLowerCase().includes(q)) || (c.phone && c.phone.includes(q));
  });

  function exportCustomers(){
    if(list.length===0) return alert('No customers to export');
    const rows = list.map(c => ({ id: c.id, name: c.name, email: c.email, phone: c.phone }));
    const keys = Object.keys(rows[0]);
    const csv = [keys.join(',')].concat(rows.map(r => keys.map(k=>`"${String(r[k] ?? '')}"`).join(','))).join('\n');
    const blob = new Blob([csv], { type:'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'customers.csv'; a.click();
  }

  return (
    <div className="vendor-page container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Customers</h1>

      <div className="bg-white p-4 rounded shadow mb-4">
        <div className="flex items-center gap-3">
          <input placeholder="Search by name, email, phone" value={query} onChange={e=>setQuery(e.target.value)} className="input" />
          <button onClick={exportCustomers} className="btn">Export</button>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <table className="w-full text-sm">
          <thead className="border-b"><tr><th className="py-2">Name</th><th>Email</th><th>Phone</th><th>Actions</th></tr></thead>
          <tbody>
            {list.map(c=>(
              <tr key={c.id} className="border-b">
                <td className="py-2">{c.name}</td>
                <td>{c.email}</td>
                <td>{c.phone}</td>
                <td><button onClick={()=> alert(JSON.stringify(c, null, 2))} className="text-blue">View</button></td>
              </tr>
            ))}
            {list.length===0 && <tr><td colSpan="4" className="py-6 text-center muted">No customers found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}