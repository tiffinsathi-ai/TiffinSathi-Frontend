import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { HiStar, HiChevronDown } from "react-icons/hi";
import { MapPin, Phone, ChefHat } from "lucide-react";
import homeBg from "../../assets/home.jpg";
import { toast } from "react-toastify";

const Restaurant = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("Most Popular");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    if (!error) return;
    toast.error(error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSortDropdown && !event.target.closest(".sort-dropdown")) {
        setShowSortDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSortDropdown]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(
        "http://localhost:8080/api/vendors/public/approved",
      );
      const data = Array.isArray(res.data) ? res.data : [];
      setVendors(data);
      setFilteredVendors(data);
    } catch (e) {
      console.error("Error fetching approved vendors:", e);
      setError("Failed to load restaurants. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...vendors];

    // Sort
    if (sortBy === "Most Popular") {
      filtered.sort(
        (a, b) => (b.yearsInBusiness || 0) - (a.yearsInBusiness || 0),
      );
    } else if (sortBy === "Most Experienced") {
      filtered.sort(
        (a, b) => (b.yearsInBusiness || 0) - (a.yearsInBusiness || 0),
      );
    } else if (sortBy === "Name: A to Z") {
      filtered.sort((a, b) =>
        (a.businessName || "").localeCompare(b.businessName || ""),
      );
    } else if (sortBy === "Name: Z to A") {
      filtered.sort((a, b) =>
        (b.businessName || "").localeCompare(a.businessName || ""),
      );
    }

    setFilteredVendors(filtered);
  }, [vendors, sortBy]);

  const getProfileSrc = (profilePicture) => {
    if (!profilePicture)
      return "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200";
    if (typeof profilePicture !== "string")
      return "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200";
    if (profilePicture.startsWith("data:")) return profilePicture;
    // Try to guess image type
    const isPng = profilePicture.startsWith("iVBOR");
    const mime = isPng ? "image/png" : "image/jpeg";
    return `data:${mime};base64,${profilePicture}`;
  };

  const renderStars = (yearsInBusiness = 0) => {
    // convert experience into a stable rating-like value [3.8..5.0]
    const rating = Math.min(
      5,
      Math.max(3.8, 3.8 + (yearsInBusiness || 0) * 0.12),
    );
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <HiStar
          key={`full-${i}`}
          className="w-4 h-4 text-yellow-400 fill-current"
        />,
      );
    }
    if (hasHalfStar) {
      stars.push(
        <HiStar
          key="half"
          className="w-4 h-4 text-yellow-400 fill-current opacity-50"
        />,
      );
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <HiStar key={`empty-${i}`} className="w-4 h-4 text-gray-300" />,
      );
    }
    return { rating, stars };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading restaurants...</div>
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
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto py-20">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
            Discover <span style={{ color: "#F5B800" }}>Restaurants</span>
          </h1>
          <p className="text-lg md:text-xl text-white mb-8 max-w-2xl mx-auto drop-shadow-md">
            Browse approved restaurants and view their meal packages.
          </p>
        </div>
      </section>

      {/* Filter and Sort Section */}
      <section className="bg-white border-b border-gray-200 py-6 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
                  {[
                    "Most Popular",
                    "Most Experienced",
                    "Name: A to Z",
                    "Name: Z to A",
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

        </div>
      </section>

      {/* Restaurants Grid */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          {filteredVendors.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600">No restaurants found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredVendors.map((v) => {
                const { rating, stars } = renderStars(v.yearsInBusiness);
                const reviewCount =
                  Math.floor((v.yearsInBusiness || 1) * 45) + 30;
                return (
                  <div
                    key={v.vendorId}
                    className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden border border-gray-100"
                  >
                    {/* Image Section */}
                    <div className="relative h-48 bg-gray-200 overflow-hidden">
                      <img
                        src={getProfileSrc(v.profilePicture)}
                        alt={v.businessName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200";
                        }}
                      />
                      {/* Tags */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        <span
                          className="px-2 py-1 rounded text-xs font-medium text-white flex items-center gap-1"
                          style={{ backgroundColor: "#4A8C39" }}
                        >
                          <ChefHat className="w-3.5 h-3.5" />
                          {(v.cuisineType || "Cuisine").toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-5">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {v.businessName}
                      </h3>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {v.description ||
                          "Approved restaurant on Tiffin Sathi."}
                      </p>

                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center">{stars}</div>
                        <span className="text-sm text-gray-600">
                          {rating.toFixed(1)} ({reviewCount} reviews)
                        </span>
                      </div>

                      {/* Details */}
                      <div className="space-y-2 text-sm text-gray-700 mb-4">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                          <span className="line-clamp-2">
                            {v.businessAddress || "Address not available"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span>{v.phone || "Phone not available"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                            {v.yearsInBusiness || 0}+ years
                          </span>
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                            {v.ownerName || "Owner"}
                          </span>
                        </div>
                      </div>

                      {/* View Packages */}
                      <div className="pt-4 border-t border-gray-200 flex justify-end">
                        <button
                          onClick={() =>
                            navigate(`/packages?vendorId=${v.vendorId}`, {
                              state: {
                                vendorId: v.vendorId,
                                vendorName: v.businessName,
                              },
                            })
                          }
                          className="px-6 py-2 rounded-lg font-medium text-white transition-colors"
                          style={{ backgroundColor: "#F5B800" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = "#e0a500")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = "#F5B800")
                          }
                        >
                          View Packages
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

export default Restaurant;
