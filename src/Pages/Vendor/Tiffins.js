// src/Pages/Vendor/Tiffins.js
import React, { useEffect, useMemo, useState } from 'react';
import { readData, writeData } from '../../helpers/storage';
import '../../Components/Styles/vendor.css';

function genId(){ return 't' + Date.now().toString(36) + Math.floor(Math.random()*1000).toString(); }

export default function Tiffins(){
  const [data, setData] = useState(readData());
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name:'', price:0, description:'', image:'/src/assets/meal1.jpg', plan_type:'7 days', active:true });
  const [query, setQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('all');

  useEffect(()=> writeData(data), [data]);

  const list = useMemo(() => {
    return data.tiffins.filter(t=>{
      if(query && !`${t.name} ${t.description}`.toLowerCase().includes(query.toLowerCase())) return false;
      if(planFilter !== 'all' && t.plan_type !== planFilter) return false;
      return true;
    });
  }, [data.tiffins, query, planFilter]);

  function openNew(){
    setEditItem(null);
    setForm({ name:'', price:0, description:'', image:'/src/assets/meal1.jpg', plan_type:'7 days', active:true });
    setShowModal(true);
  }
  function openEdit(t){
    setEditItem(t);
    setForm({ name:t.name, price:t.price, description:t.description, image:t.image, plan_type: t.plan_type || '7 days', active:t.active });
    setShowModal(true);
  }
  function save(){
    if(!form.name) return alert('Please add name');
    if(!form.price || Number(form.price) <= 0) return alert('Price must be > 0');
    const copy = JSON.parse(JSON.stringify(data));
    if(editItem){
      const idx = copy.tiffins.findIndex(x=>x.id===editItem.id);
      copy.tiffins[idx] = { ...copy.tiffins[idx], ...form, updatedAt: new Date().toISOString() };
    } else {
      const id = genId();
      copy.tiffins.push({ id, ...form, createdAt: new Date().toISOString() });
    }
    setData(copy);
    setShowModal(false);
  }
  function del(id){
    if(!window.confirm('Delete this tiffin?')) return;
    const copy = JSON.parse(JSON.stringify(data));
    copy.tiffins = copy.tiffins.filter(t=>t.id!==id);
    setData(copy);
  }
  function toggleActive(id){
    const copy = JSON.parse(JSON.stringify(data));
    const t = copy.tiffins.find(x=>x.id===id);
    if(t){ t.active = !t.active; setData(copy); }
  }

  return (
    <div className="vendor-page container mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">My Tiffins</h1>
        <div className="flex items-center gap-2">
          <input placeholder="Search tiffins" className="input" value={query} onChange={e=> setQuery(e.target.value)} />
          <select value={planFilter} onChange={e=> setPlanFilter(e.target.value)} className="input-small">
            <option value="all">All Plans</option>
            <option value="7 days">7 days</option>
            <option value="15 days">15 days</option>
            <option value="30 days">30 days</option>
          </select>
          <button onClick={openNew} className="btn-primary">+ Add New</button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {list.map(t => (
          <div className="card" key={t.id}>
            <img src={t.image} alt={t.name} className="card-img" />
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{t.name}</h3>
                <div className="muted">NPR {t.price} • {t.plan_type}</div>
              </div>
              <div>
                <button onClick={()=> toggleActive(t.id)} className={`chip ${t.active ? 'chip-active' : ''}`}>{t.active ? 'Active' : 'Inactive'}</button>
              </div>
            </div>
            <p className="muted mt-3">{t.description}</p>
            <div className="mt-4 flex gap-3">
              <button onClick={()=> openEdit(t)} className="text-blue">Edit</button>
              <button onClick={()=> del(t.id)} className="text-red">Delete</button>
              <button onClick={()=> alert(JSON.stringify(t, null, 2))} className="text-muted">View</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3 className="font-semibold mb-3">{editItem ? 'Edit Tiffin' : 'Add Tiffin'}</h3>
            <div className="grid gap-3">
              <input className="input" placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
              <input className="input" placeholder="Price" type="number" value={form.price} onChange={e=>setForm({...form, price: Number(e.target.value)})} />
              <select className="input" value={form.plan_type} onChange={e=>setForm({...form, plan_type:e.target.value})}>
                <option value="7 days">7 days</option>
                <option value="15 days">15 days</option>
                <option value="30 days">30 days</option>
              </select>
              <input className="input" placeholder="Image path" value={form.image} onChange={e=>setForm({...form, image:e.target.value})} />
              {/* preview */}
              <div className="mb-2">
                <img src={form.image} alt="preview" style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 8 }} />
              </div>
              <textarea className="input" placeholder="Description" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} />
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.active} onChange={e=>setForm({...form, active:e.target.checked})}/> Active</label>
              </div>

              <div className="flex justify-end gap-3 mt-3">
                <button onClick={()=> setShowModal(false)} className="btn">Cancel</button>
                <button onClick={save} className="btn-primary">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}