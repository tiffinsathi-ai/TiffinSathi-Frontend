import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CreditCard,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import userApi from "../../helpers/UserApi";

const EditCheckout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { subscriptionId, editResponse, packageData, paymentMethod } =
    location.state || {};

  const amountDue = editResponse?.additionalPaymentAmount || 0;
  const modificationId = editResponse?.modificationId;
  const paymentMethodFromState =
    paymentMethod || editResponse?.paymentMethod || "ESEWA";

  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [paymentUrl, setPaymentUrl] = useState("");
  const [paymentData, setPaymentData] = useState(null);

  // Redirect when state is missing (e.g. user opened checkout directly or apply failed)
  useEffect(() => {
    if (!subscriptionId) {
      console.warn(
        "EditCheckout: missing subscriptionId in state",
        location.state
      );
      navigate("/user/subscriptions");
    }
  }, [subscriptionId, navigate, location.state]);

  const handlePay = async () => {
    setProcessing(true);
    setError("");

    try {
      let paymentResponse;

      if (modificationId) {
        // Prefer modification-based payment if backend returned modificationId
        paymentResponse = await userApi.initiateModificationPayment(
          modificationId,
          paymentMethodFromState
        );
      } else if (subscriptionId && amountDue > 0) {
        // Fallback: initiate by subscription ID (e.g. POST /subscriptions/edit/:id/payment)
        paymentResponse = await userApi.initiateEditPaymentBySubscription(
          subscriptionId,
          amountDue,
          paymentMethodFromState
        );
      } else {
        throw new Error(
          "Missing subscription or amount. Please go back and try again."
        );
      }

      console.log("Payment response:", paymentResponse);

      if (paymentMethodFromState === "ESEWA") {
        // For eSewa, we need to submit a form
        setPaymentUrl(paymentResponse.paymentUrl);
        setPaymentData(paymentResponse.paymentData);

        // Create and submit form automatically
        setTimeout(() => {
          submitEsewaForm(
            paymentResponse.paymentData,
            paymentResponse.paymentUrl
          );
        }, 1000);
      } else if (paymentMethodFromState === "KHALTI") {
        // For Khalti, redirect to payment URL
        window.location.href = paymentResponse.paymentUrl;
      } else {
        throw new Error(
          `Unsupported payment method: ${paymentMethodFromState}`
        );
      }
    } catch (err) {
      console.error("EditCheckout payment error:", err);
      console.error("Response:", err?.response?.status, err?.response?.data);
      const data = err?.response?.data;
      const message =
        (typeof data === "string" ? data : null) ||
        data?.message ||
        data?.error ||
        err?.message ||
        "Failed to process payment";
      setError(message);
      toast.error(message);
      setProcessing(false);
    }
  };

  const submitEsewaForm = (data, url) => {
    // Create a form element
    const form = document.createElement("form");
    form.method = "POST";
    form.action = url;
    form.style.display = "none";

    // Add all form fields
    Object.keys(data).forEach((key) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = data[key];
      form.appendChild(input);
    });

    // Add form to body and submit
    document.body.appendChild(form);
    form.submit();
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ToastContainer />
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Payment Successful
              </h3>
              <p className="text-gray-600 mb-4">
                Your subscription has been updated successfully!
              </p>
              <button
                onClick={() => navigate("/user/subscriptions")}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Back to Subscriptions
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </button>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Complete Update Payment
          </h1>
          <p className="text-gray-600 mb-6">
            Confirm the payment required to apply your subscription changes.
          </p>

          {amountDue <= 0 && subscriptionId && (
            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-amber-800">No amount to pay</p>
                <p className="text-sm text-amber-700">
                  Payment amount was not received. Please go back to Edit
                  Schedule and click &quot;Proceed to Payment&quot; again. If it
                  still fails, check the browser console (F12) and backend logs
                  for errors.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subscription ID</span>
              <span className="font-medium text-gray-900">
                #{subscriptionId}
              </span>
            </div>
            {modificationId && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Modification ID</span>
                <span className="font-medium text-gray-900">
                  #{modificationId}
                </span>
              </div>
            )}
            {packageData?.packageName && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Package</span>
                <span className="font-medium text-gray-900">
                  {packageData.packageName}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm text-gray-600">
              <span>Payment Method</span>
              <span className="font-medium text-gray-900">
                {paymentMethodFromState}
              </span>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <span>Amount Due</span>
              <span className="text-green-600">Rs. {amountDue.toFixed(2)}</span>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              <AlertCircle className="h-5 w-5 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {paymentMethodFromState === "ESEWA" && paymentUrl && paymentData ? (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-800 text-sm mb-2">
                Redirecting to eSewa payment gateway...
              </p>
              <p className="text-yellow-700 text-sm">
                If you are not redirected automatically, click the button below.
              </p>
              <button
                onClick={() => submitEsewaForm(paymentData, paymentUrl)}
                className="mt-3 w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
              >
                <ExternalLink className="h-4 w-4" />
                Proceed to eSewa Payment
              </button>
            </div>
          ) : (
            <button
              onClick={handlePay}
              disabled={processing || amountDue <= 0}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5" />
                  Pay Rs. {amountDue.toFixed(2)} with {paymentMethodFromState}
                </>
              )}
            </button>
          )}

          <div className="mt-6 p-4 bg-gray-50 rounded border border-gray-200">
            <h4 className="text-sm font-medium text-gray-800 mb-2">
              Important Notes:
            </h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li className="flex items-start gap-2">
                <div className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></div>
                <span>
                  After payment, you will be redirected back to your
                  subscriptions
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></div>
                <span>
                  Your subscription will be updated immediately after successful
                  payment
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></div>
                <span>
                  You will receive an email confirmation of the changes
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCheckout;
