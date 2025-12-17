import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { 
  Plus, 
  Edit3, 
  Eye, 
  EyeOff, 
  Calendar,
  DollarSign,
  Users,
  Clock,
  Search,
  Upload,
  Package,
  X,
  Trash2,
  Utensils,
  Filter,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon
} from "lucide-react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Tiffins = () => {
  const [tiffins, setTiffins] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTiffin, setEditingTiffin] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [expandedTiffin, setExpandedTiffin] = useState(null);

  const token = localStorage.getItem('token');
  const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8080/api';

  const [newMeal, setNewMeal] = useState({
    name: "",
    description: "",
    price: "",
    plan_type: "7 days",
    category: "veg",
    capacity: "",
    preparation_time: "",
    ingredients: "",
    is_available: true,
    image: ""
  });

  // Fetch tiffins from backend
  const fetchTiffins = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/tiffins/vendor/my-tiffins`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTiffins(response.data || []);
      toast.success('Tiffins loaded successfully');
    } catch (error) {
      console.error('Error fetching tiffins:', error);
      toast.error('Failed to load tiffins');
    } finally {
      setLoading(false);
    }
  }, [API_BASE, token]);

  useEffect(() => {
    fetchTiffins();
  }, [fetchTiffins]);

  // Image handling
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setNewMeal({ ...newMeal, image: base64String });
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setNewMeal({ ...newMeal, image: "" });
    setImagePreview("");
  };

  // Form validation
  const validateForm = () => {
    const errors = [];
    
    if (!newMeal.name.trim()) errors.push("Meal name is required");
    if (!newMeal.price || isNaN(newMeal.price) || parseFloat(newMeal.price) <= 0) 
      errors.push("Valid price is required");
    if (!newMeal.capacity || parseInt(newMeal.capacity) <= 0) 
      errors.push("Valid daily capacity is required");
    if (!newMeal.preparation_time || parseInt(newMeal.preparation_time) <= 0)
      errors.push("Valid preparation time is required");
    if (!newMeal.ingredients.trim()) 
      errors.push("Ingredients list is required");
    
    return errors;
  };

  // Add new tiffin
  const addMeal = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    try {
      setLoading(true);
      
      const payload = {
        ...newMeal,
        price: parseFloat(newMeal.price),
        capacity: parseInt(newMeal.capacity),
        preparation_time: parseInt(newMeal.preparation_time)
      };

      await axios.post(`${API_BASE}/tiffins`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Tiffin created successfully!');
      fetchTiffins();
      resetForm();
      setShowAddForm(false);
    } catch (error) {
      console.error('Error creating tiffin:', error);
      toast.error('Error creating tiffin: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Update tiffin
  const updateMeal = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    try {
      setLoading(true);
      
      const payload = {
        ...newMeal,
        price: parseFloat(newMeal.price),
        capacity: parseInt(newMeal.capacity),
        preparation_time: parseInt(newMeal.preparation_time)
      };

      await axios.put(`${API_BASE}/tiffins/vendor/${editingTiffin.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Tiffin updated successfully!');
      fetchTiffins();
      resetForm();
      setEditingTiffin(null);
      setShowAddForm(false);
    } catch (error) {
      console.error('Error updating tiffin:', error);
      toast.error('Error updating tiffin: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Delete tiffin
  const deleteMeal = async (id) => {
    if (!window.confirm('Are you sure you want to delete this meal plan? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE}/tiffins/vendor/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Tiffin deleted successfully!');
      fetchTiffins();
    } catch (error) {
      console.error('Error deleting tiffin:', error);
      toast.error('Error deleting tiffin');
    }
  };

  // Toggle availability
  const toggleAvailability = async (tiffin) => {
    try {
      const updatedTiffins = tiffins.map(t =>
        t.id === tiffin.id ? { ...t, is_available: !t.is_available } : t
      );
      setTiffins(updatedTiffins);

      await axios.put(`${API_BASE}/tiffins/vendor/${tiffin.id}/toggle-availability`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(`Tiffin ${!tiffin.is_available ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error toggling tiffin:', error);
      setTiffins(tiffins);
      toast.error('Error updating tiffin availability');
    }
  };

  // Reset form
  const resetForm = () => {
    setNewMeal({
      name: "",
      description: "",
      price: "",
      plan_type: "7 days",
      category: "veg",
      capacity: "",
      preparation_time: "",
      ingredients: "",
      is_available: true,
      image: ""
    });
    setImagePreview("");
  };

  // Start editing
  const startEdit = (tiffin) => {
    setEditingTiffin(tiffin);
    setNewMeal({ ...tiffin });
    if (tiffin.image) {
      setImagePreview(tiffin.image);
    }
    setShowAddForm(true);
  };

  // Filter tiffins
  const filteredTiffins = tiffins.filter(tiffin => {
    const matchesSearch =
      tiffin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tiffin.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tiffin.ingredients?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || tiffin.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Toggle tiffin details
  const toggleTiffinDetails = (tiffinId) => {
    setExpandedTiffin(expandedTiffin === tiffinId ? null : tiffinId);
  };

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "veg", label: "Vegetarian" },
    { value: "non-veg", label: "Non-Vegetarian" },
    { value: "vegan", label: "Vegan" },
    { value: "jain", label: "Jain" }
  ];

  const planTypes = {
    "7 days": "7 Days",
    "15 days": "15 Days", 
    "30 days": "30 Days",
    "one-time": "One Time"
  };

  if (loading && !showAddForm) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading tiffins...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
            Meal Plans Management
          </h1>
          <p className="text-gray-600 mt-1 md:mt-2">
            Create and manage your tiffin meal plans for customers
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Package className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Plans</p>
                <p className="text-xl font-bold text-gray-900">{tiffins.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <Utensils className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Plans</p>
                <p className="text-xl font-bold text-gray-900">
                  {tiffins.filter(t => t.is_available).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <Eye className="text-purple-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Inactive Plans</p>
                <p className="text-xl font-bold text-gray-900">
                  {tiffins.filter(t => !t.is_available).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg mr-3">
                <Users className="text-orange-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Capacity</p>
                <p className="text-xl font-bold text-gray-900">
                  {tiffins.reduce((sum, t) => sum + (parseInt(t.capacity) || 0), 0)}/day
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search meals by name, description, or ingredients..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <Filter size={20} className="text-gray-500" />
                <select
                  className="border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={fetchTiffins}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Meal Plans</h2>
            <p className="text-gray-600">
              Individual meal configurations for your tiffin service
            </p>
          </div>
          <button
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 md:px-6 md:py-3 rounded-lg flex items-center space-x-2 transition-all duration-200 shadow-sm hover:shadow-md"
            onClick={() => {
              resetForm();
              setShowAddForm(true);
              setEditingTiffin(null);
            }}
          >
            <Plus size={20} />
            <span>Add New Meal Plan</span>
          </button>
        </div>

        {/* Tiffins Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredTiffins.map(tiffin => (
            <div 
              key={tiffin.id} 
              className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 ${
                !tiffin.is_available ? 'opacity-80' : ''
              }`}
            >
              {/* Image Section */}
              {tiffin.image && (
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={tiffin.image.startsWith('data:') ? tiffin.image : `data:image/jpeg;base64,${tiffin.image}`}
                    alt={tiffin.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 flex space-x-1">
                    <button
                      onClick={() => toggleAvailability(tiffin)}
                      className={`p-1.5 rounded-full shadow-sm transition-colors ${
                        tiffin.is_available
                          ? "bg-green-500 text-white hover:bg-green-600"
                          : "bg-gray-500 text-white hover:bg-gray-600"
                      }`}
                      title={tiffin.is_available ? "Set unavailable" : "Set available"}
                    >
                      {tiffin.is_available ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button
                      onClick={() => startEdit(tiffin)}
                      className="p-1.5 bg-blue-500 text-white rounded-full shadow-sm hover:bg-blue-600 transition-colors"
                      title="Edit meal plan"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => toggleTiffinDetails(tiffin.id)}
                      className="p-1.5 bg-purple-500 text-white rounded-full shadow-sm hover:bg-purple-600 transition-colors"
                      title="View details"
                    >
                      {expandedTiffin === tiffin.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Card Content */}
              <div className="p-4 md:p-5">
                {/* Header with title and status */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{tiffin.name}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mt-1">{tiffin.description}</p>
                  </div>
                  <button
                    onClick={() => deleteMeal(tiffin.id)}
                    className="p-1.5 ml-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    tiffin.is_available 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {tiffin.is_available ? 'Available' : 'Unavailable'}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {planTypes[tiffin.plan_type] || tiffin.plan_type}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    tiffin.category === 'veg' ? 'bg-green-100 text-green-800' :
                    tiffin.category === 'non-veg' ? 'bg-red-100 text-red-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {categories.find(c => c.value === tiffin.category)?.label || tiffin.category}
                  </span>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                  <div className="flex items-center text-gray-600">
                    <DollarSign size={14} className="mr-2 flex-shrink-0 text-gray-500" />
                    <span className="font-medium text-gray-900">Rs {tiffin.price}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users size={14} className="mr-2 flex-shrink-0 text-gray-500" />
                    <span className="font-medium text-gray-900">{tiffin.capacity}/day</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock size={14} className="mr-2 flex-shrink-0 text-gray-500" />
                    <span className="font-medium text-gray-900">{tiffin.preparation_time} min</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar size={14} className="mr-2 flex-shrink-0 text-gray-500" />
                    <span className="font-medium text-gray-900 capitalize">{tiffin.category}</span>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedTiffin === tiffin.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h5 className="font-medium text-gray-700 mb-2 flex items-center">
                      <Utensils size={16} className="mr-2" />
                      Ingredients:
                    </h5>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {tiffin.ingredients}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTiffins.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Meal Plans Found
            </h3>
            <p className="text-gray-600 mb-4 max-w-md mx-auto">
              {searchTerm || categoryFilter !== "all"
                ? "No meal plans match your search criteria. Try adjusting your filters."
                : "Start by creating your first meal plan to attract customers"}
            </p>
            <button
              onClick={() => {
                resetForm();
                setShowAddForm(true);
                setEditingTiffin(null);
              }}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg inline-flex items-center space-x-2 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Plus size={20} />
              <span>Create Your First Meal Plan</span>
            </button>
          </div>
        )}

        {/* Add/Edit Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {editingTiffin ? "Edit Meal Plan" : "Create New Meal Plan"}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {editingTiffin
                        ? "Update your meal plan details"
                        : "Fill in the details to create a new meal plan"}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingTiffin(null);
                      resetForm();
                    }}
                    className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  editingTiffin ? updateMeal() : addMeal();
                }} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Meal Name *
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Veg Nepali Thali"
                        value={newMeal.name}
                        onChange={(e) =>
                          setNewMeal({ ...newMeal, name: e.target.value })
                        }
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price (Rs) *
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="250"
                        value={newMeal.price}
                        onChange={(e) =>
                          setNewMeal({ ...newMeal, price: e.target.value })
                        }
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Plan Type *
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newMeal.plan_type}
                        onChange={(e) =>
                          setNewMeal({ ...newMeal, plan_type: e.target.value })
                        }
                      >
                        {Object.entries(planTypes).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category *
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newMeal.category}
                        onChange={(e) =>
                          setNewMeal({ ...newMeal, category: e.target.value })
                        }
                      >
                        {categories
                          .filter((cat) => cat.value !== "all")
                          .map((cat) => (
                            <option key={cat.value} value={cat.value}>
                              {cat.label}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Daily Capacity *
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="50"
                        value={newMeal.capacity}
                        onChange={(e) =>
                          setNewMeal({ ...newMeal, capacity: e.target.value })
                        }
                        min="1"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prep Time (mins) *
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="45"
                        value={newMeal.preparation_time}
                        onChange={(e) =>
                          setNewMeal({
                            ...newMeal,
                            preparation_time: e.target.value,
                          })
                        }
                        min="1"
                        required
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe the meal items, taste, and special features..."
                      rows="3"
                      value={newMeal.description}
                      onChange={(e) =>
                        setNewMeal({ ...newMeal, description: e.target.value })
                      }
                    />
                  </div>

                  {/* Ingredients */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ingredients *
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="List main ingredients (comma separated)..."
                      rows="3"
                      value={newMeal.ingredients}
                      onChange={(e) =>
                        setNewMeal({ ...newMeal, ingredients: e.target.value })
                      }
                      required
                    />
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meal Image
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="w-32 h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                        {imagePreview ? (
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <div className="text-center">
                            <ImageIcon size={24} className="mx-auto text-gray-400 mb-2" />
                            <p className="text-xs text-gray-500">No image</p>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="file"
                          id="meal-image-upload"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <div className="space-y-2">
                          <label
                            htmlFor="meal-image-upload"
                            className="cursor-pointer inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                          >
                            Upload Image
                          </label>
                          <p className="text-xs text-gray-500">
                            JPG, PNG up to 5MB. Recommended: 800×600px
                          </p>
                          {imagePreview && (
                            <button
                              type="button"
                              onClick={removeImage}
                              className="text-sm text-red-600 hover:text-red-800"
                            >
                              Remove Image
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="flex items-center space-x-4 pt-4 border-t">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newMeal.is_available}
                        onChange={(e) =>
                          setNewMeal({
                            ...newMeal,
                            is_available: e.target.checked,
                          })
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        id="meal-availability"
                      />
                      <label htmlFor="meal-availability" className="ml-2 text-sm text-gray-700">
                        Available for orders
                      </label>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex space-x-3 pt-4 border-t">
                    <button
                      type="submit"
                      disabled={loading}
                      className={`flex-1 py-2.5 px-4 rounded-lg transition-all duration-200 ${
                        loading
                          ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow'
                      }`}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          {editingTiffin ? 'Updating...' : 'Creating...'}
                        </span>
                      ) : editingTiffin ? (
                        'Update Meal Plan'
                      ) : (
                        'Create Meal Plan'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingTiffin(null);
                        resetForm();
                      }}
                      className="flex-1 bg-gray-200 text-gray-700 py-2.5 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tiffins;