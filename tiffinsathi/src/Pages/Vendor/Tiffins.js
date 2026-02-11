import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Edit3, 
  Eye, 
  EyeOff, 
  Package,
  Utensils,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Trash2,
  X,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  ChefHat,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../../helpers/api";

const Tiffins = () => {
  const [activeTab, setActiveTab] = useState('mealPackages');
  const [mealSets, setMealSets] = useState([]);
  const [mealPackages, setMealPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [expandedPackage, setExpandedPackage] = useState(null);
  const [error, setError] = useState(null);
  
  // Form states
  const [showMealSetForm, setShowMealSetForm] = useState(false);
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [editingMealSet, setEditingMealSet] = useState(null);
  const [editingPackage, setEditingPackage] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  
  // Form data
  const [mealSetForm, setMealSetForm] = useState({
    name: '',
    mealType: 'VEG', // Changed from 'type' to 'mealType' to match API
    description: '',
    price: '',
    isAvailable: true
  });
  
  const [packageForm, setPackageForm] = useState({
    name: '',
    durationDays: '7', // Changed from 'duration' to 'durationDays' to match API
    packageType: 'STANDARD',
    pricePerDay: '',
    description: '',
    isAvailable: true,
    mealSetIds: [] // Changed from 'selectedMealSets' to 'mealSetIds' to match API
  });
  
  const navigate = useNavigate();

  // ============================================
  // REAL API CALLS - REPLACING MOCK DATA
  // ============================================

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load meal sets and packages in parallel
      const [mealSetsResponse, mealPackagesResponse] = await Promise.all([
        api.mealSets.getVendorMealSets(),
        api.mealPackages.getVendorMealPackages()
      ]);

      // Transform meal sets data to match frontend expectations
      const transformedMealSets = (mealSetsResponse || []).map(set => ({
        id: set.id || set._id,
        name: set.name,
        type: set.mealType || set.type, // Map backend field to frontend
        description: set.description,
        price: set.price,
        isAvailable: set.isAvailable !== false
      }));

      // Transform meal packages data
      const transformedMealPackages = (mealPackagesResponse || []).map(pkg => {
        // Calculate total price if not provided
        const totalPrice = pkg.totalPrice || (pkg.pricePerDay * (pkg.durationDays || 7));
        
        return {
          id: pkg.id || pkg._id,
          name: pkg.name,
          packageType: pkg.packageType,
          description: pkg.description,
          pricePerDay: pkg.pricePerDay,
          duration: pkg.durationDays?.toString() || pkg.duration || '7', // Map to frontend 'duration'
          totalPrice,
          isAvailable: pkg.isAvailable !== false,
          mealSets: pkg.mealSetIds || pkg.mealSets || [] // Map to frontend 'mealSets'
        };
      });

      setMealSets(transformedMealSets);
      setMealPackages(transformedMealPackages);
    } catch (err) {
      console.error("Error loading data:", err);
      setError(err.message || "Failed to load data. Please try again.");
      // Set empty arrays instead of mock data
      setMealSets([]);
      setMealPackages([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // API CRUD OPERATIONS
  // ============================================

  // Meal Set Operations
  const handleMealSetSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);
    
    try {
      const mealSetData = {
        name: mealSetForm.name,
        mealType: mealSetForm.mealType, // Use mealType for API
        description: mealSetForm.description,
        price: Number(mealSetForm.price),
        isAvailable: mealSetForm.isAvailable
      };

      if (editingMealSet) {
        // Update existing meal set
        const updatedSet = await api.mealSets.updateMealSet(editingMealSet.id, mealSetData);
        setMealSets(prev => prev.map(set => 
          set.id === editingMealSet.id ? {
            ...set,
            ...mealSetData,
            type: mealSetData.mealType // Map back to frontend field
          } : set
        ));
      } else {
        // Create new meal set
        const newSet = await api.mealSets.createMealSet(mealSetData);
        setMealSets(prev => [...prev, {
          id: newSet.id || newSet._id,
          name: newSet.name,
          type: newSet.mealType || newSet.type,
          description: newSet.description,
          price: newSet.price,
          isAvailable: newSet.isAvailable !== false
        }]);
      }
      
      setShowMealSetForm(false);
      resetMealSetForm();
    } catch (err) {
      console.error("Error saving meal set:", err);
      setError(err.message || "Failed to save meal set. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  // Meal Package Operations
  const handlePackageSubmit = async (e) => {
    e.preventDefault();
    
    if (packageForm.mealSetIds.length === 0) {
      setError("Please select at least one meal set");
      return;
    }

    setFormLoading(true);
    setError(null);

    try {
      const packageData = {
        name: packageForm.name,
        durationDays: Number(packageForm.durationDays), // Use durationDays for API
        packageType: packageForm.packageType,
        pricePerDay: Number(packageForm.pricePerDay),
        description: packageForm.description,
        isAvailable: packageForm.isAvailable,
        mealSetIds: packageForm.mealSetIds // Use mealSetIds for API
      };

      if (editingPackage) {
        // Update existing package
        const updatedPackage = await api.mealPackages.updateMealPackage(editingPackage.id, packageData);
        setMealPackages(prev => prev.map(pkg => 
          pkg.id === editingPackage.id ? {
            ...pkg,
            ...packageData,
            duration: packageData.durationDays?.toString(),
            totalPrice: packageData.pricePerDay * packageData.durationDays,
            mealSets: packageData.mealSetIds
          } : pkg
        ));
      } else {
        // Create new package
        const newPackage = await api.mealPackages.createMealPackage(packageData);
        setMealPackages(prev => [...prev, {
          id: newPackage.id || newPackage._id,
          name: newPackage.name,
          packageType: newPackage.packageType,
          description: newPackage.description,
          pricePerDay: newPackage.pricePerDay,
          duration: newPackage.durationDays?.toString() || '7',
          totalPrice: newPackage.pricePerDay * (newPackage.durationDays || 7),
          isAvailable: newPackage.isAvailable !== false,
          mealSets: newPackage.mealSetIds || []
        }]);
      }
      
      setShowPackageForm(false);
      resetPackageForm();
    } catch (err) {
      console.error("Error saving meal package:", err);
      setError(err.message || "Failed to save meal package. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  const toggleMealSetAvailability = async (mealSet) => {
    try {
      const updatedAvailability = !mealSet.isAvailable;
      await api.mealSets.updateMealSet(mealSet.id, {
        ...mealSet,
        mealType: mealSet.type, // Map to backend field
        isAvailable: updatedAvailability
      });
      
      setMealSets(prev => prev.map(set => 
        set.id === mealSet.id ? { ...set, isAvailable: updatedAvailability } : set
      ));
    } catch (err) {
      console.error("Error updating meal set availability:", err);
      setError("Failed to update meal set availability");
    }
  };

  const togglePackageAvailability = async (mealPackage) => {
    try {
      const updatedAvailability = !mealPackage.isAvailable;
      
      // Prepare package data for API
      const packageData = {
        name: mealPackage.name,
        durationDays: Number(mealPackage.duration),
        packageType: mealPackage.packageType,
        pricePerDay: mealPackage.pricePerDay,
        description: mealPackage.description,
        isAvailable: updatedAvailability,
        mealSetIds: mealPackage.mealSets
      };
      
      await api.mealPackages.updateMealPackage(mealPackage.id, packageData);
      
      setMealPackages(prev => prev.map(pkg => 
        pkg.id === mealPackage.id ? { ...pkg, isAvailable: updatedAvailability } : pkg
      ));
    } catch (err) {
      console.error("Error updating package availability:", err);
      setError("Failed to update package availability");
    }
  };

  const deleteMealSet = async (id) => {
    if (!window.confirm('Are you sure you want to delete this meal set?')) return;
    
    try {
      await api.mealSets.deleteMealSet(id);
      setMealSets(prev => prev.filter(set => set.id !== id));
    } catch (err) {
      console.error("Error deleting meal set:", err);
      setError("Failed to delete meal set");
    }
  };

  const deletePackage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this meal package?')) return;
    
    try {
      await api.mealPackages.deleteMealPackage(id);
      setMealPackages(prev => prev.filter(pkg => pkg.id !== id));
    } catch (err) {
      console.error("Error deleting meal package:", err);
      setError("Failed to delete meal package");
    }
  };

  const editMealSet = (mealSet) => {
    setMealSetForm({
      name: mealSet.name,
      mealType: mealSet.type, // Map to backend field
      description: mealSet.description,
      price: mealSet.price,
      isAvailable: mealSet.isAvailable
    });
    setEditingMealSet(mealSet);
    setShowMealSetForm(true);
  };

  const editPackage = (mealPackage) => {
    setPackageForm({
      name: mealPackage.name,
      durationDays: mealPackage.duration, // Map to backend field
      packageType: mealPackage.packageType,
      pricePerDay: mealPackage.pricePerDay,
      description: mealPackage.description,
      isAvailable: mealPackage.isAvailable,
      mealSetIds: mealPackage.mealSets // Map to backend field
    });
    setEditingPackage(mealPackage);
    setShowPackageForm(true);
  };

  const resetMealSetForm = () => {
    setMealSetForm({
      name: '',
      mealType: 'VEG',
      description: '',
      price: '',
      isAvailable: true
    });
    setEditingMealSet(null);
  };

  const resetPackageForm = () => {
    setPackageForm({
      name: '',
      durationDays: '7',
      packageType: 'STANDARD',
      pricePerDay: '',
      description: '',
      isAvailable: true,
      mealSetIds: []
    });
    setEditingPackage(null);
  };

  // ============================================
  // COMPONENTS (UPDATED TO REMOVE UNSUPPORTED FIELDS)
  // ============================================

  const CompactStatCard = ({ title, value, icon: Icon, color, onClick, description }) => {
    const colorClasses = {
      blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100 hover:border-blue-300" },
      green: { bg: "bg-green-50", text: "text-green-600", border: "border-green-100 hover:border-green-300" },
      purple: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100 hover:border-purple-300" },
      orange: { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-100 hover:border-orange-300" },
    };

    const colors = colorClasses[color] || colorClasses.blue;

    return (
      <div 
        className={`bg-white p-4 rounded-lg border ${colors.border} hover:shadow-sm transition-all duration-200 ${onClick ? 'cursor-pointer' : ''}`}
        onClick={onClick}
      >
        <div className="flex items-center justify-between mb-2">
          <div className={`p-2 rounded-lg ${colors.bg} ${colors.text}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-1">{value}</h3>
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
    );
  };

  // Updated Meal Set Card - Removed unsupported fields
  const MealSetCard = ({ mealSet }) => {
    const handleAction = (e, action) => {
      e.stopPropagation();
      e.preventDefault();
      action();
    };

    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-green-300 transition-all duration-200">
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-bold text-lg text-gray-900">{mealSet.name}</h3>
                <span className={`px-2 py-1 rounded text-xs font-medium ${mealSet.type === 'VEG' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {mealSet.type}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${mealSet.isAvailable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {mealSet.isAvailable ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">{mealSet.description}</p>
            </div>
            <div className="flex items-center space-x-1 ml-2">
              <div
                onClick={(e) => handleAction(e, () => toggleMealSetAvailability(mealSet))}
                className={`p-2 rounded-lg cursor-pointer ${mealSet.isAvailable ? 'text-green-600 hover:bg-green-50' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                {mealSet.isAvailable ? <Eye size={18} /> : <EyeOff size={18} />}
              </div>
              <div
                onClick={(e) => handleAction(e, () => editMealSet(mealSet))}
                className="p-2 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-50"
              >
                <Edit3 size={18} />
              </div>
              <div
                onClick={(e) => handleAction(e, () => deleteMealSet(mealSet.id))}
                className="p-2 text-red-600 rounded-lg cursor-pointer hover:bg-red-50"
              >
                <Trash2 size={18} />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center">
              <span className="font-bold text-gray-900">Rs. {mealSet.price}</span>
            </div>
            {/* Removed tags display as not supported by API */}
          </div>
        </div>
      </div>
    );
  };

  // Updated Meal Package Card - Removed unsupported fields (image, features, subscriptionCount)
  const MealPackageCard = ({ mealPackage }) => {
    const handleAction = (e, action) => {
      e.stopPropagation();
      e.preventDefault();
      action();
    };

    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-green-300 transition-all duration-200">
        <div className="flex flex-col md:flex-row">
          {/* Removed image section as API doesn't support package images */}
          <div className="md:w-2/3 lg:w-3/4 p-5">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-lg text-gray-900">{mealPackage.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    mealPackage.packageType === 'PREMIUM' ? 'bg-purple-100 text-purple-800' :
                    mealPackage.packageType === 'DELUXE' ? 'bg-amber-100 text-amber-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {mealPackage.packageType}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    mealPackage.isAvailable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {mealPackage.isAvailable ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">{mealPackage.description}</p>
              </div>
              <div className="flex items-center space-x-1 ml-2">
                <div
                  onClick={(e) => handleAction(e, () => togglePackageAvailability(mealPackage))}
                  className={`p-2 rounded-lg cursor-pointer ${mealPackage.isAvailable ? 'text-green-600 hover:bg-green-50' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {mealPackage.isAvailable ? <Eye size={18} /> : <EyeOff size={18} />}
                </div>
                <div
                  onClick={(e) => handleAction(e, () => editPackage(mealPackage))}
                  className="p-2 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-50"
                >
                  <Edit3 size={18} />
                </div>
                <div
                  onClick={(e) => handleAction(e, () => deletePackage(mealPackage.id))}
                  className="p-2 text-red-600 rounded-lg cursor-pointer hover:bg-red-50"
                >
                  <Trash2 size={18} />
                </div>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setExpandedPackage(prev => prev === mealPackage.id ? null : mealPackage.id);
                  }}
                  className="p-2 text-gray-600 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  {expandedPackage === mealPackage.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Price/Day</p>
                <p className="font-bold text-gray-900">Rs. {mealPackage.pricePerDay}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Duration</p>
                <p className="font-medium text-gray-900">{mealPackage.duration} days</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Total Price</p>
                <p className="font-bold text-green-600">Rs. {mealPackage.totalPrice}</p>
              </div>
            </div>

            {/* Removed features display as not supported by API */}

            {expandedPackage === mealPackage.id && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Included Meal Sets:</h4>
                <div className="space-y-2">
                  {mealPackage.mealSets && mealPackage.mealSets.length > 0 ? (
                    mealPackage.mealSets.map((setId, index) => {
                      const mealSet = mealSets.find(s => s.id === setId);
                      if (!mealSet) return null;
                      return (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded bg-gray-200 flex items-center justify-center">
                              <Utensils className="h-4 w-4 text-gray-500" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{mealSet.name}</p>
                              <p className="text-xs text-gray-600">Rs. {mealSet.price}</p>
                            </div>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded ${mealSet.type === 'VEG' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {mealSet.type}
                          </span>
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
    );
  };

  // Filter functions
  const filteredMealSets = mealSets.filter(set => {
    const matchesSearch = set.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      set.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (set.id && set.id.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || set.type === categoryFilter;
    
    if (categoryFilter === 'ACTIVE_ONLY') {
      return matchesSearch && set.isAvailable;
    }
    
    return matchesSearch && matchesCategory;
  });

  const filteredMealPackages = mealPackages.filter(pkg => {
    const matchesSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pkg.id && pkg.id.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesCategory = true;
    if (categoryFilter === 'ACTIVE_ONLY') {
      matchesCategory = pkg.isAvailable;
    } else if (categoryFilter !== 'all') {
      matchesCategory = pkg.packageType === categoryFilter;
    }
    
    return matchesSearch && matchesCategory;
  });

  // Calculate stats from current data
  const calculateStats = () => {
    const totalPackages = mealPackages.length;
    const totalMealSets = mealSets.length;
    const activePackages = mealPackages.filter(p => p.isAvailable).length;
    const activeMealSets = mealSets.filter(s => s.isAvailable).length;
    
    return {
      totalPackages,
      totalMealSets,
      activePackages,
      activeMealSets
    };
  };

  const stats = calculateStats();

  // ============================================
  // RENDER
  // ============================================

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <RefreshCw className="animate-spin text-green-600 mb-4" size={32} />
        <p className="text-gray-600">Loading menu data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
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
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
            <p className="text-gray-600 mt-1">Manage your meal sets and packages</p>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CompactStatCard
          title="Total Meal Packages"
          value={stats.totalPackages}
          icon={Package}
          color="blue"
          onClick={() => {
            setActiveTab('mealPackages');
            setCategoryFilter('all');
          }}
        />
        <CompactStatCard
          title="Total Meal Sets"
          value={stats.totalMealSets}
          icon={Utensils}
          color="green"
          onClick={() => {
            setActiveTab('mealSets');
            setCategoryFilter('all');
          }}
        />
        <CompactStatCard
          title="Active Packages"
          value={stats.activePackages}
          icon={Eye}
          color="purple"
          onClick={() => {
            setActiveTab('mealPackages');
            setCategoryFilter('ACTIVE_ONLY');
          }}
        />
        <CompactStatCard
          title="Active Meal Sets"
          value={stats.activeMealSets}
          icon={CheckCircle}
          color="orange"
          onClick={() => {
            setActiveTab('mealSets');
            setCategoryFilter('ACTIVE_ONLY');
          }}
        />
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={`Search ${activeTab === 'mealSets' ? 'meal sets' : 'meal packages'} by name or description...`}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-500" />
            <select
              className="border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {activeTab === 'mealSets' ? (
                <>
                  <option value="VEG">Vegetarian</option>
                  <option value="NON_VEG">Non-Vegetarian</option>
                  <option value="ACTIVE_ONLY">Active Only</option>
                </>
              ) : (
                <>
                  <option value="STANDARD">Standard</option>
                  <option value="PREMIUM">Premium</option>
                  <option value="DELUXE">Deluxe</option>
                  <option value="ACTIVE_ONLY">Active Only</option>
                </>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs and Content */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6 pt-6">
            <button
              className={`pb-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === 'mealPackages'
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab('mealPackages')}
            >
              <Package size={16} />
              <span>Meal Packages ({mealPackages.length})</span>
            </button>
            <button
              className={`pb-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === 'mealSets'
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab('mealSets')}
            >
              <Utensils size={16} />
              <span>Meal Sets ({mealSets.length})</span>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {activeTab === 'mealSets' ? 'Meal Sets' : 'Meal Packages'}
              </h2>
              <p className="text-gray-600 text-sm">
                {activeTab === 'mealSets'
                  ? 'Individual meal configurations'
                  : 'Complete meal plans for subscriptions'}
              </p>
            </div>
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg flex items-center space-x-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              onClick={() => activeTab === 'mealSets' ? setShowMealSetForm(true) : setShowPackageForm(true)}
              disabled={formLoading}
            >
              <Plus size={20} />
              <span>Add {activeTab === 'mealSets' ? 'Meal Set' : 'Meal Package'}</span>
            </button>
          </div>

          {/* Content */}
          {activeTab === 'mealSets' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredMealSets.length > 0 ? (
                filteredMealSets.map(mealSet => (
                  <MealSetCard key={mealSet.id} mealSet={mealSet} />
                ))
              ) : (
                <div className="col-span-2 text-center py-12">
                  <ChefHat className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {searchTerm || categoryFilter !== 'all' ? 'No meal sets found' : 'No meal sets yet'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm || categoryFilter !== 'all'
                      ? 'Try adjusting your search or filter criteria'
                      : 'Create your first meal set to get started'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredMealPackages.length > 0 ? (
                filteredMealPackages.map(mealPackage => (
                  <MealPackageCard key={mealPackage.id} mealPackage={mealPackage} />
                ))
              ) : (
                <div className="text-center py-12">
                  <ChefHat className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {searchTerm || categoryFilter !== 'all' ? 'No packages found' : 'No meal packages yet'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm || categoryFilter !== 'all'
                      ? 'Try adjusting your search or filter criteria'
                      : 'Create your first meal package to get started'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

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
                    {editingMealSet ? 'Update meal set details' : 'Add new meal set to your menu'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowMealSetForm(false);
                    resetMealSetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors"
                  disabled={formLoading}
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleMealSetSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      value={mealSetForm.name}
                      onChange={(e) => setMealSetForm({ ...mealSetForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                      placeholder="e.g., Veg Thali"
                      disabled={formLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                    <select
                      value={mealSetForm.mealType}
                      onChange={(e) => setMealSetForm({ ...mealSetForm, mealType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      disabled={formLoading}
                    >
                      <option value="VEG">Vegetarian</option>
                      <option value="NON_VEG">Non-Vegetarian</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rs.) *</label>
                    <input
                      type="number"
                      value={mealSetForm.price}
                      onChange={(e) => setMealSetForm({ ...mealSetForm, price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                      placeholder="225"
                      disabled={formLoading}
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={mealSetForm.isAvailable}
                      onChange={(e) => setMealSetForm({ ...mealSetForm, isAvailable: e.target.checked })}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      id="set-availability"
                      disabled={formLoading}
                    />
                    <label htmlFor="set-availability" className="ml-2 text-sm text-gray-700">
                      Available for orders
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    value={mealSetForm.description}
                    onChange={(e) => setMealSetForm({ ...mealSetForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows="4"
                    required
                    placeholder="Describe the meal set ingredients and details..."
                    disabled={formLoading}
                  />
                </div>

                <div className="flex space-x-3 pt-4 border-t">
                  <button
                    type="submit"
                    disabled={formLoading}
                    className={`flex-1 bg-green-600 text-white py-2.5 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center ${
                      formLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
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
                    onClick={() => {
                      setShowMealSetForm(false);
                      resetMealSetForm();
                    }}
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

      {/* Package Form Modal - REMOVED IMAGE UPLOAD */}
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
                    {editingPackage ? 'Update package details' : 'Create new meal package for subscriptions'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowPackageForm(false);
                    resetPackageForm();
                  }}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors"
                  disabled={formLoading}
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handlePackageSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Package Name *</label>
                    <input
                      type="text"
                      value={packageForm.name}
                      onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                      placeholder="e.g., Weekly Vegetarian Plan"
                      disabled={formLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Package Type *</label>
                    <select
                      value={packageForm.packageType}
                      onChange={(e) => setPackageForm({ ...packageForm, packageType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      disabled={formLoading}
                    >
                      <option value="STANDARD">Standard</option>
                      <option value="PREMIUM">Premium</option>
                      <option value="DELUXE">Deluxe</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (days) *</label>
                    <select
                      value={packageForm.durationDays}
                      onChange={(e) => setPackageForm({ ...packageForm, durationDays: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      disabled={formLoading}
                    >
                      <option value="7">7 days</option>
                      <option value="15">15 days</option>
                      <option value="30">30 days</option>
                      <option value="90">90 days</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price per Day (Rs.) *</label>
                    <input
                      type="number"
                      value={packageForm.pricePerDay}
                      onChange={(e) => setPackageForm({ ...packageForm, pricePerDay: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                      placeholder="210"
                      disabled={formLoading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    value={packageForm.description}
                    onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows="3"
                    required
                    placeholder="Describe the package features and benefits..."
                    disabled={formLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Meal Sets *</label>
                  {mealSets.filter(set => set.isAvailable).length === 0 ? (
                    <div className="text-center py-4 border border-gray-300 rounded-lg">
                      <p className="text-gray-600">No active meal sets available.</p>
                      <p className="text-sm text-gray-500 mt-1">Create meal sets first to include in packages.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                      {mealSets.filter(set => set.isAvailable).map(mealSet => (
                        <div key={mealSet.id} className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={packageForm.mealSetIds.includes(mealSet.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setPackageForm(prev => ({
                                  ...prev,
                                  mealSetIds: [...prev.mealSetIds, mealSet.id]
                                }));
                              } else {
                                setPackageForm(prev => ({
                                  ...prev,
                                  mealSetIds: prev.mealSetIds.filter(id => id !== mealSet.id)
                                }));
                              }
                            }}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                            id={`meal-set-${mealSet.id}`}
                            disabled={formLoading}
                          />
                          <label htmlFor={`meal-set-${mealSet.id}`} className="ml-3 flex-1 cursor-pointer">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center">
                                  <Utensils className="h-5 w-5 text-gray-500" />
                                </div>
                                <div>
                                  <span className="font-medium text-sm text-gray-900">{mealSet.name}</span>
                                  <p className="text-xs text-gray-500">Rs. {mealSet.price}</p>
                                </div>
                              </div>
                              <span className={`text-xs px-2 py-0.5 rounded ${mealSet.type === 'VEG' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {mealSet.type}
                              </span>
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={packageForm.isAvailable}
                    onChange={(e) => setPackageForm({ ...packageForm, isAvailable: e.target.checked })}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    id="package-availability"
                    disabled={formLoading}
                  />
                  <label htmlFor="package-availability" className="ml-2 text-sm text-gray-700">
                    Available for subscriptions
                  </label>
                </div>

                <div className="flex space-x-3 pt-4 border-t">
                  <button
                    type="submit"
                    disabled={formLoading || packageForm.mealSetIds.length === 0}
                    className={`flex-1 py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center ${
                      packageForm.mealSetIds.length > 0 && !formLoading
                        ? 'bg-green-600 text-white hover:bg-green-700'
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
                    onClick={() => {
                      setShowPackageForm(false);
                      resetPackageForm();
                    }}
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
  );
};

export default Tiffins;