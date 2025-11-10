import React, { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown, Eye, Edit, Trash2, X } from 'lucide-react';

const VendorManagementTable = () => {
  // Sample tiffin vendor data
  const [vendors] = useState([
    { 
      id: 1, 
      businessName: "Tiffin Delight Services", 
      ownerName: "Priya Sharma", 
      email: "priya.sharma@tiffindelights.com", 
      phone: "9876543210",
      alternatePhone: "9988776655",
      status: "Active",
      address: "12/A, Gandhi Road",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      cuisineTypes: ["North Indian", "Gujarati"],
      capacity: 200,
      priceRange: "100-150",
      yearsInBusiness: 3,
      description: "We specialize in healthy, home-style North Indian and Gujarati meals, delivered fresh daily.",
      bankName: "State Bank of India",
      accountNumber: "123456789012",
      ifscCode: "SBIN000001",
      accountHolderName: "Priya Sharma",
      panNumber: "ABCDE1234F",
      gstNumber: "27ABCDE1234F1Z5",
      fssaiNumber: "10012345678901",
      businessImageUrl: "https://ui-avatars.com/api/?name=Tiffin+Delight&background=DC2626&color=fff&size=150",
      registeredDate: "2024-01-15"
    },
    { 
      id: 2, 
      businessName: "Mumbai Meals Express", 
      ownerName: "Rajesh Patel", 
      email: "rajesh@mumbaimeals.com", 
      phone: "9123456789",
      alternatePhone: "9234567890",
      status: "Active",
      address: "45/B, Station Road",
      city: "Pune",
      state: "Maharashtra",
      pincode: "411001",
      cuisineTypes: ["South Indian", "Maharashtrian"],
      capacity: 150,
      priceRange: "80-120",
      yearsInBusiness: 5,
      description: "Traditional South Indian and Maharashtrian tiffin service with authentic flavors.",
      bankName: "HDFC Bank",
      accountNumber: "234567890123",
      ifscCode: "HDFC0001234",
      accountHolderName: "Rajesh Patel",
      panNumber: "BCDEF2345G",
      gstNumber: "27BCDEF2345G1Z6",
      fssaiNumber: "10012345678902",
      businessImageUrl: "https://ui-avatars.com/api/?name=Mumbai+Meals&background=0891B2&color=fff&size=150",
      registeredDate: "2024-02-20"
    },
    { 
      id: 3, 
      businessName: "Healthy Bites Tiffin", 
      ownerName: "Anjali Verma", 
      email: "anjali@healthybites.com", 
      phone: "9345678901",
      alternatePhone: "9456789012",
      status: "Inactive",
      address: "78, Green Park",
      city: "Delhi",
      state: "Delhi",
      pincode: "110016",
      cuisineTypes: ["Continental", "Chinese"],
      capacity: 100,
      priceRange: "120-180",
      yearsInBusiness: 2,
      description: "Diet-friendly and nutritious tiffin options with international cuisines.",
      bankName: "ICICI Bank",
      accountNumber: "345678901234",
      ifscCode: "ICIC0002345",
      accountHolderName: "Anjali Verma",
      panNumber: "CDEFG3456H",
      gstNumber: "07CDEFG3456H1Z7",
      fssaiNumber: "10012345678903",
      businessImageUrl: "https://ui-avatars.com/api/?name=Healthy+Bites&background=059669&color=fff&size=150",
      registeredDate: "2024-03-10"
    },
    { 
      id: 4, 
      businessName: "Spice Route Tiffins", 
      ownerName: "Mohammed Khan", 
      email: "khan@spiceroute.com", 
      phone: "9567890123",
      alternatePhone: "9678901234",
      status: "Active",
      address: "23, MG Road",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560001",
      cuisineTypes: ["North Indian", "Mughlai"],
      capacity: 250,
      priceRange: "90-140",
      yearsInBusiness: 4,
      description: "Authentic Mughlai and North Indian cuisine prepared with traditional recipes.",
      bankName: "Axis Bank",
      accountNumber: "456789012345",
      ifscCode: "UTIB0003456",
      accountHolderName: "Mohammed Khan",
      panNumber: "DEFGH4567I",
      gstNumber: "29DEFGH4567I1Z8",
      fssaiNumber: "10012345678904",
      businessImageUrl: "https://ui-avatars.com/api/?name=Spice+Route&background=7C3AED&color=fff&size=150",
      registeredDate: "2024-04-05"
    },
    { 
      id: 5, 
      businessName: "Home Kitchen Delights", 
      ownerName: "Lakshmi Iyer", 
      email: "lakshmi@homekitchen.com", 
      phone: "9789012345",
      alternatePhone: "9890123456",
      status: "Active",
      address: "56, Anna Nagar",
      city: "Chennai",
      state: "Tamil Nadu",
      pincode: "600040",
      cuisineTypes: ["South Indian", "Tamil"],
      capacity: 180,
      priceRange: "70-110",
      yearsInBusiness: 6,
      description: "Homemade South Indian meals with authentic Tamil flavors and traditional cooking methods.",
      bankName: "Canara Bank",
      accountNumber: "567890123456",
      ifscCode: "CNRB0004567",
      accountHolderName: "Lakshmi Iyer",
      panNumber: "EFGHI5678J",
      gstNumber: "33EFGHI5678J1Z9",
      fssaiNumber: "10012345678905",
      businessImageUrl: "https://ui-avatars.com/api/?name=Home+Kitchen&background=DB2777&color=fff&size=150",
      registeredDate: "2024-05-12"
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [cuisineFilter, setCuisineFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [modalType, setModalType] = useState(null);

  // Get unique cuisines
  const allCuisines = [...new Set(vendors.flatMap(v => v.cuisineTypes))];

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
        vendor.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.email.toLowerCase().includes(searchTerm.toLowerCase());
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
  }, [vendors, searchTerm, cuisineFilter, statusFilter, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedVendors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedVendors = filteredAndSortedVendors.slice(startIndex, startIndex + itemsPerPage);

  // Actions
  const handleView = (vendor) => {
    setSelectedVendor(vendor);
    setModalType('view');
  };

  const handleEdit = (vendor) => {
    setSelectedVendor(vendor);
    setModalType('edit');
  };

  const handleDelete = (vendor) => {
    setSelectedVendor(vendor);
    setModalType('delete');
  };

  const closeModal = () => {
    setSelectedVendor(null);
    setModalType(null);
  };

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <ChevronUp className="w-4 h-4 opacity-30" />;
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Tiffin Vendor Management</h1>
        
        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by business, owner or email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {/* Cuisine Filter */}
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
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
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
                      Owner
                      <SortIcon column="ownerName" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('city')}
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      Location
                      <SortIcon column="city" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cuisines
                  </th>
                  <th 
                    onClick={() => handleSort('capacity')}
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      Capacity
                      <SortIcon column="capacity" />
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
                      {vendor.ownerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {vendor.city}, {vendor.state}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex flex-wrap gap-1">
                        {vendor.cuisineTypes.map((cuisine, idx) => (
                          <span key={idx} className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            {cuisine}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {vendor.capacity} meals/day
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        vendor.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {vendor.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleView(vendor)}
                          className="p-1 hover:bg-blue-50 rounded text-blue-600"
                          title="View"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(vendor)}
                          className="p-1 hover:bg-green-50 rounded text-green-600"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(vendor)}
                          className="p-1 hover:bg-red-50 rounded text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
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
              <div className="sticky top-0 bg-white p-6 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">
                  {modalType === 'view' && 'Vendor Details'}
                  {modalType === 'edit' && 'Edit Vendor'}
                  {modalType === 'delete' && 'Delete Vendor'}
                </h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6">
                {/* ===== SIMPLIFIED & VISUALLY ORGANIZED VIEW BLOCK ===== */}
                {modalType === 'view' && (
                <div className="space-y-4">
                  <div className="flex items-center mb-2">
                    <img
                      src={selectedVendor.businessImageUrl}
                      alt={selectedVendor.businessName}
                      className="w-16 h-16 rounded-full object-cover mr-4"
                    />
                    <div>
                      <div className="text-lg font-semibold">{selectedVendor.businessName}</div>
                      <div className="text-sm text-gray-500">{selectedVendor.ownerName}</div>
                    </div>
                  </div>
                  <div className="bg-gray-100 rounded">
                    <div className="divide-y">
                      <div className="flex py-2 px-4"><div className="w-40 font-medium">Email</div><div>{selectedVendor.email}</div></div>
                      <div className="flex py-2 px-4"><div className="w-40 font-medium">Phone</div><div>{selectedVendor.phone}</div></div>
                      <div className="flex py-2 px-4"><div className="w-40 font-medium">Alternate Phone</div><div>{selectedVendor.alternatePhone}</div></div>
                      <div className="flex py-2 px-4"><div className="w-40 font-medium">Status</div><div>{selectedVendor.status}</div></div>
                      <div className="flex py-2 px-4"><div className="w-40 font-medium">Address</div><div>{selectedVendor.address}, {selectedVendor.city}, {selectedVendor.state} - {selectedVendor.pincode}</div></div>
                      <div className="flex py-2 px-4"><div className="w-40 font-medium">Cuisine Types</div><div>{selectedVendor.cuisineTypes.join(', ')}</div></div>
                      <div className="flex py-2 px-4"><div className="w-40 font-medium">Capacity</div><div>{selectedVendor.capacity} meals/day</div></div>
                      <div className="flex py-2 px-4"><div className="w-40 font-medium">Price Range</div><div>₹{selectedVendor.priceRange}</div></div>
                      <div className="flex py-2 px-4"><div className="w-40 font-medium">Years in Business</div><div>{selectedVendor.yearsInBusiness}</div></div>
                      <div className="flex py-2 px-4"><div className="w-40 font-medium">Description</div><div>{selectedVendor.description}</div></div>
                      <div className="flex py-2 px-4"><div className="w-40 font-medium">Bank Name</div><div>{selectedVendor.bankName}</div></div>
                      <div className="flex py-2 px-4"><div className="w-40 font-medium">Account Number</div><div>{selectedVendor.accountNumber}</div></div>
                      <div className="flex py-2 px-4"><div className="w-40 font-medium">IFSC Code</div><div>{selectedVendor.ifscCode}</div></div>
                      <div className="flex py-2 px-4"><div className="w-40 font-medium">Account Holder Name</div><div>{selectedVendor.accountHolderName}</div></div>
                      <div className="flex py-2 px-4"><div className="w-40 font-medium">PAN</div><div>{selectedVendor.panNumber}</div></div>
                      <div className="flex py-2 px-4"><div className="w-40 font-medium">GST</div><div>{selectedVendor.gstNumber}</div></div>
                      <div className="flex py-2 px-4"><div className="w-40 font-medium">FSSAI</div><div>{selectedVendor.fssaiNumber}</div></div>
                      <div className="flex py-2 px-4"><div className="w-40 font-medium">Registered Date</div><div>{selectedVendor.registeredDate}</div></div>
                    </div>
                  </div>
                </div>
              )}
                {/* ===== END SIMPLIFIED & ORGANIZED VIEW BLOCK ===== */}
                {modalType === 'edit' && (
                  <div className="space-y-4">
                    <p className="text-gray-600">Edit functionality would be implemented here with form fields for all vendor information.</p>
                    <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                      Save Changes
                    </button>
                  </div>
                )}
                {modalType === 'delete' && (
                  <div>
                    <p className="text-gray-600 mb-4">
                      Are you sure you want to delete vendor "{selectedVendor.businessName}"? This action cannot be undone.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={closeModal}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                        Delete
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

export default VendorManagementTable;