// src/Pages/Vendor/Reviews.js
import React, { useState, useEffect } from "react";
import { readData, writeData } from "../../helpers/storage";
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
  Flag,
  XCircle
} from "lucide-react";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [selectedReview, setSelectedReview] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    loadReviews();
  }, []);

  useEffect(() => {
    filterReviews();
  }, [searchTerm, ratingFilter, reviews]);

  const loadReviews = () => {
    const data = readData();
    setReviews(data.reviews || []);
  };

  const filterReviews = () => {
    let filtered = [...reviews];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(review =>
        review.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (review.mealPlanName && review.mealPlanName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Rating filter
    if (ratingFilter !== "all") {
      filtered = filtered.filter(review => review.rating === parseInt(ratingFilter));
    }

    // Sort by latest first
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setFilteredReviews(filtered);
  };

  const deleteReview = (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    
    const data = readData();
    data.reviews = data.reviews.filter(review => review.id !== reviewId);
    writeData(data);
    setReviews(data.reviews);
  };

  const startReply = (review) => {
    setSelectedReview(review);
    setReplyText(review.reply || "");
    setShowReplyModal(true);
  };

  const submitReply = () => {
    if (!replyText.trim() || !selectedReview) return;

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
  };

  const getRatingColor = (rating) => {
    const colors = {
      5: "bg-green-100 text-green-800",
      4: "bg-blue-100 text-blue-800", 
      3: "bg-yellow-100 text-yellow-800",
      2: "bg-orange-100 text-orange-800",
      1: "bg-red-100 text-red-800"
    };
    return colors[rating] || "bg-gray-100 text-gray-800";
  };

  const getTimeAgo = (dateString) => {
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

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating]++;
    });
    return distribution;
  };

  const ratingDistribution = getRatingDistribution();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
          <p className="text-gray-600">Manage and respond to customer feedback</p>
        </div>
      </div>

      {/* Rating Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-4xl font-bold text-gray-900 mb-2">{getAverageRating()}</div>
          <div className="flex justify-center mb-2">
            {[1, 2, 3, 4, 5].map(star => (
              <Star
                key={star}
                size={20}
                className={`${
                  star <= getAverageRating() 
                    ? "text-yellow-400 fill-yellow-400" 
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <p className="text-gray-600">{reviews.length} total reviews</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:col-span-2">
          <h3 className="font-medium text-gray-900 mb-4">Rating Distribution</h3>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(rating => (
              <div key={rating} className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 w-16">
                  <span className="text-sm text-gray-600">{rating}</span>
                  <Star size={14} className="text-yellow-400 fill-yellow-400" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full" 
                    style={{ 
                      width: `${reviews.length > 0 ? (ratingDistribution[rating] / reviews.length) * 100 : 0}%` 
                    }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {ratingDistribution[rating]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search reviews..."
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
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <div key={review.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="font-semibold text-blue-600">
                    {review.userName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{review.userName}</h3>
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
                            star <= review.rating 
                              ? "text-yellow-400 fill-yellow-400" 
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRatingColor(review.rating)}`}>
                      {review.rating}.0
                    </span>
                    <span className="text-sm text-gray-500">
                      {getTimeAgo(review.createdAt)}
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
                <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg transition-colors">
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-gray-700">{review.comment}</p>
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
                  <button className="flex items-center space-x-1 px-3 py-1 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                    <Flag size={14} />
                    <span>Report</span>
                  </button>
                </div>
                <button
                  onClick={() => deleteReview(review.id)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}

        {filteredReviews.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reviews Found</h3>
            <p className="text-gray-600">
              {searchTerm || ratingFilter !== "all"
                ? "No reviews match your current filters. Try adjusting your search criteria."
                : "No reviews have been submitted yet. Reviews will appear here when customers rate your service."
              }
            </p>
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {showReplyModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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
                          star <= selectedReview.rating 
                            ? "text-yellow-400 fill-yellow-400" 
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-medium">{selectedReview.userName}</span>
                </div>
                <p className="text-gray-700">{selectedReview.comment}</p>
              </div>

              {/* Reply Form */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Response
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your response to this review..."
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