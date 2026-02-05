import React, { useState, useEffect, useCallback } from 'react';
import DeliveryPartnerForm from '../../Components/Vendor/DeliveryPartnerForm';
import { toast } from 'react-toastify';
import authStorage from '../../helpers/authStorage';
import { vendorApi } from '../../helpers/api';
import {
  Users,
  UserCheck,
  Clock,
  Search,
  RefreshCw,
  Truck,
  AlertCircle,
  Filter,
  Bike,
  Car,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  UserX,
  Key,
  UserPlus,
  Edit2,
  Trash2
} from 'lucide-react';

const DeliveryPartnersPage = () => {
  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCount, setActiveCount] = useState(0);
  const [busyCount, setBusyCount] = useState(0);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [tempPassword, setTempPassword] = useState('');
  const [selectedPartnerName, setSelectedPartnerName] = useState('');

  const BASE_URL = process.env.REACT_APP_API_BASE || "http://localhost:8080/api";

  // Get auth header using authStorage
  const getAuthHeader = () => {
    const token = authStorage.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  const StatCard = ({ title, value, icon: Icon, color, description }) => {
    const colors = {
      blue: "text-blue-600 bg-blue-50 border-blue-200",
      green: "text-green-600 bg-green-50 border-green-200",
      yellow: "text-yellow-600 bg-yellow-50 border-yellow-200",
      purple: "text-purple-600 bg-purple-50 border-purple-200",
      red: "text-red-600 bg-red-50 border-red-200"
    };

    return (
      <div className="bg-white p-5 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2.5 rounded-lg ${colors[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
        <p className="text-sm font-medium text-gray-900">{title}</p>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
    );
  };

  const getStatusColor = (status) => {
    const colors = {
      available: "bg-green-100 text-green-800 border-green-200",
      busy: "bg-yellow-100 text-yellow-800 border-yellow-200",
      offline: "bg-gray-100 text-gray-800 border-gray-200",
      inactive: "bg-gray-100 text-gray-800 border-gray-200",
      active: "bg-green-100 text-green-800 border-green-200",
      deactivated: "bg-red-100 text-red-800 border-red-200",
      AVAILABLE: "bg-green-100 text-green-800 border-green-200",
      BUSY: "bg-yellow-100 text-yellow-800 border-yellow-200",
      OFFLINE: "bg-gray-100 text-gray-800 border-gray-200"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status) => {
    const icons = {
      available: <CheckCircle size={14} />,
      busy: <Clock size={14} />,
      offline: <XCircle size={14} />,
      inactive: <XCircle size={14} />,
      active: <CheckCircle size={14} />,
      deactivated: <XCircle size={14} />,
      AVAILABLE: <CheckCircle size={14} />,
      BUSY: <Clock size={14} />,
      OFFLINE: <XCircle size={14} />
    };
    return icons[status];
  };

  const getDisplayStatus = (status, isActive) => {
    if (!isActive) return 'inactive';
    if (status === 'OFFLINE') return 'offline';
    return status?.toLowerCase() || 'offline';
  };

  const getVehicleIcon = (vehicleInfo) => {
    if (!vehicleInfo) return <Bike size={16} className="text-gray-600" />;
    
    const vehicleType = vehicleInfo.toLowerCase();
    if (vehicleType.includes('bike')) return <Bike size={16} className="text-gray-600" />;
    if (vehicleType.includes('scooter')) return <Bike size={16} className="text-gray-600" />;
    if (vehicleType.includes('car')) return <Car size={16} className="text-gray-600" />;
    if (vehicleType.includes('truck')) return <Truck size={16} className="text-gray-600" />;
    
    return <Bike size={16} className="text-gray-600" />;
  };

  // Enhanced fetch function with proper error handling
  const authFetch = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...options.headers
    };

    try {
      const response = await fetch(url, { ...options, headers });
      
      // Handle 401 Unauthorized (token expired)
      if (response.status === 401) {
        authStorage.clearAuth();
        const currentPath = window.location.pathname;
        window.location.href = `/login?message=${encodeURIComponent("Session expired. Please login again.")}&redirect=${encodeURIComponent(currentPath)}`;
        throw new Error("Session expired");
      }
      
      // Handle 403 Forbidden
      if (response.status === 403) {
        throw new Error("Access denied");
      }
      
      let data;
      try {
        data = await response.json();
      } catch {
        data = null;
      }
      
      return { 
        ok: response.ok, 
        status: response.status, 
        data,
        error: !response.ok ? (data?.message || 'Request failed') : null
      };
    } catch (error) {
      console.error("Fetch error:", error);
      
      // Only logout on specific authentication errors
      if (error.message === "Session expired" || error.message.includes("Unauthorized")) {
        authStorage.clearAuth();
        window.location.href = `/login?message=${encodeURIComponent("Session expired. Please login again.")}`;
      }
      
      return { 
        ok: false, 
        error: error.message,
        status: 500 
      };
    }
  };

  // API methods using vendorApi from helpers
  const api = {
    getDeliveryPartners: async () => {
      try {
        return await vendorApi.getDeliveryPartners();
      } catch (error) {
        console.error("getDeliveryPartners error", error);
        throw error;
      }
    },

    createDeliveryPartner: async (data) => {
      try {
        const response = await authFetch(`${BASE_URL}/delivery-partners`, {
          method: 'POST',
          body: JSON.stringify(data)
        });
        
        if (!response.ok) {
          throw new Error(response.error || 'Failed to create delivery partner');
        }
        return response.data;
      } catch (error) {
        console.error("createDeliveryPartner error", error);
        throw error;
      }
    },

    updateDeliveryPartner: async (partnerId, data) => {
      try {
        const response = await authFetch(`${BASE_URL}/delivery-partners/vendor/${partnerId}`, {
          method: 'PUT',
          body: JSON.stringify(data)
        });
        
        if (!response.ok) {
          throw new Error(response.error || 'Failed to update delivery partner');
        }
        return response.data;
      } catch (error) {
        console.error("updateDeliveryPartner error", error);
        throw error;
      }
    },

    deleteDeliveryPartner: async (partnerId) => {
      try {
        const response = await authFetch(`${BASE_URL}/delivery-partners/vendor/${partnerId}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error(response.error || 'Failed to delete delivery partner');
        }
        return response.data;
      } catch (error) {
        console.error("deleteDeliveryPartner error", error);
        throw error;
      }
    },

    toggleAvailability: async (partnerId) => {
      try {
        const response = await authFetch(`${BASE_URL}/delivery-partners/${partnerId}/toggle-availability`, {
          method: 'PUT'
        });
        
        if (!response.ok) {
          throw new Error(response.error || 'Failed to toggle availability');
        }
        return response.data;
      } catch (error) {
        console.error("toggleAvailability error", error);
        throw error;
      }
    },

    resetPassword: async (partnerId) => {
      try {
        const response = await authFetch(`${BASE_URL}/delivery-partners/${partnerId}/reset-password`, {
          method: 'POST'
        });
        
        if (!response.ok) {
          throw new Error(response.error || 'Failed to reset password');
        }
        return response.data;
      } catch (error) {
        console.error("resetPassword error", error);
        throw error;
      }
    }
  };

  const fetchDeliveryPartners = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Check authentication first
      if (!authStorage.isAuthenticated()) {
        throw new Error("Not authenticated");
      }
      
      // Use vendorApi from helpers
      const response = await vendorApi.getDeliveryPartners();
      
      if (!response.ok) {
        throw new Error(response.error || 'Failed to fetch delivery partners');
      }
      
      const partners = response.data || [];
      setDeliveryPartners(Array.isArray(partners) ? partners : []);
      
      // Calculate counts
      if (Array.isArray(partners)) {
        const active = partners.filter(p => 
          p.isActive && (p.availabilityStatus === 'AVAILABLE' || p.availabilityStatus === 'available')
        ).length;
        
        const busy = partners.filter(p => 
          p.isActive && (p.availabilityStatus === 'BUSY' || p.availabilityStatus === 'busy')
        ).length;
        
        setActiveCount(active);
        setBusyCount(busy);
      } else {
        setActiveCount(0);
        setBusyCount(0);
      }
    } catch (error) {
      console.error("Fetch delivery partners error:", error);
      setError(error.message || 'Failed to load delivery partners');
      
      // Don't show toast for auth errors (handled by authFetch)
      if (error.message !== "Session expired" && !error.message.includes("Unauthorized")) {
        toast.error(error.message || 'Failed to fetch delivery partners');
      }
      
      // If empty array, set empty
      setDeliveryPartners([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeliveryPartners();
  }, [fetchDeliveryPartners]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    // Search is now done client-side
  };

  const handleCreate = () => {
    setEditingPartner(null);
    setShowForm(true);
  };

  const handleEdit = (partner) => {
    setEditingPartner(partner);
    setShowForm(true);
  };

  const handleDelete = async (partnerId) => {
    if (window.confirm('Are you sure you want to delete this delivery partner?')) {
      try {
        await api.deleteDeliveryPartner(partnerId);
        toast.success('Delivery partner deleted successfully');
        fetchDeliveryPartners();
      } catch (error) {
        toast.error(error.message || 'Failed to delete delivery partner');
      }
    }
  };

  const handleToggleStatus = async (partnerId) => {
    try {
      await api.toggleAvailability(partnerId);
      toast.success('Status updated successfully');
      fetchDeliveryPartners();
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const handleResetPassword = async (partnerId, partnerName) => {
    if (window.confirm(`Are you sure you want to reset ${partnerName}'s password?`)) {
      try {
        const response = await api.resetPassword(partnerId);
        toast.success('Password reset successfully');
        
        // Extract temp password from response
        if (response && response.tempPassword) {
          setTempPassword(response.tempPassword);
          setSelectedPartnerName(partnerName);
          setShowPasswordModal(true);
        } else if (typeof response === 'string' && response.includes('New password')) {
          const match = response.match(/New password: (\w+)/);
          if (match) {
            setTempPassword(match[1]);
            setSelectedPartnerName(partnerName);
            setShowPasswordModal(true);
          }
        } else if (response && response.data && response.data.tempPassword) {
          setTempPassword(response.data.tempPassword);
          setSelectedPartnerName(partnerName);
          setShowPasswordModal(true);
        }
      } catch (error) {
        toast.error(error.message || 'Failed to reset password');
      }
    }
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setEditingPartner(null);
    fetchDeliveryPartners();
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingPartner(null);
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setTempPassword('');
    setSelectedPartnerName('');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(tempPassword).then(() => {
      toast.success('Password copied to clipboard!');
    });
  };

  // Client-side filtering
  const filteredPartners = deliveryPartners.filter(partner => {
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        (partner.name && partner.name.toLowerCase().includes(searchLower)) ||
        (partner.email && partner.email.toLowerCase().includes(searchLower)) ||
        (partner.phoneNumber && partner.phoneNumber.includes(searchTerm)) ||
        (partner.vehicleInfo && partner.vehicleInfo.toLowerCase().includes(searchLower));
      
      if (!matchesSearch) return false;
    }
    
    // Apply status filter
    const status = getDisplayStatus(partner.availabilityStatus, partner.isActive);
    
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return status === 'available';
    if (statusFilter === 'busy') return status === 'busy';
    if (statusFilter === 'inactive') return status === 'inactive' || status === 'offline';
    return true;
  });

  const getProfileImage = (partner) => {
    if (partner.profilePictureUrl) return partner.profilePictureUrl;
    if (partner.profilePicture && partner.profilePicture.startsWith('data:image')) {
      return partner.profilePicture;
    }
    // Use a default image
    return 'https://via.placeholder.com/150/cccccc/ffffff?text=DP';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Delivery Partners</h2>
          <p className="text-gray-600">Manage your delivery team and assignments</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchDeliveryPartners}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleCreate}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors shadow-sm"
          >
            <UserPlus size={20} />
            <span>Add Delivery Partner</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Partners"
          value={deliveryPartners.length}
          icon={Users}
          color="blue"
          description="All delivery partners"
        />
        <StatCard
          title="Active"
          value={activeCount}
          icon={UserCheck}
          color="green"
          description="Available for delivery"
        />
        <StatCard
          title="Busy"
          value={busyCount}
          icon={Clock}
          color="yellow"
          description="Currently on delivery"
        />
        <StatCard
          title="Inactive"
          value={deliveryPartners.length - activeCount - busyCount}
          icon={UserX}
          color="red"
          description="Not available"
        />
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search partners by name, email, phone or vehicle..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="busy">Busy</option>
            <option value="inactive">Inactive</option>
          </select>
          <div className="text-sm text-gray-600 flex items-center">
            <Filter size={16} className="mr-2" />
            <span>{filteredPartners.length} partners found</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading delivery partners...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPartners.map((partner) => {
            const status = getDisplayStatus(partner.availabilityStatus, partner.isActive);
            const profileImage = getProfileImage(partner);
            
            return (
              <div
                key={partner.partnerId || partner.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                <div className="relative">
                  <img
                    src={profileImage}
                    className="w-full h-48 object-cover bg-gray-100"
                    alt={partner.name}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/150/cccccc/ffffff?text=DP';
                    }}
                  />
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">
                        {partner.name || 'Unnamed Partner'}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        {getVehicleIcon(partner.vehicleInfo)}
                        <span className="text-sm text-gray-600">
                          {partner.vehicleInfo || 'No vehicle'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          status
                        )}`}
                      >
                        <span className="ml-1 capitalize">{status}</span>
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone size={14} className="mr-2" />
                      <span>{partner.phoneNumber || 'No phone'}</span>
                    </div>
                    {partner.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail size={14} className="mr-2" />
                        <span className="truncate">{partner.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleStatus(partner.partnerId || partner.id)}
                        className={`px-3 py-1.5 rounded text-sm font-medium min-w-[120px] ${
                          status === 'busy' || status === 'inactive' || status === 'offline'
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        } transition-colors`}
                      >
                        {status === 'busy' || status === 'inactive' || status === 'offline' ? 'Set Available' : 'Set Busy'}
                      </button>
                      <button
                        onClick={() => handleResetPassword(partner.partnerId || partner.id, partner.name)}
                        className="px-3 py-1.5 text-sm bg-purple-100 text-purple-700 hover:bg-purple-200 rounded transition-colors flex items-center min-w-[100px]"
                        title="Reset Password"
                      >
                        <Key size={14} className="mr-1.5" />
                        Reset PW
                      </button>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(partner)}
                        className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                        title="Edit partner"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(partner.partnerId || partner.id)}
                        className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && filteredPartners.length === 0 && !showForm && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Truck size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm || statusFilter !== 'all'
              ? 'No delivery partners match your current filters.'
              : 'No Delivery Partners'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filter to find what you\'re looking for.'
              : 'Get started by adding your first delivery partner to handle order deliveries.'}
          </p>
          {(!searchTerm && statusFilter === 'all') && (
            <button
              onClick={handleCreate}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg inline-flex items-center space-x-2 transition-colors"
            >
              <UserPlus size={20} />
              <span>Add Your First Partner</span>
            </button>
          )}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
          <div className="flex items-center justify-center min-h-screen px-4 py-4">
            <div 
              className="relative bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <DeliveryPartnerForm
                partner={editingPartner}
                onSubmit={handleFormSubmit}
                onClose={handleFormClose}
                api={api}
              />
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={closePasswordModal}></div>
            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-6 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Key className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Password Reset Successful
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        The password for <span className="font-semibold">{selectedPartnerName}</span> has been reset.
                      </p>
                      <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                          <code className="text-lg font-mono font-bold text-gray-900">
                            {tempPassword}
                          </code>
                          <button
                            onClick={copyToClipboard}
                            className="ml-4 text-blue-600 hover:text-blue-800 font-medium text-sm"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-red-600">
                        ⚠️ This password will not be shown again. Make sure to copy it now!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={closePasswordModal}
                >
                  OK, I've copied it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryPartnersPage;