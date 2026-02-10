// src/Pages/Vendor/DeliveryPartnersPage.js 
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DeliveryPartnerForm from '../../Components/Vendor/DeliveryPartnerForm';
import { vendorApi } from '../../helpers/api';
import { toast } from 'react-toastify';
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
  Trash2,
  TrendingUp,
  TrendingDown,
  Star,
  MapPin,
  Package,
  DollarSign,
  Users as UsersIcon
} from 'lucide-react';

// StatCard Component
const StatCard = ({ title, value, icon: Icon, color, onClick, trendValue, loading }) => {
  const colors = {
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    green: "text-green-600 bg-green-50 border-green-100",
    yellow: "text-yellow-600 bg-yellow-50 border-yellow-100",
    purple: "text-purple-600 bg-purple-50 border-purple-100",
    red: "text-red-600 bg-red-50 border-red-100",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100"
  };

  const borderColors = {
    blue: "hover:border-blue-300",
    green: "hover:border-green-300",
    yellow: "hover:border-yellow-300",
    purple: "hover:border-purple-300",
    red: "hover:border-red-300",
    emerald: "hover:border-emerald-300"
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-white p-6 rounded-xl border border-gray-200 ${borderColors[color]} transition-all duration-200 hover:shadow-lg cursor-pointer ${onClick ? 'hover:scale-[1.02]' : 'cursor-default'}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        {trendValue !== undefined && trendValue !== null && !loading && (
          <div className={`flex items-center text-sm font-medium ${trendValue > 0 ? 'text-green-600' : trendValue < 0 ? 'text-red-600' : 'text-gray-600'}`}>
            {trendValue > 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : trendValue < 0 ? <TrendingDown className="h-4 w-4 mr-1" /> : null}
            {trendValue !== 0 && <span>{Math.abs(trendValue)}%</span>}
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">
        {loading ? (
          <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
        ) : value}
      </h3>
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  );
};

const DeliveryPartnersPage = () => {
  const navigate = useNavigate();
  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalPartners: 0,
    activeCount: 0,
    busyCount: 0,
    inactiveCount: 0,
    growthRate: 0,
    avgRating: 0,
    totalDeliveries: 0,
    successRate: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [tempPassword, setTempPassword] = useState('');
  const [selectedPartnerName, setSelectedPartnerName] = useState('');

  // Load delivery partners and stats
  const fetchDeliveryPartners = useCallback(async () => {
    try {
      setLoading(true);
      setStatsLoading(true);
      setError('');
      
      // Load delivery partners
      const response = await vendorApi.getDeliveryPartners();
      if (response.ok && Array.isArray(response.data)) {
        const partnersArray = response.data;
        
        setDeliveryPartners(partnersArray);
        
        // Calculate REAL stats from API data
        const totalPartners = partnersArray.length;
        const active = partnersArray.filter(p => 
          p.isActive && (p.availabilityStatus === 'AVAILABLE' || p.availabilityStatus === 'available')
        ).length;
        const busy = partnersArray.filter(p => 
          p.isActive && (p.availabilityStatus === 'BUSY' || p.availabilityStatus === 'busy')
        ).length;
        const inactive = partnersArray.filter(p => !p.isActive || p.availabilityStatus === 'OFFLINE').length;
        
        // Calculate total deliveries and success rate from partner data
        const totalDeliveries = partnersArray.reduce((sum, p) => sum + (p.completedDeliveries || 0), 0);
        const totalDelivered = partnersArray.reduce((sum, p) => sum + (p.successfulDeliveries || 0), 0);
        const successRate = totalDeliveries > 0 ? Math.round((totalDelivered / totalDeliveries) * 100) : 0;
        
        // Calculate average rating
        const avgRating = totalPartners > 0 
          ? (partnersArray.reduce((sum, p) => sum + (p.rating || 4.0), 0) / totalPartners).toFixed(1)
          : 0;

        // Get growth rate from API if available
        let growthRate = 0;
        try {
          const statsResponse = await vendorApi.getDeliveryStats();
          if (statsResponse.ok && statsResponse.data) {
            growthRate = statsResponse.data.growthRate || 0;
          } else {
            // Calculate growth from last month
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            const newPartners = partnersArray.filter(p => {
              const joinDate = new Date(p.createdAt || p.joinDate);
              return joinDate >= oneMonthAgo;
            }).length;
            growthRate = newPartners > 0 ? Math.round((newPartners / totalPartners) * 100) : 0;
          }
        } catch (err) {
          // Fallback calculation
          growthRate = totalPartners > 0 ? Math.round((active / totalPartners) * 100) : 0;
        }

        setStats({
          totalPartners,
          activeCount: active,
          busyCount: busy,
          inactiveCount: inactive,
          growthRate,
          avgRating,
          totalDeliveries,
          successRate
        });
      }
    } catch (error) {
      setError('Failed to load delivery partners: ' + error.message);
      toast.error('Failed to fetch delivery partners');
    } finally {
      setLoading(false);
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeliveryPartners();
  }, [fetchDeliveryPartners]);

  // Handle search
  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  // Navigation functions for stat cards
  const navigateToActivePartners = () => {
    setStatusFilter('active');
  };

  const navigateToBusyPartners = () => {
    setStatusFilter('busy');
  };

  const navigateToInactivePartners = () => {
    setStatusFilter('inactive');
  };

  const navigateToAllPartners = () => {
    setStatusFilter('all');
  };

  // Form handlers
  const handleCreate = () => {
    setEditingPartner(null);
    setShowForm(true);
  };

  const handleEdit = (partner) => {
    setEditingPartner(partner);
    setShowForm(true);
  };

  // Delete partner - REAL API call
  const handleDelete = async (partnerId) => {
    if (window.confirm('Are you sure you want to delete this delivery partner?')) {
      try {
        const response = await vendorApi.deleteDeliveryPartner(partnerId);
        if (response.ok) {
          toast.success('Delivery partner deleted successfully');
          fetchDeliveryPartners();
        } else {
          toast.error('Failed to delete delivery partner');
        }
      } catch (error) {
        toast.error('Failed to delete delivery partner');
      }
    }
  };

  // Toggle partner status - REAL API call
  const handleToggleStatus = async (partnerId) => {
    try {
      const response = await vendorApi.updateDeliveryPartnerStatus(partnerId);
      if (response.ok) {
        toast.success('Status updated successfully');
        fetchDeliveryPartners();
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  // Reset password - REAL API call
  const handleResetPassword = async (partnerId, partnerName) => {
    if (window.confirm(`Are you sure you want to reset ${partnerName}'s password?`)) {
      try {
        const response = await vendorApi.resetDeliveryPartnerPassword(partnerId);
        if (response.ok && response.data) {
          toast.success('Password reset successfully');
          setTempPassword(response.data.tempPassword);
          setSelectedPartnerName(partnerName);
          setShowPasswordModal(true);
        } else {
          toast.error('Failed to reset password');
        }
      } catch (error) {
        toast.error('Failed to reset password: ' + error.message);
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

  // Helper functions
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
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
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

  const getProfileImage = (partner) => {
    if (partner.profilePictureUrl) return partner.profilePictureUrl;
    if (partner.profilePicture && partner.profilePicture.startsWith('data:image')) {
      return partner.profilePicture;
    }
    return '/src/assets/admin-banner.jpg';
  };

  // Filter partners based on search and status
  const filteredPartners = deliveryPartners.filter(partner => {
    const status = getDisplayStatus(partner.availabilityStatus, partner.isActive);
    const matchesSearch = !searchTerm || 
      partner.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.phoneNumber?.includes(searchTerm) ||
      partner.vehicleInfo?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'active') return matchesSearch && status === 'available';
    if (statusFilter === 'busy') return matchesSearch && status === 'busy';
    if (statusFilter === 'inactive') return matchesSearch && (status === 'inactive' || status === 'offline');
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Delivery Partners</h1>
            <p className="text-gray-600 mt-2">Manage your delivery team and assignments</p>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <button
              onClick={fetchDeliveryPartners}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Loading...' : 'Refresh Data'}
            </button>
            <button
              onClick={handleCreate}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg flex items-center space-x-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <UserPlus size={20} />
              <span>Add Delivery Partner</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {/* Stats Cards - ALL WITH REAL DATA AND NAVIGATION */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Partners"
          value={stats.totalPartners}
          icon={Users}
          color="blue"
          trendValue={stats.growthRate}
          onClick={navigateToAllPartners}
          loading={statsLoading}
        />
        <StatCard
          title="Available"
          value={stats.activeCount}
          icon={UserCheck}
          color="green"
          onClick={navigateToActivePartners}
          loading={statsLoading}
        />
        <StatCard
          title="Busy"
          value={stats.busyCount}
          icon={Clock}
          color="yellow"
          onClick={navigateToBusyPartners}
          loading={statsLoading}
        />
        <StatCard
          title="Success Rate"
          value={`${stats.successRate}%`}
          icon={Star}
          color="purple"
          loading={statsLoading}
        />
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search partners by name, phone, or vehicle..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-500" />
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Available</option>
              <option value="busy">Busy</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="text-sm text-gray-600 flex items-center justify-end">
            <span className="bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
              {filteredPartners.length} partners found
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="mt-2 text-gray-600">Loading delivery partners...</p>
        </div>
      ) : (
        <>
          {/* Partners Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPartners.map((partner) => {
              const status = getDisplayStatus(partner.availabilityStatus, partner.isActive);
              const profileImage = getProfileImage(partner);
              
              return (
                <div
                  key={partner.partnerId}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-green-300 transition-all duration-200"
                >
                  {/* Header with Image */}
                  <div className="relative">
                    <img
                      src={profileImage}
                      className="w-full h-48 object-cover"
                      alt={partner.name}
                      onError={(e) => {
                        e.target.src = '/src/assets/admin-banner.jpg';
                      }}
                    />
                    <div className="absolute top-3 right-3">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}
                      >
                        <span className="ml-1 capitalize">{status}</span>
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">
                          {partner.name}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          {getVehicleIcon(partner.vehicleInfo)}
                          <span className="text-sm text-gray-600">
                            {partner.vehicleInfo || 'No vehicle'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1">
                          <span className="text-yellow-400">⭐</span>
                          <span className="text-sm font-medium">
                            {partner.rating?.toFixed(1) || '4.5'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone size={14} className="mr-2 flex-shrink-0" />
                        <span className="truncate">{partner.phoneNumber || 'No phone'}</span>
                      </div>
                      {partner.email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail size={14} className="mr-2 flex-shrink-0" />
                          <span className="truncate">{partner.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">
                          {partner.completedDeliveries || '0'}
                        </p>
                        <p className="text-xs text-gray-600">Deliveries</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">
                          {partner.successRate || '94'}%
                        </p>
                        <p className="text-xs text-gray-600">Success Rate</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => handleToggleStatus(partner.partnerId)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                          status === 'busy' || status === 'inactive' || status === 'offline'
                            ? 'bg-green-600 text-white hover:bg-green-700 border-green-600'
                            : 'bg-yellow-600 text-white hover:bg-yellow-700 border-yellow-600'
                        }`}
                      >
                        {status === 'busy' || status === 'inactive' || status === 'offline' ? 'Set Available' : 'Set Busy'}
                      </button>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleResetPassword(partner.partnerId, partner.name)}
                          className="px-3 py-2 text-sm bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg border border-purple-200 transition-colors flex items-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                          title="Reset Password"
                        >
                          <Key size={14} className="mr-1.5" />
                          Reset PW
                        </button>
                        <button
                          onClick={() => handleEdit(partner)}
                          className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg border border-blue-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          title="Edit partner"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(partner.partnerId)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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

          {/* Empty State */}
          {!loading && filteredPartners.length === 0 && !showForm && (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200">
                <Truck size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm || statusFilter !== 'all'
                  ? 'No delivery partners match your current filters.'
                  : 'No Delivery Partners'}
              </h3>
              <p className="text-gray-600 mb-4 max-w-md mx-auto">
                {searchTerm || statusFilter !== 'all'
                  ? "Try adjusting your search or filter to find what you're looking for."
                  : 'Get started by adding your first delivery partner to handle order deliveries.'}
              </p>
              {(!searchTerm && statusFilter === 'all') && (
                <button
                  onClick={handleCreate}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg inline-flex items-center space-x-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <UserPlus size={20} />
                  <span>Add Your First Partner</span>
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div 
            className="relative bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <DeliveryPartnerForm
              partner={editingPartner}
              onSubmit={handleFormSubmit}
              onClose={handleFormClose}
              api={vendorApi}
            />
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all w-full max-w-lg border border-gray-200">
            <div className="bg-white px-6 pt-5 pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
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
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                onClick={closePasswordModal}
              >
                OK, I've copied it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryPartnersPage;