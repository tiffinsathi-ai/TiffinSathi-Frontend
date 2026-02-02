import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Star,
  Pause,
  Play,
  X,
  RefreshCw,
  Settings,
  HeadphonesIcon,
  Edit3,
  Edit2,
  Package,
  CheckCircle,
  CreditCard,
  User,
  MapPin,
  Info,
  Image as ImageIcon,
  Edit,
} from "lucide-react";
import homeBg from "../../assets/home.jpg";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE || 'http://localhost:8080/api';

// Create API service
const createApi = () => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const handleResponse = async (response) => {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Something went wrong' }));
      throw new Error(error.message || 'Request failed');
    }
    return response.json();
  };

  return {
    // Subscription APIs
    fetchUserSubscriptions: async () => {
      const response = await fetch(`${API_BASE_URL}/subscriptions/user`, {
        method: 'GET',
        headers,
      });
      return handleResponse(response);
    },

    fetchSubscriptionDetails: async (subscriptionId) => {
      const response = await fetch(`${API_BASE_URL}/subscriptions/${subscriptionId}/details`, {
        method: 'GET',
        headers,
      });
      return handleResponse(response);
    },

    pauseSubscription: async (subscriptionId) => {
      const response = await fetch(`${API_BASE_URL}/subscriptions/${subscriptionId}/pause`, {
        method: 'PUT',
        headers,
      });
      return handleResponse(response);
    },

    resumeSubscription: async (subscriptionId) => {
      const response = await fetch(`${API_BASE_URL}/subscriptions/${subscriptionId}/resume`, {
        method: 'PUT',
        headers,
      });
      return handleResponse(response);
    },

    cancelSubscription: async (subscriptionId) => {
      const response = await fetch(`${API_BASE_URL}/subscriptions/${subscriptionId}`, {
        method: 'DELETE',
        headers,
      });
      return handleResponse(response);
    },

    fetchSubscriptionOrders: async (subscriptionId) => {
      const response = await fetch(`${API_BASE_URL}/subscriptions/${subscriptionId}/orders`, {
        method: 'GET',
        headers,
      });
      return handleResponse(response);
    },

    fetchSubscriptionById: async (subscriptionId) => {
      const response = await fetch(`${API_BASE_URL}/subscriptions/${subscriptionId}`, {
        method: 'GET',
        headers,
      });
      return handleResponse(response);
    },

    fetchMealPackages: async () => {
      const response = await fetch(`${API_BASE_URL}/meal-packages`, {
        method: 'GET',
        headers,
      });
      return handleResponse(response);
    },

    fetchMealPackageById: async (packageId) => {
      const response = await fetch(`${API_BASE_URL}/meal-packages/${packageId}`, {
        method: 'GET',
        headers,
      });
      return handleResponse(response);
    },
  };
};

const MySubscription = () => {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [activeFilter, setActiveFilter] = useState("ACTIVE");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [subscriptionToCancel, setSubscriptionToCancel] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const [orders, setOrders] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [upcomingMeals, setUpcomingMeals] = useState([]);
  const [subscriptionHistory, setSubscriptionHistory] = useState([]);

  const [api] = useState(() => createApi());

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetchSubscriptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  useEffect(() => {
    if (!error) return;
    toast.error(error);
    setError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const data = await api.fetchUserSubscriptions();
      setSubscriptions(data);
      
      // Fetch package images for subscriptions
      const subscriptionsWithImages = await Promise.all(
        data.map(async (sub) => {
          if (sub.packageId && (!sub.package?.image && !sub.image)) {
            try {
              const packageData = await api.fetchMealPackageById(sub.packageId);
              return {
                ...sub,
                package: {
                  ...sub.package,
                  image: packageData.image,
                },
                image: packageData.image,
              };
            } catch (err) {
              console.error("Error fetching package image:", err);
              return sub;
            }
          }
          return sub;
        })
      );
      
      setSubscriptions(subscriptionsWithImages);
      
      // Prepare subscription history (cancelled and completed subscriptions)
      const history = data.filter(sub => 
        sub.status?.toUpperCase() === "CANCELLED" || 
        sub.status?.toUpperCase() === "COMPLETED"
      ).map(sub => ({
        package: sub.packageName || "Meal Package",
        type: sub.planType || "Monthly",
        duration: `${formatDate(sub.startDate)} - ${formatDate(sub.endDate)}`,
        status: sub.status,
        price: `₹${sub.totalAmount || 0}`,
        rating: 4, // Default rating, can be fetched from backend if available
      }));
      setSubscriptionHistory(history);
      
      // Generate upcoming meals based on active subscriptions
      generateUpcomingMeals(data.filter(sub => 
        sub.status?.toUpperCase() === "ACTIVE" || 
        sub.status?.toUpperCase() === "PAUSED"
      ));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateUpcomingMeals = (activeSubscriptions) => {
    if (activeSubscriptions.length === 0) {
      setUpcomingMeals([]);
      return;
    }

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    const days = [
      {
        day: "Today",
        date: today.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric"
        }),
      },
      {
        day: "Tomorrow",
        date: tomorrow.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric"
        }),
      },
      {
        day: "Day After",
        date: dayAfter.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric"
        }),
      },
    ];

    const mealOptions = [
      { name: "Dal Bhat with Aloo Tama", type: "Lunch", icon: "🍛" },
      { name: "Chicken Curry with Rice", type: "Dinner", icon: "🍗" },
      { name: "Vegetable Curry with Roti", type: "Lunch", icon: "🥗" },
      { name: "Mutton Curry with Rice", type: "Dinner", icon: "🍖" },
      { name: "Mixed Dal with Vegetables", type: "Lunch", icon: "🥘" },
      { name: "Fish Curry with Rice", type: "Dinner", icon: "🐟" },
    ];

    const upcoming = days.map((dayInfo, index) => {
      const mealIndex = index * 2;
      return {
        ...dayInfo,
        meals: [
          {
            ...mealOptions[mealIndex % mealOptions.length],
            time: "12:00 PM"
          },
          {
            ...mealOptions[(mealIndex + 1) % mealOptions.length],
            time: "7:00 PM"
          }
        ]
      };
    });

    setUpcomingMeals(upcoming);
  };

  const fetchSubscriptionDetailData = async (subscriptionId) => {
    setDetailsLoading(true);
    try {
      let details = null;

      // Try the main details endpoint first
      try {
        details = await api.fetchSubscriptionDetails(subscriptionId);
      } catch (err) {
        console.warn(
          "fetchSubscriptionDetails failed, falling back to fetchSubscriptionById:",
          err
        );
        // Fallback to basic subscription endpoint if /details is not available
        details = await api.fetchSubscriptionById(subscriptionId);
      }

      setSubscriptionDetails(details);

      // Orders are optional; if they fail, don't show a red toast
      try {
        const ordersData = await api.fetchSubscriptionOrders(subscriptionId);
        setOrders(ordersData);
      } catch (err) {
        console.warn("Error fetching subscription orders:", err);
      }
    } catch (err) {
      console.error("Error fetching subscription details (after fallback):", err);
      toast.error("Failed to load subscription details");
    } finally {
      setDetailsLoading(false);
    }
  };

  const openDetailsModal = async (subscription) => {
    setSelectedSubscription(subscription);
    setShowDetailsModal(true);
    setActiveTab("Overview");
    await fetchSubscriptionDetailData(subscription.subscriptionId);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedSubscription(null);
    setSubscriptionDetails(null);
    setOrders([]);
    setActiveTab("Overview");
  };

  const handlePause = async (subscriptionId) => {
    try {
      setActionLoading(subscriptionId);
      await api.pauseSubscription(subscriptionId);
      toast.success('Subscription paused successfully');
      fetchSubscriptions();
      
      // Refresh modal if it's open for this subscription
      if (selectedSubscription && selectedSubscription.subscriptionId === subscriptionId) {
        await fetchSubscriptionDetailData(subscriptionId);
      }
    } catch (err) {
      setError(err.message || "Failed to pause subscription");
    } finally {
      setActionLoading(null);
    }
  };

  const handleResume = async (subscriptionId) => {
    try {
      setActionLoading(subscriptionId);
      await api.resumeSubscription(subscriptionId);
      toast.success('Subscription resumed successfully');
      fetchSubscriptions();
      
      // Refresh modal if it's open for this subscription
      if (selectedSubscription && selectedSubscription.subscriptionId === subscriptionId) {
        await fetchSubscriptionDetailData(subscriptionId);
      }
    } catch (err) {
      setError(err.message || "Failed to resume subscription");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelClick = (subscription) => {
    setSubscriptionToCancel(subscription);
    setShowCancelModal(true);
  };

  const handleCancelConfirm = async () => {
    if (!subscriptionToCancel) return;

    try {
      setActionLoading(subscriptionToCancel.subscriptionId);
      await api.cancelSubscription(subscriptionToCancel.subscriptionId);
      toast.success('Subscription cancelled successfully');
      
      // Update local state
      setSubscriptions((prev) =>
        prev.map((sub) =>
          sub.subscriptionId === subscriptionToCancel.subscriptionId
            ? { ...sub, status: "CANCELLED" }
            : sub
        )
      );
      setShowCancelModal(false);
      setSubscriptionToCancel(null);
      
      // Close details modal if it's open for this subscription
      if (selectedSubscription && selectedSubscription.subscriptionId === subscriptionToCancel.subscriptionId) {
        closeDetailsModal();
      }
      
      // Refresh subscription history
      fetchSubscriptions();
    } catch (err) {
      setError(err.message || "Failed to cancel subscription");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelClose = () => {
    setShowCancelModal(false);
    setSubscriptionToCancel(null);
  };

  const handleEditSchedule = () => {
    if (!selectedSubscription) return;
    navigate(`/user/subscriptions/${selectedSubscription.subscriptionId}/edit`, {
      state: { subscription: selectedSubscription },
    });
    closeDetailsModal();
  };

  const handleRefreshDetails = async () => {
    if (!selectedSubscription) return;
    await fetchSubscriptionDetailData(selectedSubscription.subscriptionId);
    toast.success('Subscription details refreshed');
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateLong = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    if (typeof timeString === "number") {
      const hours = Math.floor(timeString / 60);
      const minutes = timeString % 60;
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`;
    }
    return timeString;
  };

  const getDayName = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const days = [
      "SUNDAY",
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
    ];
    return days[date.getDay()];
  };

  const getDeliveryDays = (subscription) => {
    const days =
      subscription.deliveryDays ||
      subscription.deliveryDaysOfWeek ||
      subscription.weeklyDeliveryDays ||
      [];

    if (typeof days === "string") {
      try {
        return JSON.parse(days);
      } catch {
        return days.split(",").map((d) => d.trim());
      }
    }

    return Array.isArray(days) ? days : [];
  };

  const calculateDaysActive = (startDate, endDate, subscription) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = getDeliveryDays(subscription || {});

    let count = 0;
    const current = new Date(start);

    while (current <= end) {
      const dayName = getDayName(current.toISOString()).toUpperCase();
      if (days.length === 0 || days.includes(dayName)) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    return count;
  };

  const calculateProgress = (startDate, endDate) => {
    if (!startDate || !endDate) return { current: 0, total: 0 };
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    const total = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const elapsed = Math.ceil((now - start) / (1000 * 60 * 60 * 24));
    return { current: Math.min(Math.max(elapsed, 0), total), total };
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return "bg-green-100 text-green-700";
      case "PAUSED":
        return "bg-yellow-100 text-yellow-700";
      case "CANCELLED":
        return "bg-red-100 text-red-700";
      case "COMPLETED":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "COMPLETED":
      case "PAID":
        return "text-green-600 bg-green-50";
      case "PENDING":
        return "text-yellow-600 bg-yellow-50";
      case "FAILED":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const calculateTotalMeals = () => {
    if (!subscriptionDetails?.schedule) return 0;
    return subscriptionDetails.schedule.reduce((total, day) => {
      if (day.enabled && day.meals) {
        return total + day.meals.reduce((dayTotal, meal) => dayTotal + (meal.quantity || 0), 0);
      }
      return total;
    }, 0);
  };

  const getTotalDays = () => {
    if (!selectedSubscription) return 0;
    const start = new Date(selectedSubscription.startDate);
    const end = new Date(selectedSubscription.endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const canEditSubscription = () => {
    if (!selectedSubscription) return false;
    
    const status = selectedSubscription.status;
    const endDate = new Date(selectedSubscription.endDate);
    const today = new Date();
    
    return (status === 'ACTIVE' || status === 'PAUSED') && endDate > today;
  };

  // Render Overview Tab
  const renderOverview = () => {
    const subscription = subscriptionDetails || selectedSubscription;
    if (!subscription) return null;

    return (
      <div className="space-y-6">
        {/* Edit Information Banner */}
        {canEditSubscription() && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-700">
                <Info className="h-5 w-5" />
                <div>
                  <p className="font-medium">You can edit your subscription</p>
                  <p className="text-sm mt-1">
                    Update meal schedule, delivery time, and instructions. Changes will apply to future orders only.
                  </p>
                </div>
              </div>
              <button
                onClick={handleEditSchedule}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Schedule
              </button>
            </div>
          </div>
        )}

        {/* Package Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Package Information</h3>
            </div>
            {canEditSubscription() && (
              <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-800 rounded-full">
                Editable
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                {subscription.packageImage ? (
                  <img 
                    src={subscription.packageImage} 
                    alt={subscription.packageName || 'Package'} 
                    className="w-20 h-20 object-cover rounded-lg border"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-100 rounded-lg border flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-gray-900">{subscription.packageName || 'N/A'}</h4>
                  <p className="text-sm text-gray-600">Package ID: {subscription.packageId || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">{getTotalDays()} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Meals:</span>
                <span className="font-medium">{calculateTotalMeals()} meals</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                  {subscription.status}
                </span>
              </div>
              {subscription.vendorBusinessName && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Vendor:</span>
                  <span className="font-medium">{subscription.vendorBusinessName}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Schedule Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Delivery Schedule</h3>
            </div>
            {canEditSubscription() && (
              <button
                onClick={handleEditSchedule}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                <Edit className="h-3 w-3" />
                Edit Schedule
              </button>
            )}
          </div>
          
          <div className="mb-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-sm text-gray-600">Start Date</div>
                <div className="font-semibold">{formatDate(subscription.startDate)}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">End Date</div>
                <div className="font-semibold">{formatDate(subscription.endDate)}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Delivery Time</div>
                <div className="font-semibold">{subscription.preferredDeliveryTime || 'Not specified'}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Days Active</div>
                <div className="font-semibold">
                  {subscription.schedule?.filter(day => day.enabled).length || 0} days/week
                </div>
              </div>
            </div>

            {/* Weekly Schedule */}
            <div className="mt-4">
              <h4 className="font-medium text-gray-900 mb-2">Weekly Delivery Days</h4>
              <div className="grid grid-cols-7 gap-2">
                {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map((day) => {
                  const daySchedule = subscription.schedule?.find(d => d.dayOfWeek === day);
                  const isEnabled = daySchedule?.enabled;
                  
                  return (
                    <div key={day} className="text-center">
                      <div className={`h-10 w-10 rounded-full mx-auto flex items-center justify-center ${
                        isEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-400'
                      }`}>
                        <span className="font-semibold">{day.charAt(0)}</span>
                      </div>
                      <div className="text-xs mt-1 text-gray-600">
                        {day.substring(0, 3)}
                      </div>
                      {isEnabled && daySchedule.meals && (
                        <div className="text-xs text-green-600 mt-1">
                          {daySchedule.meals.length} meal{daySchedule.meals.length !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Delivery Information</h3>
            </div>
            {canEditSubscription() && (
              <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-800 rounded-full">
                Editable
              </span>
            )}
          </div>
          
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-600">Delivery Address</div>
              <div className="font-medium">{subscription.deliveryAddress || 'N/A'}</div>
            </div>
            
            {subscription.landmark && (
              <div>
                <div className="text-sm text-gray-600">Landmark</div>
                <div className="font-medium">{subscription.landmark}</div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Include Packaging</div>
                <div className="font-medium">
                  {subscription.includePackaging ? 'Yes' : 'No'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Include Cutlery</div>
                <div className="font-medium">
                  {subscription.includeCutlery ? 'Yes' : 'No'}
                </div>
              </div>
            </div>
            
            {subscription.dietaryNotes && (
              <div>
                <div className="text-sm text-gray-600">Dietary Notes</div>
                <div className="font-medium">{subscription.dietaryNotes}</div>
              </div>
            )}
            
            {subscription.specialInstructions && (
              <div>
                <div className="text-sm text-gray-600">Special Instructions</div>
                <div className="font-medium">{subscription.specialInstructions}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render Meal Schedule Tab
  const renderMealSchedule = () => {
    const subscription = subscriptionDetails || selectedSubscription;
    if (!subscription || !subscription.schedule) return null;

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Meal Schedule Details</h3>
          </div>
          {canEditSubscription() && (
            <button
              onClick={handleEditSchedule}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Schedule
            </button>
          )}
        </div>
        
        {subscription.schedule.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No schedule information available
          </div>
        ) : (
          <div className="space-y-4">
            {subscription.schedule
              .filter(day => day.enabled)
              .map((day) => (
                <div key={day.dayOfWeek} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">{day.dayOfWeek}</h4>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      Active
                    </span>
                  </div>
                  
                  {day.meals && day.meals.length > 0 ? (
                    <div className="space-y-3">
                      {day.meals.map((meal, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{meal.mealSetName}</div>
                            <div className="text-sm text-gray-600">
                              Type: {meal.mealSetType} • Quantity: {meal.quantity}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">Rs. {meal.unitPrice?.toFixed(2) || '0.00'}</div>
                            <div className="text-sm text-gray-600">per meal</div>
                          </div>
                        </div>
                      ))}
                      
                      <div className="pt-3 border-t border-gray-200">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total for {day.dayOfWeek}:</span>
                          <span className="font-semibold">
                            Rs. {day.meals.reduce((total, meal) => total + ((meal.unitPrice || 0) * (meal.quantity || 0)), 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No meals scheduled for this day
                    </div>
                  )}
                </div>
              ))}
            
            {subscription.schedule.filter(day => !day.enabled).length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-900 mb-2">Inactive Days</h4>
                <div className="flex flex-wrap gap-2">
                  {subscription.schedule
                    .filter(day => !day.enabled)
                    .map((day) => (
                      <span key={day.dayOfWeek} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                        {day.dayOfWeek}
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render Payment Tab
  const renderPayment = () => {
    const subscription = subscriptionDetails || selectedSubscription;
    if (!subscription) return null;

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <CreditCard className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Payment Information</h3>
        </div>
        
        {!subscription.payment ? (
          <div className="text-center py-8 text-gray-500">
            No payment information available
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-600">Payment ID</div>
                  <div className="font-medium">{subscription.payment.paymentId || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Payment Method</div>
                  <div className="font-medium capitalize">{subscription.payment.paymentMethod?.toLowerCase() || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Payment Status</div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(subscription.payment.paymentStatus)}`}>
                    {subscription.payment.paymentStatus || 'N/A'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-600">Transaction ID</div>
                  <div className="font-medium">{subscription.payment.transactionId || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Paid At</div>
                  <div className="font-medium">
                    {formatDate(subscription.payment.paidAt)} {formatTime(subscription.payment.paidAt)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Amount</div>
                  <div className="font-semibold text-lg">Rs. {subscription.payment.amount?.toFixed(2) || '0.00'}</div>
                </div>
              </div>
            </div>

            {/* Billing Summary */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              <h4 className="font-medium text-gray-900 mb-3">Billing Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>Rs. {subscription.subtotalAmount?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee:</span>
                  <span>Rs. {subscription.deliveryFee?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax:</span>
                  <span>Rs. {subscription.taxAmount?.toFixed(2) || '0.00'}</span>
                </div>
                {subscription.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-Rs. {subscription.discountAmount?.toFixed(2) || '0.00'}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-200 pt-2 mt-2 font-semibold text-lg">
                  <span>Total Amount:</span>
                  <span>Rs. {subscription.totalAmount?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render Customer Tab
  const renderCustomer = () => {
    const subscription = subscriptionDetails || selectedSubscription;
    if (!subscription) return null;

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <User className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Customer Information</h3>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">Full Name</div>
              <div className="font-medium">{subscription.customer?.userName || subscription.user?.name || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">User ID</div>
              <div className="font-medium">{subscription.customer?.userId || subscription.user?.userId || 'N/A'}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">Email Address</div>
              <div className="font-medium">{subscription.customer?.email || subscription.user?.email || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Phone Number</div>
              <div className="font-medium">{subscription.customer?.phoneNumber || subscription.user?.phone || 'N/A'}</div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">Subscription History</h4>
            <div className="text-sm text-gray-600">
              Created on {formatDate(subscription.createdAt)} at {formatTime(subscription.createdAt)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Orders History
  const renderOrdersHistory = () => {
    if (!orders || orders.length === 0) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-center py-8 text-gray-500">
            No order history available
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Order History</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.orderId} className="border-b last:border-0">
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">#{order.orderId}</p>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {formatDate(order.deliveryDate || order.createdAt)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm font-medium">
                    Rs. {order.totalAmount?.toFixed(2) || '0.00'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Filter subscriptions
  const activeSubscriptions = subscriptions
    .filter(
      (sub) =>
        sub.status?.toUpperCase() === "ACTIVE" ||
        sub.status?.toUpperCase() === "PAUSED"
    )
    // Sort so the most recent subscription appears first
    .sort((a, b) => {
      const aDate = new Date(a.createdAt || a.startDate || 0).getTime();
      const bDate = new Date(b.createdAt || b.startDate || 0).getTime();
      return bDate - aDate;
    });
  
  const cancelledSubscriptions = subscriptions.filter(
    (sub) => sub.status?.toUpperCase() === "CANCELLED"
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ToastContainer />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer />
      
      {/* Hero Section */}
      <section className="relative min-h-[300px] flex items-center justify-center overflow-hidden py-12 px-6">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${homeBg})`,
            filter: "blur(8px)",
            transform: "scale(1.1)",
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-br from-green-400/30 via-yellow-400/20 to-green-500/30"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
            Your Meal
          </h1>
          <h2
            className="text-3xl md:text-4xl font-bold mb-4 drop-shadow-lg"
            style={{ color: "#F5B800" }}
          >
            Subscriptions
          </h2>
          <p className="text-lg text-white drop-shadow-md max-w-xl mx-auto">
            Manage your active subscriptions, view upcoming meals, and customize
            your preferences
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Horizontal Filter Buttons */}
        <div className="mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveFilter("ACTIVE")}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeFilter === "ACTIVE"
                  ? "bg-[#528C3C] text-white"
                  : "bg-[#F5F6F8] text-[#334155] hover:bg-gray-200"
              }`}
            >
              Active Subscriptions
            </button>
            <button
              onClick={() => setActiveFilter("CANCELLED")}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeFilter === "CANCELLED"
                  ? "bg-[#528C3C] text-white"
                  : "bg-[#F5F6F8] text-[#334155] hover:bg-gray-200"
              }`}
            >
              Canceled Subscriptions
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div>
          {/* Active Subscriptions */}
          {activeFilter === "ACTIVE" && (
            <React.Fragment>
              <section className="mb-10">
                {activeSubscriptions.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                    <p className="text-gray-500 mb-4">
                      No active subscriptions found
                    </p>
                    <button
                      onClick={() => navigate("/packages")}
                      className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600"
                    >
                      Browse Packages
                    </button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {activeSubscriptions.map((sub) => {
                      const progress = calculateProgress(
                        sub.startDate,
                        sub.endDate
                      );
                      const isActive = sub.status?.toUpperCase() === "ACTIVE";
                      const isPaused = sub.status?.toUpperCase() === "PAUSED";

                      return (
                        <div
                          key={sub.subscriptionId}
                          className="bg-white rounded-lg shadow-sm border overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => openDetailsModal(sub)}
                        >
                          <div className="flex">
                            <div className="w-24 h-24 bg-gray-200 flex-shrink-0">
                              {sub.packageImage ? (
                                <img
                                  src={sub.packageImage}
                                  alt={sub.packageName || "Meal"}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                  <Package className="h-10 w-10 text-gray-500" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h3 className="font-semibold text-gray-900">
                                    {sub.packageName || "Tiffin Subscription"}
                                  </h3>
                                  <div className="flex gap-2 mt-1">
                                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                                      {sub.planType || "Daily"}
                                    </span>
                                  </div>
                                </div>
                                <span
                                  className={`text-xs px-2 py-1 rounded ${getStatusColor(
                                    sub.status
                                  )}`}
                                >
                                  {sub.status || "Active"}
                                </span>
                              </div>

                              <div className="mb-3">
                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                  <span>Progress</span>
                                  <span>
                                    {progress.current}/{progress.total} days
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-green-500 h-2 rounded-full"
                                    style={{
                                      width: `${
                                        (progress.current / progress.total) * 100
                                      }%`,
                                    }}
                                  ></div>
                                </div>
                              </div>

                              <div className="flex justify-between text-sm mb-4">
                                <div>
                                  <p className="text-gray-500 text-xs">
                                    Next Delivery:
                                  </p>
                                  <p className="font-medium">
                                    {formatDate(
                                      sub.nextDeliveryDate || sub.startDate
                                    )}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-gray-500 text-xs">Price:</p>
                                  <p className="font-medium text-green-600">
                                    ₹{sub.totalAmount || 0}
                                  </p>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancelClick(sub);
                                  }}
                                  disabled={actionLoading === sub.subscriptionId}
                                  className="flex-1 bg-yellow-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-yellow-600 disabled:opacity-50"
                                >
                                  Cancel
                                </button>
                                {isActive ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePause(sub.subscriptionId);
                                    }}
                                    disabled={
                                      actionLoading === sub.subscriptionId
                                    }
                                    className="flex items-center gap-1 border border-yellow-500 text-yellow-600 py-2 px-4 rounded-lg text-sm font-medium hover:bg-yellow-50 disabled:opacity-50"
                                  >
                                    <Pause className="w-4 h-4" />
                                    Pause
                                  </button>
                                ) : isPaused ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleResume(sub.subscriptionId);
                                    }}
                                    disabled={
                                      actionLoading === sub.subscriptionId
                                    }
                                    className="flex items-center gap-1 border border-green-500 text-green-600 py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-50 disabled:opacity-50"
                                  >
                                    <Play className="w-4 h-4" />
                                    Resume
                                  </button>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Upcoming Meals, Subscription History, and Quick Actions sections removed */}
            </React.Fragment>
          )}

          {/* Canceled Subscriptions */}
          {activeFilter === "CANCELLED" && (
            <section className="mb-10">
              {cancelledSubscriptions.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                  <p className="text-gray-500">
                    No canceled subscriptions found
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {cancelledSubscriptions.map((sub) => {
                    const progress = calculateProgress(
                      sub.startDate,
                      sub.endDate
                    );

                    return (
                      <div
                        key={sub.subscriptionId}
                        className="bg-white rounded-lg shadow-sm border overflow-hidden opacity-75 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => openDetailsModal(sub)}
                      >
                        <div className="flex">
                          <div className="w-24 h-24 bg-gray-200 flex-shrink-0">
                            {sub.packageImage ? (
                              <img
                                src={sub.packageImage}
                                alt={sub.packageName || "Meal"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                <Package className="h-10 w-10 text-gray-500" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  {sub.packageName || "Tiffin Subscription"}
                                </h3>
                                <div className="flex gap-2 mt-1">
                                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                                    {sub.planType || "Daily"}
                                  </span>
                                </div>
                              </div>
                              <span
                                className={`text-xs px-2 py-1 rounded ${getStatusColor(
                                  sub.status
                                )}`}
                              >
                                {sub.status || "Cancelled"}
                              </span>
                            </div>

                            <div className="mb-3">
                              <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Progress</span>
                                <span>
                                  {progress.current}/{progress.total} days
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-red-500 h-2 rounded-full"
                                  style={{
                                    width: `${
                                      (progress.current / progress.total) * 100
                                    }%`,
                                  }}
                                ></div>
                              </div>
                            </div>

                            <div className="flex justify-between text-sm mb-4">
                              <div>
                                <p className="text-gray-500 text-xs">
                                  Canceled Date:
                                </p>
                                <p className="font-medium">
                                  {formatDate(sub.endDate || sub.startDate)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-gray-500 text-xs">Price:</p>
                                <p className="font-medium text-gray-600">
                                  ₹{sub.totalAmount || 0}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </div>
      </div>

      {/* Subscription Details Modal */}
      {showDetailsModal && selectedSubscription && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 py-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Subscription Details</h2>
                <p className="text-sm text-gray-600 mt-1">
                  #{selectedSubscription.subscriptionId} • Created {formatDate(selectedSubscription.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRefreshDetails}
                  disabled={detailsLoading}
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <RefreshCw className={`h-4 w-4 ${detailsLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={closeDetailsModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Status Banner */}
            <div className={`px-6 py-3 ${getStatusColor(selectedSubscription.status).replace('text', 'bg').replace('bg-', 'bg-')} border-b`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Subscription is {selectedSubscription.status}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm">
                    {formatDate(selectedSubscription.startDate)} to {formatDate(selectedSubscription.endDate)}
                  </div>
                  {canEditSubscription() && (
                    <div className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                      ✏️ Editable
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b">
              <div className="px-6 flex space-x-4 overflow-x-auto">
                {['Overview', 'Meal Schedule', 'Payment', 'Customer Info', 'Order History'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${
                      activeTab === tab
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {detailsLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  {activeTab === 'Overview' && renderOverview()}
                  {activeTab === 'Meal Schedule' && renderMealSchedule()}
                  {activeTab === 'Payment' && renderPayment()}
                  {activeTab === 'Customer Info' && renderCustomer()}
                  {activeTab === 'Order History' && renderOrdersHistory()}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="border-t px-6 py-4">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Total: <span className="font-semibold">Rs. {selectedSubscription.totalAmount?.toFixed(2) || '0.00'}</span>
                  {canEditSubscription() && (
                    <span className="ml-2 text-xs text-blue-600">• Changes may affect future billing</span>
                  )}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={closeDetailsModal}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  {canEditSubscription() && (
                    <button
                      onClick={handleEditSchedule}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Edit Schedule
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && subscriptionToCancel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-xl font-bold text-gray-900">
                Cancel Subscription
              </h3>
              <button
                onClick={handleCancelClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Package Image */}
              <div className="mb-4 flex justify-center">
                <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-200">
                  {subscriptionToCancel.packageImage ? (
                    <img
                      src={subscriptionToCancel.packageImage}
                      alt={subscriptionToCancel.packageName || "Package"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                      <Package className="h-12 w-12 text-gray-500" />
                    </div>
                  )}
                </div>
              </div>

              {/* Package Details */}
              <div className="text-center mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {subscriptionToCancel.packageName || "Tiffin Subscription"}
                </h4>
                <p className="text-sm text-gray-600 mb-1">
                  Plan Type: {subscriptionToCancel.planType || "Daily"}
                </p>
                <p className="text-sm text-gray-600">
                  Amount: ₹{subscriptionToCancel.totalAmount || 0}
                </p>
              </div>

              {/* Confirmation Message */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700 text-center">
                  Are you sure you want to cancel this subscription? This action
                  cannot be undone.
                </p>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleCancelClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Keep Subscription
                </button>
                <button
                  onClick={handleCancelConfirm}
                  disabled={
                    actionLoading === subscriptionToCancel.subscriptionId
                  }
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading === subscriptionToCancel.subscriptionId ? (
                    <span className="flex items-center justify-center">
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Cancelling...
                    </span>
                  ) : (
                    "Yes, Cancel Subscription"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySubscription;