import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Edit3,
  Eye,
  EyeOff,
  Calendar,
  Package,
  X,
  CheckCircle,
  Trash2,
  Search,
  Filter,
  Tag,
  Utensils,
  Info,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-toastify';
import { api } from '../../helpers/api'; // Import the API

const MealManagement = () => {
  const [activeTab, setActiveTab] = useState('mealPackages');
  const [mealSets, setMealSets] = useState([]);
  const [mealPackages, setMealPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [expandedPackage, setExpandedPackage] = useState(null);

  // Form states
  const [showMealSetForm, setShowMealSetForm] = useState(false);
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [editingMealSet, setEditingMealSet] = useState(null);
  const [editingPackage, setEditingPackage] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Meal Set Form - Note: No image upload for meal sets in API
  const [mealSetForm, setMealSetForm] = useState({
    name: '',
    mealType: 'VEG', // Changed from 'type' to match API
    description: '', // Changed from 'mealItemsText'
    price: 0, // Added price field which is required in API
    isAvailable: true
  });

  // Meal Package Form - Note: No image upload for packages in API
  const [packageForm, setPackageForm] = useState({
    name: '',
    durationDays: 7,
    packageType: 'STANDARD', // Changed from 'basePackageType'
    pricePerDay: 0, // Changed from 'pricePerSet'
    description: '', // Changed from 'features'
    isAvailable: true,
    mealSetIds: [] // Changed from 'packageSets' to match API
  });

  const [availableMealSets, setAvailableMealSets] = useState([]);
  const [error, setError] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchMealData();
  }, []);

  const fetchMealData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the API from api.js instead of direct axios calls
      const [setsResponse, packagesResponse] = await Promise.all([
        api.mealSets.getVendorMealSets(),
        api.mealPackages.getVendorMealPackages()
      ]);

      // Transform data to match frontend expectations
      const transformedMealSets = (setsResponse || []).map(set => ({
        setId: set.id || set._id,
        name: set.name,
        type: set.mealType || set.type, // Map backend field
        mealItemsText: set.description, // Use description as meal items text
        description: set.description,
        price: set.price || 0,
        isAvailable: set.isAvailable !== false
      }));

      const transformedMealPackages = (packagesResponse || []).map(pkg => {
        // Calculate total price
        const totalPrice = (pkg.pricePerDay || 0) * (pkg.durationDays || 7);
        
        return {
          packageId: pkg.id || pkg._id,
          name: pkg.name,
          basePackageType: pkg.packageType,
          packageType: pkg.packageType,
          durationDays: pkg.durationDays || 7,
          pricePerSet: pkg.pricePerDay || 0,
          pricePerDay: pkg.pricePerDay || 0,
          features: pkg.description || '',
          description: pkg.description || '',
          isAvailable: pkg.isAvailable !== false,
          packageSets: pkg.mealSetIds?.map(id => ({
            setId: id,
            frequency: 1, // Default frequency since API doesn't provide
            setName: mealSets.find(s => s.setId === id)?.name || 'Unknown'
          })) || [],
          totalPrice
        };
      });

      setMealSets(transformedMealSets);
      setMealPackages(transformedMealPackages);
      setAvailableMealSets(transformedMealSets.filter(set => set.isAvailable));

      toast.success('Data loaded successfully');
    } catch (error) {
      console.error('Error fetching meal data:', error);
      setError(error.message || 'Failed to load meal data');
      toast.error('Failed to load meal data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Meal Set Functions
  const handleMealSetSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);

    try {
      const payload = {
        name: mealSetForm.name,
        mealType: mealSetForm.mealType,
        description: mealSetForm.description,
        price: Number(mealSetForm.price),
        isAvailable: mealSetForm.isAvailable
      };

      if (editingMealSet) {
        await api.mealSets.updateMealSet(editingMealSet.setId, payload);
        toast.success('Meal set updated successfully!');
      } else {
        await api.mealSets.createMealSet(payload);
        toast.success('Meal set created successfully!');
      }
      
      resetMealSetForm();
      fetchMealData();
    } catch (error) {
      console.error('Error saving meal set:', error);
      const errorMessage = error.message || 'Error saving meal set';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const resetMealSetForm = () => {
    setMealSetForm({
      name: '',
      mealType: 'VEG',
      description: '',
      price: 0,
      isAvailable: true
    });
    setEditingMealSet(null);
    setShowMealSetForm(false);
  };

  const editMealSet = (mealSet) => {
    setMealSetForm({
      name: mealSet.name,
      mealType: mealSet.type, // Map to mealType for backend
      description: mealSet.mealItemsText || mealSet.description || '',
      price: mealSet.price || 0,
      isAvailable: mealSet.isAvailable
    });
    setEditingMealSet(mealSet);
    setShowMealSetForm(true);
  };

  const toggleMealSetAvailability = async (mealSet) => {
    try {
      const updatedAvailability = !mealSet.isAvailable;
      
      await api.mealSets.updateMealSet(mealSet.setId, {
        ...mealSet,
        mealType: mealSet.type,
        isAvailable: updatedAvailability
      });

      const updatedMealSets = mealSets.map(set =>
        set.setId === mealSet.setId ? { ...set, isAvailable: updatedAvailability } : set
      );
      
      setMealSets(updatedMealSets);
      setAvailableMealSets(updatedMealSets.filter(set => set.isAvailable));
      
      toast.success(`Meal set ${updatedAvailability ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error toggling meal set:', error);
      toast.error('Error updating meal set availability');
    }
  };

  const deleteMealSet = async (setId) => {
    if (window.confirm('Are you sure you want to delete this meal set? This action cannot be undone.')) {
      try {
        await api.mealSets.deleteMealSet(setId);
        toast.success('Meal set deleted successfully!');
        fetchMealData();
      } catch (error) {
        console.error('Error deleting meal set:', error);
        toast.error('Error deleting meal set');
      }
    }
  };

  // Meal Package Functions
  const handlePackageSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);

    try {
      if (packageForm.mealSetIds.length === 0) {
        toast.error('Please add at least 1 meal set to the package');
        return;
      }

      const payload = {
        name: packageForm.name,
        durationDays: Number(packageForm.durationDays),
        packageType: packageForm.packageType,
        pricePerDay: Number(packageForm.pricePerDay),
        description: packageForm.description,
        isAvailable: packageForm.isAvailable,
        mealSetIds: packageForm.mealSetIds
      };

      if (editingPackage) {
        await api.mealPackages.updateMealPackage(editingPackage.packageId, payload);
        toast.success('Meal package updated successfully!');
      } else {
        await api.mealPackages.createMealPackage(payload);
        toast.success('Meal package created successfully!');
      }
      
      resetPackageForm();
      fetchMealData();
    } catch (error) {
      console.error('Error saving meal package:', error);
      const errorMessage = error.message || 'Error saving meal package';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const resetPackageForm = () => {
    setPackageForm({
      name: '',
      durationDays: 7,
      packageType: 'STANDARD',
      pricePerDay: 0,
      description: '',
      isAvailable: true,
      mealSetIds: []
    });
    setEditingPackage(null);
    setShowPackageForm(false);
  };

  const editPackage = (mealPackage) => {
    setPackageForm({
      name: mealPackage.name,
      durationDays: mealPackage.durationDays,
      packageType: mealPackage.basePackageType || mealPackage.packageType,
      pricePerDay: mealPackage.pricePerDay || mealPackage.pricePerSet,
      description: mealPackage.description || mealPackage.features || '',
      isAvailable: mealPackage.isAvailable,
      mealSetIds: mealPackage.packageSets?.map(set => set.setId) || []
    });

    setEditingPackage(mealPackage);
    setShowPackageForm(true);
  };

  const togglePackageAvailability = async (mealPackage) => {
    try {
      const updatedAvailability = !mealPackage.isAvailable;
      
      const payload = {
        name: mealPackage.name,
        durationDays: mealPackage.durationDays,
        packageType: mealPackage.basePackageType || mealPackage.packageType,
        pricePerDay: mealPackage.pricePerDay || mealPackage.pricePerSet,
        description: mealPackage.description || mealPackage.features || '',
        isAvailable: updatedAvailability,
        mealSetIds: mealPackage.packageSets?.map(set => set.setId) || []
      };
      
      await api.mealPackages.updateMealPackage(mealPackage.packageId, payload);

      const updatedPackages = mealPackages.map(pkg =>
        pkg.packageId === mealPackage.packageId ? { ...pkg, isAvailable: updatedAvailability } : pkg
      );
      
      setMealPackages(updatedPackages);
      toast.success(`Meal package ${updatedAvailability ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error toggling meal package:', error);
      toast.error('Error updating meal package availability');
    }
  };

  const deletePackage = async (packageId) => {
    if (window.confirm('Are you sure you want to delete this meal package? This action cannot be undone.')) {
      try {
        await api.mealPackages.deleteMealPackage(packageId);
        toast.success('Meal package deleted successfully!');
        fetchMealData();
      } catch (error) {
        console.error('Error deleting meal package:', error);
        toast.error('Error deleting meal package');
      }
    }
  };

  const addMealSetToPackage = (mealSet) => {
    if (!packageForm.mealSetIds.includes(mealSet.setId)) {
      setPackageForm(prev => ({
        ...prev,
        mealSetIds: [...prev.mealSetIds, mealSet.setId]
      }));
      toast.success(`${mealSet.name} added to package`);
    } else {
      toast.info(`${mealSet.name} is already in the package`);
    }
  };

  const removeMealSetFromPackage = (setId) => {
    const removedSet = mealSets.find(set => set.setId === setId);
    setPackageForm(prev => ({
      ...prev,
      mealSetIds: prev.mealSetIds.filter(id => id !== setId)
    }));
    if (removedSet) {
      toast.info(`${removedSet.name} removed from package`);
    }
  };

  // Filter functions
  const filteredMealSets = mealSets.filter(set => {
    const matchesSearch = set.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (set.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (set.setId || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || set.type === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredMealPackages = mealPackages.filter(pkg => {
    const matchesSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pkg.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pkg.packageId || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || pkg.basePackageType === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Calculate package total price
  const calculatePackageTotal = (mealPackage) => {
    return ((mealPackage.pricePerDay || mealPackage.pricePerSet) * (mealPackage.durationDays || 7)).toFixed(2);
  };

  // Toggle package details
  const togglePackageDetails = (packageId) => {
    setExpandedPackage(expandedPackage === packageId ? null : packageId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="animate-spin text-green-600 mr-3" size={24} />
        <div className="text-lg text-gray-600">Loading meal data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
              <X size={18} />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Meal Management
          </h1>
          <p className="text-gray-600 mt-1 md:mt-2">
            Manage your meal packages and sets for customers
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

        {/* Search and Filter */}
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
                  <option value="all">All Categories</option>
                  <option value="VEG">Vegetarian</option>
                  <option value="NON_VEG">Non-Vegetarian</option>
                  <option value="STANDARD">Standard</option>
                  <option value="PREMIUM">Premium</option>
                  <option value="DELUXE">Deluxe</option>
                </select>
              </div>
              <button
                onClick={fetchMealData}
                disabled={loading}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6 md:mb-8">
          <nav className="-mb-px flex space-x-4 md:space-x-8 overflow-x-auto">
            <button
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap transition-all duration-200 ${activeTab === 'mealPackages'
                  ? 'border-blue-500 text-blue-600 bg-blue-50 px-3 rounded-t-lg'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              onClick={() => setActiveTab('mealPackages')}
            >
              <Package size={16} />
              <span>Meal Packages ({mealPackages.length})</span>
            </button>
            <button
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap transition-all duration-200 ${activeTab === 'mealSets'
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

        {/* Action Buttons */}
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
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 md:px-6 md:py-3 rounded-lg flex items-center space-x-2 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
            onClick={() => activeTab === 'mealSets' ? setShowMealSetForm(true) : setShowPackageForm(true)}
            disabled={formLoading}
          >
            <Plus size={20} />
            <span>Add {activeTab === 'mealSets' ? 'Meal Set' : 'Meal Package'}</span>
          </button>
        </div>

        {/* Meal Packages Tab */}
        {activeTab === 'mealPackages' && (
          <>
            {/* Meal Packages Grid */}
            <div className="space-y-4">
              {filteredMealPackages.map(mealPackage => (
                <div key={mealPackage.packageId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200">
                  <div className="flex flex-col md:flex-row">
                    {/* Card Content - No image as API doesn't support */}
                    <div className="w-full p-4 md:p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-lg font-semibold text-gray-900 line-clamp-1">{mealPackage.name}</h4>
                            <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                              {mealPackage.packageId}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-1">{mealPackage.description}</p>
                        </div>
                        <div className="flex space-x-1 ml-2">
                          <button
                            onClick={() => togglePackageAvailability(mealPackage)}
                            className={`p-1.5 rounded-full ${mealPackage.isAvailable
                                ? "text-green-600 hover:bg-green-50"
                                : "text-gray-600 hover:bg-gray-50"
                              } transition-colors`}
                            title={mealPackage.isAvailable ? "Set unavailable" : "Set available"}
                          >
                            {mealPackage.isAvailable ? <Eye size={16} /> : <EyeOff size={16} />}
                          </button>
                          <button
                            onClick={() => editPackage(mealPackage)}
                            className="p-1.5 text-blue-600 rounded-full hover:bg-blue-50 transition-colors"
                            title="Edit"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => deletePackage(mealPackage.packageId)}
                            className="p-1.5 text-red-600 rounded-full hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                          <button
                            onClick={() => togglePackageDetails(mealPackage.packageId)}
                            className="p-1.5 text-gray-600 rounded-full hover:bg-gray-50 transition-colors"
                            title="View Details"
                          >
                            {expandedPackage === mealPackage.packageId ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </div>
                      </div>

                      {/* Quick Info */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${mealPackage.isAvailable
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
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          Rs {mealPackage.pricePerDay || mealPackage.pricePerSet}/day
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          Total: Rs {calculatePackageTotal(mealPackage)}
                        </span>
                      </div>

                      {/* Expanded Details */}
                      {expandedPackage === mealPackage.packageId && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <h5 className="font-medium text-gray-700 mb-2">Included Meal Sets:</h5>
                          <div className="space-y-2">
                            {mealPackage.packageSets && mealPackage.packageSets.length > 0 ? (
                              mealPackage.packageSets.map((set, index) => {
                                const mealSet = mealSets.find(s => s.setId === set.setId);
                                if (!mealSet) return null;
                                
                                return (
                                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-2">
                                        <span className="font-medium text-sm">{mealSet.name}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded ${mealSet.type === 'VEG' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                          }`}>
                                          {mealSet.type}
                                        </span>
                                        <span className="text-xs text-gray-500">×{set.frequency || 1}</span>
                                      </div>
                                      <p className="text-xs text-gray-600 mt-1">{mealSet.description}</p>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <p className="text-sm text-gray-500 text-center py-2">No meal sets included</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
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

        {/* Meal Sets Tab */}
        {activeTab === 'mealSets' && (
          <>
            {/* Meal Sets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredMealSets.map(mealSet => (
                <div key={mealSet.setId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200">
                  <div className="p-4 md:p-5">
                    {/* Header with title and action buttons */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-lg font-semibold text-gray-900 line-clamp-1">{mealSet.name}</h4>
                          <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            {mealSet.setId}
                          </span>
                        </div>
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

                    {/* Description */}
                    <div className="mb-4">
                      <div className="flex items-start">
                        <Utensils size={14} className="mt-0.5 mr-2 flex-shrink-0 text-gray-400" />
                        <p className="text-sm text-gray-600 line-clamp-3">{mealSet.description || mealSet.mealItemsText}</p>
                      </div>
                      <div className="mt-2 flex items-center">
                        <Tag size={12} className="text-gray-400 mr-1" />
                        <span className="text-sm font-medium text-gray-700">Rs {mealSet.price || 0}</span>
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

        {/* Meal Package Form Modal - REMOVED IMAGE UPLOAD */}
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
                    disabled={formLoading}
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
                        disabled={formLoading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Package Type *
                      </label>
                      <select
                        value={packageForm.packageType}
                        onChange={(e) => setPackageForm({ ...packageForm, packageType: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={formLoading}
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
                        onChange={(e) => setPackageForm({ ...packageForm, durationDays: parseInt(e.target.value) || 7 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                        required
                        disabled={formLoading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price per Day (Rs) *
                      </label>
                      <input
                        type="number"
                        value={packageForm.pricePerDay}
                        onChange={(e) => setPackageForm({ ...packageForm, pricePerDay: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        step="0.01"
                        required
                        disabled={formLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={packageForm.description}
                      onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="Describe package features and benefits..."
                      disabled={formLoading}
                    />
                  </div>

                  {/* Meal Sets Selection */}
                  <div className="border-t pt-6">
                    <h4 className="text-lg font-semibold mb-4 flex items-center">
                      <Package className="mr-2" size={20} />
                      Meal Sets in Package
                      <span className="ml-2 text-sm font-normal text-gray-600">
                        ({packageForm.mealSetIds.length} sets added)
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
                                  <p className="text-xs text-gray-600 truncate">{mealSet.description}</p>
                                  <p className="text-xs text-gray-500 mt-1">Rs {mealSet.price || 0}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => addMealSetToPackage(mealSet)}
                                  className="ml-2 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                  disabled={formLoading}
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
                        </h5>
                        {packageForm.mealSetIds.length === 0 ? (
                          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                            <Package size={32} className="mx-auto text-gray-400 mb-2" />
                            <p className="text-gray-500">No meal sets added yet</p>
                            <p className="text-sm text-gray-400">Add at least 1 meal set from the left panel</p>
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-80 overflow-y-auto p-2 border rounded-lg bg-gray-50">
                            {packageForm.mealSetIds.map((setId, index) => {
                              const mealSet = mealSets.find(s => s.setId === setId);
                              if (!mealSet) return null;
                              
                              return (
                                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <span className="font-medium text-sm">{mealSet.name}</span>
                                      <span className={`text-xs px-2 py-0.5 rounded ${mealSet.type === 'VEG' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {mealSet.type}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-600 truncate">{mealSet.description}</p>
                                    <p className="text-xs text-gray-500 mt-1">Rs {mealSet.price || 0}</p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeMealSetFromPackage(setId)}
                                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded disabled:opacity-50"
                                    disabled={formLoading}
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Package Summary */}
                  {packageForm.mealSetIds.length > 0 && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h5 className="font-medium text-gray-700 mb-2">Package Summary:</h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Duration:</span>
                          <span className="ml-2 font-medium">{packageForm.durationDays} days</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Price per day:</span>
                          <span className="ml-2 font-medium">Rs {packageForm.pricePerDay}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Total price:</span>
                          <span className="ml-2 font-medium">
                            Rs {(packageForm.pricePerDay * packageForm.durationDays).toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Meal sets:</span>
                          <span className="ml-2 font-medium">{packageForm.mealSetIds.length}</span>
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
                        disabled={formLoading}
                      />
                      <label htmlFor="package-availability" className="ml-2 text-sm text-gray-700">
                        Available for customers
                      </label>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4 border-t">
                    <button
                      type="submit"
                      disabled={formLoading || packageForm.mealSetIds.length === 0}
                      className={`flex-1 py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center ${packageForm.mealSetIds.length > 0 && !formLoading
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow'
                          : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        }`}
                    >
                      {formLoading ? (
                        <>
                          <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                          {editingPackage ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        editingPackage ? 'Update Package' : 'Create Package'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={resetPackageForm}
                      disabled={formLoading}
                      className="flex-1 bg-gray-200 text-gray-700 py-2.5 px-4 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
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
                    disabled={formLoading}
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
                        disabled={formLoading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type *
                      </label>
                      <select
                        value={mealSetForm.mealType}
                        onChange={(e) => setMealSetForm({ ...mealSetForm, mealType: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={formLoading}
                      >
                        <option value="VEG">Vegetarian</option>
                        <option value="NON_VEG">Non-Vegetarian</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price (Rs) *
                      </label>
                      <input
                        type="number"
                        value={mealSetForm.price}
                        onChange={(e) => setMealSetForm({ ...mealSetForm, price: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        step="0.01"
                        required
                        placeholder="e.g., 225.00"
                        disabled={formLoading}
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={mealSetForm.isAvailable}
                        onChange={(e) => setMealSetForm({ ...mealSetForm, isAvailable: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        id="set-availability"
                        disabled={formLoading}
                      />
                      <label htmlFor="set-availability" className="ml-2 text-sm text-gray-700">
                        Available for packages
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      value={mealSetForm.description}
                      onChange={(e) => setMealSetForm({ ...mealSetForm, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="4"
                      placeholder="Describe the meal items and details..."
                      required
                      disabled={formLoading}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Describe the meal set ingredients and preparation details.
                    </p>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      disabled={formLoading}
                      className={`flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm hover:shadow flex items-center justify-center ${formLoading ? 'opacity-50' : ''}`}
                    >
                      {formLoading ? (
                        <>
                          <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                          {editingMealSet ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        editingMealSet ? 'Update Meal Set' : 'Create Meal Set'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={resetMealSetForm}
                      disabled={formLoading}
                      className="flex-1 bg-gray-200 text-gray-700 py-2.5 px-4 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
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

export default MealManagement;