import React, { useState, useEffect } from 'react';
import {
  User,
  Camera,
  Edit3,
  Save,
  Lock,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Truck,
  FileText,
  Shield,
  Wifi,
  WifiOff,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import { deliveryApi } from '../../helpers/deliveryApi';
import Modal from '../../Components/Delivery/Modal';
import { validatePassword, passwordRequirements } from '../../helpers/passwordValidation'; // ADDED

const DeliveryProfile = () => {
  const [deliveryPartner, setDeliveryPartner] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    address: "",
    vehicleInfo: "",
    licenseNumber: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [availabilityStatus, setAvailabilityStatus] = useState('AVAILABLE');
  
  // Add state for password visibility
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  
  // ADDED: Password validation state
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false
  });

  useEffect(() => {
    fetchDeliveryProfile();
  }, []);

  const fetchDeliveryProfile = async () => {
    try {
      const response = await deliveryApi.getProfile();
      setDeliveryPartner(response.data);
      setFormData({
        name: response.data.name || "",
        phoneNumber: response.data.phoneNumber || "",
        address: response.data.address || "",
        vehicleInfo: response.data.vehicleInfo || "",
        licenseNumber: response.data.licenseNumber || "",
      });
      setAvailabilityStatus(response.data.availabilityStatus || 'AVAILABLE');
      setLoading(false);
    } catch (error) {
      console.error("Error fetching delivery profile:", error);
      setMessage("Error loading profile");
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const base64 = await deliveryApi.convertToBase64(file);
        setProfileImage(base64);
      } catch (error) {
        console.error("Error converting image:", error);
        setMessage("Error uploading image");
      }
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const updateData = {
        ...formData,
        profilePicture: profileImage || deliveryPartner.profilePicture,
      };

      const response = await deliveryApi.updateProfile(updateData);
      setDeliveryPartner(response.data);
      setIsEditing(false);
      setMessage("Profile updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage(error.response?.data?.message || "Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  // ADDED: Validate password in real-time
  const validatePasswordInRealTime = (password) => {
    const validation = validatePassword(password);
    setPasswordErrors(validation.errors);
    
    // Update individual validation checks for UI feedback
    setPasswordValidation({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    });
    
    return validation.isValid;
  };

  // ADDED: Password form validation
  const validatePasswordForm = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage("New password and confirm password don't match");
      return false;
    }
    
    const isValid = validatePasswordInRealTime(passwordData.newPassword);
    if (!isValid) {
      setMessage("Password doesn't meet the requirements");
      return false;
    }
    
    return true;
  };

  const handleChangePassword = async () => {
    // ADDED: Validate password before API call
    if (!validatePasswordForm()) {
      return;
    }
    
    try {
      await deliveryApi.changePassword(passwordData);
      setMessage("Password changed successfully!");
      setIsChangePasswordOpen(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      // Reset password visibility
      setShowPassword({
        current: false,
        new: false,
        confirm: false,
      });
      // Reset validation state
      setPasswordErrors([]);
      setPasswordValidation({
        length: false,
        uppercase: false,
        number: false,
        special: false
      });
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error changing password:", error);
      setMessage(error.response?.data?.message || "Error changing password");
    }
  };

  const toggleAvailability = async () => {
    try {
      await deliveryApi.toggleAvailability();
      const newStatus = availabilityStatus === 'AVAILABLE' ? 'BUSY' : 'AVAILABLE';
      setAvailabilityStatus(newStatus);
      setMessage(`You are now ${newStatus.toLowerCase()}`);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error toggling availability:", error);
      setMessage("Failed to update availability");
    }
  };

  // Function to toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const getAvailabilityColor = () => {
    switch (availabilityStatus) {
      case 'AVAILABLE': return 'bg-gradient-to-r from-green-100 to-green-50 text-green-800 border-green-200';
      case 'BUSY': return 'bg-gradient-to-r from-orange-100 to-orange-50 text-orange-800 border-orange-200';
      case 'OFFLINE': return 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 border-gray-200';
      default: return 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-orange-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!deliveryPartner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-orange-50">
        <div className="text-red-600">Error loading profile</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Delivery Partner Profile</h1>
              <p className="text-gray-600">Manage your delivery information and availability</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={toggleAvailability}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 font-medium transition-colors ${getAvailabilityColor()}`}
              >
                {availabilityStatus === 'AVAILABLE' ? (
                  <Wifi className="h-4 w-4" />
                ) : (
                  <WifiOff className="h-4 w-4" />
                )}
                <span>
                  {availabilityStatus === 'AVAILABLE' ? 'Available' : 
                   availabilityStatus === 'BUSY' ? 'Busy' : 'Offline'}
                </span>
              </button>

              <button
                onClick={() => setIsChangePasswordOpen(true)}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-2 px-4 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-sm"
              >
                <Lock className="w-4 h-4" />
                <span>Change Password</span>
              </button>
              
              <button
                onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                disabled={saving}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white py-2 px-4 rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-sm disabled:opacity-50"
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

        {/* Message */}
        {message && (
          <div
            className={`p-4 rounded-lg mb-6 ${
              message.includes("Error")
                ? "bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200"
                : "bg-gradient-to-r from-green-50 to-green-100 text-green-700 border border-green-200"
            }`}
          >
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Image & Stats */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                    {deliveryPartner.profilePicture || profileImage ? (
                      <img
                        src={profileImage || deliveryPartner.profilePicture || deliveryPartner.profilePictureUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-orange-400" />
                    )}
                  </div>
                  {isEditing && (
                    <label className="absolute bottom-2 right-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white p-2 rounded-full cursor-pointer hover:from-orange-700 hover:to-orange-800 transition-all shadow-lg">
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
                <h2 className="text-xl font-semibold text-gray-900 text-center">
                  {deliveryPartner.name}
                </h2>
                <p className="text-gray-600">Delivery Partner</p>
                <div className={`mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                  deliveryPartner.isActive
                    ? "bg-gradient-to-r from-green-100 to-green-50 text-green-800 border border-green-200"
                    : "bg-gradient-to-r from-red-100 to-red-50 text-red-800 border border-red-200"
                }`}>
                  {deliveryPartner.isActive ? "ACTIVE" : "INACTIVE"}
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-2 text-gray-600 p-3 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm truncate">{deliveryPartner.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 p-3 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200">
                  <Truck className="w-4 h-4" />
                  <span className="text-sm">{deliveryPartner.vehicleInfo || "No vehicle info"}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 p-3 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    Joined {new Date(deliveryPartner.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h4 className="font-semibold text-gray-900 mb-4">Delivery Stats</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between p-2 rounded-lg hover:bg-gray-50">
                  <span className="text-gray-600">Today's Deliveries:</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg hover:bg-gray-50">
                  <span className="text-gray-600">Total Deliveries:</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg hover:bg-gray-50">
                  <span className="text-gray-600">Success Rate:</span>
                  <span className="font-medium text-green-600">100%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Delivery Information
              </h3>

              <div className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-gray-900 p-3 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200">
                      <User className="w-4 h-4" />
                      {deliveryPartner.name}
                    </div>
                  )}
                </div>

                {/* Email - Read Only */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="flex items-center gap-2 text-gray-900 p-3 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200">
                    <Mail className="w-4 h-4" />
                    {deliveryPartner.email}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Email cannot be changed</p>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, phoneNumber: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-gray-900 p-3 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200">
                      <Phone className="w-4 h-4" />
                      {deliveryPartner.phoneNumber}
                    </div>
                  )}
                </div>

                {/* Vehicle Info */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Information
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.vehicleInfo}
                      onChange={(e) =>
                        setFormData({ ...formData, vehicleInfo: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      placeholder="e.g., Honda Activa - White"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-gray-900 p-3 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200">
                      <Truck className="w-4 h-4" />
                      {deliveryPartner.vehicleInfo || "Not provided"}
                    </div>
                  )}
                </div>

                {/* License Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    License Number
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.licenseNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, licenseNumber: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      placeholder="Enter your license number"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-gray-900 p-3 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200">
                      <FileText className="w-4 h-4" />
                      {deliveryPartner.licenseNumber || "Not provided"}
                    </div>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  {isEditing ? (
                    <textarea
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      placeholder="Enter your address"
                    />
                  ) : (
                    <div className="flex items-start gap-2 text-gray-900 p-3 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200">
                      <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                      <span>{deliveryPartner.address || "Not provided"}</span>
                    </div>
                  )}
                </div>

                {/* Vendor Info */}
                {deliveryPartner.vendorName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assigned Vendor
                    </label>
                    <div className="flex items-center gap-2 text-gray-900 p-3 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200">
                      <Shield className="w-4 h-4" />
                      {deliveryPartner.vendorName}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal - UPDATED with password validation */}
      <Modal
        isOpen={isChangePasswordOpen}
        onClose={() => {
          setIsChangePasswordOpen(false);
          setPasswordErrors([]);
          setPasswordValidation({
            length: false,
            uppercase: false,
            number: false,
            special: false
          });
        }}
        title="Change Password"
        size="sm"
      >
        <div className="p-6 space-y-4">
          {/* Password Requirements */}
          <div className="mb-4 p-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200">
            <p className="text-sm font-medium text-orange-800 mb-2">Password Requirements:</p>
            <div className="space-y-1 text-xs text-orange-700">
              {passwordRequirements.map((req, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordValidation[
                    index === 0 ? 'length' : 
                    index === 1 ? 'uppercase' : 
                    index === 2 ? 'number' : 'special'
                  ] ? 'bg-green-100 text-green-600 border border-green-300' : 'bg-gray-100 text-gray-400 border border-gray-300'}`}>
                    {passwordValidation[
                      index === 0 ? 'length' : 
                      index === 1 ? 'uppercase' : 
                      index === 2 ? 'number' : 'special'
                    ] ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <span className="text-xs">•</span>
                    )}
                  </div>
                  <span>{req}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPassword.current ? "text" : "password"}
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value,
                  })
                }
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showPassword.current ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
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
                type={showPassword.new ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={(e) => {
                  const newPwd = e.target.value;
                  setPasswordData({
                    ...passwordData,
                    newPassword: newPwd,
                  });
                  validatePasswordInRealTime(newPwd);
                }}
                className={`w-full px-3 py-2 pr-10 border ${passwordErrors.length > 0 && passwordData.newPassword ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors`}
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showPassword.new ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {passwordErrors.length > 0 && passwordData.newPassword && (
              <div className="mt-2 space-y-1">
                {passwordErrors.map((error, index) => (
                  <div key={index} className="flex items-center gap-2 text-red-600 text-xs">
                    <AlertCircle className="w-3 h-3" />
                    <span>{error}</span>
                  </div>
                ))}
              </div>
            )}
            {passwordValidation.length && passwordValidation.uppercase && 
             passwordValidation.number && passwordValidation.special && 
             passwordData.newPassword && (
              <div className="mt-2 flex items-center gap-2 text-green-600 text-xs">
                <CheckCircle className="w-3 h-3" />
                <span>Password meets all requirements</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showPassword.confirm ? "text" : "password"}
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
                className={`w-full px-3 py-2 pr-10 border ${passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors`}
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showPassword.confirm ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
              <div className="mt-2 flex items-center gap-2 text-red-600 text-xs">
                <AlertCircle className="w-3 h-3" />
                <span>Passwords don't match</span>
              </div>
            )}
            {passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword && passwordData.newPassword && (
              <div className="mt-2 flex items-center gap-2 text-green-600 text-xs">
                <CheckCircle className="w-3 h-3" />
                <span>Passwords match</span>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                setIsChangePasswordOpen(false);
                // Reset password visibility when closing modal
                setShowPassword({
                  current: false,
                  new: false,
                  confirm: false,
                });
                setPasswordErrors([]);
                setPasswordValidation({
                  length: false,
                  uppercase: false,
                  number: false,
                  special: false
                });
              }}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleChangePassword}
              disabled={passwordErrors.length > 0 || passwordData.newPassword !== passwordData.confirmPassword}
              className={`flex-1 py-2 px-4 rounded-lg transition-colors ${passwordErrors.length > 0 || passwordData.newPassword !== passwordData.confirmPassword
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-600 to-orange-700 text-white hover:from-orange-700 hover:to-orange-800'
              }`}
            >
              Change Password
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DeliveryProfile;