// src/Pages/Vendor/Settings.js
import React, { useState, useEffect } from "react";
import { readData, writeData } from "../../helpers/storage";
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
  Package,
  DollarSign,
  Users,
  CheckCircle
} from "lucide-react";

const Settings = () => {
  const [settings, setSettings] = useState({});
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    setLoading(true);
    setError("");
    try {
      const data = readData();
      setSettings({
        profile: data.vendorProfile || {
          businessName: "My Tiffin Service",
          ownerName: "",
          email: "",
          phone: "",
          address: "",
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
    } catch (err) {
      setError("Failed to load settings: " + err.message);
      console.error("Error loading settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    setSaving(true);
    setError("");
    
    // Validation
    if (!settings.profile?.businessName?.trim()) {
      setError("Business name is required");
      setSaving(false);
      return;
    }

    if (!settings.profile?.email?.trim() || !/\S+@\S+\.\S+/.test(settings.profile.email)) {
      setError("Valid email is required");
      setSaving(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      try {
        const data = readData();
        data.vendorProfile = settings.profile;
        writeData(data);
        
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } catch (err) {
        setError("Failed to save settings: " + err.message);
        setSaving(false);
      }
    }, 1000);
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

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        handleProfileChange("businessImage", e.target.result);
      };
      reader.onerror = () => {
        setError("Error reading image file");
      };
      reader.readAsDataURL(file);
    }
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
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin text-blue-600 mr-2" size={24} />
        <span className="text-gray-600">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <p className="text-gray-600">Manage your business settings and preferences</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={loadSettings}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Reload</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save size={16} />
            )}
            <span>{saving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
          <button
            onClick={() => setError("")}
            className="text-red-700 hover:text-red-900"
          >
            ×
          </button>
        </div>
      )}

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          Settings saved successfully!
        </div>
      )}

      {/* Settings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
              <Building className="h-6 w-6" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {settings.profile?.businessName ? "✓ Configured" : "Not Set"}
          </h3>
          <p className="text-sm text-gray-600">Business Profile</p>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-50 text-green-600">
              <Bell className="h-6 w-6" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {Object.values(settings.notifications || {}).filter(Boolean).length}
          </h3>
          <p className="text-sm text-gray-600">Active Notifications</p>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
              <Globe className="h-6 w-6" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {settings.preferences?.currency || "NPR"}
          </h3>
          <p className="text-sm text-gray-600">Currency</p>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-orange-50 text-orange-600">
              <Shield className="h-6 w-6" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            Secure
          </h3>
          <p className="text-sm text-gray-600">Account Security</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-24">
            <nav className="space-y-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
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

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Business Profile</h3>
                  <span className="text-sm text-gray-500">Required fields *</span>
                </div>
                
                {/* Business Image */}
                <div className="flex items-center space-x-6">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                    {settings.profile?.businessImage ? (
                      <img 
                        src={settings.profile.businessImage} 
                        alt="Business" 
                        className="w-full h-full object-cover rounded-lg"
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
                      className="cursor-pointer flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Upload size={16} />
                      <span>Upload Logo</span>
                    </label>
                    <p className="text-sm text-gray-500 mt-2">JPG, PNG or GIF. Max 5MB.</p>
                  </div>
                </div>

                {/* Business Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Owner Name *
                    </label>
                    <input
                      type="text"
                      value={settings.profile?.ownerName || ""}
                      onChange={(e) => handleProfileChange("ownerName", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter complete business address"
                    />
                  </div>
                </div>

                {/* Business Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Description
                  </label>
                  <textarea
                    value={settings.profile?.description || ""}
                    onChange={(e) => handleProfileChange("description", e.target.value)}
                    placeholder="Tell customers about your business, cuisine specialties, and what makes you unique..."
                    rows="4"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    This will be visible to customers on your profile page
                  </p>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
                <p className="text-gray-600 mb-4">Choose what notifications you want to receive</p>
                
                <div className="space-y-4">
                  {[
                    { 
                      field: "emailNotifications", 
                      label: "Email Notifications", 
                      description: "Receive important updates via email",
                      icon: <Mail size={18} className="text-gray-400" />
                    },
                    { 
                      field: "orderAlerts", 
                      label: "Order Alerts", 
                      description: "Get notified for new orders",
                      icon: <Package size={18} className="text-gray-400" />
                    },
                    { 
                      field: "promotionAlerts", 
                      label: "Promotion Alerts", 
                      description: "Notifications about promotions and discounts",
                      icon: <DollarSign size={18} className="text-gray-400" />
                    },
                    { 
                      field: "weeklyReports", 
                      label: "Weekly Reports", 
                      description: "Receive weekly performance reports",
                      icon: <Users size={18} className="text-gray-400" />
                    },
                    { 
                      field: "reviewAlerts", 
                      label: "Review Alerts", 
                      description: "Get notified when customers leave reviews",
                      icon: <Bell size={18} className="text-gray-400" />
                    },
                    { 
                      field: "deliveryUpdates", 
                      label: "Delivery Updates", 
                      description: "Updates on delivery status",
                      icon: <Package size={18} className="text-gray-400" />
                    }
                  ].map((item) => (
                    <div key={item.field} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        {item.icon}
                        <div>
                          <p className="font-medium text-gray-900">{item.label}</p>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifications?.[item.field] || false}
                          onChange={(e) => handleNotificationChange(item.field, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "preferences" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Business Preferences</h3>
                
                <div className="space-y-6">
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
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
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
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="NPR">Nepalese Rupee (Rs)</option>
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
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 9:00 AM - 9:00 PM"
                    />
                    <p className="text-sm text-gray-500 mt-1">Displayed to customers</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
                
                <div className="space-y-4">
                  {/* Change Password */}
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Change Password</h4>
                    <div className="space-y-3">
                      <input
                        type="password"
                        placeholder="Current Password"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="password"
                        placeholder="New Password"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="password"
                        placeholder="Confirm New Password"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Update Password
                      </button>
                    </div>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      <Shield className="w-6 h-6 text-yellow-600" />
                      <h4 className="font-medium text-yellow-800">Two-Factor Authentication</h4>
                    </div>
                    <p className="text-sm text-yellow-700 mb-3">
                      Enhance your account security by enabling two-factor authentication. You'll need to enter a code from your authenticator app when signing in.
                    </p>
                    <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                      Enable 2FA
                    </button>
                  </div>

                  {/* Session Management */}
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Active Sessions</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Manage your active login sessions across devices
                    </p>
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                      Logout from All Devices
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "billing" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Billing & Payments</h3>
                
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
                          onChange={(e) =>
                            handleProfileChange("bank", {
                              ...settings.profile?.bank,
                              bankName: e.target.value
                            })
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., Nepal Bank"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                        <input
                          type="text"
                          value={settings.profile?.bank?.accountNumber || ""}
                          onChange={(e) =>
                            handleProfileChange("bank", {
                              ...settings.profile?.bank,
                              accountNumber: e.target.value
                            })
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="XXXXXXXXXXXX"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Branch Name</label>
                        <input
                          type="text"
                          value={settings.profile?.bank?.branch || ""}
                          onChange={(e) =>
                            handleProfileChange("bank", {
                              ...settings.profile?.bank,
                              branch: e.target.value
                            })
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., Kathmandu Branch"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder</label>
                        <input
                          type="text"
                          value={settings.profile?.bank?.holderName || ""}
                          onChange={(e) =>
                            handleProfileChange("bank", {
                              ...settings.profile?.bank,
                              holderName: e.target.value
                            })
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Account holder name"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payout Schedule */}
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Payout Schedule</h4>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        <strong>Next Payout:</strong> Every Friday
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Minimum Payout:</strong> Rs 1,000
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Processing Time:</strong> 1-3 business days
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;