// src/Pages/Vendor/Reviews.js
import React, { useState, useEffect } from "react";
import { readData, writeData } from "../../helpers/storage";
import { 
  Search, 
  Filter,
  Star,
  MessageCircle,
  Trash2,
  Reply,
  XCircle,
  RefreshCw,
  AlertCircle,
  Users,
  TrendingUp
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

  useEffect(() => {
    loadReviews();
  }, []);

  useEffect(() => {
    filterReviews();
  }, [searchTerm, ratingFilter, reviews]);

  const loadReviews = () => {
    setLoading(true);
    setError("");
    try {
      const data = readData();
      setReviews(data.reviews || []);
    } catch (err) {
      setError("Failed to load reviews: " + err.message);
      console.error("Error loading reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterReviews = () => {
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
  };

  // Enhanced StatCard component
  const StatCard = ({ title, value, icon: Icon, color, change }) => {
    const colors = {
      blue: "text-blue-600 bg-blue-50",
      green: "text-green-600 bg-green-50",
      purple: "text-purple-600 bg-purple-50",
      orange: "text-orange-600 bg-orange-50",
      emerald: "text-emerald-600 bg-emerald-50"
    };

    return (
      <div className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${colors[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
          {change && (
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
              {change}
            </span>
          )}
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
        <p className="text-sm text-gray-600">{title}</p>
      </div>
    );
  };

  const deleteReview = (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    
    try {
      const data = readData();
      data.reviews = data.reviews.filter(review => review.id !== reviewId);
      writeData(data);
      setReviews(data.reviews);
    } catch (err) {
      alert("Failed to delete review: " + err.message);
    }
  };

  const startReply = (review) => {
    setSelectedReview(review);
    setReplyText(review.reply || "");
    setShowReplyModal(true);
  };

  const submitReply = () => {
    if (!replyText.trim() || !selectedReview) return;

    try {
      const data = readData();
      const updatedReviews = data.reviews.map(review =>
        review.id === selectedReview.id 
          ? { ...review, reply: replyText, repliedAt: new Date().toISOString() }
          : review
      );
      
      data.reviews = updatedReviews;
      writeData(data);
      setReviews(updatedReviews);
      setShowReplyModal(false);
      setReplyText("");
      setSelectedReview(null);
    } catch (err) {
      alert("Failed to submit reply: " + err.message);
    }
  };

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

  const getAverageRating = () => {
    if (reviews.length === 0) return "0.0";
    const total = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    return (total / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      if (review.rating && review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating]++;
      }
    });
    return distribution;
  };

  const getRepliedReviewsCount = () => {
    return reviews.filter(review => review.reply).length;
  };

  const ratingOptions = [
    { value: "all", label: "All Ratings" },
    { value: "5", label: "5 Stars" },
    { value: "4", label: "4 Stars" },
    { value: "3", label: "3 Stars" },
    { value: "2", label: "2 Stars" },
    { value: "1", label: "1 Star" }
  ];

  const ratingDistribution = getRatingDistribution();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin text-blue-600 mr-2" size={24} />
        <span className="text-gray-600">Loading reviews...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
          <p className="text-gray-600">Manage and respond to customer feedback</p>
        </div>
        <button
          onClick={loadReviews}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Average Rating"
          value={getAverageRating()}
          icon={Star}
          color="yellow"
          change={`${reviews.length} total reviews`}
        />
        <StatCard
          title="5 Star Reviews"
          value={ratingDistribution[5]}
          icon={TrendingUp}
          color="green"
          change={`${reviews.length > 0 ? ((ratingDistribution[5] / reviews.length) * 100).toFixed(1) : 0}%`}
        />
        <StatCard
          title="Replied"
          value={getRepliedReviewsCount()}
          icon={MessageCircle}
          color="blue"
          change={`${reviews.length > 0 ? ((getRepliedReviewsCount() / reviews.length) * 100).toFixed(1) : 0}% replied`}
        />
        <StatCard
          title="New This Week"
          value={reviews.filter(r => {
            const reviewDate = new Date(r.createdAt || r.date);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return reviewDate >= weekAgo;
          }).length}
          icon={Users}
          color="purple"
        />
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search reviews by customer, comment, or meal..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
          >
            {ratingOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <div className="text-sm text-gray-600 flex items-center">
            <Filter size={16} className="mr-2" />
            <span>{filteredReviews.length} reviews found</span>
          </div>
          {(searchTerm || ratingFilter !== "all") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setRatingFilter("all");
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <div key={review.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
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
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRatingColor(review.rating)}`}>
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
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Reply to review"
                >
                  <Reply size={16} />
                </button>
                <button
                  onClick={() => deleteReview(review.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
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
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <div className="flex space-x-2">
                  <button
                    onClick={() => startReply(review)}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
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

        {filteredReviews.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {showReplyModal && selectedReview && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Reply to Review</h3>
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>

              {/* Review Details */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
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
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRatingColor(selectedReview.rating)}`}>
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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