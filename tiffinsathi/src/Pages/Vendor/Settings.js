// src/Pages/Vendor/Settings.js
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { 
  Save,
  Upload,
  Building,
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Bell,
  CreditCard,
  Globe,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
  Info
} from "lucide-react";
import { api } from "../../helpers/api";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState({
    profile: {
      businessName: "",
      ownerName: "",
      email: "",
      phone: "",
      address: "",
      description: "",
      businessImage: "",
      bank: {
        bankName: "",
        accountNumber: "",
        branch: "",
        holderName: ""
      }
    },
    notifications: {
      emailNotifications: true,
      orderAlerts: true,
      promotionAlerts: false,
      weeklyReports: true,
      reviewAlerts: true,
      deliveryUpdates: true
    },
    preferences: {
      autoAcceptOrders: false,
      advanceOrderNotice: 2,
      maxDailyOrders: 50,
      currency: "NPR",
      timezone: "Asia/Kathmandu",
      businessHours: "9:00 AM - 9:00 PM"
    }
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Load vendor settings from API
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // Get vendor profile from API
      const vendorData = await api.vendor.getVendorById();
      
      if (vendorData) {
        // Transform API data to match frontend structure
        const transformedProfile = {
          businessName: vendorData.businessName || vendorData.name || "",
          ownerName: vendorData.ownerName || vendorData.contactPerson || "",
          email: vendorData.email || "",
          phone: vendorData.phone || vendorData.contactNumber || "",
          address: vendorData.address || "",
          description: vendorData.description || "",
          businessImage: vendorData.profilePicture || vendorData.logo || "",
          bank: {
            bankName: vendorData.bankName || "",
            accountNumber: vendorData.accountNumber || "",
            branch: vendorData.branch || "",
            holderName: vendorData.accountHolderName || vendorData.ownerName || ""
          }
        };
        
        // Get existing settings from localStorage or use defaults
        const savedNotifications = JSON.parse(localStorage.getItem("vendor_notifications") || "null");
        const savedPreferences = JSON.parse(localStorage.getItem("vendor_preferences") || "null");
        
        setSettings(prev => ({
          ...prev,
          profile: transformedProfile,
          notifications: savedNotifications || prev.notifications,
          preferences: savedPreferences || prev.preferences
        }));
        
        // Update localStorage with fresh vendor data
        if (vendorData.businessName) {
          localStorage.setItem("businessName", vendorData.businessName);
        }
        if (vendorData.email) {
          localStorage.setItem("email", vendorData.email);
        }
        if (vendorData.name) {
          localStorage.setItem("name", vendorData.name);
        }
        
        toast.success("Settings loaded successfully!");
      } else {
        toast.error("Failed to load vendor data");
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      toast.error("Error loading settings. Using default settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!settings.profile?.businessName?.trim()) {
      toast.error("Business name is required");
      return;
    }

    if (!settings.profile?.email?.trim() || !/\S+@\S+\.\S+/.test(settings.profile.email)) {
      toast.error("Valid email is required");
      return;
    }

    try {
      setSaving(true);
      
      // Prepare vendor profile data for API
      const vendorProfileData = {
        businessName: settings.profile.businessName,
        name: settings.profile.ownerName,
        email: settings.profile.email,
        phone: settings.profile.phone,
        address: settings.profile.address,
        description: settings.profile.description,
        profilePicture: settings.profile.businessImage,
        bankName: settings.profile.bank?.bankName,
        accountNumber: settings.profile.bank?.accountNumber,
        branch: settings.profile.bank?.branch,
        accountHolderName: settings.profile.bank?.holderName
      };
      
      // Call API to update vendor profile
      const response = await api.vendor.updateVendorProfile(null, vendorProfileData);
      
      if (response) {
        toast.success("Profile updated successfully!");
        
        // Save notifications and preferences to localStorage
        // (These are frontend-only settings since there's no backend API for them)
        localStorage.setItem("vendor_notifications", JSON.stringify(settings.notifications));
        localStorage.setItem("vendor_preferences", JSON.stringify(settings.preferences));
        
        // Update localStorage
        if (settings.profile.businessName) {
          localStorage.setItem("businessName", settings.profile.businessName);
        }
        if (settings.profile.ownerName) {
          localStorage.setItem("name", settings.profile.ownerName);
        }
        if (settings.profile.email) {
          localStorage.setItem("email", settings.profile.email);
        }
        
        // Dispatch event to update navbar
        const vendorData = {
          businessName: settings.profile.businessName,
          ownerName: settings.profile.ownerName,
          businessEmail: settings.profile.email,
          status: "ACTIVE",
          profilePicture: settings.profile.businessImage
        };
        
        localStorage.setItem("vendor", JSON.stringify(vendorData));
        window.dispatchEvent(new CustomEvent('vendorDataUpdated', { detail: vendorData }));
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Error saving settings: " + (error.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  const handleProfileChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        [field]: value
      }
    }));
  };

  const handleBankChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        bank: {
          ...prev.profile.bank,
          [field]: value
        }
      }
    }));
  };

  const handleNotificationChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value
      }
    }));
  };

  const handlePreferenceChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value
      }
    }));
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (JPG, PNG, GIF)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    try {
      // For now, use a mock URL since there's no image upload API
      // In a real implementation, you would upload to your server
      const reader = new FileReader();
      reader.onload = (e) => {
        handleProfileChange("businessImage", e.target.result);
        toast.success("Logo loaded successfully!");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("Error uploading logo");
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      // Call API to change password
      const response = await api.vendor.changeVendorPassword(null, passwordData.newPassword);
      
      if (response) {
        toast.success("Password updated successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      }
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("Error updating password: " + (error.message || "Unknown error"));
    }
  };

  const handleEnable2FA = async () => {
    try {
      // Note: There's no 2FA API in the provided api.js
      // This would require backend implementation
      toast.info("Two-factor authentication feature is not yet implemented");
    } catch (error) {
      console.error("Error enabling 2FA:", error);
      toast.error("Error enabling 2FA");
    }
  };

  const handleLogoutAllDevices = () => {
    // Clear all tokens and redirect to login
    api.storage.clearAuth();
    window.location.href = "/login";
    toast.info("Logged out from all devices");
  };

  const tabs = [
    { id: "profile", label: "Business Profile", icon: <Building size={16} /> },
    { id: "notifications", label: "Notifications", icon: <Bell size={16} /> },
    { id: "preferences", label: "Preferences", icon: <Globe size={16} /> },
    { id: "security", label: "Security", icon: <Shield size={16} /> },
    { id: "billing", label: "Billing", icon: <CreditCard size={16} /> }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="animate-spin text-green-600 h-12 w-12 mb-4" />
        <span className="text-gray-600">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-1">Manage your business settings and preferences</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={loadSettings}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              <span>Reload</span>
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              {saving ? (
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
              ) : (
                <Save size={16} className="mr-2" />
              )}
              <span>{saving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Settings Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Settings Overview */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Info className="h-5 w-5 text-blue-600 mr-2" />
              Quick Info
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Business Status</span>
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Notifications</span>
                <span className="text-sm text-gray-900">
                  {Object.values(settings.notifications || {}).filter(Boolean).length}/6 active
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Currency</span>
                <span className="text-sm text-gray-900">Rs. (NPR)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Profile Complete</span>
                <span className="text-sm text-green-600">100%</span>
              </div>
            </div>
          </div>

          {/* Settings Navigation */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Settings Menu</h3>
            <nav className="space-y-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Settings Content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200">
            {/* Tab Content Header */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {activeTab === "profile" && "Business Profile"}
                {activeTab === "notifications" && "Notification Settings"}
                {activeTab === "preferences" && "Business Preferences"}
                {activeTab === "security" && "Security Settings"}
                {activeTab === "billing" && "Billing & Payments"}
              </h2>
              <p className="text-gray-600 mt-1">
                {activeTab === "profile" && "Update your business information and branding"}
                {activeTab === "notifications" && "Configure your notification preferences"}
                {activeTab === "preferences" && "Set your business rules and preferences"}
                {activeTab === "security" && "Manage account security and access"}
                {activeTab === "billing" && "Configure payment and billing settings"}
              </p>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === "profile" && (
                <div className="space-y-6">
                  {/* Business Image */}
                  <div className="flex items-center space-x-6">
                    <div className="w-24 h-24 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                      {settings.profile?.businessImage ? (
                        <img 
                          src={settings.profile.businessImage} 
                          alt="Business" 
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(settings.profile.businessName || 'Business')}&background=16A34A&color=fff&size=256&bold=true`;
                          }}
                        />
                      ) : (
                        <Building size={32} className="text-gray-400" />
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        id="business-logo-upload"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="business-logo-upload"
                        className="cursor-pointer inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      >
                        <Upload size={16} />
                        <span>Upload Logo</span>
                      </label>
                      <p className="text-sm text-gray-500 mt-2">JPG, PNG or GIF. Max 5MB.</p>
                    </div>
                  </div>

                  {/* Business Information Form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Owner Name *
                      </label>
                      <input
                        type="text"
                        value={settings.profile?.ownerName || ""}
                        onChange={(e) => handleProfileChange("ownerName", e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter owner's full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business Name *
                      </label>
                      <input
                        type="text"
                        value={settings.profile?.businessName || ""}
                        onChange={(e) => handleProfileChange("businessName", e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter your business name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={settings.profile?.email || ""}
                        onChange={(e) => handleProfileChange("email", e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="business@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        value={settings.profile?.phone || ""}
                        onChange={(e) => handleProfileChange("phone", e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="98XXXXXXXX"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business Address *
                      </label>
                      <textarea
                        value={settings.profile?.address || ""}
                        onChange={(e) => handleProfileChange("address", e.target.value)}
                        rows="3"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter complete business address"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business Description
                      </label>
                      <textarea
                        value={settings.profile?.description || ""}
                        onChange={(e) => handleProfileChange("description", e.target.value)}
                        placeholder="Tell customers about your business, cuisine specialties, and what makes you unique..."
                        rows="4"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        This will be visible to customers on your profile page
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="space-y-4">
                  <p className="text-gray-600 mb-4">Choose what notifications you want to receive</p>
                  
                  <div className="space-y-3">
                    {[
                      { 
                        field: "emailNotifications", 
                        label: "Email Notifications", 
                        description: "Receive important updates via email",
                      },
                      { 
                        field: "orderAlerts", 
                        label: "Order Alerts", 
                        description: "Get notified for new orders",
                      },
                      { 
                        field: "promotionAlerts", 
                        label: "Promotion Alerts", 
                        description: "Notifications about promotions and discounts",
                      },
                      { 
                        field: "weeklyReports", 
                        label: "Weekly Reports", 
                        description: "Receive weekly performance reports",
                      },
                      { 
                        field: "reviewAlerts", 
                        label: "Review Alerts", 
                        description: "Get notified when customers leave reviews",
                      },
                      { 
                        field: "deliveryUpdates", 
                        label: "Delivery Updates", 
                        description: "Updates on delivery status",
                      }
                    ].map((item) => (
                      <div key={item.field} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div>
                          <p className="font-medium text-gray-900">{item.label}</p>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notifications?.[item.field] || false}
                            onChange={(e) => handleNotificationChange(item.field, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "preferences" && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    {/* Auto-Accept Orders */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Auto-Accept Orders</p>
                        <p className="text-sm text-gray-600">Automatically accept incoming orders without manual confirmation</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.preferences?.autoAcceptOrders || false}
                          onChange={(e) => handlePreferenceChange("autoAcceptOrders", e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>

                    {/* Advance Notice */}
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Advance Order Notice (Hours)
                      </label>
                      <select
                        value={settings.preferences?.advanceOrderNotice || 2}
                        onChange={(e) => handlePreferenceChange("advanceOrderNotice", parseInt(e.target.value))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value={1}>1 Hour</option>
                        <option value={2}>2 Hours</option>
                        <option value={4}>4 Hours</option>
                        <option value={6}>6 Hours</option>
                        <option value={12}>12 Hours</option>
                        <option value={24}>24 Hours</option>
                      </select>
                      <p className="text-sm text-gray-500 mt-1">Minimum time required before order pickup</p>
                    </div>

                    {/* Maximum Orders */}
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum Daily Orders
                      </label>
                      <input
                        type="number"
                        value={settings.preferences?.maxDailyOrders || 50}
                        onChange={(e) => handlePreferenceChange("maxDailyOrders", parseInt(e.target.value))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        min="1"
                        max="1000"
                      />
                      <p className="text-sm text-gray-500 mt-1">Set a limit to avoid overbooking</p>
                    </div>

                    {/* Currency */}
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Currency
                      </label>
                      <select
                        value={settings.preferences?.currency || "NPR"}
                        onChange={(e) => handlePreferenceChange("currency", e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="NPR">Nepalese Rupee (Rs.)</option>
                        <option value="USD">US Dollar ($)</option>
                        <option value="EUR">Euro (€)</option>
                        <option value="INR">Indian Rupee (₹)</option>
                      </select>
                    </div>

                    {/* Business Hours */}
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Hours
                      </label>
                      <input
                        type="text"
                        value={settings.preferences?.businessHours || "9:00 AM - 9:00 PM"}
                        onChange={(e) => handlePreferenceChange("businessHours", e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="e.g., 9:00 AM - 9:00 PM"
                      />
                      <p className="text-sm text-gray-500 mt-1">Displayed to customers</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    {/* Change Password */}
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Change Password</h4>
                      <div className="space-y-3">
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? "text" : "password"}
                            placeholder="Current Password"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData(prev => ({...prev, currentPassword: e.target.value}))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                          >
                            {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            placeholder="New Password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData(prev => ({...prev, newPassword: e.target.value}))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                          >
                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        <input
                          type="password"
                          placeholder="Confirm New Password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData(prev => ({...prev, confirmPassword: e.target.value}))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                        <button 
                          onClick={handlePasswordChange}
                          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          Update Password
                        </button>
                      </div>
                    </div>

                    {/* Two-Factor Authentication */}
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                          <p className="text-sm text-gray-600 mt-1">Add an extra layer of security to your account</p>
                        </div>
                        <button
                          onClick={handleEnable2FA}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                          Enable
                        </button>
                      </div>
                    </div>

                    {/* Logout All Devices */}
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Logout All Devices</h4>
                          <p className="text-sm text-gray-600 mt-1">Sign out from all devices and sessions</p>
                        </div>
                        <button
                          onClick={handleLogoutAllDevices}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                          Logout All
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "billing" && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    {/* Bank Account Details */}
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900">Bank Account Details</h4>
                        <span className="text-sm text-gray-500">For payouts</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                          <input
                            type="text"
                            value={settings.profile?.bank?.bankName || ""}
                            onChange={(e) => handleBankChange("bankName", e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="e.g., Nepal Bank"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                          <input
                            type="text"
                            value={settings.profile?.bank?.accountNumber || ""}
                            onChange={(e) => handleBankChange("accountNumber", e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="XXXXXXXXXXXX"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Branch Name</label>
                          <input
                            type="text"
                            value={settings.profile?.bank?.branch || ""}
                            onChange={(e) => handleBankChange("branch", e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="e.g., Kathmandu Branch"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder</label>
                          <input
                            type="text"
                            value={settings.profile?.bank?.holderName || ""}
                            onChange={(e) => handleBankChange("holderName", e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="Account holder name"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Payout Schedule */}
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Payout Information</h4>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          <strong>Payout Method:</strong> Bank Transfer
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Status:</strong> Active
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Last Payout:</strong> Not available
                        </p>
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800">
                            Note: Payouts are processed manually. Contact support for payout requests.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;