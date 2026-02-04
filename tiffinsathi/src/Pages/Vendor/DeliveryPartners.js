import React, { useState, useEffect } from "react";
import { 
  Search, 
  Filter,
  Phone,
  Mail,
  Bike,
  Car,
  CheckCircle,
  XCircle,
  Clock,
  Edit3,
  Trash2,
  UserPlus,
  Upload,
  MapPin,
  Star,
  RefreshCw,
  Check,
  X
} from "lucide-react";

const DeliveryPartners = () => {
  const [partners, setPartners] = useState([]);
  const [filteredPartners, setFilteredPartners] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [editingPartner, setEditingPartner] = useState(null);

  const [newPartner, setNewPartner] = useState({
    name: "",
    phone: "",
    email: "",
    vehicleType: "bike",
    vehicleNumber: "",
    status: "available",
    image: "",
  });

  // Check mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mock data for demonstration
  const mockPartners = [
    {
      id: "1",
      name: "Rajesh Kumar",
      phone: "9801234567",
      email: "rajesh@example.com",
      vehicleType: "bike",
      vehicleNumber: "BA 1 PA 1234",
      status: "available",
      image: "",
      rating: 4.5,
      completedDeliveries: 42,
      joinedDate: "2024-01-15",
      location: "Kathmandu"
    },
    {
      id: "2",
      name: "Sita Sharma",
      phone: "9812345678",
      email: "sita@example.com",
      vehicleType: "scooter",
      vehicleNumber: "BA 2 PA 5678",
      status: "busy",
      image: "",
      rating: 4.8,
      completedDeliveries: 67,
      joinedDate: "2024-02-20",
      location: "Lalitpur"
    },
    {
      id: "3",
      name: "Ramesh Thapa",
      phone: "9823456789",
      email: "ramesh@example.com",
      vehicleType: "car",
      vehicleNumber: "BA 3 PA 9012",
      status: "inactive",
      image: "",
      rating: 4.2,
      completedDeliveries: 28,
      joinedDate: "2024-03-10",
      location: "Bhaktapur"
    }
  ];

  useEffect(() => {
    loadPartners();
  }, []);

  useEffect(() => {
    filterPartners();
  }, [searchTerm, statusFilter, partners]);

  const loadPartners = () => {
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setPartners(mockPartners);
      setFilteredPartners(mockPartners);
      setLoading(false);
    }, 800);
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
      rating: (4 + Math.random()).toFixed(1),
      completedDeliveries: Math.floor(Math.random() * 100),
      joinedDate: new Date().toISOString().split('T')[0],
      location: "Kathmandu"
    };

    setPartners([...partners, partner]);
    resetForm();
    setShowAddForm(false);
    setLoading(false);
    
    alert('Delivery partner added successfully!');
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
      image: partner.image || "",
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

    const updatedPartners = partners.map((partner) =>
      partner.id === editingPartner.id
        ? {
            ...partner,
            ...newPartner,
          }
        : partner
    );

    setPartners(updatedPartners);
    setEditingPartner(null);
    setShowAddForm(false);
    resetForm();
    setLoading(false);
    
    alert('Delivery partner updated successfully!');
  };

  const updatePartnerStatus = (partnerId, newStatus) => {
    const updatedPartners = partners.map((partner) =>
      partner.id === partnerId ? { ...partner, status: newStatus } : partner
    );
    setPartners(updatedPartners);
    
    alert(`Partner status updated to ${newStatus}`);
  };

  const deletePartner = (partnerId) => {
    if (!window.confirm("Are you sure you want to delete this delivery partner?"))
      return;

    const updatedPartners = partners.filter(
      (partner) => partner.id !== partnerId
    );
    setPartners(updatedPartners);
    
    alert('Delivery partner deleted successfully!');
  };

  const resetForm = () => {
    setNewPartner({
      name: "",
      phone: "",
      email: "",
      vehicleType: "bike",
      vehicleNumber: "",
      status: "available",
      image: "",
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
      available: <CheckCircle size={14} className="text-green-600" />,
      busy: <Clock size={14} className="text-yellow-600" />,
      inactive: <XCircle size={14} className="text-gray-600" />,
    };
    return icons[status];
  };

  const getVehicleIcon = (vehicleType) => {
    const icons = {
      bike: <Bike size={16} className="text-blue-600" />,
      scooter: <Bike size={16} className="text-purple-600" />,
      car: <Car size={16} className="text-green-600" />,
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
    { value: "bike", label: "Bike" },
    { value: "scooter", label: "Scooter" },
    { value: "car", label: "Car" },
  ];

  if (loading && !showAddForm) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <RefreshCw className="animate-spin text-green-600 mx-auto mb-2" size={24} />
          <div className="text-gray-600">Loading delivery partners...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Delivery Partners</h2>
          <p className="text-gray-600 text-sm">Manage your delivery team</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={loadPartners}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button
            onClick={() => {
              setShowAddForm(true);
              resetForm();
            }}
            className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 justify-center"
          >
            <UserPlus size={18} />
            <span>Add Partner</span>
          </button>
        </div>
      </div>

      {/* Add/Edit Partner Form */}
      {showAddForm && (
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">
            {editingPartner ? "Edit Delivery Partner" : "Add New Delivery Partner"}
          </h3>

          {/* Form Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter full name"
                value={newPartner.name}
                onChange={(e) =>
                  setNewPartner({ ...newPartner, name: e.target.value })
                }
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="98XXXXXXXX"
                value={newPartner.phone}
                onChange={(e) =>
                  setNewPartner({ ...newPartner, phone: e.target.value })
                }
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="partner@email.com"
                value={newPartner.email}
                onChange={(e) =>
                  setNewPartner({ ...newPartner, email: e.target.value })
                }
              />
            </div>

            {/* Vehicle Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Type
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

            {/* Vehicle Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Number *
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., BA 1 PA 1234"
                value={newPartner.vehicleNumber}
                onChange={(e) =>
                  setNewPartner({ ...newPartner, vehicleNumber: e.target.value })
                }
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Initial Status
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t">
            <button
              onClick={() => {
                setShowAddForm(false);
                resetForm();
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={editingPartner ? updatePartner : addPartner}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && (
                <RefreshCw className="animate-spin" size={16} />
              )}
              <span>{editingPartner ? "Update Partner" : "Add Partner"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search partners..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPartners.map((partner) => (
          <div
            key={partner.id}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Partner Header */}
            <div className="p-4 border-b">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">
                    {partner.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
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
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-3">
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
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin size={14} className="mr-2" />
                  <span>{partner.location}</span>
                </div>
              </div>
            </div>

            {/* Partner Stats */}
            <div className="p-4 border-b">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {partner.completedDeliveries}
                  </p>
                  <p className="text-xs text-gray-600">Deliveries</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{partner.rating}</p>
                  <p className="text-xs text-gray-600">Rating</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">94%</p>
                  <p className="text-xs text-gray-600">Success</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4">
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(partner)}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 flex items-center justify-center gap-1"
                >
                  <Edit3 size={14} />
                  Edit
                </button>
                <button
                  onClick={() => deletePartner(partner.id)}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm hover:bg-red-700 flex items-center justify-center gap-1"
                >
                  <Trash2 size={14} />
                  Remove
                </button>
              </div>
              
              {/* Status Toggle */}
              <div className="mt-3">
                <button
                  onClick={() =>
                    updatePartnerStatus(
                      partner.id,
                      partner.status === "busy" ? "available" : "busy"
                    )
                  }
                  className={`w-full py-2 rounded-lg text-sm font-medium ${
                    partner.status === "busy"
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                  }`}
                >
                  {partner.status === "busy" ? "Set Available" : "Set Busy"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredPartners.length === 0 && !showAddForm && !loading && (
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
              : "Get started by adding your first delivery partner."}
          </p>
          <button
            onClick={() => {
              setShowAddForm(true);
              resetForm();
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2"
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