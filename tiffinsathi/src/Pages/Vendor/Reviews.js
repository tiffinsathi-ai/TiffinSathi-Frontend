// src/Pages/Vendor/Reviews.js 
import React, { useState, useEffect, useCallback } from "react";
import { api } from "../../helpers/api"; // Fixed import
import { toast } from "react-toastify";
import { 
  Search, 
  Filter,
  Star,
  Calendar,
  MessageCircle,
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

  // ============================================
  // REAL DATA LOADING - NO BACKEND API FOR REVIEWS
  // ============================================
  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      
      // IMPORTANT: There is NO reviews API in the backend
      // Show informative message to user
      console.log("No reviews API available - showing informational state");
      
      // Set empty data with informative message
      setReviews([]);
      setStats({
        averageRating: 0,
        totalReviews: 0,
        fiveStarReviews: 0,
        repliedReviews: 0,
        newThisWeek: 0,
        ratingGrowth: 0,
        responseRate: 0
      });
      
      // Show informational message
      setError("Reviews feature is currently not available. Customer reviews will be implemented soon.");
      
    } catch (err) {
      console.error("Error in reviews:", err);
      setError("Unable to load reviews. Please try again later.");
    } finally {
      setLoading(false);
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
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    setFilteredReviews(filtered);
  }, [searchTerm, ratingFilter, reviews]);

  // Delete review
  const deleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    
    try {
      // Since there's no API, just update local state
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      toast.success("Review removed locally");
    } catch (err) {
      toast.error("Failed to delete review");
    }
  };

  // Start reply
  const startReply = (review) => {
    setSelectedReview(review);
    setReplyText(review.reply || "");
    setShowReplyModal(true);
  };

  // Submit reply
  const submitReply = async () => {
    if (!replyText.trim() || !selectedReview) return;

    try {
      // Update local state since there's no API
      setReviews(prev => prev.map(r => 
        r.id === selectedReview.id 
          ? { ...r, reply: replyText.trim(), repliedAt: new Date().toISOString() }
          : r
      ));
      toast.success("Response saved locally");
      setShowReplyModal(false);
      setReplyText("");
      setSelectedReview(null);
    } catch (err) {
      toast.error("Failed to save response");
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
      <div className="flex flex-col items-center justify-center h-96">
        <RefreshCw className="animate-spin text-green-600 mb-4" size={32} />
        <p className="text-gray-600">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-bold text-gray-900">Customer Reviews</h1>
            <p className="text-gray-600 mt-1">Manage and respond to customer feedback</p>
          </div>
          <button
            onClick={loadReviews}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Information/Error Display */}
      {error && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <div className="flex-1">
            <p className="font-medium">Reviews Feature Notice</p>
            <p className="text-sm">{error}</p>
          </div>
          <button 
            onClick={() => setError("")}
            className="ml-4 text-blue-500 hover:text-blue-700"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* Review Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Average Rating Card */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 rounded-lg bg-yellow-50 text-yellow-600">
              <Star className="h-5 w-5" />
            </div>
            <div className={`text-sm font-medium ${stats.ratingGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.ratingGrowth > 0 ? <TrendingUp className="h-4 w-4 inline mr-1" /> : <TrendingDown className="h-4 w-4 inline mr-1" />}
              {Math.abs(stats.ratingGrowth)}%
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.averageRating}/5.0</h3>
          <p className="text-sm text-gray-600 mb-1">Average Rating</p>
          <div className="flex items-center mt-2">
            {[1, 2, 3, 4, 5].map(star => (
              <Star
                key={star}
                size={14}
                className={`mr-1 ${
                  star <= Math.round(parseFloat(stats.averageRating))
                    ? "text-yellow-400 fill-yellow-400" 
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Total Reviews Card */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
              <MessageCircle className="h-5 w-5" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalReviews}</h3>
          <p className="text-sm text-gray-600 mb-1">Total Reviews</p>
          <p className="text-xs text-gray-500">{stats.newThisWeek} new this week</p>
        </div>

        {/* Response Rate Card */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 rounded-lg bg-green-50 text-green-600">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.responseRate}%</h3>
          <p className="text-sm text-gray-600 mb-1">Response Rate</p>
          <p className="text-xs text-gray-500">{stats.repliedReviews} of {stats.totalReviews} replied</p>
        </div>

        {/* 5-Star Reviews Card */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
              <Star className="h-5 w-5" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.fiveStarReviews}</h3>
          <p className="text-sm text-gray-600 mb-1">5-Star Reviews</p>
          <p className="text-xs text-gray-500">
            {stats.totalReviews > 0 ? Math.round((stats.fiveStarReviews / stats.totalReviews) * 100) : 0}% of total
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search reviews (feature coming soon)..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={reviews.length === 0}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-500" />
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              disabled={reviews.length === 0}
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

      {/* Information Card when no reviews API */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="p-3 bg-blue-100 rounded-lg">
              <MessageCircle className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer Reviews Feature</h3>
            <p className="text-gray-700 mb-3">
              The customer reviews system is currently being developed. This feature will allow customers to:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
              <li>Rate and review their meal orders</li>
              <li>Provide feedback on food quality and delivery</li>
              <li>View and respond to customer reviews</li>
              <li>Track your vendor rating over time</li>
            </ul>
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600">
                <strong>Expected Launch:</strong> Coming soon
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <strong>Note:</strong> You can test the review interface above, but data is not saved to the backend yet.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List - Only shows if there are reviews */}
      {filteredReviews.length > 0 && (
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
                        {getTimeAgo(review.date)}
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
            </div>
          ))}
        </div>
      )}

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
                  <strong>Note:</strong> This is a demonstration. Responses are saved locally only.
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