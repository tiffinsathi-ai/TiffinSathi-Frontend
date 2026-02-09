import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Store, 
  Eye, 
  CheckCircle, 
  XCircle, 
  MoreVertical,
  UserCheck,
  UserX,
  Clock,
  Download,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Utensils,
  FileText,
  ExternalLink,
  Hash,
  Calendar,
  TrendingUp,
  Shield,
  Building
} from 'lucide-react';
import AdminApi from '../../helpers/adminApi';
import Pagination from '../../Components/Admin/Pagination';
import ConfirmationModal from '../../Components/Admin/ConfirmationModal';
import Modal from '../../Components/Admin/Modal';
import StatsCard from '../../Components/Admin/StatsCard';

const VendorManagement = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionMenu, setActionMenu] = useState(null);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [menuPosition, setMenuPosition] = useState({});
  const [stats, setStats] = useState({
    totalVendors: 0,
    pendingVendors: 0,
    approvedVendors: 0,
    rejectedVendors: 0
  });
  
  const actionButtonRefs = useRef({});
  const menuPortalRef = useRef(null);
  const itemsPerPage = 8;

  // Calculate stats
  const calculateStats = (vendorsData) => {
    const totalVendors = vendorsData.length;
    const pendingVendors = vendorsData.filter(v => v.status === 'PENDING').length;
    const approvedVendors = vendorsData.filter(v => v.status === 'APPROVED').length;
    const rejectedVendors = vendorsData.filter(v => v.status === 'REJECTED').length;

    setStats({
      totalVendors,
      pendingVendors,
      approvedVendors,
      rejectedVendors
    });
  };

  // Create portal container for menus
  useEffect(() => {
    const portalContainer = document.createElement('div');
    portalContainer.style.position = 'fixed';
    portalContainer.style.top = '0';
    portalContainer.style.left = '0';
    portalContainer.style.right = '0';
    portalContainer.style.bottom = '0';
    portalContainer.style.zIndex = '9999';
    portalContainer.style.pointerEvents = 'none';
    portalContainer.style.overflow = 'visible';
    document.body.appendChild(portalContainer);
    menuPortalRef.current = portalContainer;

    return () => {
      if (menuPortalRef.current && document.body.contains(menuPortalRef.current)) {
        document.body.removeChild(menuPortalRef.current);
      }
    };
  }, []);

  // Calculate menu position
  const calculateMenuPosition = (vendorId) => {
    const button = actionButtonRefs.current[vendorId];
    if (!button) return {};

    const rect = button.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    // Calculate menu height based on vendor status (more accurate measurements)
    const vendor = vendors.find(v => v.vendorId === vendorId);
    const menuHeight = vendor?.status === 'PENDING' ? 168 : 112; // Adjusted for actual heights
    const menuWidth = 192;

    let top = rect.bottom + 4;
    let left = rect.left;
    
    // If menu would go off bottom of viewport, show above the button
    if (top + menuHeight > viewportHeight) {
      top = rect.top - menuHeight - 2; // Reduced gap from 4px to 2px
    }
    
    // If menu would go off right of viewport, align with right edge of button
    if (left + menuWidth > viewportWidth) {
      left = rect.right - menuWidth;
    }
    
    // Ensure menu doesn't go off left edge
    if (left < 10) {
      left = 10;
    }

    return {
      top: `${Math.max(top, 10)}px`,
      left: `${left}px`,
      position: 'fixed',
      zIndex: 9999,
    };
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      PENDING: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock,
        label: 'Pending'
      },
      APPROVED: {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: UserCheck,
        label: 'Approved'
      },
      REJECTED: {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: UserX,
        label: 'Rejected'
      }
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    );
  };

  // Toggle action menu with position calculation
  const toggleActionMenu = (vendorId) => {
    if (actionMenu === vendorId) {
      setActionMenu(null);
    } else {
      setActionMenu(vendorId);
      // Calculate position immediately
      const position = calculateMenuPosition(vendorId);
      setMenuPosition(prev => ({
        ...prev,
        [vendorId]: position
      }));
    }
  };

  // API functions
  const fetchVendors = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await AdminApi.getVendors();
      setVendors(data);
      calculateStats(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch vendors');
      console.error('Error fetching vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateVendorStatus = async (vendorId, status, reason = '') => {
    setIsLoadingAction(true);
    try {
      const updatedVendor = await AdminApi.updateVendorStatus(vendorId, status, reason);
      setVendors(vendors.map(vendor => 
        vendor.vendorId === vendorId ? updatedVendor : vendor
      ));
      calculateStats(vendors.map(vendor => 
        vendor.vendorId === vendorId ? updatedVendor : vendor
      ));
      return updatedVendor;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update vendor status');
      throw err;
    } finally {
      setIsLoadingAction(false);
    }
  };

  const deleteVendor = async (vendorId) => {
    setIsLoadingAction(true);
    try {
      await AdminApi.deleteVendor(vendorId);
      const updatedVendors = vendors.filter(vendor => vendor.vendorId !== vendorId);
      setVendors(updatedVendors);
      calculateStats(updatedVendors);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete vendor');
      throw err;
    } finally {
      setIsLoadingAction(false);
    }
  };

  // Fetch vendors on component mount
  useEffect(() => {
    fetchVendors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isButtonClick = Object.values(actionButtonRefs.current).some(ref => {
        return ref && ref.contains(event.target);
      });
      
      const menuElements = document.querySelectorAll('[data-action-menu]');
      const isMenuClick = Array.from(menuElements).some(element => 
        element.contains(event.target)
      );
      
      if (!isButtonClick && !isMenuClick) {
        setActionMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu on scroll, recalculate only on resize
  useEffect(() => {
    const handleScroll = () => {
      if (actionMenu) {
        setActionMenu(null);
      }
    };

    const handleResize = () => {
      if (actionMenu) {
        const position = calculateMenuPosition(actionMenu);
        setMenuPosition(prev => ({
          ...prev,
          [actionMenu]: position
        }));
      }
    };

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionMenu]);

  // Filter and search vendors
  const filteredVendors = useMemo(() => {
    return vendors.filter(vendor => {
      const matchesSearch = vendor.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          vendor.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          vendor.businessEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          vendor.phone?.includes(searchTerm);
      const matchesStatus = statusFilter === 'ALL' || vendor.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [vendors, searchTerm, statusFilter]);

  // Paginate vendors
  const paginatedVendors = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredVendors.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredVendors, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredVendors.length / itemsPerPage);

  const statusOptions = [
    { value: 'ALL', label: 'All Status' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' }
  ];

  // Calculate percentage change for stats
  const calculatePercentage = (current, previous) => {
    if (previous === 0) return '+100%';
    const change = ((current - previous) / previous) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  // Event handlers
  const handleView = (vendor) => {
    setSelectedVendor(vendor);
    setIsViewModalOpen(true);
    setActionMenu(null);
  };

  const handleApprove = (vendor) => {
    setSelectedVendor(vendor);
    setIsApproveModalOpen(true);
    setActionMenu(null);
  };

  const handleReject = (vendor) => {
    setSelectedVendor(vendor);
    setRejectionReason('');
    setIsRejectModalOpen(true);
    setActionMenu(null);
  };

  const handleDelete = (vendor) => {
    setSelectedVendor(vendor);
    setIsDeleteModalOpen(true);
    setActionMenu(null);
  };

  const confirmApprove = async () => {
    if (selectedVendor) {
      await updateVendorStatus(selectedVendor.vendorId, 'APPROVED');
      setIsApproveModalOpen(false);
      setSelectedVendor(null);
    }
  };

  const confirmReject = async () => {
    if (selectedVendor && rejectionReason.trim()) {
      await updateVendorStatus(selectedVendor.vendorId, 'REJECTED', rejectionReason);
      setIsRejectModalOpen(false);
      setSelectedVendor(null);
      setRejectionReason('');
    }
  };

  const confirmDelete = async () => {
    if (selectedVendor) {
      await deleteVendor(selectedVendor.vendorId);
      setIsDeleteModalOpen(false);
      setSelectedVendor(null);
    }
  };

  const exportVendors = () => {
    const csvContent = [
      ['Business Name', 'Owner', 'Email', 'Phone', 'Status', 'Cuisine Type', 'Registered Date'],
      ...filteredVendors.map(vendor => [
        vendor.businessName,
        vendor.ownerName,
        vendor.businessEmail,
        vendor.phone,
        vendor.status,
        vendor.cuisineType || 'N/A',
        new Date(vendor.createdAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vendors-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Document viewer component
  const DocumentViewer = ({ title, documentUrl }) => {
    if (!documentUrl) return null;

    return (
      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">{title}</span>
        </div>
        <a
          href={documentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          View
        </a>
      </div>
    );
  };

  // Action Menu Portal Component
  const ActionMenuPortal = ({ vendor, isOpen, position }) => {
    if (!isOpen || !menuPortalRef.current) return null;

    return createPortal(
      <div 
        data-action-menu
        className="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 pointer-events-auto min-w-[192px]"
        style={position}
      >
        <button
          onClick={() => handleView(vendor)}
          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
        >
          <Eye className="h-4 w-4" />
          View Details
        </button>
        
        {vendor.status === 'PENDING' && (
          <>
            <button
              onClick={() => handleApprove(vendor)}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50 transition-colors whitespace-nowrap"
            >
              <CheckCircle className="h-4 w-4" />
              Approve
            </button>
            <button
              onClick={() => handleReject(vendor)}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors whitespace-nowrap"
            >
              <XCircle className="h-4 w-4" />
              Reject
            </button>
          </>
        )}
        
        <div className="border-t border-gray-100 my-1"></div>
        <button
          onClick={() => handleDelete(vendor)}
          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors whitespace-nowrap"
        >
          <XCircle className="h-4 w-4" />
          Delete Vendor
        </button>
      </div>,
      menuPortalRef.current
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Section - Consistent with PaymentManagement */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
            <Store className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vendor Management</h1>
            <p className="text-gray-600 mt-1">Manage and approve vendor applications</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={exportVendors}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          
          <button
            onClick={fetchVendors}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards - Consistent with PaymentManagement */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Vendors"
          value={stats.totalVendors}
          icon={Store}
          color="blue"
          changeText={calculatePercentage(stats.totalVendors, stats.totalVendors * 0.9)}
          changePositive={true}
        />
        
        <StatsCard
          title="Pending Approval"
          value={stats.pendingVendors}
          icon={Clock}
          color="yellow"
          changeText={stats.pendingVendors > 0 ? 'Requires review' : 'All clear'}
        />
        
        <StatsCard
          title="Approved Vendors"
          value={stats.approvedVendors}
          icon={UserCheck}
          color="green"
          changeText={stats.approvedVendors > 0 ? 'Active businesses' : 'No approvals'}
        />
        
        <StatsCard
          title="Rejected Vendors"
          value={stats.rejectedVendors}
          icon={UserX}
          color="red"
          changeText={stats.rejectedVendors > 0 ? 'Review needed' : 'No rejections'}
        />
      </div>

      {/* Search and Filter Section - Consistent with PaymentManagement */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Vendors
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Store className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full rounded-lg border-0 py-2.5 pl-10 pr-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                placeholder="Search vendors by business name, owner, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="w-full lg:w-64">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Shield className="h-5 w-5 text-gray-400" />
              </div>
              <select
                className="block w-full rounded-lg border-0 py-2.5 pl-10 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Vendors Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="rounded-md bg-red-50 p-4 mx-6">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error Loading Vendors</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Business
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registered
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedVendors.map((vendor) => (
                    <tr key={vendor.vendorId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {vendor.profilePicture ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover border border-gray-200"
                                src={vendor.profilePicture}
                                alt={vendor.businessName}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                                <Store className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {vendor.businessName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {vendor.ownerName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm text-gray-900">
                            <Mail className="h-4 w-4 text-gray-400" />
                            {vendor.businessEmail}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-900">
                            <Phone className="h-4 w-4 text-gray-400" />
                            {vendor.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Utensils className="h-4 w-4 text-gray-400" />
                            {vendor.cuisineType || 'N/A'}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            {vendor.businessAddress ? `${vendor.businessAddress.substring(0, 30)}...` : 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={vendor.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(vendor.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end">
                          <div className="relative">
                            <button
                              ref={el => {
                                if (el) {
                                  actionButtonRefs.current[vendor.vendorId] = el;
                                } else {
                                  delete actionButtonRefs.current[vendor.vendorId];
                                }
                              }}
                              onClick={() => toggleActionMenu(vendor.vendorId)}
                              className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
                            >
                              <MoreVertical className="h-4 w-4 text-gray-600" />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {paginatedVendors.length === 0 && (
              <div className="text-center py-12">
                <div className="inline-flex p-4 bg-blue-50 rounded-full mb-4">
                  <Store className="h-12 w-12 text-blue-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No vendors found</h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== 'ALL' 
                    ? 'Try adjusting your search or filter criteria' 
                    : 'No vendor data available'
                  }
                </p>
              </div>
            )}
            
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={filteredVendors.length}
              currentItemsCount={paginatedVendors.length}
            />
          </>
        )}
      </div>

      {/* Action Menus via Portal */}
      {paginatedVendors.map((vendor) => (
        <ActionMenuPortal
          key={`menu-${vendor.vendorId}`}
          vendor={vendor}
          isOpen={actionMenu === vendor.vendorId}
          position={menuPosition[vendor.vendorId]}
        />
      ))}

      {/* Modern Vendor Details Modal - Similar to Payment Details */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Vendor Details"
        size="xl"
      >
        {selectedVendor && (
          <div className="space-y-6">
            {/* Header Card */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Store className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold truncate max-w-[300px]">
                      {selectedVendor.businessName}
                    </h3>
                    <p className="text-blue-100 text-sm mt-1">Vendor Profile</p>
                  </div>
                </div>
                <div className="flex flex-col sm:items-end">
                  <StatusBadge status={selectedVendor.status} />
                  <p className="text-blue-100 text-sm mt-2">Registered: {formatDate(selectedVendor.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Vendor Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Business Card */}
                <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Building className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">Business Information</h4>
                        <p className="text-sm text-gray-600">Complete business profile details</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center gap-4 mb-6">
                      {selectedVendor.profilePicture ? (
                        <img
                          src={selectedVendor.profilePicture}
                          alt={selectedVendor.businessName}
                          className="h-20 w-20 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                      ) : (
                        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center border-4 border-white shadow-lg">
                          <Store className="h-10 w-10 text-green-600" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{selectedVendor.businessName}</h3>
                        <p className="text-gray-600">Owner: {selectedVendor.ownerName}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-600">Business Email</span>
                        </div>
                        <p className="text-base font-semibold text-gray-900 truncate">
                          {selectedVendor.businessEmail}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-600">Business Phone</span>
                        </div>
                        <p className="text-base font-semibold text-gray-900">
                          {selectedVendor.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Business Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Location Card */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <MapPin className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Location Details</h4>
                        <p className="text-sm text-gray-600">Business address and location</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Business Address</p>
                        <p className="text-sm text-gray-900">{selectedVendor.businessAddress || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">City & State</p>
                        <p className="text-sm text-gray-900">
                          {selectedVendor.city}, {selectedVendor.state || 'N/A'}
                        </p>
                      </div>
                      {selectedVendor.pincode && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Pincode</p>
                          <p className="text-sm text-gray-900">{selectedVendor.pincode}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cuisine & Capacity Card */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Utensils className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Service Details</h4>
                        <p className="text-sm text-gray-600">Cuisine and capacity information</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Cuisine Type</p>
                        <p className="text-sm text-gray-900">{selectedVendor.cuisineType || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Capacity</p>
                        <p className="text-sm text-gray-900">{selectedVendor.capacity || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Years in Business</p>
                        <p className="text-sm text-gray-900">{selectedVendor.yearsInBusiness || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Documents & Dates */}
              <div className="space-y-6">
                {/* Documents Card */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <FileText className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Uploaded Documents</h4>
                      <p className="text-sm text-gray-600">Verification documents</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <DocumentViewer 
                      title="FSSAI License" 
                      documentUrl={selectedVendor.fssaiLicenseUrl} 
                    />
                    <DocumentViewer 
                      title="PAN Card" 
                      documentUrl={selectedVendor.panCardUrl} 
                    />
                    <DocumentViewer 
                      title="Bank Proof" 
                      documentUrl={selectedVendor.bankProofUrl} 
                    />
                    <DocumentViewer 
                      title="Menu Card" 
                      documentUrl={selectedVendor.menuCardUrl} 
                    />
                  </div>
                </div>

                {/* Dates Card */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Calendar className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Timeline</h4>
                      <p className="text-sm text-gray-600">Registration timeline</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Registered At</span>
                      <span className="text-sm font-medium text-gray-900">{formatDate(selectedVendor.createdAt)}</span>
                    </div>
                    <div className="border-t border-gray-100 pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Last Updated</span>
                        <span className="text-sm font-medium text-gray-900">{formatDate(selectedVendor.updatedAt)}</span>
                      </div>
                    </div>
                    {selectedVendor.approvedAt && selectedVendor.status === 'APPROVED' && (
                      <div className="border-t border-gray-100 pt-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Approved At</span>
                          <span className="text-sm font-medium text-gray-900">{formatDate(selectedVendor.approvedAt)}</span>
                        </div>
                      </div>
                    )}
                    {selectedVendor.rejectedAt && selectedVendor.status === 'REJECTED' && (
                      <div className="border-t border-gray-100 pt-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Rejected At</span>
                          <span className="text-sm font-medium text-gray-900">{formatDate(selectedVendor.rejectedAt)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Business Stats Card */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Business Stats</h4>
                      <p className="text-sm text-gray-600">Performance metrics</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Orders</span>
                      <span className="text-sm font-medium text-gray-900">{selectedVendor.totalOrders || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Revenue</span>
                      <span className="text-sm font-medium text-gray-900">Rs. {selectedVendor.totalRevenue || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Rating</span>
                      <span className="text-sm font-medium text-gray-900">{selectedVendor.rating || 'No ratings'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Section */}
            {selectedVendor.description && (
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Business Description</h4>
                    <p className="text-sm text-gray-600">About the business</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                  {selectedVendor.description}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Hash className="h-4 w-4 text-gray-400" />
                <span>Vendor ID: {selectedVendor.vendorId}</span>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                {selectedVendor.status === 'PENDING' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setIsViewModalOpen(false);
                        handleReject(selectedVendor);
                      }}
                      className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 rounded-lg hover:from-red-600 hover:to-red-700 transition-all"
                    >
                      <XCircle className="h-4 w-4 inline mr-2" />
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsViewModalOpen(false);
                        handleApprove(selectedVendor);
                      }}
                      className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-green-600 rounded-lg hover:from-green-600 hover:to-green-700 transition-all"
                    >
                      <CheckCircle className="h-4 w-4 inline mr-2" />
                      Approve
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Approve Confirmation */}
      <ConfirmationModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        onConfirm={confirmApprove}
        title="Approve Vendor"
        message={`Are you sure you want to approve ${selectedVendor?.businessName}? This vendor will be activated and can start receiving orders.`}
        confirmText="Approve Vendor"
        type="success"
        isLoading={isLoadingAction}
      />

      {/* Reject Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => {
          setIsRejectModalOpen(false);
          setRejectionReason('');
        }}
        title="Reject Vendor Application"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <p className="text-gray-700 mb-3">
              Please provide a reason for rejecting <span className="font-semibold">{selectedVendor?.businessName}</span>:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter reason for rejection (e.g., Missing documents, incomplete information, failed verification)..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              rows="4"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsRejectModalOpen(false);
                setRejectionReason('');
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmReject}
              disabled={!rejectionReason.trim() || isLoadingAction}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isLoadingAction ? 'Rejecting...' : 'Reject Vendor'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Vendor"
        message={`Are you sure you want to delete ${selectedVendor?.businessName}? This action cannot be undone and all vendor data will be permanently removed.`}
        confirmText="Delete Vendor"
        type="delete"
        isLoading={isLoadingAction}
      />
    </div>
  );
};

export default VendorManagement;