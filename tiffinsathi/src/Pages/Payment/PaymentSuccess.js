import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Home, Package, Receipt, Calendar, MapPin, Clock, Truck } from 'lucide-react';
import homeBg from "../../assets/home.jpg";


const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);

  const paymentId = searchParams.get('paymentId');
  const subscriptionId = searchParams.get('subscriptionId');

  useEffect(() => {
    if (paymentId || subscriptionId) {
      fetchPaymentDetails();
    }
  }, [paymentId, subscriptionId]);

  const fetchPaymentDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      let paymentData = null;
      let subscriptionData = null;

      // Try to fetch payment details
      if (paymentId) {
        const paymentResponse = await fetch(`http://localhost:8080/api/payments/${paymentId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (paymentResponse.ok) {
          paymentData = await paymentResponse.json();
        }
      }

      // Try to fetch subscription details
      if (subscriptionId) {
        const subscriptionResponse = await fetch(`http://localhost:8080/api/subscriptions/${subscriptionId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (subscriptionResponse.ok) {
          subscriptionData = await subscriptionResponse.json();
        }
      }

      setPaymentDetails(paymentData);
      setSubscriptionDetails(subscriptionData);
    } catch (error) {
      console.error('Error fetching details:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1 w-full">
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
              Payment Successful! 🎉
            </h1>
            <p className="text-lg text-white drop-shadow-md">
              Your subscription has been confirmed and activated
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Success Card */}
          <div className="bg-white rounded-xl shadow-lg border border-green-200 overflow-hidden mb-6">
            <div className="bg-green-50 px-6 py-4 border-b border-green-200">
              <h2 className="text-xl font-semibold text-green-900 flex items-center">
                <Receipt className="h-5 w-5 mr-2" />
                Payment Confirmation
              </h2>
            </div>
            
            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading details...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Payment Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Payment Method</h3>
                        <p className="text-lg font-semibold text-gray-900">
                          {paymentDetails?.paymentMethod || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Payment Status</h3>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {paymentDetails?.paymentStatus || 'SUCCESS'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Amount Paid</h3>
                        <p className="text-2xl font-bold text-green-600">
                          Rs. {paymentDetails?.amount?.toFixed(2) || subscriptionDetails?.totalAmount?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      {paymentDetails?.transactionId && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Transaction ID</h3>
                          <p className="text-sm font-mono text-gray-900">
                            {paymentDetails.transactionId}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Subscription Information */}
                  {(subscriptionDetails || paymentDetails?.subscription) && (
                    <div className="border-t pt-6 mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Package className="h-5 w-5 mr-2" />
                        Subscription Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Subscription ID</h4>
                          <p className="font-medium text-gray-900">
                            {subscriptionDetails?.subscriptionId || paymentDetails?.subscription?.subscriptionId}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Status</h4>
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {subscriptionDetails?.status || 'ACTIVE'}
                          </span>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Start Date</h4>
                          <p className="font-medium text-gray-900">
                            {new Date(subscriptionDetails?.startDate || new Date()).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Duration</h4>
                          <p className="font-medium text-gray-900">
                            {subscriptionDetails?.durationDays || 30} days
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Delivery Timeline */}
                  <div className="border-t pt-6 mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">What happens next?</h3>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <p className="font-medium text-gray-900">Payment Confirmed</p>
                          <p className="text-sm text-gray-600">Your payment has been verified and processed successfully.</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <Package className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <p className="font-medium text-gray-900">Subscription Activated</p>
                          <p className="text-sm text-gray-600">Your meal subscription is now active and ready for delivery.</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <Truck className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="ml-4">
                          <p className="font-medium text-gray-900">First Delivery</p>
                          <p className="text-sm text-gray-600">Your first meal will be delivered as per your schedule.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/user/subscriptions"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-white font-medium transition-colors hover:opacity-90"
              style={{ backgroundColor: "#F5B800" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#e0a500";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#F5B800";
              }}
            >
              <Package className="h-5 w-5 mr-2" />
              View Subscriptions
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
      </main>
    </div>
  );
};

export default PaymentSuccess;