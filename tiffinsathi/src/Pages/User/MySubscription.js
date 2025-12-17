import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Clock,
  Star,
  Pause,
  Play,
  X,
  RefreshCw,
  Settings,
  HeadphonesIcon,
  Edit3,
  ChevronRight,
} from "lucide-react";
import homeBg from "../../assets/home.jpg";
import { toast } from "react-toastify";

const MySubscription = () => {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

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
      setSubscriptions(data);
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

  const handleCancel = async (subscriptionId) => {
    if (!window.confirm("Are you sure you want to cancel this subscription?")) {
      return;
    }

    try {
      setActionLoading(subscriptionId);
      if (!token) {
        navigate("/login");
        return;
      }
      const response = await fetch(
        `http://localhost:8080/api/subscriptions/${subscriptionId}`,
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
      fetchSubscriptions();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
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

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Active Subscriptions */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Active Subscriptions
          </h2>

          {subscriptions.length === 0 ? (
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
              {subscriptions.map((sub) => {
                const progress = calculateProgress(sub.startDate, sub.endDate);
                const isActive = sub.status?.toUpperCase() === "ACTIVE";
                const isPaused = sub.status?.toUpperCase() === "PAUSED";

                return (
                  <div
                    key={sub.subscriptionId}
                    className="bg-white rounded-lg shadow-sm border overflow-hidden"
                  >
                    <div className="flex">
                      <div className="w-24 h-24 bg-gray-200 flex-shrink-0">
                        <img
                          src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200"
                          alt="Meal"
                          className="w-full h-full object-cover"
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
                            onClick={() => handleCancel(sub.subscriptionId)}
                            disabled={actionLoading === sub.subscriptionId}
                            className="flex-1 bg-yellow-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-yellow-600 disabled:opacity-50"
                          >
                            Cancel
                          </button>
                          {isActive ? (
                            <button
                              onClick={() => handlePause(sub.subscriptionId)}
                              disabled={actionLoading === sub.subscriptionId}
                              className="flex items-center gap-1 border border-yellow-500 text-yellow-600 py-2 px-4 rounded-lg text-sm font-medium hover:bg-yellow-50 disabled:opacity-50"
                            >
                              <Pause className="w-4 h-4" />
                              Pause
                            </button>
                          ) : isPaused ? (
                            <button
                              onClick={() => handleResume(sub.subscriptionId)}
                              disabled={actionLoading === sub.subscriptionId}
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

        {/* Upcoming Meals */}
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
                    <p className="text-sm text-gray-500">{dayMeals.date}</p>
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
                        <p className="font-medium text-gray-900">{meal.name}</p>
                        <p className="text-sm text-gray-500">
                          {meal.type} • {meal.time}
                        </p>
                      </div>
                      <div
                        className={`w-3 h-3 rounded ${
                          meal.type === "Lunch" ? "bg-green-500" : "bg-red-500"
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
                        <p className="text-sm text-gray-500">{history.type}</p>
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
            <h3 className="font-semibold text-gray-900 mb-2">Preferences</h3>
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
      </div>
    </div>
  );
};

export default MySubscription;
