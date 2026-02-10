// src/Pages/Vendor/Reviews.js 
import React, { useState, useEffect, useCallback } from "react";
import { vendorApi } from "../../helpers/api";
import { toast } from "react-toastify";
import { 
  Search, 
  Filter,
  Star,
  Calendar,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  MoreVertical,
  Trash2,
  Reply,
  XCircle,
  RefreshCw,
  AlertCircle,
  Users,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  X
} from "lucide-react";

// StatCard Component
const StatCard = ({ title, value, icon: Icon, color, onClick, trendValue, loading }) => {
  const colors = {
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    green: "text-green-600 bg-green-50 border-green-100",
    purple: "text-purple-600 bg-purple-50 border-purple-100",
    orange: "text-orange-600 bg-orange-50 border-orange-100",
    yellow: "text-yellow-600 bg-yellow-50 border-yellow-100",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100"
  };

  const borderColors = {
    blue: "hover:border-blue-300",
    green: "hover:border-green-300",
    purple: "hover:border-purple-300",
    orange: "hover:border-orange-300",
    yellow: "hover:border-yellow-300",
    emerald: "hover:border-emerald-300"
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-white p-6 rounded-xl border border-gray-200 ${borderColors[color]} transition-all duration-200 hover:shadow-lg cursor-pointer ${onClick ? 'hover:scale-[1.02]' : 'cursor-default'}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        {trendValue !== undefined && trendValue !== null && !loading && (
          <div className={`flex items-center text-sm font-medium ${trendValue > 0 ? 'text-green-600' : trendValue < 0 ? 'text-red-600' : 'text-gray-600'}`}>
            {trendValue > 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : trendValue < 0 ? <TrendingDown className="h-4 w-4 mr-1" /> : null}
            {trendValue !== 0 && <span>{Math.abs(trendValue)}%</span>}
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">
        {loading ? (
          <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
        ) : value}
      </h3>
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  );
};

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [selectedReview, setSelectedReview] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    fiveStarReviews: 0,
    repliedReviews: 0,
    newThisWeek: 0,
    ratingGrowth: 0,
    responseRate: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Load reviews and stats from API
  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      setStatsLoading(true);
      setError("");
      
      // Load reviews
      const response = await vendorApi.getVendorReviews();
      if (response.ok && Array.isArray(response.data)) {
        const reviewsData = response.data;
        setReviews(reviewsData);
        
        // Calculate REAL stats from API data
        const totalReviews = reviewsData.length;
        const fiveStarReviews = reviewsData.filter(r => r.rating === 5).length;
        const repliedReviews = reviewsData.filter(r => r.reply && r.reply.trim() !== '').length;
        
        // Calculate average rating
        const averageRating = totalReviews > 0 
          ? (reviewsData.reduce((sum, review) => sum + (review.rating || 0), 0) / totalReviews).toFixed(1)
          : "0.0";
        
        // Calculate new reviews this week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const newThisWeek = reviewsData.filter(r => {
          const reviewDate = new Date(r.createdAt || r.date);
          return reviewDate >= oneWeekAgo;
        }).length;
        
        // Calculate response rate
        const responseRate = totalReviews > 0 ? Math.round((repliedReviews / totalReviews) * 100) : 0;
        
        // Get rating growth from API if available
        let ratingGrowth = 0;
        try {
          const statsResponse = await vendorApi.getReviewStats();
          if (statsResponse.ok && statsResponse.data) {
            ratingGrowth = statsResponse.data.ratingGrowth || 0;
          } else {
            // Calculate growth from last month
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            const lastMonthReviews = reviewsData.filter(r => {
              const reviewDate = new Date(r.createdAt || r.date);
              return reviewDate >= oneMonthAgo;
            });
            
            const lastMonthAvg = lastMonthReviews.length > 0 
              ? (lastMonthReviews.reduce((sum, review) => sum + (review.rating || 0), 0) / lastMonthReviews.length).toFixed(1)
              : 0;
            
            ratingGrowth = parseFloat(averageRating) - parseFloat(lastMonthAvg);
          }
        } catch (err) {
          // Fallback calculation
          ratingGrowth = 0;
        }
        
        setStats({
          averageRating,
          totalReviews,
          fiveStarReviews,
          repliedReviews,
          newThisWeek,
          ratingGrowth: Math.round(ratingGrowth * 10), // Convert to percentage points
          responseRate
        });
      }
    } catch (err) {
      setError("Failed to load reviews: " + err.message);
      console.error("Error loading reviews:", err);
    } finally {
      setLoading(false);
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  // Filter reviews based on search and rating filter
  useEffect(() => {
    let filtered = [...reviews];
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(review =>
        (review.userName && review.userName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (review.comment && review.comment.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (review.mealPlanName && review.mealPlanName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Rating filter
    if (ratingFilter !== "all") {
      filtered = filtered.filter(review => review.rating === parseInt(ratingFilter));
    }
    
    // Sort by latest first
    filtered.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
    setFilteredReviews(filtered);
  }, [searchTerm, ratingFilter, reviews]);

  // Navigation functions for stat cards
  const filterByRating = (rating) => {
    setRatingFilter(rating.toString());
  };

  const showAllReviews = () => {
    setRatingFilter("all");
    setSearchTerm("");
  };

  const showRepliedReviews = () => {
    setFilteredReviews(reviews.filter(r => r.reply && r.reply.trim() !== ''));
  };

  // Delete review - REAL API call
  const deleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    
    try {
      const response = await vendorApi.deleteReview(reviewId);
      if (response.ok) {
        toast.success("Review deleted successfully");
        loadReviews();
      } else {
        toast.error("Failed to delete review");
      }
    } catch (err) {
      toast.error("Failed to delete review: " + err.message);
    }
  };

  // Start reply
  const startReply = (review) => {
    setSelectedReview(review);
    setReplyText(review.reply || "");
    setShowReplyModal(true);
  };

  // Submit reply - REAL API call
  const submitReply = async () => {
    if (!replyText.trim() || !selectedReview) return;

    try {
      const response = await vendorApi.replyToReview(selectedReview.id, replyText.trim());
      if (response.ok) {
        toast.success("Response submitted successfully");
        setShowReplyModal(false);
        setReplyText("");
        setSelectedReview(null);
        loadReviews();
      } else {
        toast.error("Failed to submit response");
      }
    } catch (err) {
      toast.error("Failed to submit response: " + err.message);
    }
  };

  // Helper functions
  const getRatingColor = (rating) => {
    const colors = {
      5: "bg-green-100 text-green-800 border-green-200",
      4: "bg-blue-100 text-blue-800 border-blue-200", 
      3: "bg-yellow-100 text-yellow-800 border-yellow-200",
      2: "bg-orange-100 text-orange-800 border-orange-200",
      1: "bg-red-100 text-red-800 border-red-200"
    };
    return colors[rating] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `${diffInMinutes} min ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  const ratingOptions = [
    { value: "all", label: "All Ratings" },
    { value: "5", label: "5 Stars" },
    { value: "4", label: "4 Stars" },
    { value: "3", label: "3 Stars" },
    { value: "2", label: "2 Stars" },
    { value: "1", label: "1 Star" }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin text-green-600 mr-2" size={24} />
        <span className="text-gray-600">Loading reviews...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customer Reviews</h1>
            <p className="text-gray-600 mt-2">Manage and respond to customer feedback</p>
          </div>
          <button
            onClick={loadReviews}
            disabled={loading}
            className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {/* Stats Cards - ALL WITH REAL DATA AND NAVIGATION */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Average Rating"
          value={stats.averageRating}
          icon={Star}
          color="yellow"
          trendValue={stats.ratingGrowth}
          onClick={showAllReviews}
          loading={statsLoading}
        />
        <StatCard
          title="5 Star Reviews"
          value={stats.fiveStarReviews}
          icon={TrendingUp}
          color="green"
          onClick={() => filterByRating(5)}
          loading={statsLoading}
        />
        <StatCard
          title="Response Rate"
          value={`${stats.responseRate}%`}
          icon={MessageCircle}
          color="blue"
          onClick={showRepliedReviews}
          loading={statsLoading}
        />
        <StatCard
          title="New This Week"
          value={stats.newThisWeek}
          icon={Users}
          color="purple"
          loading={statsLoading}
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search reviews by customer, comment, or meal..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-500" />
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
            >
              {ratingOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div className="text-sm text-gray-600 flex items-center justify-end">
            <span className="bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
              {filteredReviews.length} reviews found
            </span>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <div key={review.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-green-300 transition-all duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center border border-blue-200">
                  <span className="font-semibold text-blue-600">
                    {(review.userName || "Customer").charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{review.userName || "Customer"}</h3>
                  {review.mealPlanName && (
                    <p className="text-sm text-gray-600">Ordered: {review.mealPlanName}</p>
                  )}
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          size={16}
                          className={`${
                            star <= (review.rating || 0)
                              ? "text-yellow-400 fill-yellow-400" 
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRatingColor(review.rating)}`}>
                      {(review.rating || 0)}.0
                    </span>
                    <span className="text-sm text-gray-500">
                      {getTimeAgo(review.createdAt || review.date)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => startReply(review)}
                  className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg border border-blue-200 transition-colors"
                  title="Reply to review"
                >
                  <Reply size={16} />
                </button>
                <button
                  onClick={() => deleteReview(review.id)}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
                  title="Delete review"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-gray-700">{review.comment || "No comment provided"}</p>
            </div>

            {/* Vendor Reply */}
            {review.reply && (
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center border border-green-200">
                    <span className="text-xs font-semibold text-green-600">V</span>
                  </div>
                  <span className="font-medium text-gray-900">Vendor Response</span>
                  {review.repliedAt && (
                    <span className="text-sm text-gray-500">
                      {getTimeAgo(review.repliedAt)}
                    </span>
                  )}
                </div>
                <p className="text-gray-700">{review.reply}</p>
              </div>
            )}

            {/* Actions */}
            {!review.reply && (
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <button
                    onClick={() => startReply(review)}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <Reply size={14} />
                    <span>Reply</span>
                  </button>
                </div>
                <span className="text-xs text-gray-500">
                  Review #{review.id}
                </span>
              </div>
            )}
          </div>
        ))}

        {!loading && filteredReviews.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200">
              <Star size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || ratingFilter !== "all" ? "No Matching Reviews" : "No Reviews Yet"}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || ratingFilter !== "all"
                ? "Try adjusting your search criteria or clear filters"
                : "Customer reviews will appear here when they rate your service"}
            </p>
            {(searchTerm || ratingFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setRatingFilter("all");
                }}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {showReplyModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full border border-gray-200">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Reply to Review</h3>
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Review Details */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        size={16}
                        className={`${
                          star <= (selectedReview.rating || 0)
                            ? "text-yellow-400 fill-yellow-400" 
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-medium">{selectedReview.userName || "Customer"}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRatingColor(selectedReview.rating)}`}>
                    {selectedReview.rating || 0}.0
                  </span>
                </div>
                <p className="text-gray-700">{selectedReview.comment || "No comment"}</p>
                {selectedReview.mealPlanName && (
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Order:</strong> {selectedReview.mealPlanName}
                  </p>
                )}
              </div>

              {/* Reply Form */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Response
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your professional and helpful response..."
                  rows="4"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Your response will be visible to all customers.
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitReply}
                  disabled={!replyText.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Response
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews;