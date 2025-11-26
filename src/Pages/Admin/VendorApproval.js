// src/Pages/Admin/VendorApproval.js
import React, { useState, useMemo, useEffect } from "react";
import { Search, ChevronUp, ChevronDown, Eye, CheckCircle, XCircle, X } from "lucide-react";
import { api } from "../../helpers/api";

function parseCuisineField(cuisineField) {
  if (!cuisineField) return [];
  try {
    if (Array.isArray(cuisineField)) return cuisineField;
    const trimmed = cuisineField.toString().trim();
    if (/^"(.*)"$/.test(trimmed) && !trimmed.startsWith('["')) {
      return [trimmed.slice(1, -1)];
    }
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed;
    }
    if (trimmed.includes(",")) return trimmed.split(",").map(s => s.trim()).filter(Boolean);
    return [trimmed.replace(/^"|"$/g, "")];
  } catch {
    return [];
  }
}

const VendorApprovalTable = () => {
  const [vendors, setVendors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cuisineFilter, setCuisineFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [denialReason, setDenialReason] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const data = await api.getPendingVendors();
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

  const handleSort = key => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  const filteredAndSortedVendors = useMemo(() => {
    let list = Array.isArray(vendors) ? vendors : [];
    let filtered = list.filter(vendor => {
      const bn = (vendor.businessName || vendor.business_name || "").toLowerCase();
      const email = (vendor.businessEmail || vendor.email || "").toLowerCase();
      const owner = (vendor.ownerName || vendor.owner_name || "").toLowerCase();
      const matchesSearch = bn.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase()) || owner.includes(searchTerm.toLowerCase());
      const cuisines = parseCuisineField(vendor.cuisineType || vendor.cuisine_type || vendor.cuisineTypes || "");
      const matchesCuisine = cuisineFilter === "All" || cuisines.includes(cuisineFilter);
      const matchesStatus = statusFilter === "All" || ((vendor.status || "").toLowerCase() === statusFilter.toLowerCase());
      return matchesSearch && matchesCuisine && matchesStatus;
    });

    if (sortConfig.key) {
      filtered.sort((a,b) => {
        const A = (a[sortConfig.key] || "").toString().toLowerCase();
        const B = (b[sortConfig.key] || "").toString().toLowerCase();
        if (A < B) return sortConfig.direction === "asc" ? -1 : 1;
        if (A > B) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [vendors, searchTerm, cuisineFilter, statusFilter, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedVendors.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedVendors = filteredAndSortedVendors.slice(startIndex, startIndex + itemsPerPage);

  const handleView = (vendor) => { setSelectedVendor(vendor); setModalType("view"); };
  const handleApprove = (vendor) => { setSelectedVendor(vendor); setModalType("approve"); };
  const handleDeny = (vendor) => { setSelectedVendor(vendor); setDenialReason(vendor.denialReason || ""); setModalType("deny"); };

  const confirmApproval = async () => {
    if (!selectedVendor) return;
    const id = selectedVendor.vendorId || selectedVendor.id || selectedVendor.vendor_id;
    const res = await api.approveVendor(id);
    if (res && res.ok) {
      setVendors(prev => prev.map(v => ( (v.vendorId === id || v.id === id || v.vendor_id === id) ? { ...v, status: "approved" } : v )));
    } else {
      alert("Failed to approve vendor. Check backend/CORS/auth token.");
    }
    closeModal();
  };

  const confirmDenial = async () => {
    if (!denialReason.trim()) { alert("Please provide a reason for denial"); return; }
    if (!selectedVendor) return;
    const id = selectedVendor.vendorId || selectedVendor.id || selectedVendor.vendor_id;
    const res = await api.rejectVendor(id, denialReason);
    if (res && res.ok) {
      setVendors(prev => prev.map(v => ( (v.vendorId === id || v.id === id || v.vendor_id === id) ? { ...v, status: "rejected", denialReason } : v )));
    } else {
      alert("Failed to reject vendor. Check backend/CORS/auth token.");
    }
    closeModal();
  };

  const closeModal = () => { setSelectedVendor(null); setModalType(null); setDenialReason(""); };

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <ChevronUp className="w-4 h-4 opacity-30" />;
    return sortConfig.direction === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  const DetailItem = ({ label, value }) => (
    <div>
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <p className="text-gray-900">{value ?? "-"}</p>
    </div>
  );

  const CuisineTags = ({ cuisines }) => (
    <div className="flex flex-wrap gap-1 mt-1">
      {(cuisines || []).map((c, idx) => <span key={idx} className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">{c}</span>)}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Vendor Approval Queue</h1>
          <div className="flex gap-4">
            <div className="text-center px-4 py-2 bg-yellow-100 rounded-lg">
              <div className="text-2xl font-bold text-yellow-800">{(vendors || []).filter((v) => (v.status || "").toLowerCase() === "pending").length}</div>
              <div className="text-xs text-yellow-700">Pending</div>
            </div>
            <div className="text-center px-4 py-2 bg-green-100 rounded-lg">
              <div className="text-2xl font-bold text-green-800">{(vendors || []).filter((v) => (v.status || "").toLowerCase() === "approved").length}</div>
              <div className="text-xs text-green-700">Approved</div>
            </div>
            <div className="text-center px-4 py-2 bg-red-100 rounded-lg">
              <div className="text-2xl font-bold text-red-800">{(vendors || []).filter((v) => ["rejected","denied"].includes((v.status||"").toLowerCase())).length}</div>
              <div className="text-xs text-red-700">Denied</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="text" placeholder="Search by business name or email..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg" />
            </div>

            <select value={cuisineFilter} onChange={(e) => { setCuisineFilter(e.target.value); setCurrentPage(1); }} className="px-4 py-2 border border-gray-300 rounded-lg">
              <option value="All">All Cuisines</option>
              {allCuisines.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>

            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="px-4 py-2 border border-gray-300 rounded-lg">
              <option value="All">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th onClick={() => handleSort("businessName")} className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"> <div className="flex items-center gap-2">Business Name <SortIcon column="businessName" /></div></th>
                  <th onClick={() => handleSort("ownerName")} className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"> <div className="flex items-center gap-2">Owner / Email <SortIcon column="ownerName" /></div></th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Cuisines</th>
                  <th onClick={() => handleSort("registeredDate")} className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer">Reg. Date <SortIcon column="registeredDate" /></th>
                  <th onClick={() => handleSort("status")} className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer">Status <SortIcon column="status" /></th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan="6" className="p-6 text-center text-gray-500">Loading...</td></tr>
                ) : (
                  paginatedVendors.map((vendor) => (
                    <tr key={vendor.vendorId || vendor.id || vendor.email} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="flex items-center gap-3">
                          <img src={vendor.businessImageUrl || vendor.business_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(vendor.businessName||"V")}`} alt={vendor.businessName} className="w-10 h-10 rounded-full object-cover" />
                          <span>{vendor.businessName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <p className="font-medium text-gray-800">{vendor.ownerName}</p>
                        <p className="text-xs text-gray-500">{vendor.businessEmail || vendor.email}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex flex-wrap gap-1 mt-1">
                          {parseCuisineField(vendor.cuisineType || vendor.cuisine_type || vendor.cuisineTypes || []).map((c, idx) => <span key={idx} className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">{c}</span>)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{vendor.createdAt || vendor.created_at || "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${vendor.status === "approved" ? "bg-green-100 text-green-800" : vendor.status === "rejected" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}>{vendor.status || "Pending"}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div className="flex gap-2">
                          <button onClick={() => handleView(vendor)} className="p-1 hover:bg-blue-50 rounded text-blue-600" title="View Details"><Eye className="w-5 h-5" /></button>
                          {(vendor.status || "").toLowerCase() === "pending" && (
                            <>
                              <button onClick={() => handleApprove(vendor)} className="p-1 hover:bg-green-50 rounded text-green-600" title="Approve"><CheckCircle className="w-5 h-5" /></button>
                              <button onClick={() => handleDeny(vendor)} className="p-1 hover:bg-red-50 rounded text-red-600" title="Deny"><XCircle className="w-5 h-5" /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">Showing {Math.min(startIndex + 1, filteredAndSortedVendors.length)} to {Math.min(startIndex + itemsPerPage, filteredAndSortedVendors.length)} of {filteredAndSortedVendors.length} results</div>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Previous</button>
              {[...Array(totalPages)].map((_, i) => <button key={i} onClick={() => setCurrentPage(i + 1)} className={`px-4 py-2 border rounded-lg text-sm font-medium ${currentPage === i + 1 ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>{i + 1}</button>)}
              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Next</button>
            </div>
          </div>
        </div>

        {selectedVendor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white p-6 border-b flex justify-between items-center z-10">
                <h2 className="text-xl font-bold text-gray-900">{modalType === "view" ? "Vendor Details" : modalType === "approve" ? "Approve Vendor" : "Deny Vendor"}</h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
              </div>

              <div className="p-6">
                {modalType === "view" && (
                  <div className="space-y-6">
                    <div className="flex flex-col items-center justify-center mb-4">
                      <img src={selectedVendor.businessImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedVendor.businessName||"V")}`} alt={selectedVendor.businessName} className="w-24 h-24 rounded-full object-cover shadow-lg" />
                      <h3 className="text-2xl font-bold text-gray-900 mt-3">{selectedVendor.businessName}</h3>
                      <p className="text-sm font-medium text-gray-500">{selectedVendor.ownerName}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-4">
                      <DetailItem label="Status" value={selectedVendor.status} />
                      <DetailItem label="Registered Date" value={selectedVendor.createdAt || selectedVendor.created_at} />
                      <div className="md:col-span-2">
                        <span className="text-sm font-medium text-gray-500">Cuisine Types</span>
                        <CuisineTags cuisines={parseCuisineField(selectedVendor.cuisineType || selectedVendor.cuisine_type || selectedVendor.cuisineTypes || [])} />
                      </div>
                      <DetailItem label="Email" value={selectedVendor.businessEmail || selectedVendor.email} />
                      <DetailItem label="Phone" value={selectedVendor.phone} />
                      <DetailItem label="Address" value={selectedVendor.businessAddress || selectedVendor.address} />
                      <DetailItem label="Documents Provided" value={selectedVendor.licenseDocumentUrl || "-" } />
                    </div>
                  </div>
                )}

                {modalType === "approve" && (
                  <div>
                    <div className="mb-4 p-4 bg-green-50 rounded-lg">
                      <p className="text-gray-700">Are you sure you want to approve <span className="font-semibold">{selectedVendor.businessName}</span>?</p>
                      <p className="text-sm text-gray-600 mt-2">This vendor will be added to the active vendor list.</p>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={closeModal} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                      <button onClick={confirmApproval} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Approve</button>
                    </div>
                  </div>
                )}

                {modalType === "deny" && (
                  <div>
                    <div className="mb-4">
                      <p className="text-gray-700 mb-3">Please provide a reason for denying <span className="font-semibold">{selectedVendor.businessName}</span>:</p>
                      <textarea value={denialReason} onChange={(e) => setDenialReason(e.target.value)} placeholder="Enter reason for denial..." className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none" rows="4" />
                    </div>
                    <div className="flex gap-3">
                      <button onClick={closeModal} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                      <button onClick={confirmDenial} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Deny</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default VendorApprovalTable;