// src/Pages/Vendor/Analytics.js
import React, { useEffect, useMemo, useState } from 'react';
import { readData } from '../../helpers/storage';
import '../../Components/Styles/vendor.css';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar, Cell, Legend } from 'recharts';

function formatDate(d){ return d.toISOString().slice(0,10); }
function downloadCSV(name, rows){
  if(!rows.length) return alert('No data to export');
  const keys = Object.keys(rows[0]);
  const csv = [keys.join(',')].concat(rows.map(r => keys.map(k=>`"${String(r[k] ?? '')}"`).join(','))).join('\n');
  const blob = new Blob([csv], { type:'text/csv' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click();
}

export default function Analytics(){
  const [data, setData] = useState(readData());
  const [range, setRange] = useState(30);
  useEffect(()=> setData(readData()), []);

  const revenueTrend = useMemo(()=>{
    const now = new Date();
    const arr = [];
    for(let i=range-1;i>=0;i--){
      const d = new Date(now.getTime() - i*24*60*60*1000);
      const key = formatDate(d);
      const total = data.orders.filter(o => o.paymentStatus==='paid' && o.createdAt.slice(0,10)===key).reduce((s,o)=> s + (o.total||0), 0);
      arr.push({ date: key.slice(5), revenue: Math.round(total) });
    }
    return arr;
  }, [data.orders, range]);

  const topTiffins = useMemo(()=>{
    const counts = {};
    data.orders.forEach(o => (o.items||[]).forEach(it => { counts[it.tiffinId] = (counts[it.tiffinId]||0) + it.qty; }));
    const arr = Object.keys(counts).map(id => {
      const t = data.tiffins.find(x=>x.id===id);
      return { id, name: t ? t.name : id, sold: counts[id] };
    }).sort((a,b)=> b.sold - a.sold).slice(0,8);
    return arr.length ? arr : data.tiffins.slice(0,8).map(t=>({ id: t.id, name: t.name, sold: 0 }));
  }, [data.orders, data.tiffins]);

  function exportTrend(){
    downloadCSV('revenue_trend.csv', revenueTrend.map(r=> ({ date: r.date, revenue: r.revenue })));
  }

  return (
    <div className="vendor-page container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Analytics</h1>

      <div className="bg-white p-4 rounded shadow mb-4">
        <div className="flex items-center gap-3">
          <label>Range:</label>
          <select value={range} onChange={e=> setRange(Number(e.target.value))} className="input-small">
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button onClick={exportTrend} className="btn">Export Trend CSV</button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-semibold mb-2">Revenue Trend</h3>
          <div style={{ width:'100%', height:260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date"/>
                <YAxis />
                <Tooltip formatter={(v)=> `NPR ${v}`} />
                <Line dataKey="revenue" stroke="#6DB33F" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-2">Top-selling Tiffins</h3>
          <div style={{ width:'100%', height:260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topTiffins}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize:12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sold">
                  {topTiffins.map((entry, i) => <Cell key={`c-${i}`} fill={['#6DB33F','#FF9F43','#4F46E5','#FF6B6B','#38BDF8','#F59E0B'][i % 6]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}