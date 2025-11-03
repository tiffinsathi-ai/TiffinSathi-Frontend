import React, { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown, Eye, CheckCircle, XCircle, X } from 'lucide-react';

const VendorApprovalTable = () => {
  // Detailed Tiffin Vendor Data adapted for the Approval Flow
  const initialVendors = [
    { 
      id: 1, businessName: 'Tiffin Delight Services', ownerName: 'Priya Sharma', email: 'priya.sharma@tiffindelights.com', phone: '9876543210', status: 'Pending', city: 'Mumbai', cuisineTypes: ['North Indian', 'Gujarati'], registeredDate: '2024-01-15', fssaiNumber: '10012345678901', documents: 'FSSAI, PAN, GST', 
      businessImageUrl: 'https://ui-avatars.com/api/?name=Tiffin+Delight&background=4F46E5&color=fff&size=150' 
    },
    { 
      id: 2, businessName: 'Mumbai Meals Express', ownerName: 'Rajesh Patel', email: 'rajesh@mumbaimeals.com', phone: '9123456789', status: 'Pending', city: 'Pune', cuisineTypes: ['South Indian', 'Maharashtrian'], registeredDate: '2024-02-20', fssaiNumber: '10012345678902', documents: 'FSSAI, PAN, GST',
      businessImageUrl: 'https://ui-avatars.com/api/?name=Mumbai+Meals&background=0891B2&color=fff&size=150' 
    },
    { 
      id: 3, businessName: 'Healthy Bites Tiffin', ownerName: 'Anjali Verma', email: 'anjali@healthybites.com', phone: '9345678901', status: 'Pending', city: 'Delhi', cuisineTypes: ['Continental', 'Chinese'], registeredDate: '2024-03-10', fssaiNumber: '10012345678903', documents: 'FSSAI, PAN, GST',
      businessImageUrl: 'https://ui-avatars.com/api/?name=Healthy+Bites&background=059669&color=fff&size=150' 
    },
    { 
      id: 4, businessName: 'Spice Route Tiffins', ownerName: 'Mohammed Khan', email: 'khan@spiceroute.com', phone: '9567890123', status: 'Pending', city: 'Bangalore', cuisineTypes: ['North Indian', 'Mughlai'], registeredDate: '2024-04-05', fssaiNumber: '10012345678904', documents: 'FSSAI, PAN, GST',
      businessImageUrl: 'https://ui-avatars.com/api/?name=Spice+Route&background=EA580C&color=fff&size=150' 
    },
    { 
      id: 5, businessName: 'Home Kitchen Delights', ownerName: 'Lakshmi Iyer', email: 'lakshmi@homekitchen.com', phone: '9789012345', status: 'Approved', city: 'Chennai', cuisineTypes: ['South Indian', 'Tamil'], registeredDate: '2024-05-12', fssaiNumber: '10012345678905', documents: 'FSSAI, PAN',
      businessImageUrl: 'https://ui-avatars.com/api/?name=Home+Kitchen&background=DB2777&color=fff&size=150'
    },
    { 
      id: 6, businessName: 'Fusion Foods Tiffin', ownerName: 'Deepa Varma', email: 'deepa@fusionfoods.com', phone: '9999999999', status: 'Denied', denialReason: 'FSSAI license expired.', city: 'Mumbai', cuisineTypes: ['Fusion'], registeredDate: '2024-08-22', fssaiNumber: '10012345678906', documents: 'FSSAI, Business License',
      businessImageUrl: 'https://ui-avatars.com/api/?name=Fusion+Foods&background=DC2626&color=fff&size=150' 
    },
    { 
      id: 7, businessName: 'Quick Tiffins Co.', ownerName: 'Sanjay Dutt', email: 'sanjay@quicktiffin.com', phone: '9111111111', status: 'Pending', city: 'Kolkata', cuisineTypes: ['Bengali', 'North Indian'], registeredDate: '2024-11-01', fssaiNumber: '10012345678907', documents: 'FSSAI, PAN',
      businessImageUrl: 'https://ui-avatars.com/api/?name=Quick+Tiffins&background=7C3AED&color=fff&size=150'
    },
    { 
      id: 8, businessName: 'Global Tiffin Services', ownerName: 'Chris Evans', email: 'chris@globaltiffin.com', phone: '9222222222', status: 'Approved', city: 'Delhi', cuisineTypes: ['North Indian'], registeredDate: '2024-09-15', fssaiNumber: '10012345678908', documents: 'FSSAI, GST',
      businessImageUrl: 'https://ui-avatars.com/api/?name=Global+Tiffin&background=1F2937&color=fff&size=150'
    },
    { 
      id: 9, businessName: 'Pure Veg Meals', ownerName: 'Kirti Shah', email: 'kirti@pureveg.com', phone: '9333333333', status: 'Pending', city: 'Ahmedabad', cuisineTypes: ['Jain', 'Gujarati'], registeredDate: '2024-10-30', fssaiNumber: '10012345678909', documents: 'FSSAI, Business License',
      businessImageUrl: 'https://ui-avatars.com/api/?name=Pure+Veg+Meals&background=9333EA&color=fff&size=150' 
    },
    { 
      id: 10, businessName: 'Daily Diet Foods', ownerName: 'Rahul Yadav', email: 'rahul@dailydiet.com', phone: '9444444444', status: 'Pending', city: 'Hyderabad', cuisineTypes: ['Keto', 'Vegan'], registeredDate: '2024-10-28', fssaiNumber: '10012345678910', documents: 'FSSAI',
      businessImageUrl: 'https://ui-avatars.com/api/?name=Daily+Diet&background=CA8A04&color=fff&size=150'
    },
  ];

  const [vendors, setVendors] = useState(initialVendors);
  const [searchTerm, setSearchTerm] = useState('');
  // Changed filter from 'category' to 'cuisine'
  const [cuisineFilter, setCuisineFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [denialReason, setDenialReason] = useState('');

  // Get unique cuisines for the filter dropdown
  const allCuisines = useMemo(() => {
    return [...new Set(vendors.flatMap(v => v.cuisineTypes))].sort();
  }, [vendors]);

  // Sorting function
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Filter and sort data
  const filteredAndSortedVendors = useMemo(() => {
    let filtered = vendors.filter(vendor => {
      const matchesSearch = 
        vendor.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.ownerName.toLowerCase().includes(searchTerm.toLowerCase()); // Added ownerName search
      // Filter by cuisineTypes (array contains filter value)
      const matchesCuisine = cuisineFilter === 'All' || vendor.cuisineTypes.includes(cuisineFilter);
      const matchesStatus = statusFilter === 'All' || vendor.status === statusFilter;
      
      return matchesSearch && matchesCuisine && matchesStatus;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [vendors, searchTerm, cuisineFilter, statusFilter, sortConfig]); // Updated filter dependencies

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedVendors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedVendors = filteredAndSortedVendors.slice(startIndex, startIndex + itemsPerPage);

  // Actions (Same logic as original approval table)
  const handleView = (vendor) => {
    setSelectedVendor(vendor);
    setModalType('view');
  };

  const handleApprove = (vendor) => {
    setSelectedVendor(vendor);
    setModalType('approve');
  };

  const handleDeny = (vendor) => {
    setSelectedVendor(vendor);
    setDenialReason(vendor.denialReason || ''); // Preserve existing denial reason if any
    setModalType('deny');
  };

  const confirmApproval = () => {
    setVendors(vendors.map(v => 
      v.id === selectedVendor.id ? { ...v, status: 'Approved', denialReason: undefined } : v
    ));
    closeModal();
  };

  const confirmDenial = () => {
    if (!denialReason.trim()) {
      alert('Please provide a reason for denial');
      return;
    }
    setVendors(vendors.map(v => 
      v.id === selectedVendor.id ? { ...v, status: 'Denied', denialReason } : v
    ));
    closeModal();
  };

  const closeModal = () => {
    setSelectedVendor(null);
    setModalType(null);
    setDenialReason('');
  };

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <ChevronUp className="w-4 h-4 opacity-30" />;
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />;
  };

  const DetailItem = ({ label, value }) => (
    <div>
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <p className="text-gray-900">{value}</p>
    </div>
  );

  const CuisineTags = ({ cuisines }) => (
    <div className="flex flex-wrap gap-1 mt-1">
      {cuisines.map((cuisine, idx) => (
        <span key={idx} className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          {cuisine}
        </span>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Vendor Approval Queue</h1>
          <div className="flex gap-4">
            <div className="text-center px-4 py-2 bg-yellow-100 rounded-lg">
              <div className="text-2xl font-bold text-yellow-800">
                {vendors.filter(v => v.status === 'Pending').length}
              </div>
              <div className="text-xs text-yellow-700">Pending</div>
            </div>
            <div className="text-center px-4 py-2 bg-green-100 rounded-lg">
              <div className="text-2xl font-bold text-green-800">
                {vendors.filter(v => v.status === 'Approved').length}
              </div>
              <div className="text-xs text-green-700">Approved</div>
            </div>
            <div className="text-center px-4 py-2 bg-red-100 rounded-lg">
              <div className="text-2xl font-bold text-red-800">
                {vendors.filter(v => v.status === 'Denied').length}
              </div>
              <div className="text-xs text-red-700">Denied</div>
            </div>
          </div>
        </div>
        
        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by business name or email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Cuisine Filter (Updated) */}
            <select
              value={cuisineFilter}
              onChange={(e) => {
                setCuisineFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="All">All Cuisines</option>
              {allCuisines.map(cuisine => (
                <option key={cuisine} value={cuisine}>{cuisine}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Denied">Denied</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th 
                    onClick={() => handleSort('businessName')}
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      Business Name
                      <SortIcon column="businessName" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('ownerName')}
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      Owner / Email
                      <SortIcon column="ownerName" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('cuisineTypes')}
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      Cuisines
                      <SortIcon column="cuisineTypes" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('registeredDate')}
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      Reg. Date
                      <SortIcon column="registeredDate" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('status')}
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      Status
                      <SortIcon column="status" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedVendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-3">
                        <img 
                          src={vendor.businessImageUrl} 
                          alt={vendor.businessName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <span>{vendor.businessName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <p className="font-medium text-gray-800">{vendor.ownerName}</p>
                      <p className="text-xs text-gray-500">{vendor.email}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <CuisineTags cuisines={vendor.cuisineTypes} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {vendor.registeredDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        vendor.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                        vendor.status === 'Denied' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {vendor.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleView(vendor)}
                          className="p-1 hover:bg-blue-50 rounded text-blue-600"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        {vendor.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(vendor)}
                              className="p-1 hover:bg-green-50 rounded text-green-600"
                              title="Approve"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeny(vendor)}
                              className="p-1 hover:bg-red-50 rounded text-red-600"
                              title="Deny"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredAndSortedVendors.length)} of {filteredAndSortedVendors.length} results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-4 py-2 border rounded-lg text-sm font-medium ${
                    currentPage === i + 1
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Modal */}
        {selectedVendor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white p-6 border-b flex justify-between items-center z-10">
                <h2 className="text-xl font-bold text-gray-900">
                  {modalType === 'view' && 'Vendor Details'}
                  {modalType === 'approve' && 'Approve Vendor'}
                  {modalType === 'deny' && 'Deny Vendor'}
                </h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                {/* VIEW Modal (Updated for Tiffin Vendor data) */}
                {modalType === 'view' && (
                  <div className="space-y-6">
                    <div className="flex flex-col items-center justify-center mb-4">
                      <img 
                        src={selectedVendor.businessImageUrl} 
                        alt={selectedVendor.businessName}
                        className="w-24 h-24 rounded-full object-cover shadow-lg"
                      />
                      <h3 className="text-2xl font-bold text-gray-900 mt-3">{selectedVendor.businessName}</h3>
                      <p className="text-sm font-medium text-gray-500">{selectedVendor.ownerName}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-4">
                        <DetailItem label="Status" value={selectedVendor.status} />
                        <DetailItem label="Registered Date" value={selectedVendor.registeredDate} />
                        <div className="md:col-span-2">
                          <span className="text-sm font-medium text-gray-500">Cuisine Types</span>
                          <CuisineTags cuisines={selectedVendor.cuisineTypes} />
                        </div>

                        <DetailItem label="Email" value={selectedVendor.email} />
                        <DetailItem label="Phone" value={selectedVendor.phone} />

                        <DetailItem label="City" value={selectedVendor.city} />
                        <DetailItem label="Documents Provided" value={selectedVendor.documents} />

                        {selectedVendor.denialReason && selectedVendor.status === 'Denied' && (
                            <div className="md:col-span-2 mt-4 p-3 bg-red-50 rounded-lg">
                                <span className="font-medium text-red-700">Denial Reason:</span>
                                <p className="text-red-600 mt-1">{selectedVendor.denialReason}</p>
                            </div>
                        )}
                        
                        <div className="md:col-span-2 border-t pt-4">
                          <h4 className="text-md font-semibold text-gray-800 mb-2">KYC Details (For Verification)</h4>
                          <div className="grid grid-cols-2 gap-4">
                              <DetailItem label="FSSAI Number" value={selectedVendor.fssaiNumber} />
                              <DetailItem label="GST/PAN (Check Documents)" value="See Documents" />
                          </div>
                        </div>
                    </div>
                  </div>
                )}

                {/* APPROVE Modal (Original Logic) */}
                {modalType === 'approve' && (
                  <div>
                    <div className="mb-4 p-4 bg-green-50 rounded-lg">
                      <p className="text-gray-700">
                        Are you sure you want to approve <span className="font-semibold">{selectedVendor.businessName}</span>?
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        This vendor will be added to your active vendor list.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={closeModal}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={confirmApproval}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                )}

                {/* DENY Modal (Original Logic) */}
                {modalType === 'deny' && (
                  <div>
                    <div className="mb-4">
                      <p className="text-gray-700 mb-3">
                        Please provide a reason for denying <span className="font-semibold">{selectedVendor.businessName}</span>:
                      </p>
                      <textarea
                        value={denialReason}
                        onChange={(e) => setDenialReason(e.target.value)}
                        placeholder="Enter reason for denial (e.g., Missing FSSAI, incomplete documentation, failed quality check)..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                        rows="4"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={closeModal}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={confirmDenial}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Deny
                      </button>
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