import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Camera,
  Edit3,
  Save,
  X,
  Lock,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  Building,
  Utensils,
  Users as UsersIcon,
  FileText,
  Eye,
  EyeOff,
  Loader2,
  Shield,
  Star,
  Package,
  DollarSign,
  CheckCircle,
  XCircle,
  Globe,
  Clock,
  Hash,
  MessageSquare,
  AlertCircle
} from "lucide-react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { vendorApi } from "../../helpers/api";

const VendorProfile = () => {
  const [vendor, setVendor] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [formData, setFormData] = useState({
    ownerName: "",
    businessName: "",
    email: "",
    phone: "",
    businessAddress: "",
    alternatePhone: "",
    cuisineType: "",
    capacity: "",
    description: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({
    activeMealSets: 0,
    totalOrders: 0,
    deliveryPartners: 0,
    averageRating: 0,
    totalRevenue: 0
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchVendorProfile();
    fetchVendorStats();
  }, []);

  const showToast = (message, type = "info") => {
    const options = {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "light",
    };

    switch (type) {
      case "success":
        toast.success(message, options);
        break;
      case "error":
        toast.error(message, options);
        break;
      case "warning":
        toast.warning(message, options);
        break;
      default:
        toast.info(message, options);
    }
  };

  const fetchVendorProfile = async () => {
    try {
      setLoading(true);
      const response = await vendorApi.getVendorProfile();
      
      if (response.ok && response.data) {
        const vendorData = response.data;
        setVendor(vendorData);
        setFormData({
          ownerName: vendorData.ownerName || "",
          businessName: vendorData.businessName || "",
          email: vendorData.email || vendorData.businessEmail || "",
          phone: vendorData.phone || "",
          businessAddress: vendorData.businessAddress || vendorData.address || "",
          alternatePhone: vendorData.alternatePhone || "",
          cuisineType: vendorData.cuisineType || "",
          capacity: vendorData.capacity || "",
          description: vendorData.description || "",
        });
        
        if (vendorData.profilePicture || vendorData.businessImage) {
          setProfileImage(vendorData.profilePicture || vendorData.businessImage);
        }
        
        // Dispatch event to update navbar with fresh data
        const navbarData = {
          businessName: vendorData.businessName,
          ownerName: vendorData.ownerName,
          businessEmail: vendorData.email || vendorData.businessEmail,
          status: vendorData.status || "ACTIVE",
          profilePicture: vendorData.profilePicture || vendorData.businessImage
        };
        localStorage.setItem("vendor", JSON.stringify(navbarData));
        window.dispatchEvent(new CustomEvent('vendorDataUpdated', { detail: navbarData }));
        
        showToast("Profile loaded successfully", "success");
      } else {
        showToast("Failed to load profile", "error");
        // Load from localStorage as fallback
        const storedVendor = localStorage.getItem("vendor");
        if (storedVendor) {
          const parsedVendor = JSON.parse(storedVendor);
          setVendor(parsedVendor);
        }
      }
    } catch (error) {
      console.error("Error fetching vendor profile:", error);
      showToast("Error loading profile", "error");
      
      // Fallback to localStorage
      const storedVendor = localStorage.getItem("vendor");
      if (storedVendor) {
        try {
          const parsedVendor = JSON.parse(storedVendor);
          setVendor(parsedVendor);
        } catch (e) {
          console.error("Error parsing stored vendor:", e);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorStats = async () => {
    try {
      const analyticsResponse = await vendorApi.getVendorAnalytics("30days");
      if (analyticsResponse.ok && analyticsResponse.data) {
        const analytics = analyticsResponse.data;
        setStats({
          activeMealSets: analytics.activeMealSets || 0,
          totalOrders: analytics.totalOrders || 0,
          deliveryPartners: analytics.deliveryPartners || 0,
          averageRating: analytics.averageRating || 0,
          totalRevenue: analytics.totalRevenue || 0
        });
      }
    } catch (error) {
      console.error("Error fetching vendor stats:", error);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("Image size should be less than 5MB", "warning");
      return;
    }

    try {
      const response = await vendorApi.uploadLogo(file);
      if (response.ok && response.data?.imageUrl) {
        setProfileImage(response.data.imageUrl);
        showToast("Profile image updated", "success");
      } else {
        showToast("Error uploading image", "error");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      showToast("Error uploading image", "error");
    }
  };

  const handleSaveProfile = async () => {
    if (!formData.businessName.trim()) {
      showToast("Business name is required", "warning");
      return;
    }

    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      showToast("Valid email is required", "warning");
      return;
    }

    setSaving(true);
    try {
      const updateData = {
        ...formData,
        businessImage: profileImage || vendor?.businessImage,
        profilePicture: profileImage || vendor?.profilePicture
      };

      const response = await vendorApi.updateVendorSettings(updateData);
      
      if (response.ok) {
  const updatedVendor = response.data;
  setVendor(updatedVendor);
  setIsEditing(false);
  
  const newImage = updatedVendor.profilePicture || updatedVendor.businessImage;
  if (newImage) {
    setProfileImage(newImage);
  }
  
  // Update navbar data
  const navbarData = {
    businessName: updatedVendor.businessName,
    ownerName: updatedVendor.ownerName,
    businessEmail: updatedVendor.email || updatedVendor.businessEmail,
    status: updatedVendor.status || "ACTIVE",
    profilePicture: newImage
  };
  localStorage.setItem("vendor", JSON.stringify(navbarData));
  window.dispatchEvent(new CustomEvent('vendorDataUpdated', { detail: navbarData }));
  
  showToast("Profile updated successfully!", "success");
} else {
        showToast("Error updating profile", "error");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      showToast("Error updating profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast("New passwords don't match", "error");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showToast("Password must be at least 6 characters", "warning");
      return;
    }

    try {
      const response = await vendorApi.updatePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      
      if (response.ok) {
        showToast("Password changed successfully!", "success");
        setIsChangePasswordOpen(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowPasswords({
          current: false,
          new: false,
          confirm: false,
        });
      } else {
        showToast(response.data?.message || "Error changing password", "error");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      showToast("Error changing password", "error");
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleCancelEdit = () => {
    if (vendor) {
      setFormData({
        ownerName: vendor.ownerName || "",
        businessName: vendor.businessName || "",
        email: vendor.email || vendor.businessEmail || "",
        phone: vendor.phone || "",
        businessAddress: vendor.businessAddress || vendor.address || "",
        alternatePhone: vendor.alternatePhone || "",
        cuisineType: vendor.cuisineType || "",
        capacity: vendor.capacity || "",
        description: vendor.description || "",
      });
      setProfileImage(vendor.profilePicture || vendor.businessImage);
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="animate-spin text-green-600 h-12 w-12 mx-auto mb-4" />
          <span className="text-gray-600">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="text-center py-12">
        <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Not Found</h3>
        <p className="text-gray-600 mb-4">Unable to load vendor profile</p>
        <button
          onClick={fetchVendorProfile}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ToastContainer />
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Vendor Profile</h2>
          <p className="text-gray-600">Manage your business information and settings</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setIsChangePasswordOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 border border-yellow-300 text-yellow-700 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
          >
            <Lock size={16} />
            <span>Change Password</span>
          </button>
          {isEditing ? (
            <div className="flex space-x-2">
              <button
                onClick={handleCancelEdit}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X size={16} />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  <Save size={16} />
                )}
                <span>{saving ? "Saving..." : "Save"}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Edit3 size={16} />
              <span>Edit Profile</span>
            </button>
          )}
        </div>
      </div>

      {/* Professional Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
              <Package className="h-6 w-6" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {stats.activeMealSets}
          </h3>
          <p className="text-sm text-gray-600">Active Meal Sets</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-50 text-green-600">
              <Package className="h-6 w-6" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {stats.totalOrders}
          </h3>
          <p className="text-sm text-gray-600">Total Orders</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
              <UsersIcon className="h-6 w-6" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {stats.deliveryPartners}
          </h3>
          <p className="text-sm text-gray-600">Delivery Partners</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-orange-50 text-orange-600">
              <Star className="h-6 w-6" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {stats.averageRating.toFixed(1)}
          </h3>
          <p className="text-sm text-gray-600">Average Rating</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            Rs {stats.totalRevenue}
          </h3>
          <p className="text-sm text-gray-600">Total Revenue</p>
        </div>
      </div>

      {/* Main Profile Section - Professional Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Image & Status */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                  {profileImage || vendor.profilePicture || vendor.businessImage ? (
                    <img
                      src={profileImage || vendor.profilePicture || vendor.businessImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(vendor.businessName || 'Vendor')}&background=16A34A&color=fff&size=256&bold=true`;
                      }}
                    />
                  ) : (
                    <Building className="w-16 h-16 text-gray-400" />
                  )}
                </div>
                {isEditing && (
                  <label className="absolute bottom-4 right-4 bg-green-600 text-white p-2 rounded-full cursor-pointer hover:bg-green-700 transition-colors shadow-lg border-2 border-white">
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-900 text-center mb-1">
                {vendor.businessName}
              </h2>
              <p className="text-gray-600 text-sm mb-3">{vendor.ownerName}</p>
              <div className={`px-4 py-1.5 rounded-full text-sm font-medium mb-4 ${
                vendor.status === "APPROVED" || vendor.status === "ACTIVE"
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : vendor.status === "PENDING"
                  ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                  : "bg-red-100 text-red-800 border border-red-200"
              }`}>
                {vendor.status === "APPROVED" || vendor.status === "ACTIVE" 
                  ? "✓ Approved Vendor" 
                  : vendor.status}
              </div>
              
              {/* Quick Info */}
              <div className="w-full space-y-3 border-t border-gray-100 pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Mail className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {vendor.email || vendor.businessEmail || "Not set"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Phone className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium text-gray-900">
                      {vendor.phone || "Not set"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Calendar className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">Joined</p>
                    <p className="text-sm font-medium text-gray-900">
                      {vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      }) : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Status Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-gray-600" />
              Account Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    vendor.status === "APPROVED" || vendor.status === "ACTIVE"
                      ? "bg-green-100"
                      : "bg-yellow-100"
                  }`}>
                    {vendor.status === "APPROVED" || vendor.status === "ACTIVE" ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Verification</p>
                    <p className="text-sm text-gray-600">
                      {vendor.status === "APPROVED" || vendor.status === "ACTIVE"
                        ? "Account verified"
                        : "Pending verification"}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  vendor.status === "APPROVED" || vendor.status === "ACTIVE"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}>
                  {vendor.status === "APPROVED" || vendor.status === "ACTIVE" ? "Complete" : "Pending"}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Documents</p>
                    <p className="text-sm text-gray-600">
                      {vendor.fssaiLicenseUrl && vendor.panCardUrl ? "All uploaded" : "Incomplete"}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  vendor.fssaiLicenseUrl && vendor.panCardUrl
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}>
                  {vendor.fssaiLicenseUrl && vendor.panCardUrl ? "2/2" : "0/2"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Business Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                  <p className="text-sm text-gray-600">Primary contact details</p>
                </div>
              </div>
              {isEditing && (
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                  Editing
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Owner Information */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <h4 className="text-sm font-medium text-gray-700">Owner Information</h4>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.ownerName}
                      onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      placeholder="Enter owner's name"
                    />
                  ) : (
                    <div className="text-gray-900 font-medium">
                      {vendor.ownerName || "Not set"}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Primary Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      placeholder="business@example.com"
                    />
                  ) : (
                    <div className="text-gray-900 font-medium">
                      {vendor.email || vendor.businessEmail || "Not set"}
                    </div>
                  )}
                </div>
              </div>

              {/* Phone Contacts */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <h4 className="text-sm font-medium text-gray-700">Phone Contacts</h4>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Primary Phone
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      placeholder="98XXXXXXXX"
                    />
                  ) : (
                    <div className="text-gray-900 font-medium">
                      {vendor.phone || "Not set"}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Alternate Phone
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.alternatePhone}
                      onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      placeholder="Optional"
                    />
                  ) : (
                    <div className="text-gray-900">
                      {vendor.alternatePhone || "Not provided"}
                    </div>
                  )}
                </div>
              </div>

              {/* Business Address - Full Width */}
              <div className="md:col-span-2 space-y-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <h4 className="text-sm font-medium text-gray-700">Business Address</h4>
                </div>
                <div>
                  {isEditing ? (
                    <textarea
                      value={formData.businessAddress}
                      onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                      rows="3"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      placeholder="Enter complete business address"
                    />
                  ) : (
                    <div className="text-gray-900 whitespace-pre-line">
                      {vendor.businessAddress || vendor.address || "Not provided"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Business Details Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Briefcase className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Business Details</h3>
                  <p className="text-sm text-gray-600">Service and operational information</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Business Identity */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Building className="w-4 h-4 text-gray-500" />
                  <h4 className="text-sm font-medium text-gray-700">Business Identity</h4>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Business Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      placeholder="Your business name"
                    />
                  ) : (
                    <div className="text-gray-900 font-medium">
                      {vendor.businessName || "Not set"}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Cuisine Type
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.cuisineType}
                      onChange={(e) => setFormData({ ...formData, cuisineType: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      placeholder="e.g., North Indian, Chinese"
                    />
                  ) : (
                    <div className="text-gray-900">
                      {vendor.cuisineType || "Not specified"}
                    </div>
                  )}
                </div>
              </div>

              {/* Operational Details */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <h4 className="text-sm font-medium text-gray-700">Operational Details</h4>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Daily Capacity
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      placeholder="Maximum orders per day"
                    />
                  ) : (
                    <div className="text-gray-900 font-medium">
                      {vendor.capacity || "Not specified"} orders/day
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Business Hours
                  </label>
                  <div className="text-gray-900">
                    9:00 AM - 9:00 PM
                  </div>
                </div>
              </div>

              {/* Business Description - Full Width */}
              <div className="md:col-span-2 space-y-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-gray-500" />
                  <h4 className="text-sm font-medium text-gray-700">Business Description</h4>
                </div>
                <div>
                  {isEditing ? (
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows="4"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      placeholder="Describe your business, specialties, and what makes you unique..."
                    />
                  ) : (
                    <div className="text-gray-900 whitespace-pre-line">
                      {vendor.description || "No description provided. Add a description to attract more customers."}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Business Documents Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Business Documents</h3>
                  <p className="text-sm text-gray-600">Verification and compliance documents</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">FSSAI License</p>
                    <p className="text-xs text-gray-500">
                      Food safety certification
                    </p>
                  </div>
                </div>
                {vendor.fssaiLicenseUrl ? (
                  <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Verified
                  </span>
                ) : (
                  <span className="text-yellow-600 text-sm font-medium">Required</span>
                )}
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <FileText className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">PAN Card</p>
                    <p className="text-xs text-gray-500">
                      Tax identification
                    </p>
                  </div>
                </div>
                {vendor.panCardUrl ? (
                  <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Verified
                  </span>
                ) : (
                  <span className="text-yellow-600 text-sm font-medium">Required</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {isChangePasswordOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Change Password</h3>
              <button
                onClick={() => setIsChangePasswordOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent pr-10"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("current")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.current ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent pr-10"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("new")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.new ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent pr-10"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("confirm")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsChangePasswordOpen(false)}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorProfile;