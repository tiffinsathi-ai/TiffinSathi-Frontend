import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import axios from 'axios';

const PaymentStatus = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('checking');
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    checkPaymentStatus();
  }, [paymentId]);

  const checkPaymentStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`http://localhost:8080/api/payments/${paymentId}/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPaymentDetails(response.data);
      setStatus(response.data.paymentStatus);
    } catch (error) {
      console.error('Error checking payment status:', error);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    navigate('/user/checkout');
  };

  const handleGoToSubscriptions = () => {
    navigate('/user/subscriptions');
  };

  const handleGoToPackages = () => {
    navigate('/user/packages');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking payment status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {status === 'SUCCESS' ? (
          <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
            <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
            <p className="text-gray-600 mb-6">
              Your payment of Rs. {paymentDetails?.amount} has been processed successfully.
            </p>
            
            {paymentDetails && (
              <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                <h3 className="font-semibold text-gray-900 mb-4">Payment Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-medium">{paymentDetails.transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium">{paymentDetails.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">Rs. {paymentDetails.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">
                      {new Date(paymentDetails.paymentDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleGoToSubscriptions}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700"
              >
                View My Subscriptions
              </button>
              <button
                onClick={handleGoToPackages}
                className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50"
              >
                Browse More Packages
              </button>
            </div>
          </div>
        ) : status === 'PENDING' ? (
          <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
            <Clock className="h-20 w-20 text-yellow-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Pending</h1>
            <p className="text-gray-600 mb-6">
              Your payment is being processed. This may take a few minutes.
            </p>
            <button
              onClick={checkPaymentStatus}
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Check Status Again
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
            <XCircle className="h-20 w-20 text-red-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Failed</h1>
            <p className="text-gray-600 mb-6">
              {paymentDetails?.failureReason || 'There was an issue processing your payment.'}
            </p>
            <div className="space-y-3">
              <button
                onClick={handleRetry}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
              <button
                onClick={handleGoToPackages}
                className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50"
              >
                Back to Packages
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentStatus;