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
  Utensils,
  Info,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  RefreshCw,
  DollarSign
} from 'lucide-react';
import { toast } from 'react-toastify';

const MealManagement = () => {
  const [activeTab, setActiveTab] = useState('mealPackages');
  const [mealSets, setMealSets] = useState([]);
  const [mealPackages, setMealPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [expandedPackage, setExpandedPackage] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

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

  // Check mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    fetchMealData();
  }, []);

  const fetchMealData = useCallback(async () => {
    try {
      setLoading(true);
      // Mock data for demonstration - replace with actual API calls
      const mockMealSets = [
        { 
          setId: '1', 
          name: 'Healthy Breakfast', 
          type: 'VEG', 
          mealItemsText: 'Poha, Tea, Fruits', 
          isAvailable: true 
        },
        { 
          setId: '2', 
          name: 'Protein Lunch', 
          type: 'NON_VEG', 
          mealItemsText: 'Chicken Curry, Rice, Salad', 
          isAvailable: true 
        },
        { 
          setId: '3', 
          name: 'Vegan Dinner', 
          type: 'VEG', 
          mealItemsText: 'Dal, Roti, Sabzi', 
          isAvailable: false 
        }
      ];

      const mockMealPackages = [
        {
          packageId: 'P1',
          name: '7-Day Vegetarian Plan',
          durationDays: 7,
          basePackageType: 'STANDARD',
          pricePerSet: 200,
          features: 'Healthy vegetarian meals for a week',
          image: '',
          isAvailable: true,
          packageSets: [
            { setId: '1', frequency: 7, setName: 'Healthy Breakfast', type: 'VEG' }
          ]
        },
        {
          packageId: 'P2',
          name: 'Premium Non-Veg Combo',
          durationDays: 14,
          basePackageType: 'PREMIUM',
          pricePerSet: 350,
          features: 'Premium non-vegetarian meals with variety',
          image: '',
          isAvailable: true,
          packageSets: [
            { setId: '1', frequency: 7, setName: 'Healthy Breakfast', type: 'VEG' },
            { setId: '2', frequency: 7, setName: 'Protein Lunch', type: 'NON_VEG' }
          ]
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      setMealSets(mockMealSets);
      setMealPackages(mockMealPackages);
      setAvailableMealSets(mockMealSets.filter(set => set.isAvailable));

      toast.success('Data loaded successfully');
    } catch (error) {
      console.error('Error fetching meal data:', error);
      toast.error('Failed to load meal data');
    } finally {
      setLoading(false);
    }
  }, []);

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

  // Meal Set Functions
  const handleMealSetSubmit = async (e) => {
    e.preventDefault();
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success(editingMealSet ? 'Meal set updated successfully!' : 'Meal set created successfully!');
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

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));

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
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
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
    try {
      if (packageForm.packageSets.length === 0) {
        toast.error('Please add at least 1 meal set to the package');
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      toast.success(editingPackage ? 'Meal package updated successfully!' : 'Meal package created successfully!');
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

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
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
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
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

  // Filter functions
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

  // Stats Card Component
  const StatCard = ({ title, value, icon: Icon, color }) => {
    const colors = {
      blue: "bg-blue-50 border-blue-200",
      green: "bg-green-50 border-green-200",
      purple: "bg-purple-50 border-purple-200",
      orange: "bg-orange-50 border-orange-200"
    };

    const iconColors = {
      blue: "text-blue-600",
      green: "text-green-600",
      purple: "text-purple-600",
      orange: "text-orange-600"
    };

    return (
      <div className={`p-4 rounded-lg border ${colors[color] || colors.blue}`}>
        <div className="flex items-center">
          <div className="p-2 rounded-lg bg-white mr-3">
            <Icon className={`h-4 w-4 ${iconColors[color] || iconColors.blue}`} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-600">{title}</p>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <RefreshCw className="animate-spin text-green-600 mx-auto mb-2" size={24} />
          <div className="text-gray-600">Loading meal data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Meal Management</h2>
          <p className="text-gray-600 text-sm">Manage your meal packages and sets</p>
        </div>
        <button
          onClick={fetchMealData}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          title="Total Packages"
          value={mealPackages.length}
          icon={Package}
          color="blue"
        />
        <StatCard
          title="Total Meal Sets"
          value={mealSets.length}
          icon={Utensils}
          color="green"
        />
        <StatCard
          title="Active Packages"
          value={mealPackages.filter(p => p.isAvailable).length}
          icon={Eye}
          color="purple"
        />
        <StatCard
          title="Today's Revenue"
          value="₹2,850"
          icon={DollarSign}
          color="orange"
        />
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search meals..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-gray-500" />
              <select
                className="border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="VEG">Vegetarian</option>
                <option value="NON_VEG">Non-Vegetarian</option>
                <option value="STANDARD">Standard</option>
                <option value="PREMIUM">Premium</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-4 overflow-x-auto">
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'mealPackages'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('mealPackages')}
          >
            <Package size={16} className="inline mr-2" />
            Meal Packages ({mealPackages.length})
          </button>
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'mealSets'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('mealSets')}
          >
            <Utensils size={16} className="inline mr-2" />
            Meal Sets ({mealSets.length})
          </button>
        </nav>
      </div>

      {/* Action Button */}
      <div className="flex justify-end">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2"
          onClick={() => activeTab === 'mealSets' ? setShowMealSetForm(true) : setShowPackageForm(true)}
        >
          <Plus size={18} />
          Add {activeTab === 'mealSets' ? 'Meal Set' : 'Meal Package'}
        </button>
      </div>

      {/* Meal Packages Tab */}
      {activeTab === 'mealPackages' && (
        <>
          {/* Meal Packages Grid */}
          <div className="space-y-4">
            {filteredMealPackages.map(mealPackage => (
              <div key={mealPackage.packageId} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3">
                    <div className="flex-1 mb-2 sm:mb-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-lg font-semibold text-gray-900">{mealPackage.name}</h4>
                        <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {mealPackage.packageId}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{mealPackage.features}</p>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => togglePackageAvailability(mealPackage)}
                        className={`p-2 rounded-full ${mealPackage.isAvailable
                            ? "text-green-600 hover:bg-green-50"
                            : "text-gray-600 hover:bg-gray-50"
                          }`}
                      >
                        {mealPackage.isAvailable ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      <button
                        onClick={() => editPackage(mealPackage)}
                        className="p-2 text-blue-600 rounded-full hover:bg-blue-50"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => togglePackageDetails(mealPackage.packageId)}
                        className="p-2 text-gray-600 rounded-full hover:bg-gray-50"
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
                      ₹{mealPackage.pricePerSet}/set
                    </span>
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
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm text-gray-600">Total Package Price:</span>
                        <span className="text-lg font-bold text-green-600">₹{calculatePackageTotal(mealPackage)}</span>
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
              <p className="text-gray-600 mb-4">
                {searchTerm || categoryFilter !== 'all'
                  ? 'No meal packages match your search criteria.'
                  : 'Start by creating your first meal package'}
              </p>
              <button
                onClick={() => setShowPackageForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center space-x-2"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMealSets.map(mealSet => (
              <div key={mealSet.setId} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-4">
                  {/* Header with title and action buttons */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-lg font-semibold text-gray-900">{mealSet.name}</h4>
                        <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {mealSet.setId}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => toggleMealSetAvailability(mealSet)}
                        className={`p-2 rounded-full ${mealSet.isAvailable
                            ? "text-green-600 hover:bg-green-50"
                            : "text-gray-600 hover:bg-gray-50"
                          }`}
                      >
                        {mealSet.isAvailable ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      <button
                        onClick={() => editMealSet(mealSet)}
                        className="p-2 text-blue-600 rounded-full hover:bg-blue-50"
                      >
                        <Edit3 size={16} />
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
                      <p className="text-sm text-gray-600">{mealSet.mealItemsText}</p>
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
              <p className="text-gray-600 mb-4">
                {searchTerm || categoryFilter !== 'all'
                  ? 'No meal sets match your search criteria.'
                  : 'Start by creating your first meal set'}
              </p>
              <button
                onClick={() => setShowMealSetForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>Create Your First Meal Set</span>
              </button>
            </div>
          )}
        </>
      )}

      {/* Meal Package Form Modal */}
      {showPackageForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`bg-white rounded-xl w-full ${isMobile ? 'max-h-[90vh] overflow-y-auto' : 'max-w-2xl'} max-h-[90vh] overflow-y-auto`}>
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center z-10">
              <h3 className="text-lg font-bold text-gray-900">
                {editingPackage ? 'Edit Package' : 'New Package'}
              </h3>
              <button
                onClick={resetPackageForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handlePackageSubmit} className="p-4 space-y-4">
              <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
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
                    Price per Set (₹) *
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
                  rows="2"
                  placeholder="Describe package features..."
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Package Image (Optional)
                </label>
                <div className="flex items-center space-x-4">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <div className="text-center">
                        <ImageIcon size={20} className="mx-auto text-gray-400 mb-1" />
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
                        className="cursor-pointer inline-block px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
                      >
                        Upload Image
                      </label>
                      <p className="text-xs text-gray-500">
                        JPG, PNG up to 5MB
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
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  checked={packageForm.isAvailable}
                  onChange={(e) => setPackageForm({ ...packageForm, isAvailable: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  id="package-availability"
                />
                <label htmlFor="package-availability" className="text-sm text-gray-700">
                  Available for customers
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                <button
                  type="submit"
                  disabled={packageForm.packageSets.length === 0}
                  className={`flex-1 py-3 px-4 rounded-lg transition-all ${
                    packageForm.packageSets.length > 0
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  }`}
                >
                  {editingPackage ? 'Update Package' : 'Create Package'}
                </button>
                <button
                  type="button"
                  onClick={resetPackageForm}
                  className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Meal Set Form Modal */}
      {showMealSetForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center z-10">
              <h3 className="text-lg font-bold text-gray-900">
                {editingMealSet ? 'Edit Meal Set' : 'New Meal Set'}
              </h3>
              <button
                onClick={resetMealSetForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleMealSetSubmit} className="p-4 space-y-4">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meal Items *
                </label>
                <textarea
                  value={mealSetForm.mealItemsText}
                  onChange={(e) => setMealSetForm({ ...mealSetForm, mealItemsText: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Enter meal items separated by commas..."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Example: Poha, Tea, Fruits
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={mealSetForm.isAvailable}
                  onChange={(e) => setMealSetForm({ ...mealSetForm, isAvailable: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  id="set-availability"
                />
                <label htmlFor="set-availability" className="text-sm text-gray-700">
                  Available for packages
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700"
                >
                  {editingMealSet ? 'Update Meal Set' : 'Create Meal Set'}
                </button>
                <button
                  type="button"
                  onClick={resetMealSetForm}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealManagement;