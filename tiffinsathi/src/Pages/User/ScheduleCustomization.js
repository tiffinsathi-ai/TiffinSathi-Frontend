import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { HiChevronDown, HiX, HiPlus, HiMinus } from "react-icons/hi";
import axios from "axios";
import homeBg from "../../assets/home.jpg";
import { toast } from "react-toastify";

const ScheduleCustomization = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const packageData = location.state?.packageData;
  const initialDeliveryDays = location.state?.deliveryDays;
  const initialMealSelections = location.state?.mealSelections;

  const defaultDeliveryDays = {
    MONDAY: true,
    TUESDAY: true,
    WEDNESDAY: true,
    THURSDAY: true,
    FRIDAY: true,
    SATURDAY: false,
    SUNDAY: false,
  };

  const defaultMealSelections = {
    MONDAY: [],
    TUESDAY: [],
    WEDNESDAY: [],
    THURSDAY: [],
    FRIDAY: [],
    SATURDAY: [],
    SUNDAY: [],
  };

  const [deliveryDays, setDeliveryDays] = useState(() => ({
    ...defaultDeliveryDays,
    ...(initialDeliveryDays || {}),
  }));

  const [mealSelections, setMealSelections] = useState(() => ({
    ...defaultMealSelections,
    ...(initialMealSelections || {}),
  }));

  const [availableMealSets, setAvailableMealSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const daysOfWeek = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ];

  useEffect(() => {
    if (!packageData) {
      navigate("/packages");
      return;
    }
    fetchMealSets();
  }, [packageData, navigate]);

  useEffect(() => {
    if (!error) return;
    if (typeof error === "string" && error.startsWith("Note:")) {
      toast.info(error);
    } else {
      toast.error(error);
    }
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const fetchMealSets = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if packageData has meal sets directly
      if (
        packageData.packageSets &&
        Array.isArray(packageData.packageSets) &&
        packageData.packageSets.length > 0
      ) {
        setAvailableMealSets(packageData.packageSets);
        setLoading(false);
        return;
      }

      // Try to fetch meal sets from the API
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8080/api/meal-packages/${packageData.packageId}/meal-sets`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && Array.isArray(response.data)) {
        setAvailableMealSets(response.data);
      } else {
        // Fallback: Use mock data if API doesn't return
        setAvailableMealSets([
          { setId: 1, setName: "Veg Thali", type: "VEG", price: 250 },
          { setId: 2, setName: "Non-Veg Thali", type: "NON_VEG", price: 350 },
          { setId: 3, setName: "Roti Set", type: "VEG", price: 200 },
          { setId: 4, setName: "Rice Set", type: "VEG", price: 180 },
          { setId: 5, setName: "Chicken Curry", type: "NON_VEG", price: 300 },
        ]);
      }
    } catch (error) {
      console.error("Error fetching meal sets:", error);
      // Fallback mock data
      setAvailableMealSets([
        {
          setId: 1,
          setName: "Standard Veg Meal",
          type: "VEG",
          price: packageData.pricePerSet || 250,
        },
        {
          setId: 2,
          setName: "Premium Non-Veg Meal",
          type: "NON_VEG",
          price: packageData.pricePerSet * 1.4 || 350,
        },
        {
          setId: 3,
          setName: "Special Thali",
          type: "VEG",
          price: packageData.pricePerSet * 1.2 || 300,
        },
      ]);
      setError(
        "Note: Using sample meal data. Real meal sets will appear when connected to backend."
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day) => {
    setDeliveryDays((prev) => ({
      ...prev,
      [day]: !prev[day],
    }));
    if (deliveryDays[day]) {
      // If disabling day, clear meal selections
      setMealSelections((prev) => ({
        ...prev,
        [day]: [],
      }));
    }
  };

  const addMealToDay = (day, mealSet) => {
    if (!deliveryDays[day]) return;

    const existingMeal = mealSelections[day].find(
      (meal) => meal.setId === mealSet.setId
    );
    if (existingMeal) {
      updateMealQuantity(
        day,
        mealSelections[day].indexOf(existingMeal),
        existingMeal.quantity + 1
      );
      return;
    }

    setMealSelections((prev) => ({
      ...prev,
      [day]: [
        ...prev[day],
        {
          setId: mealSet.setId || mealSet.id,
          quantity: 1,
          name: mealSet.setName || mealSet.name,
          type: mealSet.type,
          price: mealSet.price || packageData.pricePerSet,
        },
      ],
    }));
  };

  const removeMealFromDay = (day, index) => {
    setMealSelections((prev) => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index),
    }));
  };

  const updateMealQuantity = (day, index, quantity) => {
    if (quantity < 1) return;
    setMealSelections((prev) => {
      const updated = [...prev[day]];
      updated[index].quantity = quantity;
      return {
        ...prev,
        [day]: updated,
      };
    });
  };

  const calculateDayTotal = (day) => {
    return mealSelections[day].reduce((total, meal) => {
      return (
        total + (meal.price || packageData.pricePerSet || 0) * meal.quantity
      );
    }, 0);
  };

  const calculateWeeklyTotal = () => {
    return daysOfWeek.reduce((total, day) => {
      if (deliveryDays[day]) {
        return total + calculateDayTotal(day);
      }
      return total;
    }, 0);
  };

  const handleContinue = () => {
    // Validate at least one day has meals
    const hasMeals = daysOfWeek.some(
      (day) => deliveryDays[day] && mealSelections[day].length > 0
    );

    if (!hasMeals) {
      setError("Please select at least one meal for the enabled days.");
      return;
    }

    // Prepare schedule data
    const schedule = daysOfWeek.map((day) => ({
      dayOfWeek: day,
      enabled: deliveryDays[day],
      meals: mealSelections[day].map((meal) => ({
        setId: meal.setId,
        quantity: meal.quantity,
      })),
    }));

    // Calculate pricing
    const weeklyTotal = calculateWeeklyTotal();
    const durationWeeks = (packageData.durationDays || 30) / 7;
    const subtotal = weeklyTotal * durationWeeks;
    const enabledDaysCount = Object.values(deliveryDays).filter(
      (d) => d
    ).length;
    const deliveryFee = 25 * enabledDaysCount * durationWeeks;
    const tax = (subtotal + deliveryFee) * 0.13;
    const grandTotal = subtotal + deliveryFee + tax;

    // Navigate to checkout with all data
    navigate("/checkout", {
      state: {
        packageData,
        schedule,
        deliveryDays,
        mealSelections,
        pricing: {
          subtotal,
          deliveryFee,
          tax,
          grandTotal,
          enabledDaysCount,
          durationWeeks,
        },
      },
    });
  };

  if (!packageData) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1 w-full">
        {/* Hero Section */}
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
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
              Customize Your Meal Plan
            </h1>
            <p className="text-lg text-white max-w-2xl mx-auto drop-shadow-md">
              Choose delivery days and select meals for each day. Your package:{" "}
              <strong>{packageData.name}</strong>
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Days and Meals */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Days Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Select Delivery Days
                </h3>
                <div className="grid grid-cols-7 gap-2">
                  {daysOfWeek.map((day) => (
                    <button
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                        deliveryDays[day]
                          ? "border-yellow-500 bg-yellow-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span className="text-sm font-medium text-gray-600">
                        {day.substring(0, 3)}
                      </span>
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center mt-2 ${
                          deliveryDays[day] ? "bg-yellow-500" : "bg-gray-200"
                        }`}
                      >
                        {deliveryDays[day] ? (
                          <span className="text-white text-xs">✓</span>
                        ) : null}
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  Selected:{" "}
                  {Object.values(deliveryDays).filter((d) => d).length} days per
                  week
                </p>
              </div>

              {/* Meal Selection Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Meal Selection
                  </h3>
                  <div className="text-sm text-gray-600">
                    {availableMealSets.length} meals available
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading meals...</p>
                  </div>
                ) : (
                  <>
                    {/* Available Meals */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Available Meal Sets:
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {availableMealSets.map((mealSet) => (
                          <div
                            key={mealSet.setId || mealSet.id}
                            className="border border-gray-200 rounded-lg p-3 hover:border-yellow-300 transition-colors"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-medium text-gray-800">
                                  {mealSet.setName || mealSet.name}
                                </h5>
                                <div className="flex items-center gap-2 mt-1">
                                  <span
                                    className={`px-2 py-1 text-xs rounded-full ${
                                      mealSet.type === "VEG"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {mealSet.type || "VEG"}
                                  </span>
                                  <span className="text-sm font-semibold text-gray-700">
                                    Rs.{" "}
                                    {mealSet.price || packageData.pricePerSet}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Day-wise Selection */}
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Selected Meals by Day:
                    </h4>
                    <div className="space-y-4">
                      {daysOfWeek.map((day) => (
                        <div
                          key={day}
                          className={`rounded-lg p-4 border ${
                            deliveryDays[day]
                              ? "border-green-200 bg-green-50/50"
                              : "border-gray-100 bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                  deliveryDays[day]
                                    ? "bg-green-500 text-white"
                                    : "bg-gray-400 text-white"
                                }`}
                              >
                                {daysOfWeek.indexOf(day) + 1}
                              </span>
                              <h4 className="text-base font-semibold text-gray-800">
                                {day}
                              </h4>
                            </div>
                            <div className="flex items-center gap-3">
                              {deliveryDays[day] &&
                                mealSelections[day].length > 0 && (
                                  <span className="text-sm font-medium text-green-600">
                                    Rs. {calculateDayTotal(day)}
                                  </span>
                                )}
                              <span
                                className={`text-sm ${
                                  deliveryDays[day]
                                    ? "text-green-600"
                                    : "text-gray-500"
                                }`}
                              >
                                {deliveryDays[day] ? "Active" : "Inactive"}
                              </span>
                            </div>
                          </div>

                          {deliveryDays[day] ? (
                            <div className="space-y-3">
                              {/* Add Meal Dropdown */}
                              <select
                                onChange={(e) => {
                                  if (e.target.value) {
                                    const selectedMeal = availableMealSets.find(
                                      (m) =>
                                        (m.setId || m.id).toString() ===
                                        e.target.value
                                    );
                                    if (selectedMeal)
                                      addMealToDay(day, selectedMeal);
                                    e.target.value = "";
                                  }
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white"
                              >
                                <option value="">
                                  + Add a meal to this day
                                </option>
                                {availableMealSets.map((mealSet) => (
                                  <option
                                    key={mealSet.setId || mealSet.id}
                                    value={mealSet.setId || mealSet.id}
                                  >
                                    {mealSet.setName || mealSet.name} - Rs.
                                    {mealSet.price || packageData.pricePerSet}
                                  </option>
                                ))}
                              </select>

                              {/* Selected Meals for this day */}
                              {mealSelections[day].length > 0 && (
                                <div className="space-y-2">
                                  {mealSelections[day].map((meal, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center justify-between py-2 px-3 bg-white rounded-lg border border-gray-200"
                                    >
                                      <div className="flex items-center gap-3">
                                        <span className="text-sm text-gray-700">
                                          {meal.name}
                                        </span>
                                        <span
                                          className={`text-xs px-2 py-1 rounded-full ${
                                            meal.type === "VEG"
                                              ? "bg-green-100 text-green-800"
                                              : "bg-red-100 text-red-800"
                                          }`}
                                        >
                                          {meal.type}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <div className="flex items-center border border-gray-300 rounded">
                                          <button
                                            onClick={() =>
                                              updateMealQuantity(
                                                day,
                                                index,
                                                meal.quantity - 1
                                              )
                                            }
                                            className="px-2 py-1 hover:bg-gray-100"
                                          >
                                            <HiMinus className="w-4 h-4" />
                                          </button>
                                          <span className="px-3 py-1 text-sm">
                                            {meal.quantity}
                                          </span>
                                          <button
                                            onClick={() =>
                                              updateMealQuantity(
                                                day,
                                                index,
                                                meal.quantity + 1
                                              )
                                            }
                                            className="px-2 py-1 hover:bg-gray-100"
                                          >
                                            <HiPlus className="w-4 h-4" />
                                          </button>
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">
                                          Rs.{" "}
                                          {(meal.price ||
                                            packageData.pricePerSet) *
                                            meal.quantity}
                                        </span>
                                        <button
                                          onClick={() =>
                                            removeMealFromDay(day, index)
                                          }
                                          className="text-red-500 hover:text-red-700 ml-2"
                                        >
                                          <HiX className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-400 italic">
                              Enable this day to select meals
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right Column - Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Order Summary
                </h3>

                {/* Package Info */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-700">
                    {packageData.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {packageData.durationDays || 30} days
                  </p>
                </div>

                {/* Selected Days */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Delivery Days:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {daysOfWeek.map(
                      (day) =>
                        deliveryDays[day] && (
                          <span
                            key={day}
                            className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                          >
                            {day.substring(0, 3)}
                          </span>
                        )
                    )}
                  </div>
                </div>

                {/* Weekly Summary */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    This Week's Meals:
                  </h4>
                  {daysOfWeek.map(
                    (day) =>
                      deliveryDays[day] &&
                      mealSelections[day].length > 0 && (
                        <div key={day} className="mb-2">
                          <p className="text-sm text-gray-600">{day}:</p>
                          <div className="ml-2 space-y-1">
                            {mealSelections[day].map((meal, index) => (
                              <div
                                key={index}
                                className="flex justify-between text-sm"
                              >
                                <span>
                                  {meal.name} × {meal.quantity}
                                </span>
                                <span>
                                  Rs.{" "}
                                  {(meal.price || packageData.pricePerSet) *
                                    meal.quantity}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                  )}
                </div>

                {/* Price Summary */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Weekly Total:</span>
                    <span className="font-medium">
                      Rs. {calculateWeeklyTotal()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">
                      {(packageData.durationDays || 30) / 7} weeks
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Meals:</span>
                    <span className="font-medium">
                      {Object.values(mealSelections).reduce(
                        (total, dayMeals) =>
                          total +
                          dayMeals.reduce(
                            (dayTotal, meal) => dayTotal + meal.quantity,
                            0
                          ),
                        0
                      ) *
                        ((packageData.durationDays || 30) / 7)}{" "}
                      meals
                    </span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Estimated Total:</span>
                      <span className="text-yellow-600">
                        Rs.{" "}
                        {calculateWeeklyTotal() *
                          ((packageData.durationDays || 30) / 7)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Final amount with tax and delivery will be shown at
                      checkout
                    </p>
                  </div>
                </div>

                {/* Continue Button */}
                <button
                  onClick={handleContinue}
                  disabled={
                    !Object.values(deliveryDays).some((enabled) => enabled) ||
                    !daysOfWeek.some(
                      (day) =>
                        deliveryDays[day] && mealSelections[day].length > 0
                    ) ||
                    loading
                  }
                  className="w-full mt-6 px-5 py-3 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  style={{ backgroundColor: "#F5B800" }}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled)
                      e.currentTarget.style.backgroundColor = "#e0a500";
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.disabled)
                      e.currentTarget.style.backgroundColor = "#F5B800";
                  }}
                >
                  Continue to Checkout →
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ScheduleCustomization;
