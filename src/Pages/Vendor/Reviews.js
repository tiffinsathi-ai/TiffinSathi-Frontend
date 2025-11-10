// src/Pages/Vendor/Reviews.js
import React, { useEffect, useState } from 'react';
import { readData, writeData } from '../../helpers/storage';
import '../../Components/Styles/vendor.css';

export default function Reviews(){
  const [data, setData] = useState(readData()); 
  const [filter, setFilter] = useState('all');
  const [replyText, setReplyText] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(()=> writeData(data), [data]);

  const list = data.reviews.filter(r => filter==='all' ? true : (String(r.rating) === filter));

  function markFeatured(id){
    const copy = JSON.parse(JSON.stringify(data));
    const r = copy.reviews.find(x=>x.id===id);
    if(r){ r.featured = !r.featured; setData(copy); }
  }

  function reply(){
    if(!selected) return;
    if(!replyText) return alert('Type reply');
    // placeholder only: store reply in review.reply
    const copy = JSON.parse(JSON.stringify(data));
    const r = copy.reviews.find(x=>x.id===selected.id);
    if(r){ r.reply = replyText; setData(copy); setReplyText(''); setSelected(null); alert('Reply saved (local)'); }
  }

  return (
    <div className="vendor-page container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Reviews</h1>

      <div className="mb-4 flex items-center gap-3">
        <label>Filter:</label>
        <select value={filter} onChange={e=> setFilter(e.target.value)} className="input-small">
          <option value="all">All</option>
          <option value="5">5 ★</option>
          <option value="4">4 ★</option>
          <option value="3">3 ★</option>
          <option value="2">2 ★</option>
          <option value="1">1 ★</option>
        </select>
      </div>

      <div className="grid gap-4">
        {list.map(r => (
          <div className="card" key={r.id}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <strong>{r.userName}</strong>
                <div className="muted text-sm">{new Date(r.createdAt).toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{r.rating} ★</div>
                <div className="muted text-sm">{r.tiffinId || '—'}</div>
              </div>
            </div>

            <p className="muted">{r.comment}</p>

            <div className="mt-3 flex items-center gap-3">
              <button onClick={()=> { setSelected(r); setReplyText(r.reply || ''); }} className="btn">Reply</button>
              <button onClick={()=> markFeatured(r.id)} className={`btn ${r.featured ? 'btn-primary' : ''}`}>{r.featured ? 'Featured' : 'Mark Featured'}</button>
            </div>

            {r.reply && <div className="mt-3 p-3 bg-gray-50 rounded text-sm">Reply: {r.reply}</div>}
          </div>
        ))}
      </div>

      {/* Reply modal */}
      {selected && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3 className="font-semibold mb-2">Reply to {selected.userName}</h3>
            <textarea className="input" value={replyText} onChange={e=>setReplyText(e.target.value)} />
            <div className="flex justify-end gap-3 mt-3">
              <button onClick={()=> setSelected(null)} className="btn">Cancel</button>
              <button onClick={reply} className="btn-primary">Send Reply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}