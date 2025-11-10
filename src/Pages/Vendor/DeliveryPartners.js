// src/Pages/Vendor/DeliveryPartners.js
import React, { useEffect, useState } from 'react';
import { readData, writeData } from '../../helpers/storage';
import '../../Components/Styles/vendor.css';

function genId(){ return 'd' + Date.now().toString(36) + Math.floor(Math.random()*1000).toString(); }

export default function DeliveryPartners(){
  const [data, setData] = useState(readData());
  const [form, setForm] = useState({ name:'', phone:'', status: 'available', image:'/src/assets/admin-banner.jpg' });
  const [editing, setEditing] = useState(null);
//   const [assignOrderId, setAssignOrderId] = useState('');

  useEffect(()=> writeData(data), [data]);

  function addOrUpdate(){
    if(!form.name || !form.phone) return alert('Provide name and phone');
    const copy = JSON.parse(JSON.stringify(data));
    if(editing){
      const idx = copy.deliveryPartners.findIndex(d=>d.id===editing.id);
      copy.deliveryPartners[idx] = { ...copy.deliveryPartners[idx], ...form };
    } else {
      copy.deliveryPartners.push({ id: genId(), ...form });
    }
    setData(copy);
    setForm({ name:'', phone:'', status:'available', image:'/src/assets/admin-banner.jpg' });
    setEditing(null);
  }

  function remove(id){
    if(!window.confirm('Remove delivery partner?')) return;
    const copy = JSON.parse(JSON.stringify(data));
    copy.deliveryPartners = copy.deliveryPartners.filter(d=>d.id!==id);
    setData(copy);
  }

  function edit(d){
    setEditing(d);
    setForm({ name: d.name, phone: d.phone, status: d.status, image: d.image || '/src/assets/admin-banner.jpg' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

//   function assignToOrder(){
//     if(!assignOrderId) return alert('Select order');
//     if(!form) return;
//     const order = data.orders.find(o=>o.id===assignOrderId);
//     if(!order) return alert('Order not found');
//     const copy = JSON.parse(JSON.stringify(data));
//     const partner = copy.deliveryPartners.find(p=>p.name === form.name && p.phone === form.phone);
//     if(!partner) return alert('Please save partner first or choose existing partner');
//     const oi = copy.orders.find(o=>o.id===assignOrderId);
//     if(oi){ oi.deliveryPartnerId = partner.id; setData(copy); alert('Assigned'); }
//   }

  return (
    <div className="vendor-page container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Delivery Partners</h1>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="font-semibold mb-2">{editing ? 'Edit Partner' : 'Add Partner'}</h3>
        <div className="grid md:grid-cols-3 gap-3">
          <input className="input" placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
          <input className="input" placeholder="Phone" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} />
          <select className="input" value={form.status} onChange={e=>setForm({...form, status:e.target.value})}>
            <option value="available">Available</option>
            <option value="busy">Busy</option>
            <option value="inactive">Inactive</option>
          </select>
          <input className="input md:col-span-2" placeholder="Image path" value={form.image} onChange={e=>setForm({...form, image:e.target.value})} />
          <div className="flex items-center gap-3">
            <button onClick={addOrUpdate} className="btn-primary">{editing ? 'Update' : 'Add'}</button>
            {editing && <button onClick={()=>{ setEditing(null); setForm({ name:'', phone:'', status:'available', image:'/src/assets/admin-banner.jpg' }); }} className="btn">Cancel</button>}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {data.deliveryPartners.map(d => (
          <div className="card" key={d.id}>
            <img src={d.image || '/src/assets/admin-banner.jpg'} alt={d.name} className="card-img" />
            <h3 className="font-semibold">{d.name}</h3>
            <div className="muted">{d.phone}</div>
            <div className="mt-2">
              <span className={`chip ${d.status==='available' ? 'chip-active' : ''}`}>{d.status}</span>
            </div>
            <div className="mt-3 flex gap-3">
              <button onClick={()=> edit(d)} className="text-blue">Edit</button>
              <button onClick={()=> remove(d.id)} className="text-red">Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}