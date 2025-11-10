// src/Pages/Vendor/Settings.js
import React, { useEffect, useState } from 'react';
import { readData, writeData } from '../../helpers/storage';
import '../../Components/Styles/vendor.css';

export default function Settings(){
  const [data, setData] = useState(readData());
  const [profile, setProfile] = useState(data.vendorProfile || {});
  const [logoPreview, setLogoPreview] = useState(profile.logo || '');

  useEffect(()=> writeData(data), [data]);

  function save(){
    const copy = JSON.parse(JSON.stringify(data));
    copy.vendorProfile = profile;
    if(logoPreview) copy.vendorProfile.logo = logoPreview;
    setData(copy);
    alert('Saved');
  }

  // local preview for file input (client-side only)
  function handleLogo(e){
    const f = e.target.files[0];
    if(!f) return;
    const url = URL.createObjectURL(f);
    setLogoPreview(url);
    setProfile({...profile, logo: url});
  }

  return (
    <div className="vendor-page container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Profile</h3>
        <div className="grid md:grid-cols-2 gap-3 mb-3">
          <input className="input" value={profile.ownerName || ''} placeholder="Owner name" onChange={e=>setProfile({...profile, ownerName: e.target.value})} />
          <input className="input" value={profile.businessName || ''} placeholder="Business name" onChange={e=>setProfile({...profile, businessName: e.target.value})} />
          <input className="input" value={profile.email || ''} placeholder="Email" onChange={e=>setProfile({...profile, email: e.target.value})} />
          <input className="input" value={profile.phone || ''} placeholder="Phone" onChange={e=>setProfile({...profile, phone: e.target.value})} />
          <input className="input md:col-span-2" value={profile.address || ''} placeholder="Address" onChange={e=>setProfile({...profile, address: e.target.value})} />
        </div>

        <h3 className="font-semibold mb-2">Bank details</h3>
        <div className="grid md:grid-cols-2 gap-3 mb-3">
          <input className="input" value={profile.bank?.bankName || ''} placeholder="Bank name" onChange={e=>setProfile({...profile, bank: {...(profile.bank||{}), bankName: e.target.value}})} />
          <input className="input" value={profile.bank?.accountNumber || ''} placeholder="Account number" onChange={e=>setProfile({...profile, bank:{...(profile.bank||{}), accountNumber: e.target.value}})} />
          <input className="input" value={profile.bank?.branch || ''} placeholder="Branch" onChange={e=>setProfile({...profile, bank:{...(profile.bank||{}), branch: e.target.value}})} />
          <input className="input" value={profile.bank?.holderName || ''} placeholder="Account holder" onChange={e=>setProfile({...profile, bank:{...(profile.bank||{}), holderName: e.target.value}})} />
        </div>

        <h3 className="font-semibold mb-2">Logo / Banner</h3>
        <div className="flex items-center gap-3 mb-3">
          <input type="file" accept="image/*" onChange={handleLogo} />
          {logoPreview && <img src={logoPreview} alt="preview" style={{ height:60, borderRadius:6 }} />}
        </div>

        <div className="flex justify-end">
          <button onClick={save} className="btn-primary">Save</button>
        </div>
      </div>
    </div>
  );
}