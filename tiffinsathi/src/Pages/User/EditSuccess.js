import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Phone, Mail, Home, Package, Clock, AlertCircle } from 'lucide-react';
import homeBg from "../../assets/home.jpg";

const EditSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { subscriptionId, editResponse, isRefund } = location.state || {};
  
  const [loading, setLoading] = useState(true);
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);

  useEffect(() => {
    if (!editResponse && !subscriptionId) {
      navigate('/user/subscriptions');
      return;
    }

    // If we have editResponse, use it
    if (editResponse) {
      setSubscriptionDetails({
        subscriptionId: editResponse.subscriptionId,
        status: editResponse.status,
        vendorPhone: editResponse.vendorPhone,
        vendorName: editResponse.vendorName,
        message: editResponse.message
      });
      setLoading(false);
      return;
    }

    // Otherwise fetch subscription details
    fetchSubscriptionDetails();
  }, [editResponse, subscriptionId, navigate]);

  const fetchSubscriptionDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/subscriptions/${subscriptionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSubscriptionDetails(data);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative min-h-[250px] flex items-center justify-center overflow-hidden py-12 px-6">
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
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 shadow-lg">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
            {isRefund ? 'Edit Successful! Refund Processing 🎉' : 'Edit Successful! 🎉'}
          </h1>
          <p className="text-lg text-white drop-shadow-md">
            Your subscription has been updated successfully
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Success Card */}
        <div className="bg-white rounded-xl shadow-lg border border-green-200 overflow-hidden mb-6">
          <div className="bg-green-50 px-6 py-4 border-b border-green-200">
            <h2 className="text-xl font-semibold text-green-900 flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Subscription Updated Successfully
            </h2>
          </div>
          
          <div className="p-6">
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Subscription ID</h3>
                    <p className="text-lg font-semibold text-gray-900">
                      {subscriptionDetails?.subscriptionId || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {subscriptionDetails?.status || 'ACTIVE'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {editResponse?.refundAmount > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Refund Amount</h3>
                      <p className="text-2xl font-bold text-green-600">
                        Rs. {editResponse.refundAmount.toFixed(2)}
                      </p>
                    </div>
                  )}
                  {editResponse?.additionalPayment > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Payment Made</h3>
                      <p className="text-2xl font-bold text-yellow-600">
                        Rs. {editResponse.additionalPayment.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Refund Information */}
              {isRefund && editResponse?.refundAmount > 0 && (
                <div className="border-t pt-6 mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 text-green-600" />
                    Refund Processing Details
                  </h3>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mt-1">
                          <Clock className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <p className="font-medium text-gray-900">Processing Timeline</p>
                          <p className="text-sm text-gray-600">Your refund of Rs. {editResponse.refundAmount.toFixed(2)} will be processed within 5-7 business days.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mt-1">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <p className="font-medium text-gray-900">Refund Method</p>
                          <p className="text-sm text-gray-600">The amount will be credited back to your original payment method.</p>
                        </div>
                      </div>
                      
                      {(subscriptionDetails?.vendorPhone || editResponse?.vendorPhone) && (
                        <div className="flex items-start">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mt-1">
                            <Phone className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <p className="font-medium text-gray-900">Need Help?</p>
                            <p className="text-sm text-gray-600">
                              Contact the vendor directly for any questions about your refund:
                            </p>
                            <div className="mt-2 space-y-1">
                              <p className="text-sm">
                                <span className="font-medium">Vendor:</span> {editResponse?.vendorName || subscriptionDetails?.vendorName}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Phone:</span> {editResponse?.vendorPhone || subscriptionDetails?.vendorPhone}
                              </p>
                              {subscriptionDetails?.vendorEmail && (
                                <p className="text-sm">
                                  <span className="font-medium">Email:</span> {subscriptionDetails.vendorEmail}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Next Steps */}
              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">What happens next?</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="font-medium text-gray-900">Subscription Updated</p>
                      <p className="text-sm text-gray-600">Your new schedule is now active and will apply to all future orders.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Package className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="font-medium text-gray-900">Future Orders</p>
                      <p className="text-sm text-gray-600">All upcoming deliveries will follow your new schedule.</p>
                    </div>
                  </div>
                  {isRefund && (
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <Clock className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="font-medium text-gray-900">Refund Status</p>
                        <p className="text-sm text-gray-600">You will receive an email confirmation once the refund is processed.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Message from backend if available */}
              {editResponse?.message && (
                <div className="border-t pt-6 mt-6">
                  <div className="p-4 bg-blue-50 rounded border border-blue-200">
                    <p className="text-sm text-blue-800">{editResponse.message}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/user/subscriptions"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-white font-medium transition-colors hover:opacity-90"
            style={{ backgroundColor: "#F5B800" }}
          >
            <Package className="h-5 w-5 mr-2" />
            View Subscriptions
          </Link>
          <Link
            to="/user/orders"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Clock className="h-5 w-5 mr-2" />
            View Orders
          </Link>
          <Link
            to="/packages"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Home className="h-5 w-5 mr-2" />
            Browse More
          </Link>
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-1 text-sm text-gray-500">
            <span>Need help?</span>
            <Link to="/contact" className="text-blue-600 hover:text-blue-700 ml-1">
              Contact Support
            </Link>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            A confirmation email has been sent to your registered email address.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EditSuccess;