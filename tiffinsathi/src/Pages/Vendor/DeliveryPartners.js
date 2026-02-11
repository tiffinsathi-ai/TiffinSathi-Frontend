// src/Pages/Vendor/DeliveryPartners.js
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { deliveryPartnersApi } from "../../helpers/api"; // CORRECT IMPORT BASED ON ERRORS
import {
  Search,
  Filter,
  Phone,
  Mail,
  MapPin,
  Bike,
  Car,
  UserCheck,
  Clock,
  XCircle,
  Edit2,
  Trash2,
  UserPlus,
  RefreshCw,
  AlertCircle,
  X,
  TrendingUp,
  TrendingDown,
  Users,
  Star,
  Truck,
  CheckCircle,
  Eye,
  MessageSquare,
  Shield,
  Award,
  Package,
  DollarSign,
  Calendar,
  Download,
  Battery,
  Navigation,
  Printer
} from "lucide-react";

const DeliveryPartners = () => {
  const navigate = useNavigate();
  const [partners, setPartners] = useState([]);
  const [filteredPartners, setFilteredPartners] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [stats, setStats] = useState({
    totalPartners: 0,
    availableCount: 0,
    busyCount: 0,
    inactiveCount: 0,
    avgRating: 0
  });

  // StatCard Component
  const StatCard = ({ title, value, icon: Icon, color, onClick, trendValue, loading }) => {
    const colors = {
      blue: "text-blue-600 bg-blue-50",
      green: "text-green-600 bg-green-50",
      purple: "text-purple-600 bg-purple-50",
      orange: "text-orange-600 bg-orange-50",
      emerald: "text-emerald-600 bg-emerald-50",
      red: "text-red-600 bg-red-50",
      yellow: "text-yellow-600 bg-yellow-50"
    };

    const borderColors = {
      blue: "hover:border-blue-300",
      green: "hover:border-green-300",
      purple: "hover:border-purple-300",
      orange: "hover:border-orange-300",
      emerald: "hover:border-emerald-300",
      red: "hover:border-red-300",
      yellow: "hover:border-yellow-300"
    };

    return (
      <div 
        className={`bg-white p-6 rounded-xl border border-gray-200 ${borderColors[color]} transition-all duration-200 hover:shadow-lg cursor-pointer ${onClick ? 'hover:scale-[1.02]' : 'cursor-default'}`}
        onClick={onClick}
      >
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${colors[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
          {trendValue !== undefined && trendValue !== null && !loading && (
            <div className={`flex items-center text-sm font-medium ${trendValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trendValue >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
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

  // ============================================
  // REAL API CALLS - USING CORRECT API STRUCTURE
  // ============================================
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");
      
      try {
        // Check if we have a token
        const token = localStorage.getItem("token");
        if (!token) {
          navigate('/login');
          return;
        }

        // Try to get delivery partners - USE CORRECT API CALL
        let partnersData = [];
        try {
          // Try the primary endpoint
          partnersData = await deliveryPartnersApi.getVendorDeliveryPartners();
        } catch (err) {
          console.log("Primary endpoint failed, trying fallback...");
          // Try fallback endpoint
          try {
            partnersData = await deliveryPartnersApi.getVendorMyPartners();
          } catch (err2) {
            console.log("Fallback endpoint also failed");
            throw new Error("Unable to load delivery partners");
          }
        }
        
        // Transform backend data to frontend format
        const transformedPartners = Array.isArray(partnersData) ? 
          partnersData.map(transformPartnerData) : 
          [];
        
        setPartners(transformedPartners);
        setFilteredPartners(transformedPartners);
        
        // Calculate stats from API data
        calculateStats(transformedPartners);
      } catch (err) {
        console.error("Error loading delivery partners:", err);
        setError(err.message || "Failed to load delivery partners. Please try again.");
        
        // Show empty state
        setPartners([]);
        setFilteredPartners([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [navigate]);

  // Data transformation function
  const transformPartnerData = (backendData) => {
    // Handle different response formats
    const data = backendData.data || backendData;
    
    // Map backend field names to frontend expectations
    return {
      partnerId: data.id || data.partnerId || `DP${data.id || Math.random().toString(36).substr(2, 9)}`,
      name: data.name || data.fullName || data.username || "Unknown Partner",
      email: data.email || "",
      phoneNumber: data.phone || data.phoneNumber || data.contactNumber || data.mobile || "N/A",
      
      // Vehicle info
      vehicleType: (data.vehicleType || data.vehicleInfo || "bike").toLowerCase(),
      vehicleModel: data.vehicleModel || data.vehicleInfo || "",
      vehicleNumber: data.vehicleNumber || data.registrationNumber || data.vehiclePlate || "N/A",
      
      // Status mapping
      status: data.availabilityStatus?.toLowerCase() || 
              data.status?.toLowerCase() || 
              (data.isActive ? "available" : "inactive"),
      availabilityStatus: data.availabilityStatus || (data.isActive ? "AVAILABLE" : "INACTIVE"),
      isActive: data.isActive !== false && data.status !== "INACTIVE",
      
      // Rating
      rating: data.rating || 4.0,
      
      // Profile picture
      profilePicture: data.profilePicture || 
                     data.profilePictureUrl || 
                     `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || "DP")}&background=random&size=256`,
      
      // Dates
      joinDate: data.createdAt || data.joinDate || data.registrationDate || new Date().toISOString(),
      lastActive: data.lastActive || data.updatedAt || data.lastLogin || new Date().toISOString(),
      
      // Service area
      serviceArea: data.serviceArea || data.area || data.zone || "Not specified",
    };
  };

  // Calculate stats from real data
  const calculateStats = (partnersArray) => {
    const totalPartners = partnersArray.length;
    
    // Count by status
    const statusCounts = {
      available: 0,
      busy: 0,
      inactive: 0,
      offline: 0
    };
    
    partnersArray.forEach(partner => {
      const status = partner.status?.toLowerCase();
      if (status === 'available' || (partner.isActive && !status)) {
        statusCounts.available++;
      } else if (status === 'busy') {
        statusCounts.busy++;
      } else if (status === 'inactive' || !partner.isActive) {
        statusCounts.inactive++;
      } else {
        statusCounts.offline++;
      }
    });
    
    // Calculate average rating
    const avgRating = totalPartners > 0 
      ? (partnersArray.reduce((sum, p) => sum + (p.rating || 0), 0) / totalPartners).toFixed(1)
      : "0.0";

    setStats({
      totalPartners,
      availableCount: statusCounts.available,
      busyCount: statusCounts.busy,
      inactiveCount: statusCounts.inactive + statusCounts.offline,
      avgRating
    });
  };

  // Filter partners
  useEffect(() => {
    let filtered = [...partners];
    
    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(p => {
        const status = p.status?.toLowerCase();
        if (statusFilter === "available") return status === "available";
        if (statusFilter === "busy") return status === "busy";
        if (statusFilter === "inactive") return status === "inactive" || status === "offline" || !p.isActive;
        return true;
      });
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(term)) ||
          (p.vehicleNumber && p.vehicleNumber.toLowerCase().includes(term)) ||
          (p.email && p.email.toLowerCase().includes(term)) ||
          (p.phoneNumber && p.phoneNumber.includes(searchTerm)) ||
          (p.serviceArea && p.serviceArea.toLowerCase().includes(term))
      );
    }

    setFilteredPartners(filtered);
  }, [partners, searchTerm, statusFilter]);

  // Helper functions
  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    const colors = {
      available: "bg-green-100 text-green-800 border-green-200",
      busy: "bg-yellow-100 text-yellow-800 border-yellow-200",
      inactive: "bg-gray-100 text-gray-800 border-gray-200",
      offline: "bg-gray-100 text-gray-800 border-gray-200",
      active: "bg-green-100 text-green-800 border-green-200",
      deactivated: "bg-red-100 text-red-800 border-red-200",
      AVAILABLE: "bg-green-100 text-green-800 border-green-200",
      BUSY: "bg-yellow-100 text-yellow-800 border-yellow-200",
      OFFLINE: "bg-gray-100 text-gray-800 border-gray-200",
      INACTIVE: "bg-gray-100 text-gray-800 border-gray-200"
    };
    return colors[statusLower] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusIcon = (status) => {
    const statusLower = status?.toLowerCase();
    const icons = {
      available: <CheckCircle size={14} />,
      busy: <Clock size={14} />,
      inactive: <XCircle size={14} />,
      offline: <XCircle size={14} />,
      active: <CheckCircle size={14} />,
      deactivated: <XCircle size={14} />,
      AVAILABLE: <CheckCircle size={14} />,
      BUSY: <Clock size={14} />,
      OFFLINE: <XCircle size={14} />,
      INACTIVE: <XCircle size={14} />
    };
    return icons[statusLower] || <XCircle size={14} />;
  };

  const getVehicleIcon = (vehicleType) => {
    if (!vehicleType) return <Bike className="h-5 w-5 text-gray-600" />;
    
    const type = vehicleType.toLowerCase();
    if (type.includes('bike')) return <Bike className="h-5 w-5 text-gray-600" />;
    if (type.includes('scooter')) return <Bike className="h-5 w-5 text-gray-600" />;
    if (type.includes('car')) return <Car className="h-5 w-5 text-gray-600" />;
    if (type.includes('truck')) return <Truck className="h-5 w-5 text-gray-600" />;
    
    return <Bike className="h-5 w-5 text-gray-600" />;
  };

  const getDisplayStatus = (status, isActive) => {
    if (!isActive) return 'inactive';
    const statusLower = status?.toLowerCase();
    if (statusLower === 'offline' || statusLower === 'inactive') return 'offline';
    return statusLower || 'offline';
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const d = new Date(dateString);
      if (Number.isNaN(d.getTime())) return "N/A";
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return "N/A";
    }
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // ============================================
  // REAL API ACTION HANDLERS
  // ============================================
  const handleToggleStatus = async (partnerId) => {
    setActionLoading(partnerId);
    try {
      // Get current partner to determine new status
      const partner = partners.find(p => p.partnerId === partnerId);
      const currentStatus = partner?.status || 'offline';
      const newStatus = currentStatus === 'available' ? 'BUSY' : 'AVAILABLE';
      
      // REAL API call
      await deliveryPartnersApi.updateDeliveryPartnerStatus(partnerId, newStatus);
      
      // Update local state
      const updatedPartners = partners.map(p => 
        p.partnerId === partnerId 
          ? { 
              ...p, 
              status: newStatus.toLowerCase(),
              availabilityStatus: newStatus,
              isActive: newStatus === 'AVAILABLE'
            } 
          : p
      );
      
      setPartners(updatedPartners);
      calculateStats(updatedPartners);
      
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Failed to update status. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeletePartner = async (partnerId) => {
    if (!window.confirm("Are you sure you want to delete this delivery partner?")) {
      return;
    }
    
    setActionLoading(partnerId);
    try {
      // REAL API call
      await deliveryPartnersApi.deleteDeliveryPartner(partnerId);
      
      // Update local state
      const updatedPartners = partners.filter(p => p.partnerId !== partnerId);
      setPartners(updatedPartners);
      calculateStats(updatedPartners);
      
    } catch (err) {
      console.error("Error deleting partner:", err);
      setError("Failed to delete partner. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddPartner = async () => {
    // Note: This is a placeholder - you need to implement the form
    setError("Add partner functionality needs to be implemented");
  };

  const viewPartnerDetails = (partner) => {
    setSelectedPartner(partner);
    setShowDetailsModal(true);
  };

  const handleAssignDelivery = (partner) => {
    alert(`Assign delivery to ${partner.name} - This would connect to Order Deliveries API`);
  };

  const exportData = () => {
    const dataStr = JSON.stringify(filteredPartners, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `delivery-partners-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      let partnersData = [];
      try {
        partnersData = await deliveryPartnersApi.getVendorDeliveryPartners();
      } catch (err) {
        partnersData = await deliveryPartnersApi.getVendorMyPartners();
      }
      
      const transformedPartners = Array.isArray(partnersData) ? 
        partnersData.map(transformPartnerData) : 
        [];
      
      setPartners(transformedPartners);
      setFilteredPartners(transformedPartners);
      calculateStats(transformedPartners);
      setError("");
    } catch (err) {
      setError("Failed to refresh data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const statusTabs = [
    { value: "all", label: "All Partners", count: stats.totalPartners, icon: Users },
    { value: "available", label: "Available", count: stats.availableCount, icon: UserCheck },
    { value: "busy", label: "Busy", count: stats.busyCount, icon: Clock },
    { value: "inactive", label: "Inactive", count: stats.inactiveCount, icon: XCircle }
  ];

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
              onClick={refreshData}
              disabled={loading}
              className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={exportData}
              className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg flex items-center space-x-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <UserPlus size={20} />
              <span>{showAddForm ? 'Cancel' : 'Add Partner'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
          <p className="text-red-700 text-sm">{error}</p>
          <button 
            onClick={() => setError("")}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* Stats Cards - WITH REAL DATA */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Partners"
          value={stats.totalPartners}
          icon={Users}
          color="blue"
          onClick={() => setStatusFilter("all")}
          loading={loading}
        />
        <StatCard
          title="Available"
          value={stats.availableCount}
          icon={UserCheck}
          color="green"
          onClick={() => setStatusFilter("available")}
          loading={loading}
        />
        <StatCard
          title="Busy"
          value={stats.busyCount}
          icon={Clock}
          color="yellow"
          onClick={() => setStatusFilter("busy")}
          loading={loading}
        />
        <StatCard
          title="Avg Rating"
          value={stats.avgRating}
          icon={Star}
          color="purple"
          loading={loading}
        />
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search partners by name, vehicle, or area..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-500" />
            <select
              className="border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statusTabs.map((tab) => (
                <option key={tab.value} value={tab.value}>
                  {tab.label} ({tab.count})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="mt-6 border-b border-gray-200">
          <nav className="flex space-x-4 md:space-x-8 overflow-x-auto pb-2">
            {statusTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap transition-colors ${
                    statusFilter === tab.value
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  <span className={`px-2 py-0.5 text-xs rounded-full transition-colors ${
                    statusFilter === tab.value ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-600"
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="mt-2 text-gray-600">Loading delivery partners...</p>
        </div>
      ) : filteredPartners.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No {statusFilter === 'all' ? '' : statusFilter + ' '}delivery partners found
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            {searchTerm 
              ? "No delivery partners match your search criteria" 
              : "Get started by adding your first delivery partner to handle order deliveries."}
          </p>
          {(searchTerm || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
              className="mt-4 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPartners.map((partner) => {
            const status = getDisplayStatus(partner.availabilityStatus, partner.isActive);
            
            return (
              <div
                key={partner.partnerId}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-green-300 transition-all duration-200"
              >
                {/* Partner Header with Image */}
                <div className="relative">
                  <img
                    src={partner.profilePicture}
                    className="w-full h-48 object-cover"
                    alt={partner.name}
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(partner.name)}&background=random&size=256`;
                    }}
                  />
                  <div className="absolute top-3 right-3">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}
                    >
                      {getStatusIcon(status)}
                      <span className="ml-1 capitalize">{status}</span>
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <div className="flex items-center space-x-1 bg-black bg-opacity-50 backdrop-blur-sm px-2 py-1 rounded-lg">
                      <span className="text-yellow-400">⭐</span>
                      <span className="text-sm font-medium text-white">
                        {partner.rating?.toFixed(1) || '4.5'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Partner Details */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">
                        {partner.name}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        {getVehicleIcon(partner.vehicleType)}
                        <span className="text-sm text-gray-600">
                          {partner.vehicleNumber}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">
                        Last active: {getTimeAgo(partner.lastActive)}
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone size={14} className="mr-2" />
                      <span>{partner.phoneNumber}</span>
                    </div>
                    {partner.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail size={14} className="mr-2" />
                        <span className="truncate">{partner.email}</span>
                      </div>
                    )}
                    {partner.serviceArea && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin size={14} className="mr-2" />
                        <span>{partner.serviceArea}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => handleToggleStatus(partner.partnerId)}
                      disabled={actionLoading === partner.partnerId}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                        status === 'busy' || status === 'inactive' || status === 'offline'
                          ? 'bg-green-600 text-white hover:bg-green-700 border-green-600'
                          : 'bg-yellow-600 text-white hover:bg-yellow-700 border-yellow-600'
                      }`}
                    >
                      {actionLoading === partner.partnerId ? 'Processing...' : 
                       (status === 'busy' || status === 'inactive' || status === 'offline' ? 'Set Available' : 'Set Busy')}
                    </button>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => viewPartnerDetails(partner)}
                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg border border-blue-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        title="View details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleAssignDelivery(partner)}
                        className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg border border-green-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        title="Assign delivery"
                      >
                        <Package size={16} />
                      </button>
                      <button
                        onClick={() => handleDeletePartner(partner.partnerId)}
                        disabled={actionLoading === partner.partnerId}
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
      )}

      {/* Partner Details Modal */}
      {showDetailsModal && selectedPartner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedPartner.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">Delivery Partner Details</p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Profile */}
                <div className="lg:col-span-1">
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <div className="flex flex-col items-center">
                      <img
                        src={selectedPartner.profilePicture}
                        alt={selectedPartner.name}
                        className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-sm mb-4"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedPartner.name)}&background=random&size=256`;
                        }}
                      />
                      <h4 className="text-lg font-bold text-gray-900">{selectedPartner.name}</h4>
                      <div className="flex items-center space-x-1 mt-1">
                        <span className="text-yellow-400">⭐</span>
                        <span className="font-medium">{selectedPartner.rating?.toFixed(1)}</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 space-y-3">
                      <div className="flex items-center gap-2 p-3 hover:bg-white rounded-lg transition-colors border border-gray-200">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{selectedPartner.phoneNumber}</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 hover:bg-white rounded-lg transition-colors border border-gray-200">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{selectedPartner.email || "No email"}</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 hover:bg-white rounded-lg transition-colors border border-gray-200">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">Joined {formatDate(selectedPartner.joinDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 hover:bg-white rounded-lg transition-colors border border-gray-200">
                        <Shield className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">Partner ID: {selectedPartner.partnerId}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Columns - Details */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Vehicle Information */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Truck className="h-5 w-5 text-blue-600" />
                      Vehicle Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-gray-600">Vehicle Type</div>
                        <div className="font-medium text-sm flex items-center gap-2">
                          {getVehicleIcon(selectedPartner.vehicleType)}
                          {selectedPartner.vehicleType?.toUpperCase() || "BIKE"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600">Vehicle Model</div>
                        <div className="font-medium text-sm">{selectedPartner.vehicleModel || "Not specified"}</div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-xs text-gray-600">Vehicle Number</div>
                        <div className="font-medium text-sm font-mono">{selectedPartner.vehicleNumber}</div>
                      </div>
                      {selectedPartner.serviceArea && (
                        <div className="col-span-2">
                          <div className="text-xs text-gray-600">Service Area</div>
                          <div className="font-medium text-sm">{selectedPartner.serviceArea}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => handleAssignDelivery(selectedPartner)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Package className="h-4 w-4" />
                  Assign Delivery
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryPartners;