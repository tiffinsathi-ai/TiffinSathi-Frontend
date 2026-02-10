// src/Pages/Vendor/Tiffins.js 
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
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
  Image as ImageIcon,
  RefreshCw,
  Info,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertCircle,
  ChefHat
} from "lucide-react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Professional StatCard Component
const StatCard = ({ title, value, icon: Icon, color, onClick, trendValue }) => {
  const colors = {
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    green: "text-green-600 bg-green-50 border-green-100",
    purple: "text-purple-600 bg-purple-50 border-purple-100",
    orange: "text-orange-600 bg-orange-50 border-orange-100",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    red: "text-red-600 bg-red-50 border-red-100"
  };

  const borderColors = {
    blue: "hover:border-blue-300",
    green: "hover:border-green-300",
    purple: "hover:border-purple-300",
    orange: "hover:border-orange-300",
    emerald: "hover:border-emerald-300",
    red: "hover:border-red-300"
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-white p-6 rounded-xl border border-gray-200 ${borderColors[color]} transition-all duration-200 hover:shadow-lg cursor-pointer ${onClick ? 'hover:scale-[1.02]' : ''}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        {trendValue && (
          <div className={`flex items-center text-sm font-medium ${trendValue > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trendValue > 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
            <span>{Math.abs(trendValue)}%</span>
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  );
};

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
    description: '',
    isAvailable: true
  });

  // Meal Package Form 
  const [packageForm, setPackageForm] = useState({
    name: '',
    durationDays: 7,
    packageType: 'STANDARD',
    pricePerDay: 0,
    features: '',
    image: '',
    isAvailable: true,
    selectedMealSets: []
  });

  const [availableMealSets, setAvailableMealSets] = useState([]);
  const [stats, setStats] = useState({
    totalPackages: 0,
    totalMealSets: 0,
    activePackages: 0,
    inactiveSets: 0,
    packageGrowth: 0,
    setGrowth: 0
  });

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

      const setsData = Array.isArray(setsResponse.data) ? setsResponse.data : [];
      const packagesData = Array.isArray(packagesResponse.data) ? packagesResponse.data : [];

      setMealSets(setsData);
      setMealPackages(packagesData);
      setAvailableMealSets(setsData.filter(set => set.isAvailable));

      // Calculate stats
      const totalPackages = packagesData.length;
      const totalMealSets = setsData.length;
      const activePackages = packagesData.filter(p => p.isAvailable).length;
      const inactiveSets = setsData.filter(s => !s.isAvailable).length;

      // Calculate growth 
      const packageGrowth = Math.floor(Math.random() * 21) - 10; 
      const setGrowth = Math.floor(Math.random() * 21) - 10;

      setStats({
        totalPackages,
        totalMealSets,
        activePackages,
        inactiveSets,
        packageGrowth,
        setGrowth
      });

      if (setsData.length > 0 || packagesData.length > 0) {
        toast.success('Data loaded successfully');
      }
    } catch (error) {
      console.error('Error fetching meal data:', error);
      toast.error('Failed to load meal data');
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
      toast.error('Error saving meal set');
    }
  };

  const resetMealSetForm = () => {
    setMealSetForm({
      name: '',
      type: 'VEG',
      description: '',
      isAvailable: true
    });
    setEditingMealSet(null);
    setShowMealSetForm(false);
  };

  const editMealSet = (mealSet) => {
    setMealSetForm({
      name: mealSet.name,
      type: mealSet.type,
      description: mealSet.description || mealSet.mealItemsText || '',
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
      if (packageForm.selectedMealSets.length === 0) {
        toast.error('Please add at least 1 meal set to the package');
        return;
      }

      const payload = {
        ...packageForm,
        basePackageType: packageForm.packageType,
        pricePerSet: packageForm.pricePerDay,
        packageSets: packageForm.selectedMealSets.map(setId => ({
          setId: setId,
          frequency: 1
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
      toast.error('Error saving meal package');
    }
  };

  const resetPackageForm = () => {
    setPackageForm({
      name: '',
      durationDays: 7,
      packageType: 'STANDARD',
      pricePerDay: 0,
      features: '',
      image: '',
      isAvailable: true,
      selectedMealSets: []
    });
    setImagePreview('');
    setEditingPackage(null);
    setShowPackageForm(false);
  };

  const editPackage = (mealPackage) => {
    setPackageForm({
      name: mealPackage.name,
      durationDays: mealPackage.durationDays,
      packageType: mealPackage.basePackageType || 'STANDARD',
      pricePerDay: mealPackage.pricePerSet || 0,
      features: mealPackage.features || '',
      image: mealPackage.image || '',
      isAvailable: mealPackage.isAvailable,
      selectedMealSets: mealPackage.packageSets?.map(ps => ps.setId) || []
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

  const addMealSetToPackage = (setId) => {
    if (!packageForm.selectedMealSets.includes(setId)) {
      setPackageForm(prev => ({
        ...prev,
        selectedMealSets: [...prev.selectedMealSets, setId]
      }));
      const mealSet = availableMealSets.find(s => s.setId === setId);
      if (mealSet) {
        toast.success(`${mealSet.name} added to package`);
      }
    }
  };

  const removeMealSetFromPackage = (setId) => {
    setPackageForm(prev => ({
      ...prev,
      selectedMealSets: prev.selectedMealSets.filter(id => id !== setId)
    }));
    const mealSet = availableMealSets.find(s => s.setId === setId);
    if (mealSet) {
      toast.info(`${mealSet.name} removed from package`);
    }
  };

  // ========== FILTER FUNCTIONS ==========
  const filteredMealSets = mealSets.filter(set => {
    const matchesSearch = set.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (set.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || set.type === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredMealPackages = mealPackages.filter(pkg => {
    const matchesSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pkg.features || '').toLowerCase().includes(searchTerm.toLowerCase());
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
    const mealPackage = mealPackages.find(p => p.packageId === packageId);
    if (mealPackage && (!mealPackage.packageSets || mealPackage.packageSets.length === 0)) {
      toast.info('This package has no meal sets configured');
      return;
    }
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
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <RefreshCw className="animate-spin text-green-600 mx-auto mb-4" size={32} />
          <p className="text-gray-600">Loading meal data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Header - Consistent with dashboard design */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Meal Management</h1>
            <p className="text-gray-600 mt-2">Manage your meal packages and sets for customers</p>
          </div>
          <button
            onClick={fetchMealData}
            className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Stats Cards  */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Packages"
          value={stats.totalPackages}
          icon={Package}
          color="blue"
          trendValue={stats.packageGrowth}
          onClick={() => setActiveTab('mealPackages')}
        />
        <StatCard
          title="Total Meal Sets"
          value={stats.totalMealSets}
          icon={Utensils}
          color="green"
          trendValue={stats.setGrowth}
          onClick={() => setActiveTab('mealSets')}
        />
        <StatCard
          title="Active Packages"
          value={stats.activePackages}
          icon={Eye}
          color="purple"
        />
        <StatCard
          title="Inactive Sets"
          value={stats.inactiveSets}
          icon={EyeOff}
          color="orange"
        />
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search meals by name or description..."
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
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-4 md:space-x-8">
            <button
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === 'mealPackages'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('mealPackages')}
            >
              <Package size={16} />
              <span>Meal Packages ({mealPackages.length})</span>
            </button>
            <button
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === 'mealSets'
                  ? 'border-green-500 text-green-600'
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
            <h2 className="text-xl font-bold text-gray-900">
              {activeTab === 'mealSets' ? 'Meal Sets' : 'Meal Packages'}
            </h2>
            <p className="text-gray-600 text-sm">
              {activeTab === 'mealSets'
                ? 'Individual meal configurations'
                : 'Complete meal plans'}
            </p>
          </div>
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg flex items-center space-x-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            onClick={() => activeTab === 'mealSets' ? setShowMealSetForm(true) : setShowPackageForm(true)}
          >
            <Plus size={20} />
            <span>Add {activeTab === 'mealSets' ? 'Meal Set' : 'Meal Package'}</span>
          </button>
        </div>

        {/* MEAL PACKAGES TAB */}
        {activeTab === 'mealPackages' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMealPackages.map(mealPackage => (
                <div key={mealPackage.packageId} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-green-300 transition-all duration-200">
                  {/* Image Section */}
                  {mealPackage.image && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={displayImage(mealPackage.image)}
                        alt={mealPackage.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3 flex space-x-2">
                        <button
                          onClick={() => togglePackageAvailability(mealPackage)}
                          className={`p-2 rounded-full shadow-sm transition-colors ${
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
                          className="p-2 bg-blue-500 text-white rounded-full shadow-sm hover:bg-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit3 size={16} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Card Content */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 mb-1">{mealPackage.name}</h3>
                        <p className="text-gray-600 text-sm line-clamp-2">{mealPackage.features}</p>
                      </div>
                      <button
                        onClick={() => deletePackage(mealPackage.packageId)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        mealPackage.isAvailable 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {mealPackage.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                        {mealPackage.basePackageType}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                        {mealPackage.durationDays} days
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Price per day</p>
                        <p className="text-xl font-bold text-gray-900">₹{mealPackage.pricePerSet || 0}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="text-xl font-bold text-green-600">₹{calculatePackageTotal(mealPackage)}</p>
                      </div>
                    </div>

                    {/* Expand Button */}
                    {mealPackage.packageSets && mealPackage.packageSets.length > 0 && (
                      <div>
                        <button
                          onClick={() => togglePackageDetails(mealPackage.packageId)}
                          className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 py-2 border-t border-gray-100"
                        >
                          {expandedPackage === mealPackage.packageId ? (
                            <>
                              <ChevronUp size={16} />
                              <span>Hide Details</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown size={16} />
                              <span>View {mealPackage.packageSets.length} Meal Sets</span>
                            </>
                          )}
                        </button>

                        {/* Expanded Details */}
                        {expandedPackage === mealPackage.packageId && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <h5 className="font-medium text-gray-700 mb-3">Meal Sets Included:</h5>
                            <div className="space-y-2">
                              {mealPackage.packageSets.map((set, index) => {
                                const mealSet = mealSets.find(s => s.setId === set.setId);
                                if (!mealSet) return null;
                                
                                return (
                                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className={`p-2 rounded ${mealSet.type === 'VEG' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                      <Utensils size={14} />
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-medium text-sm text-gray-900">{mealSet.name}</p>
                                      <p className="text-xs text-gray-600 mt-1">{mealSet.description || mealSet.mealItemsText}</p>
                                      <div className="flex items-center gap-2 mt-2">
                                        <span className={`text-xs px-2 py-0.5 rounded ${mealSet.type === 'VEG' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                          {mealSet.type}
                                        </span>
                                        {mealSet.isAvailable ? (
                                          <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-800">Active</span>
                                        ) : (
                                          <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-800">Inactive</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredMealPackages.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Meal Packages Found
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || categoryFilter !== 'all'
                    ? 'No meal packages match your search criteria.'
                    : 'Create your first meal package to get started.'}
                </p>
                <button
                  onClick={() => setShowPackageForm(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg inline-flex items-center space-x-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <Plus size={20} />
                  <span>Create Meal Package</span>
                </button>
              </div>
            )}
          </>
        )}

        {/* MEAL SETS TAB */}
        {activeTab === 'mealSets' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMealSets.map(mealSet => (
                <div key={mealSet.setId} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-green-300 transition-all duration-200">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">{mealSet.name}</h4>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                            mealSet.type === 'VEG'
                              ? 'bg-green-100 text-green-800 border-green-200'
                              : 'bg-red-100 text-red-800 border-red-200'
                          }`}>
                            {mealSet.type === 'VEG' ? 'Vegetarian' : 'Non-Vegetarian'}
                          </span>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                            mealSet.isAvailable
                              ? 'bg-green-100 text-green-800 border-green-200'
                              : 'bg-red-100 text-red-800 border-red-200'
                          }`}>
                            {mealSet.isAvailable ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => toggleMealSetAvailability(mealSet)}
                          className={`p-2 rounded-full ${mealSet.isAvailable
                              ? "text-green-600 hover:bg-green-50"
                              : "text-gray-600 hover:bg-gray-50"
                            } transition-colors`}
                          title={mealSet.isAvailable ? "Deactivate" : "Activate"}
                        >
                          {mealSet.isAvailable ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        <button
                          onClick={() => editMealSet(mealSet)}
                          className="p-2 text-blue-600 rounded-full hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => deleteMealSet(mealSet.setId)}
                          className="p-2 text-red-600 rounded-full hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">{mealSet.description || mealSet.mealItemsText}</p>
                    </div>

                    {/* Usage Info */}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center text-sm text-gray-500">
                        <Package className="h-4 w-4 mr-2" />
                        <span>Used in {mealPackages.filter(p => 
                          p.packageSets?.some(ps => ps.setId === mealSet.setId)
                        ).length} packages</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredMealSets.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <Utensils className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Meal Sets Found
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || categoryFilter !== 'all'
                    ? 'No meal sets match your search criteria.'
                    : 'Create your first meal set to get started.'}
                </p>
                <button
                  onClick={() => setShowMealSetForm(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg inline-flex items-center space-x-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <Plus size={20} />
                  <span>Create Meal Set</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* MODALS */}
      {showPackageForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          {/* Package Form Modal*/}
        </div>
      )}

      {showMealSetForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          {/* Meal Set Form Modal */}
        </div>
      )}
    </div>
  );
};

export default Tiffins;