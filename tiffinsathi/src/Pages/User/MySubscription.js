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
} from "lucide-react";
import homeBg from "../../assets/home.jpg";
import { toast } from "react-toastify";

const MySubscription = () => {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [activeFilter, setActiveFilter] = useState("ACTIVE"); // ACTIVE, CANCELLED
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [subscriptionToCancel, setSubscriptionToCancel] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchSubscriptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, navigate]);

  useEffect(() => {
    if (!error) return;
    toast.error(error);
    setError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      if (!token) {
        navigate("/login");
        return;
      }
      const response = await fetch(
        "http://localhost:8080/api/subscriptions/user",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch subscriptions");
      }

      const data = await response.json();

      // Fetch package images for each subscription if packageId exists
      const subscriptionsWithImages = await Promise.all(
        data.map(async (sub) => {
          // If package image is not already included, try to fetch it
          if (
            (!sub.package?.image && !sub.image && sub.packageId) ||
            (sub.packageId && !sub.package)
          ) {
            try {
              const packageResponse = await fetch(
                `http://localhost:8080/api/meal-packages/${sub.packageId}`,
                {
                  method: "GET",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                }
              );
              if (packageResponse.ok) {
                const packageData = await packageResponse.json();
                return {
                  ...sub,
                  package: {
                    ...sub.package,
                    image: packageData.image || sub.package?.image,
                  },
                  image: packageData.image || sub.image,
                };
              }
            } catch (err) {
              console.error("Error fetching package image:", err);
            }
          }
          return sub;
        })
      );

      setSubscriptions(subscriptionsWithImages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async (subscriptionId) => {
    try {
      setActionLoading(subscriptionId);
      if (!token) {
        navigate("/login");
        return;
      }
      const response = await fetch(
        `http://localhost:8080/api/subscriptions/${subscriptionId}/pause`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to pause subscription");
      }

      toast.success("Subscription paused");
      fetchSubscriptions();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResume = async (subscriptionId) => {
    try {
      setActionLoading(subscriptionId);
      if (!token) {
        navigate("/login");
        return;
      }
      const response = await fetch(
        `http://localhost:8080/api/subscriptions/${subscriptionId}/resume`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to resume subscription");
      }

      toast.success("Subscription resumed");
      fetchSubscriptions();
    } catch (err) {
      setError(err.message);
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
      if (!token) {
        navigate("/login");
        return;
      }
      const response = await fetch(
        `http://localhost:8080/api/subscriptions/${subscriptionToCancel.subscriptionId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to cancel subscription");
      }

      toast.success("Subscription cancelled");
      // Update local state to move subscription from active to canceled
      setSubscriptions((prev) =>
        prev.map((sub) =>
          sub.subscriptionId === subscriptionToCancel.subscriptionId
            ? { ...sub, status: "CANCELLED" }
            : sub
        )
      );
      setShowCancelModal(false);
      setSubscriptionToCancel(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelClose = () => {
    setShowCancelModal(false);
    setSubscriptionToCancel(null);
  };

  const openDetailsModal = (subscription) => {
    setSelectedSubscription(subscription);
    setShowDetailsModal(true);
    setActiveTab("Overview");
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedSubscription(null);
    setActiveTab("Overview");
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
    if (!timeString) return "N/A";
    if (typeof timeString === "number") {
      // If it's a number (minutes from midnight), convert to HH:MM
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
    // Try to get delivery days from various possible fields
    const days =
      subscription.deliveryDays ||
      subscription.deliveryDaysOfWeek ||
      subscription.weeklyDeliveryDays ||
      [];

    // If it's a string, try to parse it
    if (typeof days === "string") {
      try {
        return JSON.parse(days);
      } catch {
        return days.split(",").map((d) => d.trim());
      }
    }

    return Array.isArray(days) ? days : [];
  };

  const getMealSchedule = (subscription) => {
    // Try to get meal schedule from various possible fields
    const schedule =
      subscription.mealSchedule ||
      subscription.meals ||
      subscription.schedule ||
      subscription.mealItems ||
      subscription.package?.mealSchedule ||
      subscription.package?.meals ||
      subscription.mealPackage?.mealSchedule ||
      subscription.mealPackage?.meals ||
      [];

    if (typeof schedule === "string") {
      try {
        return JSON.parse(schedule);
      } catch {
        return [];
      }
    }

    return Array.isArray(schedule) ? schedule : [];
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
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Mock data for upcoming meals (since API doesn't provide this)
  const upcomingMeals = [
    {
      day: "Today",
      date: "Thursday, January 25, 2024",
      meals: [
        {
          name: "Dal Bhat with Aloo Tama",
          type: "Lunch",
          time: "12:00 PM",
          icon: "🍛",
        },
        {
          name: "Chicken Curry with Rice",
          type: "Dinner",
          time: "7:00 PM",
          icon: "🍗",
        },
      ],
    },
    {
      day: "Tomorrow",
      date: "Friday, January 26, 2024",
      meals: [
        {
          name: "Vegetable Curry with Roti",
          type: "Lunch",
          time: "12:00 PM",
          icon: "🥗",
        },
        {
          name: "Mutton Curry with Rice",
          type: "Dinner",
          time: "7:00 PM",
          icon: "🍖",
        },
      ],
    },
    {
      day: "Day After",
      date: "Saturday, January 27, 2024",
      meals: [
        {
          name: "Mixed Dal with Vegetables",
          type: "Lunch",
          time: "12:00 PM",
          icon: "🥘",
        },
        {
          name: "Fish Curry with Rice",
          type: "Dinner",
          time: "7:00 PM",
          icon: "🐟",
        },
      ],
    },
  ];

  // Mock subscription history
  const subscriptionHistory = [
    {
      package: "Monthly Premium",
      type: "Monthly",
      duration: "01/12/2023 - 31/12/2023",
      status: "Completed",
      price: "₹3200",
      rating: 5,
    },
    {
      package: "Festival Special",
      type: "Special",
      duration: "15/10/2023 - 20/10/2023",
      status: "Completed",
      price: "₹250",
      rating: 4,
    },
  ];

  // Filter subscriptions based on active filter
  const filteredSubscriptions = subscriptions.filter((sub) => {
    const status = sub.status?.toUpperCase();
    if (activeFilter === "ACTIVE")
      return status === "ACTIVE" || status === "PAUSED";
    if (activeFilter === "CANCELLED") return status === "CANCELLED";
    return true;
  });

  const activeSubscriptions = subscriptions.filter(
    (sub) =>
      sub.status?.toUpperCase() === "ACTIVE" ||
      sub.status?.toUpperCase() === "PAUSED"
  );
  const cancelledSubscriptions = subscriptions.filter(
    (sub) => sub.status?.toUpperCase() === "CANCELLED"
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
                    // Try multiple possible paths for package image
                    const packageImage =
                      sub.package?.image ||
                      sub.mealPackage?.image ||
                      sub.packageImage ||
                      sub.image ||
                      sub.package?.mealPackage?.image ||
                      (sub.packageId &&
                        `http://localhost:8080/api/meal-packages/${sub.packageId}/image`) ||
                      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200";

                    return (
                      <div
                        key={sub.subscriptionId}
                        className="bg-white rounded-lg shadow-sm border overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => openDetailsModal(sub)}
                      >
                        <div className="flex">
                          <div className="w-24 h-24 bg-gray-200 flex-shrink-0">
                            <img
                              src={packageImage}
                              alt={sub.packageName || "Meal"}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src =
                                  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200";
                              }}
                            />
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
                    // Try multiple possible paths for package image
                    const packageImage =
                      sub.package?.image ||
                      sub.mealPackage?.image ||
                      sub.packageImage ||
                      sub.image ||
                      sub.package?.mealPackage?.image ||
                      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200";

                    return (
                      <div
                        key={sub.subscriptionId}
                        className="bg-white rounded-lg shadow-sm border overflow-hidden opacity-75 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => openDetailsModal(sub)}
                      >
                        <div className="flex">
                          <div className="w-24 h-24 bg-gray-200 flex-shrink-0">
                            <img
                              src={packageImage}
                              alt={sub.packageName || "Meal"}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src =
                                  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200";
                              }}
                            />
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

          {/* Upcoming Meals - Only show when viewing Active Subscriptions */}
          {activeFilter === "ACTIVE" && (
            <React.Fragment>
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Upcoming Meals
                </h2>

                <div className="space-y-6">
                  {upcomingMeals.map((dayMeals, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-lg shadow-sm border p-4"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {dayMeals.day}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {dayMeals.date}
                          </p>
                        </div>
                        <button className="flex items-center gap-1 text-yellow-600 border border-yellow-500 px-3 py-1.5 rounded-lg text-sm hover:bg-yellow-50">
                          <Edit3 className="w-4 h-4" />
                          Customize
                        </button>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        {dayMeals.meals.map((meal, mealIdx) => (
                          <div
                            key={mealIdx}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                          >
                            <span className="text-2xl">{meal.icon}</span>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {meal.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {meal.type} • {meal.time}
                              </p>
                            </div>
                            <div
                              className={`w-3 h-3 rounded ${
                                meal.type === "Lunch"
                                  ? "bg-green-500"
                                  : "bg-red-500"
                              }`}
                            ></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Subscription History */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Subscription History
                </h2>

                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                            Package
                          </th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                            Duration
                          </th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                            Status
                          </th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                            Price
                          </th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                            Rating
                          </th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {subscriptionHistory.map((history, idx) => (
                          <tr key={idx} className="border-b last:border-0">
                            <td className="py-3 px-4">
                              <p className="font-medium text-gray-900">
                                {history.package}
                              </p>
                              <p className="text-sm text-gray-500">
                                {history.type}
                              </p>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {history.duration}
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-green-600">
                                {history.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm font-medium">
                              {history.price}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < history.rating
                                        ? "text-yellow-400 fill-yellow-400"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <button className="text-yellow-600 border border-yellow-500 px-3 py-1 rounded text-sm hover:bg-yellow-50">
                                <RefreshCw className="w-4 h-4 inline mr-1" />
                                Reorder
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              {/* Quick Actions */}
              <section className="grid md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-6 h-6 text-yellow-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Schedule Delivery
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Change your delivery schedule or skip meals
                  </p>
                  <button className="w-full border border-yellow-500 text-yellow-600 py-2 rounded-lg hover:bg-yellow-50">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Manage Schedule
                  </button>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Settings className="w-6 h-6 text-yellow-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Preferences
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Update your dietary preferences and spice levels
                  </p>
                  <button className="w-full border border-yellow-500 text-yellow-600 py-2 rounded-lg hover:bg-yellow-50">
                    <Settings className="w-4 h-4 inline mr-2" />
                    Update Preferences
                  </button>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HeadphonesIcon className="w-6 h-6 text-yellow-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Support</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Need help with your subscription?
                  </p>
                  <button className="w-full border border-yellow-500 text-yellow-600 py-2 rounded-lg hover:bg-yellow-50">
                    <HeadphonesIcon className="w-4 h-4 inline mr-2" />
                    Contact Support
                  </button>
                </div>
              </section>
            </React.Fragment>
          )}
        </div>
      </div>

      {/* Subscription Details Modal */}
      {showDetailsModal && selectedSubscription && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 px-4 py-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Subscription Details
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    #
                    {selectedSubscription.subscriptionCode ||
                      selectedSubscription.subscriptionId}{" "}
                    • Created{" "}
                    {formatDateLong(
                      selectedSubscription.createdAt ||
                        selectedSubscription.startDate
                    )}
                  </p>
                </div>
                <button
                  onClick={closeDetailsModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Active Status Bar */}
              <div
                className={`mt-4 px-4 py-3 rounded-lg flex items-center justify-between ${
                  selectedSubscription.status?.toUpperCase() === "ACTIVE"
                    ? "bg-green-50 border border-green-200"
                    : selectedSubscription.status?.toUpperCase() === "PAUSED"
                    ? "bg-yellow-50 border border-yellow-200"
                    : "bg-gray-50 border border-gray-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  {selectedSubscription.status?.toUpperCase() === "ACTIVE" && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                  <span
                    className={`font-semibold ${
                      selectedSubscription.status?.toUpperCase() === "ACTIVE"
                        ? "text-green-700"
                        : selectedSubscription.status?.toUpperCase() ===
                          "PAUSED"
                        ? "text-yellow-700"
                        : "text-gray-700"
                    }`}
                  >
                    Subscription is{" "}
                    {selectedSubscription.status?.toUpperCase() || "ACTIVE"}
                  </span>
                </div>
                <span className="text-sm text-gray-600">
                  {formatDateLong(selectedSubscription.startDate)} to{" "}
                  {formatDateLong(selectedSubscription.endDate)}
                </span>
              </div>

              {/* Tabs */}
              <div className="flex gap-6 mt-4 border-b">
                {["Overview", "Meal Schedule", "Payment", "Customer Info"].map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-3 px-1 font-medium text-sm transition-colors ${
                        activeTab === tab
                          ? "text-blue-600 border-b-2 border-blue-600"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {tab}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              {activeTab === "Overview" && (
                <div className="space-y-6">
                  {/* Package Information Card */}
                  <div className="bg-white rounded-lg border shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Package className="w-5 h-5 text-gray-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Package Information
                      </h3>
                    </div>
                    <div className="flex gap-6">
                      <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                        <img
                          src={
                            selectedSubscription.package?.image ||
                            selectedSubscription.mealPackage?.image ||
                            selectedSubscription.packageImage ||
                            selectedSubscription.image ||
                            selectedSubscription.package?.mealPackage?.image ||
                            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200"
                          }
                          alt={selectedSubscription.packageName || "Package"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src =
                              "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200";
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-semibold text-gray-900 mb-2">
                          {selectedSubscription.packageName ||
                            selectedSubscription.package?.name ||
                            "Tiffin Subscription"}
                        </h4>
                        <div className="space-y-2 text-sm">
                          <p className="text-gray-600">
                            <span className="font-medium">Package ID:</span>{" "}
                            {selectedSubscription.packageId ||
                              selectedSubscription.package?.packageId ||
                              "N/A"}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-medium">Duration:</span>{" "}
                            {selectedSubscription.durationDays ||
                              calculateProgress(
                                selectedSubscription.startDate,
                                selectedSubscription.endDate
                              ).total}{" "}
                            days
                          </p>
                          <p className="text-gray-600">
                            <span className="font-medium">Total Meals:</span>{" "}
                            {selectedSubscription.totalMeals ||
                              selectedSubscription.package?.totalMeals ||
                              "N/A"}{" "}
                            meals
                          </p>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              selectedSubscription.status?.toUpperCase() ===
                              "ACTIVE"
                                ? "bg-green-100 text-green-700"
                                : selectedSubscription.status?.toUpperCase() ===
                                  "PAUSED"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {selectedSubscription.status?.toUpperCase() ||
                              "ACTIVE"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Schedule Card */}
                  <div className="bg-white rounded-lg border shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className="w-5 h-5 text-gray-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Delivery Schedule
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 mb-1">Start Date</p>
                        <p className="font-medium text-gray-900">
                          {formatDateLong(selectedSubscription.startDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">End Date</p>
                        <p className="font-medium text-gray-900">
                          {formatDateLong(selectedSubscription.endDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Delivery Time</p>
                        <p className="font-medium text-gray-900">
                          {formatTime(selectedSubscription.deliveryTime) ||
                            "12:00"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Days Active</p>
                        <p className="font-medium text-gray-900">
                          {(() => {
                            const deliveryDays =
                              getDeliveryDays(selectedSubscription);
                            return deliveryDays.length > 0
                              ? deliveryDays.length
                              : 7;
                          })()}{" "}
                          days/week
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-gray-500 mb-2">
                          Weekly Delivery Days
                        </p>
                        <div className="flex gap-2">
                          {["M", "T", "W", "T", "F", "S", "S"].map(
                            (day, idx) => {
                              const dayNames = [
                                "MONDAY",
                                "TUESDAY",
                                "WEDNESDAY",
                                "THURSDAY",
                                "FRIDAY",
                                "SATURDAY",
                                "SUNDAY",
                              ];
                              const deliveryDays =
                                getDeliveryDays(selectedSubscription);
                              const isActive =
                                deliveryDays.length === 0 ||
                                deliveryDays.includes(dayNames[idx]);
                              return (
                                <div
                                  key={idx}
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                                    isActive
                                      ? "bg-green-500 text-white"
                                      : "bg-gray-200 text-gray-500"
                                  }`}
                                >
                                  {day}
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "Meal Schedule" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Meal Schedule Details
                    </h3>
                  </div>

                  {(() => {
                    const mealSchedule = getMealSchedule(selectedSubscription);
                    const deliveryDays = getDeliveryDays(selectedSubscription);
                    const startDate = new Date(selectedSubscription.startDate);
                    const endDate = new Date(selectedSubscription.endDate);
                    const daysOfWeek = [
                      "MONDAY",
                      "TUESDAY",
                      "WEDNESDAY",
                      "THURSDAY",
                      "FRIDAY",
                      "SATURDAY",
                      "SUNDAY",
                    ];
                    let totalAmount = 0;
                    const scheduleByDay = {};

                    // Group meals by day
                    if (mealSchedule.length > 0) {
                      mealSchedule.forEach((meal) => {
                        const day = meal.dayOfWeek || meal.day;
                        if (!scheduleByDay[day]) {
                          scheduleByDay[day] = [];
                        }
                        scheduleByDay[day].push(meal);
                      });
                    } else {
                      // If no meal schedule, create default based on delivery days
                      const activeDays =
                        deliveryDays.length > 0 ? deliveryDays : daysOfWeek;
                      activeDays.forEach((day) => {
                        const defaultPrice =
                          selectedSubscription.totalAmount &&
                          selectedSubscription.totalMeals
                            ? selectedSubscription.totalAmount /
                              selectedSubscription.totalMeals
                            : 1000;
                        scheduleByDay[day] = [
                          {
                            name:
                              selectedSubscription.packageName ||
                              selectedSubscription.package?.name ||
                              "Meal Set",
                            type:
                              selectedSubscription.mealType ||
                              selectedSubscription.package?.mealType ||
                              "NON_VEG",
                            quantity: 1,
                            price: defaultPrice,
                          },
                        ];
                      });
                    }

                    return (
                      <>
                        {daysOfWeek.map((day) => {
                          const meals = scheduleByDay[day] || [];
                          if (meals.length === 0) return null;

                          const dayTotal = meals.reduce((sum, meal) => {
                            const mealPrice =
                              meal.price ||
                              meal.mealPrice ||
                              meal.meal?.price ||
                              (selectedSubscription.totalAmount &&
                              selectedSubscription.totalMeals
                                ? selectedSubscription.totalAmount /
                                  selectedSubscription.totalMeals
                                : 1000);
                            const quantity = meal.quantity || meal.qty || 1;
                            return sum + mealPrice * quantity;
                          }, 0);
                          totalAmount += dayTotal;

                          return (
                            <div
                              key={day}
                              className="bg-white rounded-lg border shadow-sm p-4"
                            >
                              <h4 className="font-semibold text-gray-900 mb-3">
                                {day}:
                              </h4>
                              {meals.map((meal, idx) => {
                                const mealName =
                                  meal.name ||
                                  meal.mealName ||
                                  meal.meal?.name ||
                                  selectedSubscription.packageName ||
                                  "Meal Set";
                                const mealType =
                                  meal.type ||
                                  meal.mealType ||
                                  meal.meal_type ||
                                  selectedSubscription.mealType ||
                                  selectedSubscription.package?.mealType ||
                                  "NON_VEG";
                                const quantity = meal.quantity || meal.qty || 1;
                                const mealPrice =
                                  meal.price ||
                                  meal.mealPrice ||
                                  meal.meal?.price ||
                                  (selectedSubscription.totalAmount &&
                                  selectedSubscription.totalMeals
                                    ? selectedSubscription.totalAmount /
                                      selectedSubscription.totalMeals
                                    : 1000);

                                return (
                                  <div
                                    key={idx}
                                    className="mb-3 pb-3 border-b last:border-0"
                                  >
                                    <div className="flex justify-between items-start mb-2">
                                      <div>
                                        <p className="font-medium text-gray-900">
                                          {mealName}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                          Type: {mealType} • Quantity:{" "}
                                          {quantity}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-sm font-medium text-gray-900">
                                          Rs. {mealPrice.toFixed(2)} per meal
                                        </p>
                                        <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                                          Active
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                              <div className="mt-3 pt-3 border-t">
                                <p className="text-sm font-semibold text-gray-700">
                                  Total for {day}: Rs. {dayTotal.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                        <div className="bg-white rounded-lg border shadow-sm p-4 mt-4">
                          <p className="text-lg font-bold text-gray-900">
                            Total: Rs. {totalAmount.toFixed(2)}
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {activeTab === "Payment" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Payment Information
                    </h3>
                  </div>
                  <div className="bg-white rounded-lg border shadow-sm p-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">
                          Payment Method
                        </p>
                        <p className="text-base font-medium text-gray-900">
                          {selectedSubscription.paymentMethod ||
                            selectedSubscription.payment?.method ||
                            "Online Payment"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">
                          Transaction ID
                        </p>
                        <p className="text-base font-medium text-gray-900">
                          {selectedSubscription.transactionId ||
                            selectedSubscription.payment?.transactionId ||
                            "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">
                          Total Amount
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          ₹{selectedSubscription.totalAmount || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">
                          Payment Status
                        </p>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                            selectedSubscription.paymentStatus?.toUpperCase() ===
                            "PAID"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {selectedSubscription.paymentStatus?.toUpperCase() ||
                            "PAID"}
                        </span>
                      </div>
                      {selectedSubscription.paymentDate && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">
                            Payment Date
                          </p>
                          <p className="text-base font-medium text-gray-900">
                            {formatDateLong(selectedSubscription.paymentDate)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "Customer Info" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Customer Information
                    </h3>
                  </div>
                  <div className="bg-white rounded-lg border shadow-sm p-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Name</p>
                        <p className="text-base font-medium text-gray-900">
                          {selectedSubscription.user?.name ||
                            selectedSubscription.customerName ||
                            "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Email</p>
                        <p className="text-base font-medium text-gray-900">
                          {selectedSubscription.user?.email ||
                            selectedSubscription.customerEmail ||
                            "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Phone</p>
                        <p className="text-base font-medium text-gray-900">
                          {selectedSubscription.user?.phone ||
                            selectedSubscription.customerPhone ||
                            "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">
                          Delivery Address
                        </p>
                        <p className="text-base font-medium text-gray-900">
                          {selectedSubscription.deliveryAddress ||
                            selectedSubscription.address ||
                            "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
                        {/* Footer */}
            <div className="px-6 py-4 border-t bg-white flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Total: Rs.{" "}
                  {selectedSubscription.totalAmount?.toFixed(2) || "0.00"}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={closeDetailsModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => navigate("/subscription/edit", { state: { subscription: selectedSubscription } })}
                  className="flex items-center gap-1 px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Print Details
                </button>
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
                  <img
                    src={
                      subscriptionToCancel.package?.image ||
                      subscriptionToCancel.mealPackage?.image ||
                      subscriptionToCancel.packageImage ||
                      subscriptionToCancel.image ||
                      subscriptionToCancel.package?.mealPackage?.image ||
                      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200"
                    }
                    alt={subscriptionToCancel.packageName || "Package"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200";
                    }}
                  />
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
