import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { HiChevronDown, HiX } from "react-icons/hi";
import axios from "axios";
import Header from "../../Components/Users/Header";
import Footer from "../../Components/Users/Footer";
import homeBg from "../../assets/home.jpg";

const ScheduleCustomization = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const packageData = location.state?.packageData;

  const [deliveryDays, setDeliveryDays] = useState({
    MONDAY: false,
    TUESDAY: false,
    WEDNESDAY: false,
    THURSDAY: false,
    FRIDAY: false,
    SATURDAY: false,
    SUNDAY: false,
  });

  const [mealSelections, setMealSelections] = useState({
    MONDAY: [],
    TUESDAY: [],
    WEDNESDAY: [],
    THURSDAY: [],
    FRIDAY: [],
    SATURDAY: [],
    SUNDAY: [],
  });

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

  const fetchMealSets = async () => {
    try {
      setLoading(true);
      setError(null);

      // First, try to get meal sets from package data
      if (
        packageData.packageSets &&
        Array.isArray(packageData.packageSets) &&
        packageData.packageSets.length > 0
      ) {
        setAvailableMealSets(packageData.packageSets);
        setLoading(false);
        return;
      }

      // If not in package data, try to fetch from API
      try {
        const response = await axios.get(
          `http://localhost:8080/api/meal-packages/${packageData.packageId}/meal-sets`
        );
        if (
          response.data &&
          Array.isArray(response.data) &&
          response.data.length > 0
        ) {
          setAvailableMealSets(response.data);
        } else {
          // Try alternative endpoint
          const altResponse = await axios.get(
            `http://localhost:8080/api/meal-packages/${packageData.packageId}`
          );
          if (altResponse.data?.packageSets) {
            setAvailableMealSets(altResponse.data.packageSets);
          } else {
            throw new Error("No meal sets found");
          }
        }
      } catch (apiError) {
        console.error("Error fetching meal sets:", apiError);
        // Try to fetch all available meal sets
        try {
          const allMealSetsResponse = await axios.get(
            "http://localhost:8080/api/meal-sets"
          );
          if (
            allMealSetsResponse.data &&
            Array.isArray(allMealSetsResponse.data)
          ) {
            setAvailableMealSets(
              allMealSetsResponse.data.filter(
                (set) => set.isAvailable !== false
              )
            );
          } else {
            throw new Error("No meal sets available");
          }
        } catch (finalError) {
          console.error("Final error fetching meal sets:", finalError);
          setError("Unable to load meal sets. Please try again later.");
        }
      }
    } catch (error) {
      console.error("Error in fetchMealSets:", error);
      setError("Failed to load meal sets");
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

    setMealSelections((prev) => ({
      ...prev,
      [day]: [
        ...prev[day],
        {
          setId: mealSet.setId || mealSet.id,
          quantity: 1,
          name: mealSet.name,
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

  const handleContinue = () => {
    // Prepare schedule data
    const schedule = daysOfWeek.map((day) => ({
      day,
      enabled: deliveryDays[day],
      meals: mealSelections[day].map((meal) => ({
        setId: meal.setId,
        quantity: meal.quantity,
      })),
    }));

    // Navigate to checkout with all data
    navigate("/checkout", {
      state: {
        packageData,
        schedule,
        deliveryDays,
        mealSelections,
      },
    });
  };

  if (!packageData) {
    return null;
  }

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
          {/* Content */}
          <div className="relative z-10 max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
              Customize Your Meal Plan
            </h1>
            <p className="text-lg text-white max-w-2xl mx-auto drop-shadow-md">
              Choose your package duration, select meals for each day, and
              create the perfect tiffin subscription.
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="space-y-5">
            {/* Delivery Days Section - Horizontal */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <h3 className="text-base font-semibold text-gray-800 mb-4">
                Select Delivery Days
              </h3>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map((day) => (
                  <label
                    key={day}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all text-sm ${
                      deliveryDays[day]
                        ? "border-yellow-500 bg-yellow-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={deliveryDays[day]}
                      onChange={() => toggleDay(day)}
                      className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                      style={{ accentColor: "#F5B800" }}
                    />
                    <span
                      className={`font-medium ${
                        deliveryDays[day] ? "text-gray-800" : "text-gray-600"
                      }`}
                    >
                      {day.charAt(0) + day.slice(1).toLowerCase()}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Meal Selection Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <h3 className="text-base font-semibold text-gray-800 mb-4">
                Meal Selection
              </h3>
              <div className="space-y-3">
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
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white ${
                            deliveryDays[day] ? "bg-green-500" : "bg-gray-400"
                          }`}
                        >
                          {daysOfWeek.indexOf(day) + 1}
                        </span>
                        <h4 className="text-sm font-medium text-gray-800">
                          {day.charAt(0) + day.slice(1).toLowerCase()}
                        </h4>
                      </div>
                      {deliveryDays[day] && (
                        <span className="text-xs text-green-600 font-medium">
                          Active
                        </span>
                      )}
                    </div>

                    {deliveryDays[day] ? (
                      <div className="space-y-2">
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              const selectedMeal = availableMealSets.find(
                                (m) => (m.setId || m.id) === e.target.value
                              );
                              if (selectedMeal) addMealToDay(day, selectedMeal);
                              e.target.value = "";
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 bg-white"
                          disabled={loading}
                        >
                          <option value="">Choose a meal...</option>
                          {availableMealSets.map((mealSet) => (
                            <option
                              key={mealSet.setId || mealSet.id}
                              value={mealSet.setId || mealSet.id}
                            >
                              {mealSet.name} - Rs.{mealSet.price || 0}
                            </option>
                          ))}
                        </select>

                        {mealSelections[day].length > 0 && (
                          <div className="space-y-1">
                            {mealSelections[day].map((meal, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between py-2 px-3 bg-white rounded border border-gray-200"
                              >
                                <span className="text-sm text-gray-700">
                                  {meal.name}
                                </span>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    min="1"
                                    value={meal.quantity}
                                    onChange={(e) =>
                                      updateMealQuantity(
                                        day,
                                        index,
                                        parseInt(e.target.value) || 1
                                      )
                                    }
                                    className="w-14 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                                  />
                                  <button
                                    onClick={() =>
                                      removeMealFromDay(day, index)
                                    }
                                    className="text-red-500 hover:text-red-700"
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
                      <p className="text-xs text-gray-400">
                        Enable this day to select meals
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between gap-3 mt-6">
            <button
              onClick={() => navigate("/packages")}
              className="px-5 py-2 border border-gray-300 rounded-lg text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={handleContinue}
              disabled={
                !Object.values(deliveryDays).some((enabled) => enabled) ||
                !daysOfWeek.some(
                  (day) => deliveryDays[day] && mealSelections[day].length > 0
                )
              }
              className="px-5 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
      </main>

      <Footer />
    </div>
  );
};

export default ScheduleCustomization;
