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
  Package,
  X,
  Trash2,
  Utensils,
  Filter,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  AlertCircle,
  RefreshCw,
  Info,
  CheckCircle,
  Tag
} from "lucide-react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Tiffins = () => {
  const [activeTab, setActiveTab] = useState('mealPackages');
  const [mealSets, setMealSets] = useState([]);
  const [mealPackages, setMealPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [expandedPackage, setExpandedPackage] = useState(null);

  // Form states
  const [showMealSetForm, setShowMealSetForm] = useState(false);
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [editingMealSet, setEditingMealSet] = useState(null);
  const [editingPackage, setEditingPackage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Meal Set Form
  const [mealSetForm, setMealSetForm] = useState({
    name: '',
    type: 'VEG',
    mealItemsText: '',
    isAvailable: true
  });

  // Meal Package Form
  const [packageForm, setPackageForm] = useState({
    name: '',
    durationDays: 7,
    basePackageType: 'STANDARD',
    pricePerSet: 0,
    features: '',
    image: '',
    isAvailable: true,
    packageSets: []
  });

  const [availableMealSets, setAvailableMealSets] = useState([]);
  const token = localStorage.getItem('token');
  const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8080/api';

  // Fetch data on component mount
  const fetchMealData = useCallback(async () => {
    try {
      setLoading(true);
      const [setsResponse, packagesResponse] = await Promise.all([
        axios.get(`${API_BASE}/meal-sets/vendor/my-sets`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE}/meal-packages/vendor/my-packages`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setMealSets(setsResponse.data || []);
      setMealPackages(packagesResponse.data || []);
      setAvailableMealSets((setsResponse.data || []).filter(set => set.isAvailable));

      toast.success('Data loaded successfully');
    } catch (error) {
      console.error('Error fetching meal data:', error);
      if (error.response?.status === 500) {
        toast.error('Server error. Please try again later.');
      } else {
        toast.error('Failed to load meal data');
      }
    } finally {
      setLoading(false);
    }
  }, [API_BASE, token]);

  useEffect(() => {
    fetchMealData();
  }, [fetchMealData]);

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
        setPackageForm({ ...packageForm, image: base64String });
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setPackageForm({ ...packageForm, image: '' });
    setImagePreview('');
  };

  // ========== MEAL SET FUNCTIONS ==========
  const handleMealSetSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...mealSetForm,
        type: mealSetForm.type
      };

      if (editingMealSet) {
        await axios.put(`${API_BASE}/meal-sets/vendor/${editingMealSet.setId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Meal set updated successfully!');
      } else {
        await axios.post(`${API_BASE}/meal-sets`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Meal set created successfully!');
      }
      resetMealSetForm();
      fetchMealData();
    } catch (error) {
      console.error('Error saving meal set:', error);
      toast.error('Error saving meal set: ' + (error.response?.data?.message || error.message));
    }
  };

  const resetMealSetForm = () => {
    setMealSetForm({
      name: '',
      type: 'VEG',
      mealItemsText: '',
      isAvailable: true
    });
    setEditingMealSet(null);
    setShowMealSetForm(false);
  };

  const editMealSet = (mealSet) => {
    setMealSetForm({
      name: mealSet.name,
      type: mealSet.type,
      mealItemsText: mealSet.mealItemsText || '',
      isAvailable: mealSet.isAvailable
    });
    setEditingMealSet(mealSet);
    setShowMealSetForm(true);
  };

  const toggleMealSetAvailability = async (mealSet) => {
    try {
      const updatedMealSets = mealSets.map(set =>
        set.setId === mealSet.setId ? { ...set, isAvailable: !set.isAvailable } : set
      );
      setMealSets(updatedMealSets);

      await axios.put(`${API_BASE}/meal-sets/vendor/${mealSet.setId}/toggle-availability`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setAvailableMealSets(updatedMealSets.filter(set => set.isAvailable));
      toast.success(`Meal set ${!mealSet.isAvailable ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error toggling meal set:', error);
      setMealSets(mealSets);
      toast.error('Error updating meal set availability');
    }
  };

  const deleteMealSet = async (setId) => {
    if (window.confirm('Are you sure you want to delete this meal set? This action cannot be undone.')) {
      try {
        await axios.delete(`${API_BASE}/meal-sets/vendor/${setId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Meal set deleted successfully!');
        fetchMealData();
      } catch (error) {
        console.error('Error deleting meal set:', error);
        toast.error('Error deleting meal set');
      }
    }
  };

  // ========== MEAL PACKAGE FUNCTIONS ==========
  const handlePackageSubmit = async (e) => {
    e.preventDefault();
    try {
      if (packageForm.packageSets.length === 0) {
        toast.error('Please add at least 1 meal set to the package');
        return;
      }

      const payload = {
        ...packageForm,
        packageSets: packageForm.packageSets.map(set => ({
          setId: set.setId,
          frequency: set.frequency
        }))
      };

      if (editingPackage) {
        await axios.put(`${API_BASE}/meal-packages/vendor/${editingPackage.packageId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Meal package updated successfully!');
      } else {
        await axios.post(`${API_BASE}/meal-packages`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Meal package created successfully!');
      }
      resetPackageForm();
      fetchMealData();
    } catch (error) {
      console.error('Error saving meal package:', error);
      toast.error('Error saving meal package: ' + (error.response?.data?.message || error.message));
    }
  };

  const resetPackageForm = () => {
    setPackageForm({
      name: '',
      durationDays: 7,
      basePackageType: 'STANDARD',
      pricePerSet: 0,
      features: '',
      image: '',
      isAvailable: true,
      packageSets: []
    });
    setImagePreview('');
    setEditingPackage(null);
    setShowPackageForm(false);
  };

  const editPackage = (mealPackage) => {
    setPackageForm({
      name: mealPackage.name,
      durationDays: mealPackage.durationDays,
      basePackageType: mealPackage.basePackageType,
      pricePerSet: mealPackage.pricePerSet,
      features: mealPackage.features || '',
      image: mealPackage.image || '',
      isAvailable: mealPackage.isAvailable,
      packageSets: mealPackage.packageSets || []
    });

    if (mealPackage.image) {
      setImagePreview(mealPackage.image);
    }

    setEditingPackage(mealPackage);
    setShowPackageForm(true);
  };

  const togglePackageAvailability = async (mealPackage) => {
    try {
      const updatedPackages = mealPackages.map(pkg =>
        pkg.packageId === mealPackage.packageId ? { ...pkg, isAvailable: !pkg.isAvailable } : pkg
      );
      setMealPackages(updatedPackages);

      await axios.put(`${API_BASE}/meal-packages/vendor/${mealPackage.packageId}/toggle-availability`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Meal package ${!mealPackage.isAvailable ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error toggling meal package:', error);
      setMealPackages(mealPackages);
      toast.error('Error updating meal package availability');
    }
  };

  const deletePackage = async (packageId) => {
    if (window.confirm('Are you sure you want to delete this meal package? This action cannot be undone.')) {
      try {
        await axios.delete(`${API_BASE}/meal-packages/vendor/${packageId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Meal package deleted successfully!');
        fetchMealData();
      } catch (error) {
        console.error('Error deleting meal package:', error);
        toast.error('Error deleting meal package');
      }
    }
  };

  const addMealSetToPackage = (mealSet) => {
    const existingSet = packageForm.packageSets.find(ps => ps.setId === mealSet.setId);

    if (existingSet) {
      setPackageForm(prev => ({
        ...prev,
        packageSets: prev.packageSets.map(ps =>
          ps.setId === mealSet.setId
            ? { ...ps, frequency: ps.frequency + 1 }
            : ps
        )
      }));
      toast.info(`${mealSet.name} frequency increased`);
    } else {
      setPackageForm(prev => ({
        ...prev,
        packageSets: [
          ...prev.packageSets,
          {
            setId: mealSet.setId,
            frequency: 1,
            setName: mealSet.name,
            type: mealSet.type,
            mealItemsText: mealSet.mealItemsText
          }
        ]
      }));
      toast.success(`${mealSet.name} added to package`);
    }
  };

  const removeMealSetFromPackage = (setId) => {
    const removedSet = packageForm.packageSets.find(ps => ps.setId === setId);
    setPackageForm(prev => ({
      ...prev,
      packageSets: prev.packageSets.filter(ps => ps.setId !== setId)
    }));
    if (removedSet) {
      toast.info(`${removedSet.setName} removed from package`);
    }
  };

  const updateMealSetFrequency = (setId, frequency) => {
    const newFrequency = Math.max(1, parseInt(frequency) || 1);
    setPackageForm(prev => ({
      ...prev,
      packageSets: prev.packageSets.map(ps =>
        ps.setId === setId ? { ...ps, frequency: newFrequency } : ps
      )
    }));
  };

  // ========== FILTER FUNCTIONS ==========
  const filteredMealSets = mealSets.filter(set => {
    const matchesSearch = set.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      set.mealItemsText?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      set.setId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || set.type === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredMealPackages = mealPackages.filter(pkg => {
    const matchesSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.features?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.packageId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || pkg.basePackageType === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Calculate package total price
  const calculatePackageTotal = (mealPackage) => {
    return (mealPackage.pricePerSet * mealPackage.durationDays).toFixed(2);
  };

  // Display image helper
  const displayImage = (base64String) => {
    if (!base64String) return null;
    if (base64String.startsWith('data:')) {
      return base64String;
    }
    return `data:image/jpeg;base64,${base64String}`;
  };

  // Toggle package details
  const togglePackageDetails = (packageId) => {
    setExpandedPackage(expandedPackage === packageId ? null : packageId);
  };

  // Filter options
  const getFilterOptions = () => {
    if (activeTab === 'mealSets') {
      return [
        { value: "all", label: "All Types" },
        { value: "VEG", label: "Vegetarian" },
        { value: "NON_VEG", label: "Non-Vegetarian" }
      ];
    } else {
      return [
        { value: "all", label: "All Categories" },
        { value: "STANDARD", label: "Standard" },
        { value: "PREMIUM", label: "Premium" },
        { value: "DELUXE", label: "Deluxe" }
      ];
    }
  };

  const filterOptions = getFilterOptions();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading meal data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="max-w-7xl mx-auto">
        {/* Header - Updated with left alignment and smaller title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              Meal Management
            </h1>
            <p className="text-gray-600 mt-1 text-sm">
              Manage your meal packages and sets for customers
            </p>
          </div>
          <button
            onClick={fetchMealData}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-sm hover:shadow-md self-start md:self-center"
          >
            <RefreshCw size={18} />
            <span>Refresh Data</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Package className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Packages</p>
                <p className="text-xl font-bold text-gray-900">{mealPackages.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <Utensils className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Meal Sets</p>
                <p className="text-xl font-bold text-gray-900">{mealSets.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <Eye className="text-purple-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Packages</p>
                <p className="text-xl font-bold text-gray-900">
                  {mealPackages.filter(p => p.isAvailable).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg mr-3">
                <EyeOff className="text-orange-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Inactive Sets</p>
                <p className="text-xl font-bold text-gray-900">
                  {mealSets.filter(s => !s.isAvailable).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter - Removed refresh button */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search meals by name, ID, or features..."
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
                  {filterOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-4 md:space-x-8 overflow-x-auto">
            <button
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap transition-all duration-200 ${
                activeTab === 'mealPackages'
                  ? 'border-blue-500 text-blue-600 bg-blue-50 px-3 rounded-t-lg'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('mealPackages')}
            >
              <Package size={16} />
              <span>Meal Packages ({mealPackages.length})</span>
            </button>
            <button
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap transition-all duration-200 ${
                activeTab === 'mealSets'
                  ? 'border-blue-500 text-blue-600 bg-blue-50 px-3 rounded-t-lg'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('mealSets')}
            >
              <Utensils size={16} />
              <span>Meal Sets ({mealSets.length})</span>
            </button>
          </nav>
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              {activeTab === 'mealSets' ? 'Meal Sets' : 'Meal Packages'}
            </h2>
            <p className="text-gray-600">
              {activeTab === 'mealSets'
                ? 'Individual meal configurations'
                : 'Complete meal plans combining multiple sets'}
            </p>
          </div>
          <button
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 md:px-6 md:py-3 rounded-lg flex items-center space-x-2 transition-all duration-200 shadow-sm hover:shadow-md"
            onClick={() => activeTab === 'mealSets' ? setShowMealSetForm(true) : setShowPackageForm(true)}
          >
            <Plus size={20} />
            <span>Add {activeTab === 'mealSets' ? 'Meal Set' : 'Meal Package'}</span>
          </button>
        </div>

        {/* MEAL PACKAGES TAB - NOW IN CARDS */}
        {activeTab === 'mealPackages' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredMealPackages.map(mealPackage => (
                <div key={mealPackage.packageId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200">
                  {/* Image Section */}
                  {mealPackage.image && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={displayImage(mealPackage.image)}
                        alt={mealPackage.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3 flex space-x-1">
                        <button
                          onClick={() => togglePackageAvailability(mealPackage)}
                          className={`p-1.5 rounded-full shadow-sm transition-colors ${
                            mealPackage.isAvailable
                              ? "bg-green-500 text-white hover:bg-green-600"
                              : "bg-gray-500 text-white hover:bg-gray-600"
                          }`}
                          title={mealPackage.isAvailable ? "Set unavailable" : "Set available"}
                        >
                          {mealPackage.isAvailable ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        <button
                          onClick={() => editPackage(mealPackage)}
                          className="p-1.5 bg-blue-500 text-white rounded-full shadow-sm hover:bg-blue-600 transition-colors"
                          title="Edit meal package"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => togglePackageDetails(mealPackage.packageId)}
                          className="p-1.5 bg-purple-500 text-white rounded-full shadow-sm hover:bg-purple-600 transition-colors"
                          title="View details"
                        >
                          {expandedPackage === mealPackage.packageId ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Card Content */}
                  <div className="p-4 md:p-5">
                    {/* Header with title and status */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{mealPackage.name}</h3>
                        <p className="text-gray-600 text-sm line-clamp-2 mt-1">{mealPackage.features}</p>
                      </div>
                      <button
                        onClick={() => deletePackage(mealPackage.packageId)}
                        className="p-1.5 ml-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        mealPackage.isAvailable 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {mealPackage.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {mealPackage.basePackageType}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {mealPackage.durationDays} days
                      </span>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                      <div className="flex items-center text-gray-600">
                        <DollarSign size={14} className="mr-2 flex-shrink-0 text-gray-500" />
                        <span className="font-medium text-gray-900">Rs {mealPackage.pricePerSet}/set</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Calendar size={14} className="mr-2 flex-shrink-0 text-gray-500" />
                        <span className="font-medium text-gray-900">Total: Rs {calculatePackageTotal(mealPackage)}</span>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedPackage === mealPackage.packageId && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <h5 className="font-medium text-gray-700 mb-2">Included Meal Sets:</h5>
                        <div className="space-y-2">
                          {mealPackage.packageSets?.map((set, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium text-sm">{set.setName}</span>
                                  <span className={`text-xs px-2 py-0.5 rounded ${set.type === 'VEG' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                    {set.type}
                                  </span>
                                  <span className="text-xs text-gray-500">×{set.frequency}</span>
                                </div>
                                <p className="text-xs text-gray-600 mt-1">{set.mealItemsText}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredMealPackages.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Meal Packages Found
                </h3>
                <p className="text-gray-600 mb-4 max-w-md mx-auto">
                  {searchTerm || categoryFilter !== 'all'
                    ? 'No meal packages match your search criteria. Try adjusting your filters.'
                    : 'Start by creating your first meal package'}
                </p>
                <button
                  onClick={() => setShowPackageForm(true)}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg inline-flex items-center space-x-2 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <Plus size={20} />
                  <span>Create Your First Meal Package</span>
                </button>
              </div>
            )}
          </>
        )}

        {/* MEAL SETS TAB */}
        {activeTab === 'mealSets' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredMealSets.map(mealSet => (
                <div key={mealSet.setId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200">
                  <div className="p-4 md:p-5">
                    {/* Header with title and action buttons */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 line-clamp-1">{mealSet.name}</h4>
                      </div>
                      <div className="flex space-x-1 ml-2">
                        <button
                          onClick={() => toggleMealSetAvailability(mealSet)}
                          className={`p-1.5 rounded-full ${mealSet.isAvailable
                              ? "text-green-600 hover:bg-green-50"
                              : "text-gray-600 hover:bg-gray-50"
                            } transition-colors`}
                          title={mealSet.isAvailable ? "Set unavailable" : "Set available"}
                        >
                          {mealSet.isAvailable ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        <button
                          onClick={() => editMealSet(mealSet)}
                          className="p-1.5 text-blue-600 rounded-full hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => deleteMealSet(mealSet.setId)}
                          className="p-1.5 text-red-600 rounded-full hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Availability and Type badges */}
                    <div className="flex items-center mb-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${mealSet.isAvailable
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                        }`}>
                        {mealSet.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                      <span className={`ml-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${mealSet.type === 'VEG'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                        }`}>
                        {mealSet.type === 'VEG' ? 'Vegetarian' : 'Non-Vegetarian'}
                      </span>
                    </div>

                    {/* Meal Items */}
                    <div className="mb-4">
                      <div className="flex items-start">
                        <Utensils size={14} className="mt-0.5 mr-2 flex-shrink-0 text-gray-400" />
                        <p className="text-sm text-gray-600 line-clamp-3">{mealSet.mealItemsText}</p>
                      </div>
                    </div>

                    {/* Status indicator */}
                    <div className="pt-3 border-t border-gray-100">
                      <div className="flex items-center">
                        <CheckCircle size={14} className={`mr-2 ${mealSet.isAvailable ? 'text-green-500' : 'text-red-500'
                          }`} />
                        <span className={`text-sm font-medium ${mealSet.isAvailable ? 'text-green-600' : 'text-red-600'
                          }`}>
                          {mealSet.isAvailable ? 'Active for packages' : 'Not available'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredMealSets.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Utensils size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Meal Sets Found
                </h3>
                <p className="text-gray-600 mb-4 max-w-md mx-auto">
                  {searchTerm || categoryFilter !== 'all'
                    ? 'No meal sets match your search criteria. Try adjusting your filters.'
                    : 'Start by creating your first meal set'}
                </p>
                <button
                  onClick={() => setShowMealSetForm(true)}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg inline-flex items-center space-x-2 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <Plus size={20} />
                  <span>Create Your First Meal Set</span>
                </button>
              </div>
            )}
          </>
        )}

        {/* ========== MODALS ========== */}

        {/* Meal Package Form Modal */}
        {showPackageForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {editingPackage ? 'Edit Meal Package' : 'Create New Meal Package'}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {editingPackage
                        ? 'Update your meal package details'
                        : 'Fill in the details to create a new meal package'}
                    </p>
                  </div>
                  <button
                    onClick={resetPackageForm}
                    className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handlePackageSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Package Name *
                      </label>
                      <input
                        type="text"
                        value={packageForm.name}
                        onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        placeholder="e.g., 7-Day Vegetarian Plan"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Package Type *
                      </label>
                      <select
                        value={packageForm.basePackageType}
                        onChange={(e) => setPackageForm({ ...packageForm, basePackageType: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="STANDARD">Standard</option>
                        <option value="PREMIUM">Premium</option>
                        <option value="DELUXE">Deluxe</option>
                        <option value="CUSTOM">Custom</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration (days) *
                      </label>
                      <input
                        type="number"
                        value={packageForm.durationDays}
                        onChange={(e) => setPackageForm({ ...packageForm, durationDays: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price per Set (Rs) *
                      </label>
                      <input
                        type="number"
                        value={packageForm.pricePerSet}
                        onChange={(e) => setPackageForm({ ...packageForm, pricePerSet: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Features
                    </label>
                    <textarea
                      value={packageForm.features}
                      onChange={(e) => setPackageForm({ ...packageForm, features: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="Describe package features and benefits..."
                    />
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Package Image
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
                          id="package-image-upload"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <div className="space-y-2">
                          <label
                            htmlFor="package-image-upload"
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

                  {/* Meal Sets Selection */}
                  <div className="border-t pt-6">
                    <h4 className="text-lg font-semibold mb-4 flex items-center">
                      <Package className="mr-2" size={20} />
                      Meal Sets in Package
                      <span className="ml-2 text-sm font-normal text-gray-600">
                        ({packageForm.packageSets.length} sets added)
                      </span>
                    </h4>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Available Meal Sets */}
                      <div>
                        <h5 className="font-medium text-gray-700 mb-3 flex items-center">
                          <Info className="mr-2" size={16} />
                          Available Meal Sets:
                          <span className="ml-2 text-sm font-normal text-gray-500">
                            ({availableMealSets.length})
                          </span>
                        </h5>
                        <div className="space-y-2 max-h-80 overflow-y-auto p-2 border rounded-lg bg-gray-50">
                          {availableMealSets.length === 0 ? (
                            <div className="text-center py-4 text-gray-500">
                              No available meal sets. Create some meal sets first.
                            </div>
                          ) : (
                            availableMealSets.map(mealSet => (
                              <div key={mealSet.setId} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white hover:bg-blue-50 transition-colors">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className="font-medium text-sm">{mealSet.name}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded ${mealSet.type === 'VEG' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                      }`}>
                                      {mealSet.type}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-600 truncate">{mealSet.mealItemsText}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => addMealSetToPackage(mealSet)}
                                  className="ml-2 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                  <Plus size={16} />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Selected Meal Sets */}
                      <div>
                        <h5 className="font-medium text-gray-700 mb-3 flex items-center">
                          <CheckCircle className="mr-2" size={16} />
                          Selected Meal Sets:
                          <span className="ml-2 text-sm font-normal text-gray-500">
                            Total frequency: {packageForm.packageSets.reduce((sum, set) => sum + set.frequency, 0)}
                          </span>
                        </h5>
                        {packageForm.packageSets.length === 0 ? (
                          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                            <Package size={32} className="mx-auto text-gray-400 mb-2" />
                            <p className="text-gray-500">No meal sets added yet</p>
                            <p className="text-sm text-gray-400">Add at least 1 meal set from the left panel</p>
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-80 overflow-y-auto p-2 border rounded-lg bg-gray-50">
                            {packageForm.packageSets.map(packageSet => (
                              <div key={packageSet.setId} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className="font-medium text-sm">{packageSet.setName}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded ${packageSet.type === 'VEG' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                      }`}>
                                      {packageSet.type}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-600 truncate">{packageSet.mealItemsText}</p>
                                </div>
                                <div className="flex items-center space-x-2 ml-2">
                                  <div className="flex items-center space-x-1">
                                    <button
                                      type="button"
                                      onClick={() => updateMealSetFrequency(packageSet.setId, packageSet.frequency - 1)}
                                      className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300"
                                      disabled={packageSet.frequency <= 1}
                                    >
                                      <span className="text-xs">-</span>
                                    </button>
                                    <input
                                      type="number"
                                      value={packageSet.frequency}
                                      onChange={(e) => updateMealSetFrequency(packageSet.setId, e.target.value)}
                                      className="w-12 text-center px-1 py-1 border border-gray-300 rounded text-sm"
                                      min="1"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => updateMealSetFrequency(packageSet.setId, packageSet.frequency + 1)}
                                      className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300"
                                    >
                                      <span className="text-xs">+</span>
                                    </button>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeMealSetFromPackage(packageSet.setId)}
                                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Package Summary */}
                  {packageForm.packageSets.length > 0 && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h5 className="font-medium text-gray-700 mb-2">Package Summary:</h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Duration:</span>
                          <span className="ml-2 font-medium">{packageForm.durationDays} days</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Price per set:</span>
                          <span className="ml-2 font-medium">Rs {packageForm.pricePerSet}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Total price:</span>
                          <span className="ml-2 font-medium">
                            Rs {(packageForm.pricePerSet * packageForm.durationDays).toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Meal sets:</span>
                          <span className="ml-2 font-medium">{packageForm.packageSets.length}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Total frequency:</span>
                          <span className="ml-2 font-medium">
                            {packageForm.packageSets.reduce((sum, set) => sum + set.frequency, 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-4 pt-4 border-t">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={packageForm.isAvailable}
                        onChange={(e) => setPackageForm({ ...packageForm, isAvailable: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        id="package-availability"
                      />
                      <label htmlFor="package-availability" className="ml-2 text-sm text-gray-700">
                        Available for customers
                      </label>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4 border-t">
                    <button
                      type="submit"
                      disabled={packageForm.packageSets.length === 0}
                      className={`flex-1 py-2.5 px-4 rounded-lg transition-all duration-200 ${packageForm.packageSets.length > 0
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow'
                          : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        }`}
                    >
                      {editingPackage ? 'Update Package' : 'Create Package'}
                    </button>
                    <button
                      type="button"
                      onClick={resetPackageForm}
                      className="flex-1 bg-gray-200 text-gray-700 py-2.5 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Meal Set Form Modal */}
        {showMealSetForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {editingMealSet ? 'Edit Meal Set' : 'Create New Meal Set'}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {editingMealSet
                        ? 'Update your meal set details'
                        : 'Fill in the details to create a new meal set'}
                    </p>
                  </div>
                  <button
                    onClick={resetMealSetForm}
                    className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleMealSetSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        value={mealSetForm.name}
                        onChange={(e) => setMealSetForm({ ...mealSetForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        placeholder="e.g., Healthy Breakfast"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type *
                      </label>
                      <select
                        value={mealSetForm.type}
                        onChange={(e) => setMealSetForm({ ...mealSetForm, type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="VEG">Vegetarian</option>
                        <option value="NON_VEG">Non-Vegetarian</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meal Items *
                    </label>
                    <textarea
                      value={mealSetForm.mealItemsText}
                      onChange={(e) => setMealSetForm({ ...mealSetForm, mealItemsText: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="4"
                      placeholder="Enter meal items separated by commas (e.g., Poha, Tea, Fruits)..."
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Separate items with commas. Be descriptive for better customer understanding.
                    </p>
                  </div>

                  <div className="flex items-center space-x-4 pt-4 border-t">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={mealSetForm.isAvailable}
                        onChange={(e) => setMealSetForm({ ...mealSetForm, isAvailable: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        id="set-availability"
                      />
                      <label htmlFor="set-availability" className="ml-2 text-sm text-gray-700">
                        Available for packages
                      </label>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm hover:shadow"
                    >
                      {editingMealSet ? 'Update Meal Set' : 'Create Meal Set'}
                    </button>
                    <button
                      type="button"
                      onClick={resetMealSetForm}
                      className="flex-1 bg-gray-200 text-gray-700 py-2.5 px-4 rounded-lg hover:bg-gray-300 transition-colors"
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