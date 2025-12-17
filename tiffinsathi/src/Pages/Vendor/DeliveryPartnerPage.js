// src/Pages/Vendor/DeliveryPartnersPage.js
import React, { useState, useEffect } from 'react';
import DeliveryPartnerList from '../../Components/Vendor/DeliveryPartnerList';
import DeliveryPartnerForm from '../../Components/Vendor/DeliveryPartnerForm';
import { toast } from 'react-toastify';
import {
  Users,
  UserCheck,
  UserPlus,
  Search,
  Plus,
  RefreshCw,
  Truck,
  AlertCircle,
  Filter
} from 'lucide-react';

const DeliveryPartnersPage = () => {
  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCount, setActiveCount] = useState(0);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const API_BASE_URL = 'http://localhost:8080/api/delivery-partners';

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Enhanced StatCard component
  const StatCard = ({ title, value, icon: Icon, color, change }) => {
    const colors = {
      blue: "text-blue-600 bg-blue-50",
      green: "text-green-600 bg-green-50",
      purple: "text-purple-600 bg-purple-50",
      orange: "text-orange-600 bg-orange-50"
    };

    return (
      <div className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${colors[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
          {change && (
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
              {change}
            </span>
          )}
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
        <p className="text-sm text-gray-600">{title}</p>
      </div>
    );
  };

  // API call functions
  const api = {
    getMyDeliveryPartners: async () => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/vendor/my-partners`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch delivery partners');
      return response.json();
    },

    getActivePartnersCount: async () => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/vendor/count`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch count');
      const data = await response.json();
      return data.count || data.activeCount || 0;
    },

    searchDeliveryPartners: async (name) => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/vendor/search?name=${encodeURIComponent(name)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to search delivery partners');
      return response.json();
    },

    createDeliveryPartner: async (data) => {
      const token = getAuthToken();
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create delivery partner');
      }
      return response.json();
    },

    updateDeliveryPartner: async (partnerId, data) => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/vendor/${partnerId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update delivery partner');
      }
      return response.json();
    },

    deleteDeliveryPartner: async (partnerId) => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/vendor/${partnerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to delete delivery partner');
      return response.json();
    },

    toggleAvailability: async (partnerId) => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/vendor/${partnerId}/toggle-availability`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to toggle availability');
      return response.json();
    },

    resetPassword: async (partnerId) => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/vendor/${partnerId}/reset-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to reset password');
      return response.json();
    }
  };

  useEffect(() => {
    fetchDeliveryPartners();
  }, []);

  const fetchDeliveryPartners = async () => {
    try {
      setLoading(true);
      setError('');
      const partners = await api.getMyDeliveryPartners();
      setDeliveryPartners(partners);
      
      // Calculate active count
      const active = partners.filter(p => p.isActive).length;
      setActiveCount(active);
    } catch (error) {
      setError('Failed to load delivery partners: ' + error.message);
      toast.error('Failed to fetch delivery partners');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (term) => {
    setSearchTerm(term);
    if (term.trim() === '') {
      fetchDeliveryPartners();
    } else {
      try {
        const partners = await api.searchDeliveryPartners(term);
        setDeliveryPartners(partners);
      } catch (error) {
        toast.error('Failed to search delivery partners');
      }
    }
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
        toast.error('Failed to delete delivery partner');
      }
    }
  };

  const handleToggleStatus = async (partnerId) => {
    try {
      await api.toggleAvailability(partnerId);
      toast.success('Status updated successfully');
      fetchDeliveryPartners();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleResetPassword = async (partnerId) => {
    if (window.confirm('Are you sure you want to reset this delivery partner\'s password?')) {
      try {
        const response = await api.resetPassword(partnerId);
        toast.success('Password reset successfully');
        if (response.tempPassword) {
          alert(`Temporary password: ${response.tempPassword}. Please share this with the delivery partner.`);
        }
      } catch (error) {
        toast.error('Failed to reset password');
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

  const filteredPartners = deliveryPartners.filter(partner => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return partner.isActive;
    if (statusFilter === 'inactive') return !partner.isActive;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Delivery Partners</h2>
          <p className="text-gray-600">Manage your delivery partners and their information</p>
        </div>
        <button
          onClick={fetchDeliveryPartners}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Partners"
          value={deliveryPartners.length}
          icon={Users}
          color="blue"
          change={`${activeCount} active`}
        />
        <StatCard
          title="Active Partners"
          value={activeCount}
          icon={UserCheck}
          color="green"
          change={`${deliveryPartners.length - activeCount} inactive`}
        />
        <StatCard
          title="Add New Partner"
          value=""
          icon={UserPlus}
          color="purple"
        >
          <button
            onClick={handleCreate}
            className="text-purple-600 font-semibold hover:text-purple-700 mt-2 text-sm"
          >
            Click to add →
          </button>
        </StatCard>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search delivery partners by name..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
          <button
            onClick={handleCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Partner
          </button>
        </div>
      </div>

      {/* Delivery Partners List */}
      <DeliveryPartnerList
        partners={filteredPartners}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        onResetPassword={handleResetPassword}
      />

      {/* Form Modal */}
      {showForm && (
        <DeliveryPartnerForm
          partner={editingPartner}
          onSubmit={handleFormSubmit}
          onClose={handleFormClose}
          api={api}
        />
      )}
    </div>
  );
};

export default DeliveryPartnersPage;