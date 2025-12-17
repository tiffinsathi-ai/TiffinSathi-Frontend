/* eslint-disable no-unused-vars */
// src/Pages/Vendor/Tiffins.js
import React, { useState, useEffect } from "react";
import { readData, writeData } from "../../helpers/storage";
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
  Package // ADD THIS MISSING IMPORT
} from "lucide-react";
// Remove Trash2, Filter, ChevronDown since they're not used


const Tiffins = () => {
  const [tiffins, setTiffins] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTiffin, setEditingTiffin] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  // extra state from snippet (not strictly needed but added as requested)
  const [imagePreview, setImagePreview] = useState(null);

  const [newMeal, setNewMeal] = useState({
    name: "",
    description: "",
    price: "",
    plan_type: "7 days",
    category: "veg",
    capacity: "",
    preparation_time: "",
    ingredients: "",
    dietary_info: "",
    spice_level: "medium",
    is_available: true,
    image: "/src/assets/meal1.jpg"
  });

  useEffect(() => {
    loadTiffins();
  }, []);

  const loadTiffins = () => {
    const data = readData();
    setTiffins(data.tiffins || []);
  };

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

  const addMeal = () => {
    const errors = validateForm();
    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }

    setLoading(true);
    
    const meal = {
      ...newMeal,
      id: "t" + Date.now(),
      price: parseFloat(newMeal.price),
      capacity: parseInt(newMeal.capacity),
      preparation_time: parseInt(newMeal.preparation_time),
      createdAt: new Date().toISOString(),
      orders_today: Math.floor(Math.random() * 10),
      total_orders: Math.floor(Math.random() * 100),
      rating: (4 + Math.random()).toFixed(1)
    };

    const data = readData();
    data.tiffins = [...data.tiffins, meal];
    writeData(data);
    
    setTiffins(data.tiffins);
    resetForm();
    setShowAddForm(false);
    setLoading(false);
  };

  const updateMeal = () => {
    const errors = validateForm();
    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }

    setLoading(true);
    
    const data = readData();
    const updatedTiffins = data.tiffins.map(t => 
      t.id === editingTiffin.id 
        ? { 
            ...t, 
            ...newMeal, 
            price: parseFloat(newMeal.price), 
            capacity: parseInt(newMeal.capacity),
            preparation_time: parseInt(newMeal.preparation_time)
          }
        : t
    );
    
    data.tiffins = updatedTiffins;
    writeData(data);
    
    setTiffins(updatedTiffins);
    setEditingTiffin(null);
    setShowAddForm(false);
    resetForm();
    setLoading(false);
  };

  const deleteMeal = (id) => {
    if (!window.confirm("Are you sure you want to delete this meal plan? This action cannot be undone.")) {
      return;
    }
    
    const data = readData();
    data.tiffins = data.tiffins.filter(t => t.id !== id);
    writeData(data);
    setTiffins(data.tiffins);
  };

  const toggleAvailability = (id) => {
    const data = readData();
    const updatedTiffins = data.tiffins.map(t => 
      t.id === id ? { ...t, is_available: !t.is_available } : t
    );
    
    data.tiffins = updatedTiffins;
    writeData(data);
    setTiffins(updatedTiffins);
  };

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
      dietary_info: "",
      spice_level: "medium",
      is_available: true,
      image: "/src/assets/meal1.jpg"
    });
    setImagePreview(null);
  };

  const startEdit = (tiffin) => {
    setEditingTiffin(tiffin);
    setNewMeal({ ...tiffin });
    setShowAddForm(true);
  };

  // Add this function to your existing Tiffins.js
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target.result;
        setNewMeal((prev) => ({ ...prev, image: imageDataUrl }));
        setImagePreview(imageDataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredTiffins = tiffins.filter(tiffin => {
    const matchesSearch =
      tiffin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tiffin.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || tiffin.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

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

  const spiceLevels = [
    { value: "mild", label: "Mild" },
    { value: "medium", label: "Medium" },
    { value: "hot", label: "Hot" },
    { value: "extra_hot", label: "Extra Hot" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Meal Plans Management</h2>
          <p className="text-gray-600">Create and manage your tiffin meal plans</p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(true);
            setEditingTiffin(null);
            resetForm();
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors shadow-sm"
        >
          <Plus size={20} />
          <span>Add New Meal Plan</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search meal plans..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">
            {editingTiffin ? "Edit Meal Plan" : "Add New Meal Plan"}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {/* Basic Information */}
            <div className="md:col-span-2 lg:col-span-3">
              <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meal Name *
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Veg Nepali Thali"
                value={newMeal.name}
                onChange={(e) =>
                  setNewMeal({ ...newMeal, name: e.target.value })
                }
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (Rs) *
              </label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="250"
                value={newMeal.price}
                onChange={(e) =>
                  setNewMeal({ ...newMeal, price: e.target.value })
                }
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plan Type *
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="50"
                value={newMeal.capacity}
                onChange={(e) =>
                  setNewMeal({ ...newMeal, capacity: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prep Time (mins) *
              </label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="45"
                value={newMeal.preparation_time}
                onChange={(e) =>
                  setNewMeal({
                    ...newMeal,
                    preparation_time: e.target.value,
                  })
                }
              />
            </div>
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe the meal items, taste, and special features..."
              rows="3"
              value={newMeal.description}
              onChange={(e) =>
                setNewMeal({ ...newMeal, description: e.target.value })
              }
            />
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ingredients *
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="List main ingredients (comma separated)..."
                rows="2"
                value={newMeal.ingredients}
                onChange={(e) =>
                  setNewMeal({ ...newMeal, ingredients: e.target.value })
                }
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dietary Information
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Gluten-free, No onion garlic"
                value={newMeal.dietary_info}
                onChange={(e) =>
                  setNewMeal({ ...newMeal, dietary_info: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Spice Level
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={newMeal.spice_level}
                onChange={(e) =>
                  setNewMeal({ ...newMeal, spice_level: e.target.value })
                }
              >
                {spiceLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  checked={newMeal.is_available}
                  onChange={(e) =>
                    setNewMeal({
                      ...newMeal,
                      is_available: e.target.checked,
                    })
                  }
                />
                <span className="ml-2 text-sm text-gray-700">
                  Available for orders
                </span>
              </label>
            </div>
          </div>

          {/* Image Upload - updated section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meal Image
            </label>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                {newMeal.image && newMeal.image !== "/src/assets/meal1.jpg" ? (
                  <img
                    src={newMeal.image}
                    alt="Meal"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <Upload size={24} className="text-gray-400" />
                )}
              </div>
              <div>
                <input
                  type="file"
                  id="meal-image-upload"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label
                  htmlFor="meal-image-upload"
                  className="cursor-pointer px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors inline-block"
                >
                  Upload Image
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG or GIF. Max 5MB.
                </p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 border-t pt-4">
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingTiffin(null);
                resetForm();
              }}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={editingTiffin ? updateMeal : addMeal}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              <span>
                {editingTiffin ? "Update Meal Plan" : "Create Meal Plan"}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Meal Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTiffins.map((t) => (
          <div
            key={t.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
          >
            <div className="relative">
              <img
                src={t.image}
                className="w-full h-48 object-cover"
                alt={t.name}
              />
              <div className="absolute top-3 right-3 flex space-x-2">
                <button
                  onClick={() => toggleAvailability(t.id)}
                  className={`p-2 rounded-full shadow-sm ${
                    t.is_available
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : "bg-gray-500 text-white hover:bg-gray-600"
                  } transition-colors`}
                  title={t.is_available ? "Set unavailable" : "Set available"}
                >
                  {t.is_available ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button
                  onClick={() => startEdit(t)}
                  className="p-2 bg-blue-500 text-white rounded-full shadow-sm hover:bg-blue-600 transition-colors"
                  title="Edit meal plan"
                >
                  <Edit3 size={16} />
                </button>
              </div>
              {!t.is_available && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <span className="text-white font-semibold bg-red-500 px-3 py-1 rounded-full text-sm">
                    Unavailable
                  </span>
                </div>
              )}
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-gray-900">{t.name}</h3>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                  {planTypes[t.plan_type] || t.plan_type}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {t.description}
              </p>
              
              <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                <div className="flex items-center text-gray-600">
                  <DollarSign size={14} className="mr-1 flex-shrink-0" />
                  <span className="truncate">Rs {t.price}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Users size={14} className="mr-1 flex-shrink-0" />
                  <span className="truncate">{t.capacity}/day</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock size={14} className="mr-1 flex-shrink-0" />
                  <span className="truncate">{t.preparation_time}min</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar size={14} className="mr-1 flex-shrink-0" />
                  <span className="truncate capitalize">{t.category}</span>
                </div>
              </div>

              {t.ingredients && (
                <div className="mb-3">
                  <p className="text-xs text-gray-700">
                    <strong className="text-gray-900">Ingredients:</strong>{" "}
                    {t.ingredients}
                  </p>
                </div>
              )}

              {t.dietary_info && (
                <div className="mb-3">
                  <p className="text-xs text-gray-700">
                    <strong className="text-gray-900">Dietary:</strong>{" "}
                    {t.dietary_info}
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>{t.orders_today || 0} orders today</span>
                <span className="flex items-center">⭐ {t.rating || "4.5"}</span>
              </div>

              <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                <button
                  onClick={() => startEdit(t)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteMeal(t.id)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTiffins.length === 0 && !showAddForm && (
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
              setShowAddForm(true);
              setEditingTiffin(null);
              resetForm();
              setSearchTerm("");
              setCategoryFilter("all");
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg inline-flex items-center space-x-2 transition-colors shadow-sm"
          >
            <Plus size={20} />
            <span>Create Your First Meal Plan</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Tiffins;