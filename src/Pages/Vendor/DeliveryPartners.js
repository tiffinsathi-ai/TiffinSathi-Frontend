// src/Pages/Vendor/DeliveryPartners.js
import React, { useState, useEffect } from "react";
import { readData, writeData } from "../../helpers/storage";
import { 
  // Plus, 
  Search, 
  Filter,
  Phone,
  Mail,
  // MapPin,
  Bike,
  Car,
  // Scooter,
  CheckCircle,
  XCircle,
  Clock,
  // MoreVertical,
  Edit3,
  Trash2,
  UserPlus,
  Upload, // added for image upload
} from "lucide-react";

const DeliveryPartners = () => {
  const [partners, setPartners] = useState([]);
  const [filteredPartners, setFilteredPartners] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [editingPartner, setEditingPartner] = useState(null);

  const [newPartner, setNewPartner] = useState({
    name: "",
    phone: "",
    email: "",
    vehicleType: "bike",
    vehicleNumber: "",
    status: "available",
    image: "/src/assets/admin-banner.jpg",
  });

  useEffect(() => {
    loadPartners();
  }, []);

  useEffect(() => {
    filterPartners();
  }, [searchTerm, statusFilter, partners]);

  const loadPartners = () => {
    const data = readData();
    setPartners(data.deliveryPartners || []);
  };

  const filterPartners = () => {
    let filtered = [...partners];

    if (searchTerm) {
      filtered = filtered.filter((partner) =>
        partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partner.phone.includes(searchTerm) ||
        partner.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((partner) => partner.status === statusFilter);
    }

    setFilteredPartners(filtered);
  };

  const validatePartner = () => {
    if (!newPartner.name.trim()) return "Name is required";
    if (!newPartner.phone.trim() || newPartner.phone.length !== 10)
      return "Valid 10-digit phone number is required";
    if (!newPartner.vehicleNumber.trim()) return "Vehicle number is required";
    return null;
  };

  const addPartner = () => {
    const error = validatePartner();
    if (error) {
      alert(error);
      return;
    }

    setLoading(true);

    const partner = {
      ...newPartner,
      id: "d" + Date.now(),
      image: newPartner.image || "/src/assets/admin-banner.jpg",
      rating: (4 + Math.random()).toFixed(1),
      completedDeliveries: Math.floor(Math.random() * 100),
      joinedDate: new Date().toISOString(),
    };

    const data = readData();
    data.deliveryPartners = [...(data.deliveryPartners || []), partner];
    writeData(data);

    setPartners(data.deliveryPartners);
    resetForm();
    setShowAddForm(false);
    setLoading(false);
  };

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
        setNewPartner((prev) => ({ ...prev, image: imageDataUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  const startEdit = (partner) => {
    setEditingPartner(partner);
    setNewPartner({
      name: partner.name,
      phone: partner.phone,
      email: partner.email || "",
      vehicleType: partner.vehicleType,
      vehicleNumber: partner.vehicleNumber,
      status: partner.status,
      image: partner.image || "/src/assets/admin-banner.jpg",
    });
    setShowAddForm(true);
  };

  const updatePartner = () => {
    const error = validatePartner();
    if (error) {
      alert(error);
      return;
    }

    setLoading(true);

    const data = readData();
    const updatedPartners = (data.deliveryPartners || []).map((partner) =>
      partner.id === editingPartner.id
        ? {
            ...partner,
            ...newPartner,
          }
        : partner
    );

    data.deliveryPartners = updatedPartners;
    writeData(data);

    setPartners(updatedPartners);
    setEditingPartner(null);
    setShowAddForm(false);
    resetForm();
    setLoading(false);
  };

  const updatePartnerStatus = (partnerId, newStatus) => {
    const data = readData();
    const updatedPartners = data.deliveryPartners.map((partner) =>
      partner.id === partnerId ? { ...partner, status: newStatus } : partner
    );

    data.deliveryPartners = updatedPartners;
    writeData(data);
    setPartners(updatedPartners);
  };

  const deletePartner = (partnerId) => {
    if (!window.confirm("Are you sure you want to delete this delivery partner?"))
      return;

    const data = readData();
    data.deliveryPartners = data.deliveryPartners.filter(
      (partner) => partner.id !== partnerId
    );
    writeData(data);
    setPartners(data.deliveryPartners);
  };

  const resetForm = () => {
    setNewPartner({
      name: "",
      phone: "",
      email: "",
      vehicleType: "bike",
      vehicleNumber: "",
      status: "available",
      image: "/src/assets/admin-banner.jpg",
    });
    setEditingPartner(null);
  };

  const getStatusColor = (status) => {
    const colors = {
      available: "bg-green-100 text-green-800",
      busy: "bg-yellow-100 text-yellow-800",
      inactive: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status) => {
    const icons = {
      available: <CheckCircle size={14} />,
      busy: <Clock size={14} />,
      inactive: <XCircle size={14} />,
    };
    return icons[status];
  };

  const getVehicleIcon = (vehicleType) => {
    const icons = {
      bike: <Bike size={16} />,
      scooter: <Bike size={16} />,
      car: <Car size={16} />,
    };
    return icons[vehicleType] || <Bike size={16} />;
  };

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "available", label: "Available" },
    { value: "busy", label: "Busy" },
    { value: "inactive", label: "Inactive" },
  ];

  const vehicleOptions = [
    { value: "bike", label: "Bike", icon: <Bike size={16} /> },
    { value: "scooter", label: "Scooter", icon: <Bike size={16} /> },
    { value: "car", label: "Car", icon: <Car size={16} /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Delivery Partners</h2>
          <p className="text-gray-600">Manage your delivery team and assignments</p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(true);
            resetForm();
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors shadow-sm"
        >
          <UserPlus size={20} />
          <span>Add Delivery Partner</span>
        </button>
      </div>

      {/* Add/Edit Partner Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">
            {editingPartner ? "Edit Delivery Partner" : "Add New Delivery Partner"}
          </h3>

          {/* Image upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profile Image
            </label>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                {newPartner.image && newPartner.image !== "/src/assets/admin-banner.jpg" ? (
                  <img
                    src={newPartner.image}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Upload size={20} className="text-gray-400" />
                )}
              </div>
              <div>
                <input
                  type="file"
                  id="partner-image-upload"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label
                  htmlFor="partner-image-upload"
                  className="cursor-pointer px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors inline-block"
                >
                  Upload Photo
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG or GIF. Max 5MB.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter full name"
                value={newPartner.name}
                onChange={(e) =>
                  setNewPartner({ ...newPartner, name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="98XXXXXXXX"
                value={newPartner.phone}
                onChange={(e) =>
                  setNewPartner({ ...newPartner, phone: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="partner@email.com"
                value={newPartner.email}
                onChange={(e) =>
                  setNewPartner({ ...newPartner, email: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Type
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={newPartner.vehicleType}
                onChange={(e) =>
                  setNewPartner({ ...newPartner, vehicleType: e.target.value })
                }
              >
                {vehicleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Number *
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., BA 1 PA 1234"
                value={newPartner.vehicleNumber}
                onChange={(e) =>
                  setNewPartner({ ...newPartner, vehicleNumber: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Initial Status
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={newPartner.status}
                onChange={(e) =>
                  setNewPartner({ ...newPartner, status: e.target.value })
                }
              >
                <option value="available">Available</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowAddForm(false);
                resetForm();
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={editingPartner ? updatePartner : addPartner}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              <span>{editingPartner ? "Update Partner" : "Add Partner"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search partners..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="text-sm text-gray-600 flex items-center">
            <Filter size={16} className="mr-2" />
            <span>{filteredPartners.length} partners found</span>
          </div>
        </div>
      </div>

      {/* Partners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPartners.map((partner) => (
          <div
            key={partner.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
          >
            <div className="relative">
              <img
                src={partner.image}
                className="w-full h-48 object-cover"
                alt={partner.name}
              />
              <div className="absolute top-3 right-3 flex space-x-2">
                <button
                  onClick={() =>
                    updatePartnerStatus(
                      partner.id,
                      partner.status === "available" ? "inactive" : "available"
                    )
                  }
                  className={`p-2 rounded-full shadow-sm ${
                    partner.status === "available"
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : partner.status === "busy"
                      ? "bg-yellow-500 text-white hover:bg-yellow-600"
                      : "bg-gray-500 text-white hover:bg-gray-600"
                  } transition-colors`}
                >
                  {getStatusIcon(partner.status)}
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">
                    {partner.name}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    {getVehicleIcon(partner.vehicleType)}
                    <span className="text-sm text-gray-600">
                      {partner.vehicleNumber}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      partner.status
                    )}`}
                  >
                    {getStatusIcon(partner.status)}
                    <span className="ml-1">{partner.status}</span>
                  </span>
                  <div className="flex items-center space-x-1 mt-1">
                    <span className="text-yellow-400">⭐</span>
                    <span className="text-sm font-medium">
                      {partner.rating}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Phone size={14} className="mr-2" />
                  <span>{partner.phone}</span>
                </div>
                {partner.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail size={14} className="mr-2" />
                    <span className="truncate">{partner.email}</span>
                  </div>
                )}
              </div>

              {/* Partner Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">
                    {partner.completedDeliveries}
                  </p>
                  <p className="text-xs text-gray-600">Deliveries</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">94%</p>
                  <p className="text-xs text-gray-600">Success Rate</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center">
                <button
                  onClick={() =>
                    updatePartnerStatus(
                      partner.id,
                      partner.status === "busy" ? "available" : "busy"
                    )
                  }
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    partner.status === "busy"
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                  } transition-colors`}
                >
                  {partner.status === "busy" ? "Set Available" : "Set Busy"}
                </button>
                <div className="flex space-x-2">
                  <button
                    onClick={() => startEdit(partner)}
                    className="p-1 text-blue-600 hover:text-blue-700"
                    title="Edit partner"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => deletePartner(partner.id)}
                    className="p-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPartners.length === 0 && !showAddForm && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bike size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Delivery Partners
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== "all"
              ? "No delivery partners match your current filters."
              : "Get started by adding your first delivery partner to handle order deliveries."}
          </p>
          <button
            onClick={() => {
              setShowAddForm(true);
              resetForm();
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg inline-flex items-center space-x-2 transition-colors"
          >
            <UserPlus size={20} />
            <span>Add Your First Partner</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default DeliveryPartners;