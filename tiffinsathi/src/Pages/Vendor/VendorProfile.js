import { useState, useEffect } from "react";
import axios from "axios";
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
  Users,
  FileText,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const VendorProfile = () => {
  const [vendor, setVendor] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [formData, setFormData] = useState({
    ownerName: "",
    businessName: "",
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

  useEffect(() => {
    fetchVendorProfile();
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
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8080/api/vendors/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVendor(response.data);
      setFormData({
        ownerName: response.data.ownerName || "",
        businessName: response.data.businessName || "",
        phone: response.data.phone || "",
        businessAddress: response.data.businessAddress || "",
        alternatePhone: response.data.alternatePhone || "",
        cuisineType: response.data.cuisineType || "",
        capacity: response.data.capacity || "",
        description: response.data.description || "",
      });
      setLoading(false);
      showToast("Profile loaded successfully", "success");
    } catch (error) {
      console.error("Error fetching vendor profile:", error);
      showToast("Error loading profile", "error");
      setLoading(false);
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast("Image size should be less than 5MB", "warning");
        return;
      }
      try {
        const base64 = await convertToBase64(file);
        setProfileImage(base64);
        showToast("Profile image updated", "success");
      } catch (error) {
        console.error("Error converting image:", error);
        showToast("Error uploading image", "error");
      }
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const updateData = {
        ...formData,
        businessImage: profileImage || vendor.profilePicture,
      };

      const response = await axios.put(
        "http://localhost:8080/api/vendors/profile",
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setVendor(response.data);
      setIsEditing(false);
      showToast("Profile updated successfully!", "success");
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
      const token = localStorage.getItem("token");
      await axios.put(
        "http://localhost:8080/api/vendors/change-password",
        passwordData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

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
    } catch (error) {
      console.error("Error changing password:", error);
      showToast(
        error.response?.data?.message || "Error changing password",
        "error"
      );
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-600">Error loading profile</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8">
      <ToastContainer />
      
      <div className="max-w-6xl mx-auto px-3 sm:px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Vendor Profile</h1>
              <p className="text-gray-600 text-sm sm:text-base">Manage your business information</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <button
                onClick={() => setIsChangePasswordOpen(true)}
                className="flex items-center justify-center gap-2 bg-yellow-500 text-white py-2 px-3 sm:px-4 rounded-lg hover:bg-yellow-600 transition text-sm sm:text-base"
              >
                <Lock className="w-4 h-4" />
                <span>Change Password</span>
              </button>
              <button
                onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                disabled={saving}
                className="flex items-center justify-center gap-2 bg-green-600 text-white py-2 px-3 sm:px-4 rounded-lg hover:bg-green-700 transition disabled:opacity-50 text-sm sm:text-base"
              >
                {isEditing ? (
                  <>
                    <Save className="w-4 h-4" />
                    {saving ? "Saving..." : "Save"}
                  </>
                ) : (
                  <>
                    <Edit3 className="w-4 h-4" />
                    Edit Profile
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Profile Image Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {vendor.profilePicture || profileImage ? (
                      <img
                        src={profileImage || vendor.profilePicture}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />
                    )}
                  </div>
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-green-600 text-white p-1.5 sm:p-2 rounded-full cursor-pointer hover:bg-green-700 transition">
                      <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                </div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 text-center">
                  {vendor.businessName}
                </h2>
                <p className="text-gray-600 text-sm">Vendor</p>
                <p
                  className={`mt-2 px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                    vendor.status === "APPROVED"
                      ? "bg-green-100 text-green-800"
                      : vendor.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {vendor.status}
                </p>
              </div>

              {/* Additional Info */}
              <div className="mt-6 space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="w-4 h-4" />
                  <span className="text-xs sm:text-sm truncate">{vendor.ownerName}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span className="text-xs sm:text-sm truncate">{vendor.businessEmail}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs sm:text-sm">
                    Joined {new Date(vendor.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Business Stats */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mt-4 sm:mt-6">
              <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Business Stats</h4>
              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Meal Sets:</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Orders:</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Partners:</span>
                  <span className="font-medium">0</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">
                Business Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Owner Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Owner Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.ownerName}
                      onChange={(e) =>
                        setFormData({ ...formData, ownerName: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-gray-900 p-2 text-sm sm:text-base">
                      <User className="w-4 h-4" />
                      {vendor.ownerName}
                    </div>
                  )}
                </div>

                {/* Business Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.businessName}
                      onChange={(e) =>
                        setFormData({ ...formData, businessName: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-gray-900 p-2 text-sm sm:text-base">
                      <Briefcase className="w-4 h-4" />
                      {vendor.businessName}
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-gray-900 p-2 text-sm sm:text-base">
                      <Phone className="w-4 h-4" />
                      {vendor.phone}
                    </div>
                  )}
                </div>

                {/* Alternate Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alternate Phone
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.alternatePhone}
                      onChange={(e) =>
                        setFormData({ ...formData, alternatePhone: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-gray-900 p-2 text-sm sm:text-base">
                      <Phone className="w-4 h-4" />
                      {vendor.alternatePhone || "Not provided"}
                    </div>
                  )}
                </div>

                {/* Cuisine Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cuisine Type
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.cuisineType}
                      onChange={(e) =>
                        setFormData({ ...formData, cuisineType: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-gray-900 p-2 text-sm sm:text-base">
                      <Utensils className="w-4 h-4" />
                      {vendor.cuisineType || "Not specified"}
                    </div>
                  )}
                </div>

                {/* Capacity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Daily Capacity
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) =>
                        setFormData({ ...formData, capacity: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-gray-900 p-2 text-sm sm:text-base">
                      <Users className="w-4 h-4" />
                      {vendor.capacity || "Not specified"}
                    </div>
                  )}
                </div>

                {/* Business Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Address
                  </label>
                  {isEditing ? (
                    <textarea
                      value={formData.businessAddress}
                      onChange={(e) =>
                        setFormData({ ...formData, businessAddress: e.target.value })
                      }
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                    />
                  ) : (
                    <div className="flex items-start gap-2 text-gray-900 p-2 text-sm sm:text-base">
                      <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                      <span>{vendor.businessAddress || "Not provided"}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Description
                  </label>
                  {isEditing ? (
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                    />
                  ) : (
                    <div className="text-gray-900 p-2 text-sm sm:text-base">
                      {vendor.description || "No description provided"}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Business Documents Section */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mt-4 sm:mt-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Business Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-sm">FSSAI License</p>
                      <p className="text-xs text-gray-500">
                        {vendor.fssaiLicenseUrl ? "Uploaded" : "Not uploaded"}
                      </p>
                    </div>
                  </div>
                  {vendor.fssaiLicenseUrl && (
                    <span className="text-green-600 text-sm">Verified</span>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-sm">PAN Card</p>
                      <p className="text-xs text-gray-500">
                        {vendor.panCardUrl ? "Uploaded" : "Not uploaded"}
                      </p>
                    </div>
                  </div>
                  {vendor.panCardUrl && (
                    <span className="text-green-600 text-sm">Verified</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {isChangePasswordOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 pr-10"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 pr-10"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 pr-10"
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

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-6">
              <button
                onClick={() => setIsChangePasswordOpen(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm sm:text-base"
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