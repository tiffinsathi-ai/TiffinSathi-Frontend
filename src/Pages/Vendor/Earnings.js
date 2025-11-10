// src/Pages/Vendor/Earnings.js
import React, { useEffect, useMemo, useState } from 'react';
import { readData, writeData } from '../../helpers/storage';
import '../../Components/Styles/vendor.css';

export default function Earnings(){
  const [data, setData] = useState(readData());
  const [openRequest, setOpenRequest] = useState(false);
  const [amount, setAmount] = useState('');

  useEffect(()=> writeData(data), [data]);

  const earnings = useMemo(()=> data.orders.reduce((s,o)=> s + (o.paymentStatus==='paid' ? (o.total||0) : 0), 0), [data.orders]);
  const withdrawable = Math.round(earnings * 0.8);

  function requestPayout(){
    const v = Number(amount);
    if(!v || v <= 0) return alert('Enter valid amount');
    if(v > withdrawable) return alert('Exceeds withdrawable');
    const copy = JSON.parse(JSON.stringify(data));
    const tx = { id: 'tx'+Date.now().toString(36), date: new Date().toISOString(), amount: v, type: 'payout_request' };
    copy.transactions.push(tx);
    setData(copy);
    setOpenRequest(false);
    setAmount('');
    alert('Payout requested (simulated)');
  }

  return (
    <div className="vendor-page container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Earnings</h1>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <div className="muted">Total Earnings</div>
          <div className="card-value">NPR {earnings}</div>
        </div>
        <div className="card">
          <div className="muted">Withdrawable</div>
          <div className="card-value">NPR {withdrawable}</div>
        </div>
        <div className="card">
          <div className="muted">Pending</div>
          <div className="card-value">NPR {Math.max(0, earnings - withdrawable)}</div>
        </div>
      </div>

      <div className="mb-4">
        <button onClick={()=> setOpenRequest(true)} className="btn-primary">Request Payout</button>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-3">Transaction history</h3>
        <table className="w-full text-sm">
          <thead className="border-b"><tr><th>Date</th><th>Amount</th><th>Type</th></tr></thead>
          <tbody>
            {data.transactions.length === 0 ? (
              <tr><td colSpan="3" className="py-4 text-center muted">No transactions yet</td></tr>
            ) : data.transactions.slice().reverse().map((t,i)=>(
              <tr key={i} className="border-b">
                <td className="py-2">{new Date(t.date).toLocaleString()}</td>
                <td>NPR {t.amount}</td>
                <td>{t.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {openRequest && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3 className="font-semibold mb-3">Request Payout</h3>
            <input className="input" placeholder="Amount" value={amount} onChange={e=>setAmount(e.target.value)} />
            <div className="flex justify-end gap-3 mt-3">
              <button onClick={()=> setOpenRequest(false)} className="btn">Cancel</button>
              <button onClick={requestPayout} className="btn-primary">Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}