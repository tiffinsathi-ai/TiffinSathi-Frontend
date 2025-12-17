import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { HiChevronDown, HiClock } from "react-icons/hi";
import { MapPin, X } from "lucide-react";
import axios from "axios";
import { authStorage } from "../../helpers/api";
import Header from "../../Components/Users/Header";
import Footer from "../../Components/Users/Footer";
import homeBg from "../../assets/home.jpg";

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    packageData,
    schedule,
    deliveryDays: initialDeliveryDays,
    mealSelections: initialMealSelections,
  } = location.state || {};

  // Use provided values or defaults
  const deliveryDays = initialDeliveryDays || {
    MONDAY: true,
    TUESDAY: true,
    WEDNESDAY: true,
    THURSDAY: true,
    FRIDAY: true,
    SATURDAY: false,
    SUNDAY: false,
  };

  const mealSelections = initialMealSelections || {
    MONDAY: [],
    TUESDAY: [],
    WEDNESDAY: [],
    THURSDAY: [],
    FRIDAY: [],
    SATURDAY: [],
    SUNDAY: [],
  };

  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [preferredDeliveryTime, setPreferredDeliveryTime] = useState("12-1");
  const [startDate, setStartDate] = useState("");
  const [dietaryNotes, setDietaryNotes] = useState("");
  const [includePackaging, setIncludePackaging] = useState(true);
  const [includeCutlery, setIncludeCutlery] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("ESEWA");
  const [discountCode, setDiscountCode] = useState("");
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Generate time options as time slots
  const timeOptions = ["12-1", "1-2", "2-3", "3-4", "4-5", "5-6", "6-7", "7-8"];

  useEffect(() => {
    if (!packageData) {
      navigate("/packages");
      return;
    }
    // Set earliest available date (2 days from today)
    const today = new Date();
    const earliestDate = new Date(today);
    earliestDate.setDate(today.getDate() + 2);
    setStartDate(earliestDate.toISOString().split("T")[0]);

    // Initialize deliveryDays and mealSelections if not provided
    if (!deliveryDays) {
      // Default: weekdays enabled
      const defaultDays = {
        MONDAY: true,
        TUESDAY: true,
        WEDNESDAY: true,
        THURSDAY: true,
        FRIDAY: true,
        SATURDAY: false,
        SUNDAY: false,
      };
      // This will be handled by state initialization
    }
  }, [packageData, navigate]);

  // Close time dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showTimeDropdown && !event.target.closest(".time-dropdown")) {
        setShowTimeDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showTimeDropdown]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateSubtotal = () => {
    if (!packageData) return 0;
    // Use package price as base, can be enhanced with meal set prices later
    return packageData.pricePerSet || 0;
  };

  const calculateDeliveryFee = () => {
    const enabledDays = Object.values(deliveryDays || {}).filter(
      (enabled) => enabled
    ).length;
    // 5 days/week = 125, adjust based on days
    return (enabledDays / 7) * 175; // Approximate calculation
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    const deliveryFee = calculateDeliveryFee();
    return (subtotal + deliveryFee) * 0.13; // 13% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateDeliveryFee() + calculateTax();
  };

  const handleSubmit = async () => {
    if (!deliveryAddress.trim()) {
      alert("Please enter delivery address");
      return;
    }
    if (!startDate) {
      alert("Please select start date");
      return;
    }

    setLoading(true);

    try {
      const token = authStorage.getToken();
      if (!token) {
        navigate("/login");
        return;
      }

      // Prepare schedule array for API
      const scheduleArray = Object.keys(deliveryDays || {}).map((day) => ({
        day,
        enabled: deliveryDays[day] || false,
        meals: (mealSelections?.[day] || []).map((meal) => ({
          setId: meal.setId,
          quantity: meal.quantity || 1,
        })),
      }));

      const payload = {
        packageId: packageData.packageId,
        schedule: scheduleArray,
        deliveryAddress,
        landmark,
        preferredDeliveryTime,
        dietaryNotes,
        specialInstructions: dietaryNotes,
        includePackaging,
        includeCutlery,
        discountCode: discountCode || undefined,
        paymentMethod,
        startDate,
      };

      const response = await axios.post(
        "http://localhost:8080/api/subscriptions",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        alert("Subscription created successfully!");
        navigate("/packages");
      }
    } catch (error) {
      console.error("Error creating subscription:", error);
      alert(
        error.response?.data?.message ||
          "Failed to create subscription. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!packageData) {
    return null;
  }

  const enabledDaysCount = Object.values(deliveryDays || {}).filter(
    (enabled) => enabled
  ).length;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 w-full">
        {/* Hero Section */}
        <div className="relative min-h-[300px] flex items-center justify-center overflow-hidden py-12 px-6">
          {/* Background Image with Blur */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${homeBg})`,
              filter: "blur(8px)",
              transform: "scale(1.1)",
            }}
          ></div>
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/30 via-yellow-400/20 to-green-500/30"></div>
          <div className="absolute inset-0 bg-black/20"></div>
          {/* Content - Centered */}
          <div className="relative z-10 max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
              Checkout
            </h1>
            <p className="text-lg text-white drop-shadow-md">
              Review your order and complete your subscription
            </p>
          </div>
        </div>

        {/* Back Button Section */}
        <div className="max-w-7xl mx-auto px-6 pt-4">
          <button
            onClick={() =>
              navigate("/schedule-customization", {
                state: {
                  packageData,
                  schedule,
                  deliveryDays,
                  mealSelections,
                },
              })
            }
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
          >
            Back to Schedule
          </button>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Package Details */}
              <div
                className="bg-white rounded-lg shadow-md p-6 border-l-4"
                style={{ borderColor: "#F5B800" }}
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Package Details
                </h3>
                <div
                  className="flex justify-between items-center p-4 rounded-lg"
                  style={{ backgroundColor: "#FFF9E6" }}
                >
                  <div>
                    <p className="text-gray-800 font-semibold text-lg">
                      {packageData.name}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">
                      {packageData.durationDays || 7} days subscription
                    </p>
                  </div>
                  <p className="text-gray-800 font-bold text-xl">
                    Rs.{packageData.pricePerSet || 0}/set
                  </p>
                </div>
              </div>

              {/* Delivery Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Delivery Information
                </h3>

                <div className="space-y-4">
                  {/* Delivery Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Address *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Enter your complete delivery address or click the map icon to select location"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 pr-10 transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowMapModal(true)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-yellow-500 transition-colors"
                      >
                        <MapPin className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Click the map icon to select your delivery location on the
                      map
                    </p>
                  </div>

                  {/* Landmark */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Landmark
                    </label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="Nearby landmark"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
                    />
                  </div>

                  {/* Preferred Delivery Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Delivery Time
                    </label>
                    <div className="relative time-dropdown">
                      <button
                        type="button"
                        onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 flex items-center justify-between hover:border-yellow-400 transition-all"
                      >
                        <span>{preferredDeliveryTime}</span>
                        <HiChevronDown className="w-5 h-5" />
                      </button>
                      {showTimeDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {timeOptions.map((time) => (
                            <button
                              key={time}
                              type="button"
                              onClick={() => {
                                setPreferredDeliveryTime(time);
                                setShowTimeDropdown(false);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-gray-100"
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      min={
                        new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
                          .toISOString()
                          .split("T")[0]
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
                      required
                    />
                    {startDate && (
                      <div className="mt-2 text-sm text-gray-600">
                        <p>Selected: {formatDate(startDate)}</p>
                      </div>
                    )}
                  </div>

                  {/* Dietary Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dietary Notes & Special Instructions
                    </label>
                    <textarea
                      value={dietaryNotes}
                      onChange={(e) => setDietaryNotes(e.target.value)}
                      placeholder="Any dietary restrictions or special instructions..."
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
                    />
                  </div>

                  {/* Options */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={includePackaging}
                        onChange={(e) => setIncludePackaging(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300"
                        style={{ accentColor: "#F5B800" }}
                      />
                      <span className="text-sm text-gray-700">
                        Include Packaging
                      </span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={includeCutlery}
                        onChange={(e) => setIncludeCutlery(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300"
                        style={{ accentColor: "#F5B800" }}
                      />
                      <span className="text-sm text-gray-700">
                        Include Cutlery
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Payment Method
                </h3>
                <div className="space-y-2">
                  {["ESEWA", "KHALTI", "CARD", "CASH_ON_DELIVERY"].map(
                    (method) => (
                      <label
                        key={method}
                        className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-yellow-50 hover:border-yellow-300 cursor-pointer transition-all"
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method}
                          checked={paymentMethod === method}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-4 h-4"
                          style={{ accentColor: "#F5B800" }}
                        />
                        <span className="text-gray-700">
                          {method.replace("_", " ")}
                        </span>
                      </label>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div
                className="bg-white rounded-lg shadow-lg p-6 sticky top-4 border-t-4"
                style={{ borderColor: "#F5B800" }}
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-6">
                  Order Summary
                </h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-700 py-2">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">
                      Rs.{calculateSubtotal().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-700 py-2">
                    <span className="text-gray-600">
                      Delivery Fee ({enabledDaysCount} days/week):
                    </span>
                    <span className="font-medium">
                      Rs.{calculateDeliveryFee().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-700 py-2">
                    <span className="text-gray-600">Tax (13%):</span>
                    <span className="font-medium">
                      Rs.{calculateTax().toFixed(2)}
                    </span>
                  </div>
                  <div
                    className="border-t-2 pt-4 mt-4"
                    style={{ borderColor: "#F5B800" }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-800">
                        Total:
                      </span>
                      <span
                        className="text-2xl font-bold"
                        style={{ color: "#F5B800" }}
                      >
                        Rs.{calculateTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Discount Code */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      placeholder="Enter code"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
                    />
                    <button
                      className="px-4 py-2 rounded-lg text-white font-medium transition-colors hover:opacity-90"
                      style={{ backgroundColor: "#F5B800" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#e0a500";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#F5B800";
                      }}
                    >
                      Apply
                    </button>
                  </div>
                </div>

                {/* Payment Button */}
                <button
                  onClick={handleSubmit}
                  disabled={loading || !deliveryAddress.trim() || !startDate}
                  className="w-full py-3 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed mb-4 transition-colors"
                  style={{ backgroundColor: "#F5B800" }}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.backgroundColor = "#e0a500";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.backgroundColor = "#F5B800";
                    }
                  }}
                >
                  {loading ? "Processing..." : `Pay with ${paymentMethod}`}
                </button>

                {/* Subscription Start Info */}
                {startDate && (
                  <div
                    className="p-4 rounded-lg border"
                    style={{
                      backgroundColor: "#FFF9E6",
                      borderColor: "#F5B800",
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <HiClock
                        className="w-5 h-5 mt-0.5"
                        style={{ color: "#F5B800" }}
                      />
                      <div>
                        <p className="font-semibold text-gray-800">
                          Subscription Start
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Your subscription will begin on{" "}
                          {formatDate(startDate)}. A minimum 2-day gap is
                          required for order processing.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Map Modal */}
      {showMapModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">
                Select Delivery Location
              </h3>
              <button
                onClick={() => setShowMapModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-3">
                Click on the map to select your delivery location
              </p>
              <div className="rounded-lg overflow-hidden border border-gray-300">
                <iframe
                  title="Select Delivery Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d56516.31625953415!2d85.29111325!3d27.70895785!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb198a307baabf%3A0xb5137c1bf18db1ea!2sKathmandu%2044600%2C%20Nepal!5e0!3m2!1sen!2sus!4v1234567890"
                  width="100%"
                  height="400"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter address manually:
                </label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Type your address here..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-4 border-t">
              <button
                onClick={() => setShowMapModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowMapModal(false)}
                className="px-4 py-2 rounded-lg text-white font-medium"
                style={{ backgroundColor: "#F5B800" }}
              >
                Confirm Location
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Checkout;
