// src/Pages/Admin/VendorManagement.js
import React, { useState, useMemo, useEffect } from "react";
import { Search, ChevronUp, ChevronDown } from "lucide-react";
import { api } from "../../helpers/api";

function parseCuisineField(cuisineField) {
  // backend may send:
  // - a JSON array string: '["North Indian","Nepali"]'
  // - a simple string: "North Indian"
  // - an escaped quoted string "\"North Indian\"" (your example)
  if (!cuisineField) return [];
  try {
    // If it's already an array
    if (Array.isArray(cuisineField)) return cuisineField;
    // If it looks like a JSON array
    if (typeof cuisineField === "string") {
      const trimmed = cuisineField.trim();
      // handle "\"North Indian\"" -> becomes "North Indian"
      if (/^"(.*)"$/.test(trimmed) && !trimmed.startsWith('["')) {
        return [trimmed.slice(1, -1)];
      }
      if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed;
      }
      // comma separated fallback
      if (trimmed.includes(",")) return trimmed.split(",").map(s => s.trim()).filter(Boolean);
      // plain string fallback
      return [trimmed.replace(/^"|"$/g, "")];
    }
    return [];
  } catch {
    return [];
  }
}

const VendorManagement = () => {
  const [vendors, setVendors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cuisineFilter, setCuisineFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const data = await api.getVendors();
      if (mounted) setVendors(Array.isArray(data) ? data : []);
      setLoading(false);
    })();
    return () => (mounted = false);
  }, []);

  const allCuisines = useMemo(() => {
    try {
      const set = new Set();
      (vendors || []).forEach(v => {
        const arr = parseCuisineField(v.cuisineType || v.cuisine_type || v.cuisineTypes || "");
        arr.forEach(c => set.add(c));
      });
      return Array.from(set).sort();
    } catch {
      return [];
    }
  }, [vendors]);

  const filteredAndSortedVendors = useMemo(() => {
    let list = Array.isArray(vendors) ? vendors : [];
    let filtered = list.filter(vendor => {
      const bn = (vendor.businessName || vendor.business_name || "").toString().toLowerCase();
      const owner = (vendor.ownerName || vendor.owner_name || "").toString().toLowerCase();
      const email = (vendor.businessEmail || vendor.email || vendor.business_email || "").toString().toLowerCase();
      const matchesSearch = bn.includes(searchTerm.toLowerCase()) || owner.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
      const cuisines = parseCuisineField(vendor.cuisineType || vendor.cuisine_type || vendor.cuisineTypes || "");
      const matchesCuisine = cuisineFilter === "All" || cuisines.includes(cuisineFilter);
      const matchesStatus = statusFilter === "All" || ((vendor.status || "").toLowerCase() === statusFilter.toLowerCase());
      return matchesSearch && matchesCuisine && matchesStatus;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const A = ((a[sortConfig.key] || "") + "").toString().toLowerCase();
        const B = ((b[sortConfig.key] || "") + "").toString().toLowerCase();
        if (A < B) return sortConfig.direction === "asc" ? -1 : 1;
        if (A > B) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [vendors, searchTerm, cuisineFilter, statusFilter, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedVendors.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filteredAndSortedVendors.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = key => {
    let dir = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") dir = "desc";
    setSortConfig({ key, direction: dir });
  };

  const removeVendor = async (v) => {
    if (!window.confirm("Delete vendor?")) return;
    const id = v.vendorId || v.id || v.vendor_id;
    const ok = await api.deleteVendor(id);
    if (ok) setVendors(prev => prev.filter(x => !(x.vendorId === id || x.id === id || x.vendor_id === id)));
    else alert("Delete failed");
  };

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <ChevronUp className="w-4 h-4 opacity-30" />;
    return sortConfig.direction === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Tiffin Vendor Management</h1>

      <div className="bg-white p-4 rounded shadow mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" />
            <input className="pl-10 w-full border px-3 py-2 rounded" placeholder="Search business, owner or email..." value={searchTerm} onChange={e=>{setSearchTerm(e.target.value); setCurrentPage(1);}} />
          </div>

          <select value={cuisineFilter} onChange={e=>{setCuisineFilter(e.target.value); setCurrentPage(1);}} className="px-3 py-2 border rounded">
            <option value="All">All Cuisines</option>
            {allCuisines.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select value={statusFilter} onChange={e=>{setStatusFilter(e.target.value); setCurrentPage(1);}} className="px-3 py-2 border rounded">
            <option value="All">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">Business</th>
              <th className="p-3">Owner / Email</th>
              <th className="p-3">Cuisines</th>
              <th className="p-3">Reg. Date</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="6" className="p-6 text-center">Loading...</td></tr> : (
              paginated.map(v => (
                <tr key={v.vendorId || v.id || v.businessEmail} className="hover:bg-gray-50">
                  <td className="p-3">{v.businessName || v.business_name}</td>
                  <td className="p-3"><div className="font-medium">{v.ownerName || v.owner_name}</div><div className="text-xs text-gray-500">{v.businessEmail || v.email}</div></td>
                  <td className="p-3">
                    {parseCuisineField(v.cuisineType || v.cuisine_type || v.cuisineTypes || []).map((c, i) => <span key={i} className="inline-block px-2 py-1 mr-1 text-xs bg-orange-100 rounded">{c}</span>)}
                  </td>
                  <td className="p-3">{v.createdAt || v.created_at || "-"}</td>
                  <td className="p-3">{v.status || "pending"}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button onClick={()=>{navigator.clipboard?.writeText(JSON.stringify(v)); alert("Vendor JSON copied to clipboard (for quick debug)");}} className="px-2 py-1 border rounded text-sm">CopyJSON</button>
                      <button onClick={()=>removeVendor(v)} className="px-2 py-1 border rounded text-red-600">Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="p-3 flex items-center justify-between">
          <div>Showing {Math.min(startIndex+1, filteredAndSortedVendors.length)} to {Math.min(startIndex+itemsPerPage, filteredAndSortedVendors.length)} of {filteredAndSortedVendors.length}</div>
          <div className="flex gap-2">
            <button onClick={()=>setCurrentPage(p=>Math.max(1,p-1))} disabled={currentPage===1} className="px-3 py-1 border rounded">Prev</button>
            {[...Array(totalPages)].map((_,i)=>(
              <button key={i} onClick={()=>setCurrentPage(i+1)} className={`px-3 py-1 border rounded ${currentPage===i+1?"bg-blue-600 text-white":""}`}>{i+1}</button>
            ))}
            <button onClick={()=>setCurrentPage(p=>Math.min(totalPages,p+1))} disabled={currentPage===totalPages} className="px-3 py-1 border rounded">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorManagement;