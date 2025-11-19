// DeliveryPartnersPage.jsx
import React, { useState, useEffect } from 'react';
import DeliveryPartnerList from '../../Components/Vendor/DeliveryPartnerList';
import DeliveryPartnerForm from '../../Components/Vendor/DeliveryPartnerForm';
import { toast } from 'react-toastify';
import {
  Users,
  UserCheck,
  UserPlus,
  Search,
  Plus
} from 'lucide-react';

const DeliveryPartnersPage = () => {
  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCount, setActiveCount] = useState(0);

  const API_BASE_URL = 'http://localhost:8080/api/delivery-partners';

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('token');
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
      return response.json();
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
    fetchActiveCount();
  }, []);

  const fetchDeliveryPartners = async () => {
    try {
      setLoading(true);
      const partners = await api.getMyDeliveryPartners();
      setDeliveryPartners(partners);
    } catch (error) {
      toast.error('Failed to fetch delivery partners');
      console.error('Error fetching delivery partners:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveCount = async () => {
    try {
      const count = await api.getActivePartnersCount();
      setActiveCount(count);
    } catch (error) {
      console.error('Error fetching active count:', error);
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
        fetchActiveCount();
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
      fetchActiveCount();
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
    fetchActiveCount();
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingPartner(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Delivery Partners</h1>
          <p className="text-gray-600 mt-2">Manage your delivery partners and their information</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Partners</h3>
                <p className="text-2xl font-semibold text-gray-900">{deliveryPartners.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Active Partners</h3>
                <p className="text-2xl font-semibold text-gray-900">{activeCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <UserPlus className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Add New Partner</h3>
                <button
                  onClick={handleCreate}
                  className="text-purple-600 font-semibold hover:text-purple-700 mt-1"
                >
                  Click here →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search delivery partners by name..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <button
                onClick={handleCreate}
                className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Delivery Partner
              </button>
            </div>
          </div>
        </div>

        {/* Delivery Partners List */}
        <DeliveryPartnerList
          partners={deliveryPartners}
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
    </div>
  );
};

export default DeliveryPartnersPage;