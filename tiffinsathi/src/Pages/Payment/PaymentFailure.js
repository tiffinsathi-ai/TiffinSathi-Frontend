import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { XCircle, RefreshCw, Home, AlertTriangle, CreditCard } from 'lucide-react';
import homeBg from "../../assets/home.jpg";
import esewaLogo from "../../assets/esewa.png";
import khaltiLogo from "../../assets/khalti.png";


const PaymentFailure = () => {
  const [searchParams] = useSearchParams();
  const [retrying, setRetrying] = useState(false);
  
  const paymentId = searchParams.get('paymentId');
  const subscriptionId = searchParams.get('subscriptionId');
  const error = searchParams.get('error');
  const message = searchParams.get('message'); // raw error message (e.g. from EditCheckout)
  const from = searchParams.get('from'); // 'edit' when coming from subscription edit checkout

  const handleRetry = () => {
    setRetrying(true);
    // Redirect back to checkout with subscription data
    setTimeout(() => {
      window.history.back();
    }, 1000);
  };

  const commonErrors = {
    'insufficient_funds': 'Insufficient balance in your account.',
    'transaction_declined': 'Transaction was declined by your bank.',
    'network_error': 'Network error occurred. Please check your internet connection.',
    'timeout': 'Payment request timed out. Please try again.',
    'invalid_card': 'Invalid card details provided.',
    'user_cancelled': 'You cancelled the payment.',
    'payment_cancelled': 'Payment was cancelled. You can try again when you\'re ready.',
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
          <div className="absolute inset-0 bg-gradient-to-br from-red-400/30 via-yellow-400/20 to-red-500/30"></div>
          <div className="absolute inset-0 bg-black/20"></div>
          
          <div className="relative z-10 max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 shadow-lg">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
              Payment Failed ❌
            </h1>
            <p className="text-lg text-white drop-shadow-md">
              We couldn't process your payment. Please try again.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Error Card */}
          <div className="bg-white rounded-xl shadow-lg border border-red-200 overflow-hidden mb-6">
            <div className="bg-red-50 px-6 py-4 border-b border-red-200">
              <h2 className="text-xl font-semibold text-red-900 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Payment Error Details
              </h2>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                {/* Error Message */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-red-900">Payment Not Completed</h4>
                      <p className="text-sm text-red-700 mt-1">
                        {message
                          ? (() => { try { return decodeURIComponent(message); } catch { return message; } })()
                          : error && commonErrors[error]
                            ? commonErrors[error]
                            : 'An error occurred while processing your payment. Please try again or use a different payment method.'}
                      </p>
                      {paymentId && (
                        <p className="text-xs text-red-600 mt-2">
                          Payment ID: {paymentId}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Troubleshooting Tips */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Troubleshooting Tips</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div 
                      className="border border-blue-200 rounded-lg p-4"
                      style={{ backgroundColor: "#F8FAFC" }}
                    >
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Check Your Account
                      </h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Ensure sufficient balance</li>
                        <li>• Verify card details are correct</li>
                        <li>• Check daily transaction limits</li>
                      </ul>
                    </div>
                    <div 
                      className="border border-blue-200 rounded-lg p-4"
                      style={{ backgroundColor: "#F8FAFC" }}
                    >
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Try These Solutions
                      </h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Use a different payment method</li>
                        <li>• Try again after a few minutes</li>
                        <li>• Contact your bank if issues persist</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Alternative Payment Methods</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['eSewa', 'Khalti', 'Card', 'Cash on Delivery'].map((method) => (
                      <div 
                        key={method} 
                        className="text-center p-3 border border-gray-200 rounded-lg hover:border-yellow-300 hover:bg-yellow-50/50 transition-colors cursor-pointer"
                        onClick={() => {
                          // Update payment method and retry
                          localStorage.setItem('preferredPaymentMethod', method.toUpperCase().replace(' ', '_'));
                          handleRetry();
                        }}
                      >
                        <div className="h-12 w-12 rounded-lg flex items-center justify-center mx-auto mb-2 overflow-hidden"
                             style={{ backgroundColor: "#FFF9E6" }}>
                          {method === 'eSewa' ? (
                            <img src={esewaLogo} alt="eSewa" className="h-10 w-10 object-contain" />
                          ) : method === 'Khalti' ? (
                            <img src={khaltiLogo} alt="Khalti" className="h-10 w-10 object-contain" />
                          ) : (
                            <span className="text-gray-700 font-medium">{method.charAt(0)}</span>
                          )}
                        </div>
                        <span className="text-sm text-gray-600">{method}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-white font-medium transition-colors hover:opacity-90 disabled:opacity-50"
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
              <RefreshCw className={`h-5 w-5 mr-2 ${retrying ? 'animate-spin' : ''}`} />
              {retrying ? 'Retrying...' : 'Try Again'}
            </button>
            
            {from === 'edit' ? (
              <Link
                to="/user/subscriptions"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Home className="h-5 w-5 mr-2" />
                My Subscriptions
              </Link>
            ) : (
              <Link
                to="/user"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Home className="h-5 w-5 mr-2" />
                Back to Dashboard
              </Link>
            )}
            
          </div>

          {/* Support Section */}
          <div className="mt-8 text-center">
            <div 
              className="rounded-lg p-6 inline-block"
              style={{ backgroundColor: "#F8FAFC", borderColor: "#E2E8F0" }}
            >
              <h4 className="font-medium text-gray-900 mb-2">Need immediate assistance?</h4>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Call us: <span className="font-medium">+977-9800000000</span>
                </p>
                <p className="text-sm text-gray-600">
                  Email: <span className="font-medium">support@tiffinsathi.com</span>
                </p>
                <p className="text-xs text-gray-500 mt-4">
                  Available 24/7 for payment-related queries
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
};

export default PaymentFailure;