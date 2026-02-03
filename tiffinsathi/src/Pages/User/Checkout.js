import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { HiChevronDown, HiClock, HiChevronRight } from "react-icons/hi";
import {
  MapPin,
  X,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Navigation,
  Locate,
} from "lucide-react";
import axios from "axios";
import authStorage from "../../helpers/authStorage";
import homeBg from "../../assets/home.jpg";
import { toast } from "react-toastify";

// Leaflet imports
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for Leaflet default icons
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper component to recenter map
const RecenterAutomatically = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
};

// Helper component to handle map clicks
const LocationFinderDummy = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    },
  });
  return null;
};

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    packageData,
    schedule,
    deliveryDays: initialDeliveryDays,
    mealSelections: initialMealSelections,
    pricing: initialPricing,
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
  const [preferredDeliveryTime, setPreferredDeliveryTime] =
    useState("12:00 PM - 1:00 PM");
  const [startDate, setStartDate] = useState("");
  const [dietaryNotes, setDietaryNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("ESEWA");
  const [discountCode, setDiscountCode] = useState("");
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapModal, setMapModal] = useState({
    open: false,
    address: "",
    coordinates: { lat: 27.7172, lng: 85.324 }, // Default: Kathmandu
  });
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pricing, setPricing] = useState(
    initialPricing || {
      subtotal: 0,
      deliveryFee: 0,
      tax: 0,
      grandTotal: 0,
      enabledDaysCount: 5,
      durationWeeks: 4.29,
      discount: 0,
    }
  );

  // Generate time slots in 1-hour increments from 8 AM to 8 PM
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
      const startHour = hour % 12 || 12;
      const endHour = (hour + 1) % 12 || 12;
      const startAmPm = hour < 12 ? "AM" : "PM";
      const endAmPm = hour + 1 < 12 ? "AM" : "PM";
      slots.push(`${startHour}:00 ${startAmPm} - ${endHour}:00 ${endAmPm}`);
    }
    return slots;
  };

  const timeOptions = generateTimeSlots();

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

    // Calculate pricing if not provided
    if (!initialPricing) {
      calculatePricing();
    }
  }, [packageData, navigate]);

  useEffect(() => {
    if (success) {
      toast.success(success);
      setSuccess("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [success]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      setError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showTimeDropdown && !event.target.closest(".time-dropdown")) {
        setShowTimeDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showTimeDropdown]);

  // Location Services
  const getUserLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  };

  const openMapModal = async (currentAddress = "") => {
    try {
      setError("");
      let coordinates = mapModal.coordinates;

      if (!currentAddress) {
        try {
          const gps = await getUserLocation();
          coordinates = gps;
        } catch (e) {
          console.log("GPS not available, using default");
        }
      }

      setMapModal({
        open: true,
        address: currentAddress,
        coordinates: coordinates,
      });

      if (!currentAddress && coordinates) {
        handleMapClick(coordinates);
      }
    } catch (error) {
      console.error("Error opening map:", error);
      setMapModal((prev) => ({ ...prev, open: true }));
    }
  };

  const getAddressFromCoordinates = async (lat, lng) => {
    setIsGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();

      if (data && data.display_name) {
        let cleanAddress = data.display_name;
        if (data.address) {
          const parts = [];
          if (data.address.road) parts.push(data.address.road);
          if (data.address.suburb) parts.push(data.address.suburb);
          if (data.address.city || data.address.town || data.address.village)
            parts.push(
              data.address.city || data.address.town || data.address.village
            );
          if (parts.length > 0) cleanAddress = parts.join(", ");
        }
        return cleanAddress;
      }
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
      console.error("Geocoding error:", error);
      return "Location selected (Address lookup failed)";
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleMapClick = async (latlng) => {
    setSelectedLocation(latlng);
    setMapModal((prev) => ({ ...prev, coordinates: latlng }));

    const address = await getAddressFromCoordinates(latlng.lat, latlng.lng);
    setMapModal((prev) => ({ ...prev, address: address }));
  };

  const confirmLocation = () => {
    if (mapModal.address) {
      setDeliveryAddress(mapModal.address);
      setSuccess("Delivery location set successfully!");
      closeMapModal();
    } else {
      setError("Please select a location on the map");
    }
  };

  const closeMapModal = () => {
    setMapModal({ ...mapModal, open: false });
    setSelectedLocation(null);
    setError("");
  };

  const calculatePricing = () => {
    if (!packageData) return;

    const enabledDaysCount = Object.values(deliveryDays).filter(
      (d) => d
    ).length;
    const durationWeeks = (packageData.durationDays || 30) / 7;

    // Calculate subtotal based on meal selections
    let subtotal = 0;
    Object.keys(mealSelections).forEach((day) => {
      if (deliveryDays[day]) {
        mealSelections[day].forEach((meal) => {
          subtotal +=
            (meal.price || packageData.pricePerSet || 0) * meal.quantity;
        });
      }
    });

    subtotal = subtotal * durationWeeks;
    const deliveryFee = 25 * enabledDaysCount * durationWeeks;
    const discount = calculateDiscount(subtotal + deliveryFee, discountCode);
    const taxableAmount = subtotal + deliveryFee - discount;
    const tax = taxableAmount * 0.13;
    const grandTotal = subtotal + deliveryFee + tax - discount;

    setPricing({
      subtotal,
      deliveryFee,
      tax,
      discount,
      grandTotal,
      enabledDaysCount,
      durationWeeks,
    });
  };

  const calculateDiscount = (amount, code) => {
    if (!code) return 0;
    switch (code.toUpperCase()) {
      case "SAVE10":
        return amount * 0.1;
      case "WELCOME15":
        return amount * 0.15;
      case "FIRSTORDER":
        return Math.min(amount, 100);
      case "TIFFIN5":
        return Math.min(amount, 50);
      default:
        return 0;
    }
  };

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

  const handleApplyDiscount = () => {
    calculatePricing();
    if (pricing.discount > 0) {
      setSuccess(`Discount applied! Saved Rs. ${pricing.discount.toFixed(2)}`);
    }
  };

  const handleEsewaPayment = (paymentData) => {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = paymentData.paymentUrl;

    Object.entries(paymentData.paymentData).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  const initiatePayment = async (subscriptionId) => {
    try {
      setProcessingPayment(true);
      setError("");
      const token = authStorage.getToken();
      const amount = pricing.grandTotal;

      // Call payment initiation endpoint
      const response = await axios.post(
        "http://localhost:8080/api/payments/initiate",
        {
          subscriptionId: subscriptionId,
          paymentMethod: paymentMethod,
          amount: amount,
          successUrl: `${window.location.origin}/payment-success`,
          failureUrl: `${window.location.origin}/payment-failure`,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const paymentData = response.data;

      // Handle different payment methods
      if (paymentMethod === "ESEWA") {
        handleEsewaPayment(paymentData);
      } else if (paymentMethod === "KHALTI") {
        window.location.href = paymentData.paymentUrl;
      } else if (paymentMethod === "CARD") {
        setError(
          "Card payment integration coming soon. Please use eSewa or Khalti for now."
        );
        setProcessingPayment(false);
      }
    } catch (error) {
      console.error("Error initiating payment:", error);
      setError(
        "Failed to initiate payment: " +
          (error.response?.data?.message || error.message)
      );
      setProcessingPayment(false);
    }
  };

  const handleSubmit = async () => {
    if (!deliveryAddress.trim()) {
      setError("Please enter delivery address");
      return;
    }
    if (!startDate) {
      setError("Please select start date");
      return;
    }

    // Validate start date is at least 2 days from today
    const today = new Date();
    const startDateObj = new Date(startDate);
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 2);

    if (startDateObj < minDate) {
      setError("Start date must be at least 2 days from today");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = authStorage.getToken();
      if (!token) {
        navigate("/login");
        return;
      }

      // Prepare schedule array for API
      const scheduleArray = Object.keys(deliveryDays).map((day) => ({
        dayOfWeek: day,
        enabled: deliveryDays[day] || false,
        meals: (mealSelections[day] || []).map((meal) => ({
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
        discountCode: discountCode || undefined,
        paymentMethod,
        startDate,
      };

      // Create subscription first
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

      const subscription = response.data;
      const subscriptionId = subscription.subscriptionId;

      // Handle payment based on method
      if (paymentMethod === "CASH_ON_DELIVERY") {
        setSuccess("Subscription created successfully! Pay on delivery.");
        // Redirect to subscriptions page after 2 seconds
        setTimeout(() => {
          navigate("/user/subscriptions");
        }, 2000);
      } else {
        // Initiate payment for online payment methods
        await initiatePayment(subscriptionId);
      }
    } catch (error) {
      console.error("Error creating subscription:", error);
      setError(
        error.response?.data?.message ||
          "Failed to create subscription. Please try again."
      );
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
      <main className="flex-1 w-full">
        {/* Hero Section - EXACT SAME AS BEFORE */}
        <div className="relative min-h-[300px] flex items-center justify-center overflow-hidden py-12 px-6">
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
                  pricing,
                },
              })
            }
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors flex items-center gap-2"
          >
            <HiChevronRight className="rotate-180 w-4 h-4" />
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
                  className="flex justify-between items-start p-4 rounded-lg"
                  style={{ backgroundColor: "#FFF9E6" }}
                >
                  <div>
                    <p className="text-gray-800 font-semibold text-lg">
                      {packageData.name}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">
                      {packageData.durationDays || 30} days subscription
                    </p>
                    <p className="text-gray-600 text-sm mt-1">
                      Delivery days: {enabledDaysCount} days/week
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
                      <textarea
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Enter your complete delivery address or click the map icon to select location"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 pr-10 transition-all"
                        rows="3"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => openMapModal(deliveryAddress)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-yellow-500 transition-colors"
                      >
                        <MapPin className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Click the map icon to pinpoint your exact delivery
                      location
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
                              className="w-full text-left px-4 py-2 hover:bg-gray-100 hover:text-yellow-600 transition-colors"
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
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Payment Method
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {["ESEWA", "KHALTI", "CARD", "CASH_ON_DELIVERY"].map(
                    (method) => (
                      <label
                        key={method}
                        className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                          paymentMethod === method
                            ? "border-yellow-500 bg-yellow-50"
                            : "border-gray-200 hover:border-yellow-300 hover:bg-yellow-50/50"
                        }`}
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
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-gray-600" />
                          <span className="text-gray-700 font-medium">
                            {method.replace("_", " ")}
                          </span>
                        </div>
                      </label>
                    )
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  {paymentMethod === "CASH_ON_DELIVERY"
                    ? "Pay when your meal is delivered"
                    : "You will be redirected to the payment gateway"}
                </p>
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
                      Rs.{pricing.subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-700 py-2">
                    <span className="text-gray-600">
                      Delivery Fee ({enabledDaysCount} days/week):
                    </span>
                    <span className="font-medium">
                      Rs.{pricing.deliveryFee.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-700 py-2">
                    <span className="text-gray-600">Tax (13%):</span>
                    <span className="font-medium">
                      Rs.{pricing.tax.toFixed(2)}
                    </span>
                  </div>
                  {pricing.discount > 0 && (
                    <div className="flex justify-between text-green-600 py-2">
                      <span>Discount:</span>
                      <span className="font-medium">
                        - Rs.{pricing.discount.toFixed(2)}
                      </span>
                    </div>
                  )}
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
                        Rs.{pricing.grandTotal.toFixed(2)}
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
                      onClick={handleApplyDiscount}
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
                  <p className="text-xs text-gray-500 mt-2">
                    Try: SAVE10, WELCOME15, FIRSTORDER, TIFFIN5
                  </p>
                </div>

                {/* Payment Button */}
                <button
                  onClick={handleSubmit}
                  disabled={
                    loading ||
                    processingPayment ||
                    !deliveryAddress.trim() ||
                    !startDate
                  }
                  className="w-full py-3 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed mb-4 transition-colors flex items-center justify-center gap-2"
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
                  {loading || processingPayment ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {processingPayment
                        ? "Processing Payment..."
                        : "Creating Subscription..."}
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      {paymentMethod === "CASH_ON_DELIVERY"
                        ? "Complete Subscription"
                        : `Pay with ${paymentMethod}`}
                    </>
                  )}
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

      {/* Map Modal - Using Leaflet */}
      {mapModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Select Delivery Location
              </h3>
              <button
                onClick={closeMapModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-4 flex-1 flex flex-col overflow-y-auto">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Address
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={mapModal.address}
                    onChange={(e) =>
                      setMapModal((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="Click on map to select..."
                  />
                  <button
                    onClick={() => openMapModal("")}
                    className="px-3 py-2 text-white rounded-md hover:opacity-90 flex items-center transition-colors"
                    style={{ backgroundColor: "#F5B800" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#e0a500";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#F5B800";
                    }}
                  >
                    <Locate className="h-4 w-4 mr-1" /> My GPS
                  </button>
                </div>
              </div>

              {/* MAP CONTAINER */}
              <div
                className="relative rounded-lg overflow-hidden border border-gray-300"
                style={{ height: "400px" }}
              >
                <MapContainer
                  center={[mapModal.coordinates.lat, mapModal.coordinates.lng]}
                  zoom={15}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <RecenterAutomatically
                    lat={mapModal.coordinates.lat}
                    lng={mapModal.coordinates.lng}
                  />
                  <LocationFinderDummy
                    onLocationSelect={(latlng) => handleMapClick(latlng)}
                  />

                  {selectedLocation && (
                    <Marker
                      position={[selectedLocation.lat, selectedLocation.lng]}
                    >
                      <Popup>Selected Location</Popup>
                    </Marker>
                  )}
                  {!selectedLocation && mapModal.coordinates && (
                    <Marker
                      position={[
                        mapModal.coordinates.lat,
                        mapModal.coordinates.lng,
                      ]}
                    >
                      <Popup>You are here</Popup>
                    </Marker>
                  )}
                </MapContainer>

                {isGeocoding && (
                  <div className="absolute top-2 right-2 bg-white px-3 py-1 rounded shadow text-xs font-bold text-yellow-600 z-[1000]">
                    Finding address...
                  </div>
                )}
              </div>

              {/* Selected Location Details */}
              <div
                className="mt-4 p-3 rounded-lg border flex justify-between items-center"
                style={{ backgroundColor: "#FFF9E6", borderColor: "#F5B800" }}
              >
                <div>
                  <div className="font-bold text-gray-900 text-sm">
                    Selected Address:
                  </div>
                  <div className="text-gray-800 text-sm">
                    {mapModal.address || "No location selected"}
                  </div>
                  {selectedLocation && (
                    <div className="text-xs text-gray-600 mt-1">
                      {selectedLocation.lat.toFixed(5)},{" "}
                      {selectedLocation.lng.toFixed(5)}
                    </div>
                  )}
                </div>
                {mapModal.address && (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={closeMapModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLocation}
                  disabled={!mapModal.address}
                  className="px-4 py-2 text-white rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
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
                  <MapPin className="h-4 w-4 mr-2" />
                  Confirm Location
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Checkout;
