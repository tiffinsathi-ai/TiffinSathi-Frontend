import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { HiStar, HiChevronDown } from "react-icons/hi";
import { Heart } from "lucide-react";
import { authStorage } from "../../helpers/api";
import homeBg from "../../assets/home.jpg";

const Packages = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All Packages");
  const [sortBy, setSortBy] = useState("Most Popular");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [favorites, setFavorites] = useState(new Set());

  useEffect(() => {
    fetchPackages();
  }, []);

  useEffect(() => {
    filterAndSortPackages();
  }, [packages, activeFilter, sortBy]);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSortDropdown && !event.target.closest(".sort-dropdown")) {
        setShowSortDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSortDropdown]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:8080/api/meal-packages"
      );

      // Ensure response.data is an array and normalize the data structure
      const packagesData = Array.isArray(response.data) ? response.data : [];

      // Normalize features to always be an array
      const normalizedPackages = packagesData.map((pkg) => ({
        ...pkg,
        features: Array.isArray(pkg.features)
          ? pkg.features
          : pkg.features
          ? [pkg.features]
          : [],
        packageSets: Array.isArray(pkg.packageSets) ? pkg.packageSets : [],
      }));

      console.log("Fetched packages:", normalizedPackages);
      setPackages(normalizedPackages);
      setFilteredPackages(normalizedPackages);
    } catch (err) {
      console.error("Error fetching packages:", err);
      setError("Failed to load packages. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortPackages = () => {
    let filtered = [...packages];

    // Apply filter
    if (activeFilter !== "All Packages") {
      const filterMap = {
        Daily: 1,
        Weekly: 7,
        Monthly: 30,
        Special: "special",
      };
      const filterValue = filterMap[activeFilter];
      if (filterValue === "special") {
        // Filter for special packages (you might need to adjust this based on your backend)
        filtered = filtered.filter(
          (pkg) =>
            pkg.name?.toLowerCase().includes("special") ||
            pkg.name?.toLowerCase().includes("premium")
        );
      } else {
        filtered = filtered.filter((pkg) => pkg.durationDays === filterValue);
      }
    }

    // Apply sort
    if (sortBy === "Most Popular") {
      // Sort by rating or reviews if available
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === "Price: Low to High") {
      filtered.sort((a, b) => (a.pricePerSet || 0) - (b.pricePerSet || 0));
    } else if (sortBy === "Price: High to Low") {
      filtered.sort((a, b) => (b.pricePerSet || 0) - (a.pricePerSet || 0));
    } else if (sortBy === "Name: A to Z") {
      filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }

    setFilteredPackages(filtered);
  };

  const toggleFavorite = (packageId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(packageId)) {
      newFavorites.delete(packageId);
    } else {
      newFavorites.add(packageId);
    }
    setFavorites(newFavorites);
  };

  const getDurationLabel = (durationDays) => {
    if (durationDays === 1) return "Daily";
    if (durationDays === 7) return "Weekly";
    if (durationDays === 30) return "Monthly";
    return "Special";
  };

  const getSpecialTag = (pkg) => {
    const name = pkg.name?.toLowerCase() || "";
    if (name.includes("student")) return "Student Offer";
    if (name.includes("premium")) return "Premium";
    if (name.includes("family")) return "Family Size";
    if (name.includes("basic")) return "Affordable";
    if (name.includes("popular") || pkg.rating >= 4.7) return "Most Popular";
    if (pkg.pricePerSet && packages.length > 0) {
      const avgPrice =
        packages.reduce((sum, p) => sum + (p.pricePerSet || 0), 0) /
        packages.length;
      if (pkg.pricePerSet < avgPrice * 0.8) return "Best Value";
    }
    return null;
  };

  const calculateOriginalPrice = (currentPrice) => {
    // Add 20-30% markup for original price
    return Math.round(currentPrice * 1.25);
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <HiStar key={i} className="w-4 h-4 text-yellow-400 fill-current" />
      );
    }
    if (hasHalfStar) {
      stars.push(
        <HiStar
          key="half"
          className="w-4 h-4 text-yellow-400 fill-current opacity-50"
        />
      );
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <HiStar key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading packages...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-50">
      {/* Hero Section */}
      <section className="relative min-h-[400px] flex items-center justify-center overflow-hidden">
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
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto py-20">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
            Choose Your Perfect{" "}
            <span style={{ color: "#F5B800" }}>Meal Package</span>
          </h1>
          <p className="text-lg md:text-xl text-white mb-8 max-w-2xl mx-auto drop-shadow-md">
            From daily fresh tiffins to monthly premium plans, find the perfect
            meal solution for your lifestyle.
          </p>
        </div>
      </section>

      {/* Filter and Sort Section */}
      <section className="bg-white border-b border-gray-200 py-6 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-3">
              {["All Packages", "Daily", "Weekly", "Monthly", "Special"].map(
                (filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      activeFilter === filter
                        ? "text-white"
                        : "text-gray-700 bg-gray-100 hover:bg-gray-200"
                    }`}
                    style={
                      activeFilter === filter
                        ? { backgroundColor: "#4A8C39" }
                        : {}
                    }
                  >
                    {filter}
                  </button>
                )
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative sort-dropdown">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
              >
                <span>Sort by: {sortBy}</span>
                <HiChevronDown className="w-4 h-4" />
              </button>
              {showSortDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
                  {[
                    "Most Popular",
                    "Price: Low to High",
                    "Price: High to Low",
                    "Name: A to Z",
                  ].map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setSortBy(option);
                        setShowSortDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                        sortBy === option ? "bg-gray-50 font-medium" : ""
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Package Count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredPackages.length} package
            {filteredPackages.length !== 1 ? "s" : ""}
          </div>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          {filteredPackages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600">No packages found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPackages.map((pkg) => {
                const durationLabel = getDurationLabel(pkg.durationDays);
                const specialTag = getSpecialTag(pkg);
                const originalPrice = calculateOriginalPrice(pkg.pricePerSet);
                const rating = pkg.rating || 4.5;
                const reviewCount =
                  pkg.reviewCount || Math.floor(Math.random() * 200) + 50;

                return (
                  <div
                    key={pkg.packageId}
                    className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden border border-gray-100"
                  >
                    {/* Image Section */}
                    <div className="relative h-48 bg-gray-200 overflow-hidden">
                      <img
                        src={
                          pkg.image ||
                          "https://via.placeholder.com/400x300?text=Meal+Package"
                        }
                        alt={pkg.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/400x300?text=Meal+Package";
                        }}
                      />
                      {/* Tags */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        <span
                          className="px-2 py-1 rounded text-xs font-medium text-white"
                          style={{ backgroundColor: "#4A8C39" }}
                        >
                          {durationLabel}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                        {specialTag && (
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium text-white ${
                              specialTag === "Premium"
                                ? "bg-green-600"
                                : specialTag === "Student Offer"
                                ? "bg-blue-600"
                                : "bg-red-500"
                            }`}
                          >
                            {specialTag}
                          </span>
                        )}
                      </div>
                      {/* Favorite Button */}
                      <button
                        onClick={() => toggleFavorite(pkg.packageId)}
                        className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors shadow-sm"
                      >
                        <Heart
                          className={`w-5 h-5 ${
                            favorites.has(pkg.packageId)
                              ? "fill-red-500 text-red-500"
                              : "text-gray-400"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Content Section */}
                    <div className="p-5">
                      {/* Title */}
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {pkg.name}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {pkg.description ||
                          "Fresh homemade meals delivered daily with authentic taste and variety"}
                      </p>

                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center">
                          {renderStars(rating)}
                        </div>
                        <span className="text-sm text-gray-600">
                          {rating.toFixed(1)} ({reviewCount} reviews)
                        </span>
                      </div>

                      {/* Features/Inclusions */}
                      <div className="mb-4">
                        <div className="text-sm text-gray-700">
                          {pkg.features &&
                          Array.isArray(pkg.features) &&
                          pkg.features.length > 0 ? (
                            <div className="space-y-1">
                              {pkg.features.slice(0, 3).map((feature, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2"
                                >
                                  <span className="text-green-600">•</span>
                                  <span>
                                    {typeof feature === "string"
                                      ? feature
                                      : JSON.stringify(feature)}
                                  </span>
                                </div>
                              ))}
                              {pkg.features.length > 3 && (
                                <div className="text-gray-500 text-xs mt-1">
                                  +{pkg.features.length - 3} more
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-gray-500">
                              {pkg.packageSets &&
                              Array.isArray(pkg.packageSets) &&
                              pkg.packageSets.length > 0
                                ? `${pkg.packageSets.length} meal sets available`
                                : "Check details for inclusions"}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Price and Subscribe */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-gray-800">
                              Rs.{pkg.pricePerSet || 0}
                            </span>
                            <span className="text-lg text-gray-500 line-through">
                              Rs.{originalPrice}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            per {durationLabel.toLowerCase()}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const token = authStorage.getToken();
                            if (!token) {
                              navigate("/login", {
                                state: { from: "/packages", packageData: pkg },
                              });
                            } else {
                              navigate("/schedule-customization", {
                                state: { packageData: pkg },
                              });
                            }
                          }}
                          className="px-6 py-2 rounded-lg font-medium text-white transition-colors flex items-center gap-2"
                          style={{ backgroundColor: "#F5B800" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = "#e0a500")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = "#F5B800")
                          }
                        >
                          <span>Subscribe</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Packages;
