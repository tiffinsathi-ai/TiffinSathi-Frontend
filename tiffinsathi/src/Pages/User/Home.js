import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { HiHeart, HiTruck, HiTag, HiSearch, HiCube, HiCog, HiEmojiHappy, HiStar } from "react-icons/hi";
import { FaLeaf } from "react-icons/fa";
import { Heart } from "lucide-react";
import authStorage from "../../helpers/authStorage";
import homeBg from "../../assets/home.jpg";

const Home = () => {
  const navigate = useNavigate();
  const howItWorksRef = useRef(null);
  const [packages, setPackages] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [packagesError, setPackagesError] = useState(null);
  const [favorites, setFavorites] = useState(new Set());

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoadingPackages(true);
        const response = await axios.get(
          "http://localhost:8080/api/meal-packages"
        );

        const packagesData = Array.isArray(response.data) ? response.data : [];
        const normalizedPackages = packagesData.map((pkg) => ({
          ...pkg,
          features: Array.isArray(pkg.features)
            ? pkg.features
            : pkg.features
            ? [pkg.features]
            : [],
          packageSets: Array.isArray(pkg.packageSets) ? pkg.packageSets : [],
        }));

        setPackages(normalizedPackages);
      } catch (err) {
        console.error("Error fetching packages for home:", err);
        setPackagesError("Failed to load featured packages.");
      } finally {
        setLoadingPackages(false);
      }
    };

    fetchPackages();
  }, []);

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

  const getSpecialTag = (pkg, allPackages) => {
    const name = pkg.name?.toLowerCase() || "";
    if (name.includes("student")) return "Student Offer";
    if (name.includes("premium")) return "Premium";
    if (name.includes("family")) return "Family Size";
    if (name.includes("basic")) return "Affordable";
    if (name.includes("popular") || pkg.rating >= 4.7) return "Most Popular";
    if (pkg.pricePerSet && allPackages.length > 0) {
      const avgPrice =
        allPackages.reduce((sum, p) => sum + (p.pricePerSet || 0), 0) /
        allPackages.length;
      if (pkg.pricePerSet < avgPrice * 0.8) return "Best Value";
    }
    return null;
  };

  const calculateOriginalPrice = (currentPrice) => {
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

  return (
    <div className="flex flex-col min-h-screen w-full">
      <div className="flex-grow">
        {/* Hero Section */}
        <section
          className="relative min-h-[600px] flex items-center justify-center bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${homeBg})` }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          <div className="relative z-10 text-center px-6 max-w-4xl mx-auto py-20">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Eat Fresh. Healthy{" "}
              <span style={{ color: "#4A8C39" }}>Tiffin</span> Delivered{" "}
              <span style={{ color: "#4A8C39" }}>Daily</span> to Your Door.
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
              Experience the authentic taste of home with our freshly prepared
              tiffin meals. Made with love in clean kitchens, delivered with
              care to your doorstep.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                className="px-8 py-3 rounded-lg flex items-center gap-2 font-medium shadow-lg transition-colors text-white"
                style={{ backgroundColor: "#F5B800" }}
                onClick={() => navigate("/packages")}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#e0a500")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#F5B800")
                }
              >
                <HiSearch className="w-5 h-5" />
                <span>Explore Packages</span>
              </button>
              <button
                className="px-8 py-3 rounded-lg flex items-center gap-2 font-medium border-2 border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                onClick={() => {
                  if (howItWorksRef.current) {
                    howItWorksRef.current.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              >
                <span>How It Works</span>
              </button>
            </div>
          </div>
        </section>

        {/* Featured Packages Section */}
        <section className="py-16 px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {loadingPackages ? (
              <div className="flex justify-center py-8">
                <div className="text-gray-600">Loading packages...</div>
              </div>
            ) : packagesError ? (
              <div className="flex justify-center py-8">
                <div className="text-red-600 text-sm">{packagesError}</div>
              </div>
            ) : packages.length === 0 ? (
              <div className="flex justify-center py-8">
                <div className="text-gray-600 text-sm">
                  No packages available yet.
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {packages.slice(0, 3).map((pkg) => {
                  const durationLabel = getDurationLabel(pkg.durationDays);
                  const specialTag = getSpecialTag(pkg, packages);
                  const originalPrice = calculateOriginalPrice(
                    pkg.pricePerSet || 0
                  );
                  const rating = pkg.rating || 4.5;
                  const reviewCount =
                    pkg.reviewCount ||
                    Math.floor(Math.random() * 200) + 50;

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
                                  state: {
                                    from: "/",
                                    packageData: pkg,
                                  },
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
                              (e.currentTarget.style.backgroundColor =
                                "#e0a500")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "#F5B800")
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

        {/* Why Choose Tiffin Sathi Section */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Why Choose{" "}
                <span style={{ color: "#4A8C39" }}>Tiffin Sathi</span>?
              </h2>
              <p className="text-lg text-gray-600">
                We bring the warmth of home-cooked meals to your busy lifestyle
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Benefit Card 1 */}
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                <div className="flex justify-center mb-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#FFF4E6" }}
                  >
                    <HiHeart className="w-8 h-8" style={{ color: "#F5B800" }} />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">
                  Homemade Fresh
                </h3>
                <p className="text-gray-600 text-center">
                  Prepared daily with love in clean home kitchens
                </p>
              </div>

              {/* Benefit Card 2 */}
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                <div className="flex justify-center mb-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#FFF4E6" }}
                  >
                    <HiTruck className="w-8 h-8" style={{ color: "#F5B800" }} />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">
                  On-Time Delivery
                </h3>
                <p className="text-gray-600 text-center">
                  Hot meals delivered right to your doorstep
                </p>
              </div>

              {/* Benefit Card 3 */}
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                <div className="flex justify-center mb-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#FFF4E6" }}
                  >
                    <FaLeaf className="w-8 h-8" style={{ color: "#F5B800" }} />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">
                  Healthy & Organic
                </h3>
                <p className="text-gray-600 text-center">
                  Fresh ingredients, nutritious and balanced meals
                </p>
              </div>

              {/* Benefit Card 4 */}
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                <div className="flex justify-center mb-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#FFF4E6" }}
                  >
                    <HiTag className="w-8 h-8" style={{ color: "#F5B800" }} />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">
                  Affordable Pricing
                </h3>
                <p className="text-gray-600 text-center">
                  Great value meals that fit your budget
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section
          className="py-16 px-6 bg-gray-50"
          ref={howItWorksRef}
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                How It Works
              </h2>
              <p className="text-lg text-gray-600">
                Simple steps to get fresh, homemade meals delivered to your door
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <div className="flex justify-center mb-6">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#FFF4E6" }}
                  >
                    <div className="relative">
                      <span
                        className="text-3xl font-bold absolute -top-2 -left-2"
                        style={{ color: "#F5B800" }}
                      >
                        1
                      </span>
                      <HiCube
                        className="w-10 h-10"
                        style={{ color: "#4A8C39" }}
                      />
                    </div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  Choose Your Plan
                </h3>
                <p className="text-gray-600">
                  Select from daily, weekly, or monthly meal packages that suit
                  your needs
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <div className="flex justify-center mb-6">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#FFF4E6" }}
                  >
                    <div className="relative">
                      <span
                        className="text-3xl font-bold absolute -top-2 -left-2"
                        style={{ color: "#F5B800" }}
                      >
                        2
                      </span>
                      <HiCog
                        className="w-10 h-10"
                        style={{ color: "#4A8C39" }}
                      />
                    </div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  Customize Meals
                </h3>
                <p className="text-gray-600">
                  Personalize your meals according to your preferences and
                  dietary requirements
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <div className="flex justify-center mb-6">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#FFF4E6" }}
                  >
                    <div className="relative">
                      <span
                        className="text-3xl font-bold absolute -top-2 -left-2"
                        style={{ color: "#F5B800" }}
                      >
                        3
                      </span>
                      <HiEmojiHappy
                        className="w-10 h-10"
                        style={{ color: "#4A8C39" }}
                      />
                    </div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  Enjoy Fresh Food
                </h3>
                <p className="text-gray-600">
                  Receive delicious, hot meals at your doorstep and enjoy the
                  authentic taste of home
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
