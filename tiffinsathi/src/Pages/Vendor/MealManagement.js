import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MealManagement = () => {
  const [activeTab, setActiveTab] = useState('mealSets');
  const [mealSets, setMealSets] = useState([]);
  const [mealPackages, setMealPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMealSetForm, setShowMealSetForm] = useState(false);
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [editingMealSet, setEditingMealSet] = useState(null);
  const [editingPackage, setEditingPackage] = useState(null);

  // Meal Set Form State
  const [mealSetForm, setMealSetForm] = useState({
    setId: '',
    name: '',
    type: 'VEG',
    mealItemsText: '',
    isAvailable: true
  });

  // Meal Package Form State
  const [packageForm, setPackageForm] = useState({
    packageId: '',
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
  const [imagePreview, setImagePreview] = useState('');
  const [currentImage, setCurrentImage] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchMealData();
  }, []);

  const fetchMealData = async () => {
    try {
      setLoading(true);
      const [setsResponse, packagesResponse] = await Promise.all([
        axios.get('/api/meal-sets/vendor/my-sets', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/meal-packages/vendor/my-packages', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setMealSets(setsResponse.data);
      setMealPackages(packagesResponse.data);
      setAvailableMealSets(setsResponse.data.filter(set => set.isAvailable));
    } catch (error) {
      console.error('Error fetching meal data:', error);
      alert('Error loading meal data');
    } finally {
      setLoading(false);
    }
  };

  // Image handling functions
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setPackageForm({ ...packageForm, image: base64String });
        setImagePreview(base64String);
      };
      reader.onerror = () => {
        alert('Error reading file');
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
      if (editingMealSet) {
        await axios.put(`/api/meal-sets/vendor/${mealSetForm.setId}`, mealSetForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Meal set updated successfully!');
      } else {
        await axios.post('/api/meal-sets', mealSetForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Meal set created successfully!');
      }
      resetMealSetForm();
      fetchMealData();
    } catch (error) {
      console.error('Error saving meal set:', error);
      alert('Error saving meal set: ' + (error.response?.data || error.message));
    }
  };

  const resetMealSetForm = () => {
    setMealSetForm({
      setId: '',
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
      setId: mealSet.setId,
      name: mealSet.name,
      type: mealSet.type,
      mealItemsText: mealSet.mealItemsText,
      isAvailable: mealSet.isAvailable
    });
    setEditingMealSet(mealSet);
    setShowMealSetForm(true);
  };

  const toggleMealSetAvailability = async (setId) => {
    try {
      await axios.put(`/api/meal-sets/vendor/${setId}/toggle-availability`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Meal set availability updated!');
      fetchMealData();
    } catch (error) {
      console.error('Error toggling meal set:', error);
      alert('Error updating meal set');
    }
  };

  const deleteMealSet = async (setId) => {
    if (window.confirm('Are you sure you want to delete this meal set?')) {
      try {
        await axios.delete(`/api/meal-sets/vendor/${setId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Meal set deleted successfully!');
        fetchMealData();
      } catch (error) {
        console.error('Error deleting meal set:', error);
        alert('Error deleting meal set');
      }
    }
  };

  // Meal Package Functions
  const handlePackageSubmit = async (e) => {
    e.preventDefault();
    try {
      if (packageForm.packageSets.length === 0) {
        alert('Please add at least 1 meal set to the package');
        return;
      }

      if (editingPackage) {
        await axios.put(`/api/meal-packages/vendor/${packageForm.packageId}`, packageForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Meal package updated successfully!');
      } else {
        await axios.post('/api/meal-packages', packageForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Meal package created successfully!');
      }
      resetPackageForm();
      fetchMealData();
    } catch (error) {
      console.error('Error saving meal package:', error);
      alert('Error saving meal package: ' + (error.response?.data || error.message));
    }
  };

  const resetPackageForm = () => {
    setPackageForm({
      packageId: '',
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
    setCurrentImage('');
    setEditingPackage(null);
    setShowPackageForm(false);
  };

  const editPackage = (mealPackage) => {
    setPackageForm({
      packageId: mealPackage.packageId,
      name: mealPackage.name,
      durationDays: mealPackage.durationDays,
      basePackageType: mealPackage.basePackageType,
      pricePerSet: mealPackage.pricePerSet,
      features: mealPackage.features || '',
      image: mealPackage.image || '',
      isAvailable: mealPackage.isAvailable,
      packageSets: mealPackage.packageSets || []
    });
    
    // Set image previews
    if (mealPackage.image) {
      setCurrentImage(mealPackage.image);
      setImagePreview(mealPackage.image);
    } else {
      setCurrentImage('');
      setImagePreview('');
    }
    
    setEditingPackage(mealPackage);
    setShowPackageForm(true);
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
    } else {
      setPackageForm(prev => ({
        ...prev,
        packageSets: [
          ...prev.packageSets,
          {
            setId: mealSet.setId,
            frequency: 1,
            setName: mealSet.name,
            mealItemsText: mealSet.mealItemsText,
            type: mealSet.type
          }
        ]
      }));
    }
  };

  const removeMealSetFromPackage = (setId) => {
    setPackageForm(prev => ({
      ...prev,
      packageSets: prev.packageSets.filter(ps => ps.setId !== setId)
    }));
  };

  const updateMealSetFrequency = (setId, frequency) => {
    setPackageForm(prev => ({
      ...prev,
      packageSets: prev.packageSets.map(ps =>
        ps.setId === setId ? { ...ps, frequency: parseInt(frequency) || 1 } : ps
      )
    }));
  };

  const togglePackageAvailability = async (packageId) => {
    try {
      await axios.put(`/api/meal-packages/vendor/${packageId}/toggle-availability`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Meal package availability updated!');
      fetchMealData();
    } catch (error) {
      console.error('Error toggling meal package:', error);
      alert('Error updating meal package');
    }
  };

  const deletePackage = async (packageId) => {
    if (window.confirm('Are you sure you want to delete this meal package?')) {
      try {
        await axios.delete(`/api/meal-packages/vendor/${packageId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Meal package deleted successfully!');
        fetchMealData();
      } catch (error) {
        console.error('Error deleting meal package:', error);
        alert('Error deleting meal package');
      }
    }
  };

  // Function to display base64 image
  const displayImage = (base64String) => {
    if (!base64String) return null;
    
    // Check if it's already a data URL
    if (base64String.startsWith('data:')) {
      return base64String;
    }
    
    // Convert plain base64 to data URL
    return `data:image/jpeg;base64,${base64String}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading meal data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Meal Management</h1>
          <p className="text-gray-600 mt-2">
            Manage your meal sets and create packages for customers
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'mealSets'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('mealSets')}
            >
              Meal Sets ({mealSets.length})
            </button>
            <button
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'mealPackages'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('mealPackages')}
            >
              Meal Packages ({mealPackages.length})
            </button>
          </nav>
        </div>

        {/* Meal Sets Tab - This part remains the same as your existing code */}
        {activeTab === 'mealSets' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Meal Sets</h2>
                <p className="text-gray-600">Individual meal configurations</p>
              </div>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => setShowMealSetForm(true)}
              >
                + Add Meal Set
              </button>
            </div>

            {/* Meal Set Form Modal - This part remains the same */}
            {showMealSetForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-4">
                      {editingMealSet ? 'Edit Meal Set' : 'Create New Meal Set'}
                    </h3>
                    <form onSubmit={handleMealSetSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Set ID
                        </label>
                        <input
                          type="text"
                          value={mealSetForm.setId}
                          onChange={(e) => setMealSetForm({...mealSetForm, setId: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                          disabled={!!editingMealSet}
                          placeholder="e.g., BREAKFAST_01"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          value={mealSetForm.name}
                          onChange={(e) => setMealSetForm({...mealSetForm, name: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                          placeholder="e.g., Healthy Breakfast"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Type
                        </label>
                        <select
                          value={mealSetForm.type}
                          onChange={(e) => setMealSetForm({...mealSetForm, type: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="VEG">Vegetarian</option>
                          <option value="NON_VEG">Non-Vegetarian</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Meal Items
                        </label>
                        <textarea
                          value={mealSetForm.mealItemsText}
                          onChange={(e) => setMealSetForm({...mealSetForm, mealItemsText: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows="4"
                          placeholder="Enter meal items separated by commas (e.g., Poha, Tea, Fruits)"
                          required
                        />
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={mealSetForm.isAvailable}
                          onChange={(e) => setMealSetForm({...mealSetForm, isAvailable: e.target.checked})}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 text-sm text-gray-700">
                          Available for packages
                        </label>
                      </div>

                      <div className="flex space-x-3 pt-4">
                        <button
                          type="submit"
                          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                        >
                          {editingMealSet ? 'Update' : 'Create'} Meal Set
                        </button>
                        <button
                          type="button"
                          onClick={resetMealSetForm}
                          className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Meal Sets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mealSets.map(mealSet => (
                <div key={mealSet.setId} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">{mealSet.name}</h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      mealSet.type === 'VEG' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {mealSet.type}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">ID:</span> {mealSet.setId}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Items:</span> {mealSet.mealItemsText}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Status:</span>{' '}
                      <span className={`${
                        mealSet.isAvailable ? 'text-green-600' : 'text-red-600'
                      } font-medium`}>
                        {mealSet.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => editMealSet(mealSet)}
                      className="flex-1 bg-yellow-500 text-white py-2 px-3 rounded text-sm hover:bg-yellow-600 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleMealSetAvailability(mealSet.setId)}
                      className={`flex-1 py-2 px-3 rounded text-sm transition-colors ${
                        mealSet.isAvailable
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                    >
                      {mealSet.isAvailable ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => deleteMealSet(mealSet.setId)}
                      className="flex-1 bg-red-600 text-white py-2 px-3 rounded text-sm hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {mealSets.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🍽️</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No meal sets yet</h3>
                <p className="text-gray-600 mb-4">Create your first meal set to get started</p>
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => setShowMealSetForm(true)}
                >
                  Create Meal Set
                </button>
              </div>
            )}
          </div>
        )}

        {/* Meal Packages Tab */}
        {activeTab === 'mealPackages' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Meal Packages</h2>
                <p className="text-gray-600">Complete meal plans combining multiple sets</p>
              </div>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => setShowPackageForm(true)}
              >
                + Add Meal Package
              </button>
            </div>

            {/* Meal Package Form Modal */}
            {showPackageForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-4">
                      {editingPackage ? 'Edit Meal Package' : 'Create New Meal Package'}
                    </h3>
                    
                    <form onSubmit={handlePackageSubmit} className="space-y-6">
                      {/* Basic Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Package ID
                          </label>
                          <input
                            type="text"
                            value={packageForm.packageId}
                            onChange={(e) => setPackageForm({...packageForm, packageId: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            disabled={!!editingPackage}
                            placeholder="e.g., PKG_7DAY_VEG"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Package Name
                          </label>
                          <input
                            type="text"
                            value={packageForm.name}
                            onChange={(e) => setPackageForm({...packageForm, name: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            placeholder="e.g., 7-Day Vegetarian Plan"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Duration (days)
                          </label>
                          <input
                            type="number"
                            value={packageForm.durationDays}
                            onChange={(e) => setPackageForm({...packageForm, durationDays: parseInt(e.target.value)})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="1"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Package Type
                          </label>
                          <select
                            value={packageForm.basePackageType}
                            onChange={(e) => setPackageForm({...packageForm, basePackageType: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="STANDARD">Standard</option>
                            <option value="PREMIUM">Premium</option>
                            <option value="DELUXE">Deluxe</option>
                            <option value="CUSTOM">Custom</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Price per Set (₹)
                          </label>
                          <input
                            type="number"
                            value={packageForm.pricePerSet}
                            onChange={(e) => setPackageForm({...packageForm, pricePerSet: parseFloat(e.target.value)})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                          onChange={(e) => setPackageForm({...packageForm, features: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows="3"
                          placeholder="Describe package features and benefits"
                        />
                      </div>

                      {/* Image Upload */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Package Image
                        </label>
                        
                        {/* Show current image when editing */}
                        {editingPackage && currentImage && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">Current Image:</p>
                            <div className="relative inline-block">
                              <img
                                src={displayImage(currentImage)}
                                alt="Current package"
                                className="h-32 w-32 object-cover rounded-lg border"
                              />
                            </div>
                          </div>
                        )}

                        <div className="mt-1 flex items-center">
                          {imagePreview ? (
                            <div className="relative">
                              <img
                                src={imagePreview}
                                alt="Package preview"
                                className="h-32 w-32 object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={removeImage}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg">
                              <div className="text-center">
                                <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="mt-1 block text-xs text-gray-500">Upload Image</span>
                              </div>
                            </div>
                          )}
                          <div className="ml-4">
                            <label className="bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
                              Choose File
                              <input
                                type="file"
                                className="sr-only"
                                accept="image/*"
                                onChange={handleImageUpload}
                              />
                            </label>
                            <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                            {editingPackage && currentImage && (
                              <p className="text-xs text-blue-500 mt-1">
                                Upload a new image to replace the current one
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Meal Sets Selection */}
                      <div className="border-t pt-6">
                        <h4 className="text-lg font-semibold mb-4">
                          Meal Sets in Package 
                          <span className="ml-2 text-sm font-normal text-gray-600">
                            ({packageForm.packageSets.length} sets added)
                          </span>
                        </h4>

                        {/* Available Meal Sets */}
                        <div className="mb-6">
                          <h5 className="font-medium text-gray-700 mb-3">Available Meal Sets:</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-2">
                            {availableMealSets.map(mealSet => (
                              <div key={mealSet.setId} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className="font-medium text-sm">{mealSet.name}</span>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${
                                      mealSet.type === 'VEG' 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                      {mealSet.type}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-600 truncate">{mealSet.mealItemsText}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => addMealSetToPackage(mealSet)}
                                  className="ml-2 bg-green-500 text-white p-2 rounded hover:bg-green-600 transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Selected Meal Sets */}
                        <div>
                          <h5 className="font-medium text-gray-700 mb-3">Selected Meal Sets:</h5>
                          {packageForm.packageSets.length === 0 ? (
                            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                              <div className="text-gray-400 text-4xl mb-2">🥗</div>
                              <p className="text-gray-500">No meal sets added yet</p>
                              <p className="text-sm text-gray-400">Add at least 1 meal set to create a package</p>
                            </div>
                          ) : (
                            <div className="space-y-3 max-h-60 overflow-y-auto p-2">
                              {packageForm.packageSets.map(packageSet => (
                                <div key={packageSet.setId} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                                  <div className="flex items-center space-x-3 flex-1">
                                    <span className="font-medium text-sm">{packageSet.setName}</span>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${
                                      packageSet.type === 'VEG' 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                      {packageSet.type}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <label className="text-sm text-gray-700">Frequency:</label>
                                    <input
                                      type="number"
                                      value={packageSet.frequency}
                                      onChange={(e) => updateMealSetFrequency(packageSet.setId, e.target.value)}
                                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                                      min="1"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeMealSetFromPackage(packageSet.setId)}
                                      className="text-red-500 hover:text-red-700 p-1"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={packageForm.isAvailable}
                          onChange={(e) => setPackageForm({...packageForm, isAvailable: e.target.checked})}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 text-sm text-gray-700">
                          Available for customers
                        </label>
                      </div>

                      <div className="flex space-x-3 pt-4 border-t">
                        <button
                          type="submit"
                          disabled={packageForm.packageSets.length === 0}
                          className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                            packageForm.packageSets.length > 0
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                          }`}
                        >
                          {editingPackage ? 'Update' : 'Create'} Package
                        </button>
                        <button
                          type="button"
                          onClick={resetPackageForm}
                          className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Meal Packages Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mealPackages.map(mealPackage => (
                <div key={mealPackage.packageId} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                  {mealPackage.image && (
                    <img 
                      src={displayImage(mealPackage.image)}
                      alt={mealPackage.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-xl font-semibold text-gray-900">{mealPackage.name}</h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        mealPackage.isAvailable 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {mealPackage.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">ID:</span> {mealPackage.packageId}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Duration:</span> {mealPackage.durationDays} days
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Type:</span> {mealPackage.basePackageType}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Price:</span> ₹{mealPackage.pricePerSet} per set
                      </p>
                      {mealPackage.features && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Features:</span> {mealPackage.features}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Meal Sets:</span> {mealPackage.packageSets?.length || 0} sets
                      </p>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => editPackage(mealPackage)}
                        className="flex-1 bg-yellow-500 text-white py-2 px-3 rounded text-sm hover:bg-yellow-600 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => togglePackageAvailability(mealPackage.packageId)}
                        className={`flex-1 py-2 px-3 rounded text-sm transition-colors ${
                          mealPackage.isAvailable
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                      >
                        {mealPackage.isAvailable ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => deletePackage(mealPackage.packageId)}
                        className="flex-1 bg-red-600 text-white py-2 px-3 rounded text-sm hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {mealPackages.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📦</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No meal packages yet</h3>
                <p className="text-gray-600 mb-4">Create your first meal package to offer complete meal plans</p>
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => setShowPackageForm(true)}
                >
                  Create Meal Package
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MealManagement;