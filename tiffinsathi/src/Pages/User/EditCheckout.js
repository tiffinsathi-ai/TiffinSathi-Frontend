import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CreditCard, AlertCircle, CheckCircle, ArrowLeft, Shield, Phone } from "lucide-react";
import axios from "axios";
import { authStorage } from "../../helpers/api";
import { toast } from "react-toastify";

// Safe display helpers — avoid NaN, undefined, null
const formatAmount = (val) => {
  const n = Number(val);
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
};
const safeStr = (val, fallback = "—") =>
  val != null && String(val).trim() !== "" ? String(val).trim() : fallback;

const EditCheckout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { subscription, newSchedule, priceCalculation: rawPrice, editReason } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState("ESEWA");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!subscription || !rawPrice) {
    navigate("/user/subscriptions");
    return null;
  }

  // Normalize price — support different backend keys and ensure numbers (API may return strings)
  const priceCalculation = {
    ...rawPrice,
    oldCost: Number(rawPrice.oldCost ?? rawPrice.oldRemainingCost) || 0,
    newCost: Number(rawPrice.newCost ?? rawPrice.newRemainingCost) || 0,
    additionalPayment: Number(rawPrice.additionalPayment) || 0,
    refundAmount: Number(rawPrice.refundAmount) || 0,
  };

  const handlePayment = async () => {
    try {
      setProcessingPayment(true);
      const token = authStorage.getToken();

      // First, ensure we have a valid edit history by calling apply again
      const applyRequest = {
        subscriptionId: subscription.subscriptionId,
        newSchedule: newSchedule.map(day => ({
          dayOfWeek: day.dayOfWeek,
          enabled: !!day.enabled,
          meals: (day.meals || []).map(m => ({ setId: m.setId, quantity: m.quantity }))
        })),
        editReason,
        additionalPayment: priceCalculation.additionalPayment || 0,
        refundAmount: priceCalculation?.refundAmount || 0
      };

      // Create/edit history first
      const applyResponse = await axios.post(
        "http://localhost:8080/api/subscriptions/edit/apply",
        applyRequest,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );

      const applyData = applyResponse.data;

      if (applyData.paymentResponse) {
        // If apply endpoint returns payment response directly, use it
        const paymentData = applyData.paymentResponse;
        
        // Handle gateway redirect
        if (paymentMethod === "ESEWA") {
          handleEsewaPayment(paymentData);
        } else if (paymentMethod === "KHALTI") {
          if (paymentData.paymentUrl) {
            window.location.href = paymentData.paymentUrl;
          } else {
            toast.error("Payment URL missing for Khalti");
            setProcessingPayment(false);
          }
        }
        return;
      }

      // Fallback: Use the edit payment endpoint if direct response not available
      const editPaymentResponse = await axios.post(
        `http://localhost:8080/api/subscriptions/edit/${subscription.subscriptionId}/payment`,
        {
          paymentMethod: paymentMethod,
          amount: priceCalculation.additionalPayment,
          editReason: editReason
        },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );

      const paymentData = editPaymentResponse.data;
      
      // Handle gateway redirect
      if (paymentMethod === "ESEWA") {
        handleEsewaPayment(paymentData);
      } else if (paymentMethod === "KHALTI") {
        if (paymentData.paymentUrl) {
          window.location.href = paymentData.paymentUrl;
        } else {
          toast.error("Payment URL missing for Khalti");
          setProcessingPayment(false);
        }
      }

    } catch (error) {
      console.error("Error processing payment:", error);
      const msg = error.response?.data?.message || error.message || "Failed to process payment";
      toast.error(msg);
      setProcessingPayment(false);
    }
  };

  const handleEsewaPayment = (paymentData) => {
    if (paymentData.paymentUrl && paymentData.paymentData) {
      const form = document.createElement("form");
      form.method = "POST";
      form.action = paymentData.paymentUrl;

      Object.entries(paymentData.paymentData).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } else if (paymentData.paymentUrl) {
      window.location.href = paymentData.paymentUrl;
    } else {
      toast.error("Payment data missing. Please try again.");
      setProcessingPayment(false);
    }
  };

  const getRemainingDays = () => {
    const startDate = new Date(subscription.startDate);
    const endDate = new Date(subscription.endDate);
    const today = new Date();
    const effectiveStartDate = today > startDate ? today : startDate;
    const timeDiff = endDate.getTime() - effectiveStartDate.getTime();
    return Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
  };

  const handleNoPaymentEdit = async () => {
    try {
      setLoading(true);
      const token = authStorage.getToken();
      
      // Apply edit without payment
      const response = await axios.post(
        "http://localhost:8080/api/subscriptions/edit/apply",
        {
          subscriptionId: subscription.subscriptionId,
          newSchedule: newSchedule.map(day => ({
            dayOfWeek: day.dayOfWeek,
            enabled: !!day.enabled,
            meals: (day.meals || []).map(meal => ({ setId: meal.setId, quantity: meal.quantity }))
          })),
          editReason: editReason,
          additionalPayment: 0,
          refundAmount: priceCalculation?.refundAmount || 0
        },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );

      const responseData = response.data;
      
      if (responseData.editStatus === "COMPLETED" || responseData.editStatus === "REFUND_APPROVED") {
        if (priceCalculation.refundAmount > 0) {
          toast.success(
            <div>
              <p>Subscription updated successfully!</p>
              <p>A refund of Rs. {formatAmount(priceCalculation.refundAmount)} has been approved and will be processed.</p>
              {responseData.vendorPhone && (
                <p>For questions, contact vendor: {responseData.vendorName} — {responseData.vendorPhone}</p>
              )}
            </div>
          );
        } else {
          toast.success("Subscription updated successfully!");
        }
        
        // Navigate to a success page with the response data
        navigate("/payment/success", { 
          state: { 
            subscriptionId: subscription.subscriptionId,
            editResponse: responseData,
            isRefund: priceCalculation?.refundAmount > 0,
            refundAmount: priceCalculation?.refundAmount || 0
          } 
        });
      } else {
        toast.info(responseData.message || "Edit processed successfully");
        navigate("/user/subscriptions");
      }
      
    } catch (error) {
      console.error("Error applying edit:", error);
      const msg = error.response?.data?.message || error.message || "Failed to apply changes";
      toast.error(msg);
      setLoading(false);
    }
  };

  // Check if this is a refund case
  const isRefundCase = priceCalculation?.refundAmount > 0 && priceCalculation?.additionalPayment <= 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {isRefundCase ? "Complete edit (refund available)" : "Complete subscription edit"}
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              {isRefundCase ? "Review and confirm to receive your refund." : "Review and complete payment."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/subscription/edit", { state: { subscription } })}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-gray-900 hover:opacity-90 transition-opacity shrink-0"
            style={{ backgroundColor: "#F5B800" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to edit
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Summary</h3>
              <dl className="space-y-2">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <dt className="text-gray-600 text-sm">Subscription ID</dt>
                  <dd className="font-medium text-gray-900">{safeStr(subscription.subscriptionId)}</dd>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <dt className="text-gray-600 text-sm">Package</dt>
                  <dd className="font-medium text-gray-900">{safeStr(subscription.packageName)}</dd>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <dt className="text-gray-600 text-sm">Remaining days</dt>
                  <dd className="font-medium text-gray-900">{getRemainingDays()} days</dd>
                </div>
                {safeStr(editReason) !== "—" && (
                  <div className="flex justify-between items-start py-2">
                    <dt className="text-gray-600 text-sm">Edit reason</dt>
                    <dd className="font-medium text-blue-600 text-right max-w-[60%]">{editReason}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Summary</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Current remaining</p>
                    <p className="text-lg font-bold text-gray-900">Rs. {formatAmount(priceCalculation.oldCost)}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">New remaining</p>
                    <p className="text-lg font-bold text-gray-900">Rs. {formatAmount(priceCalculation.newCost)}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-2">
                  {priceCalculation.additionalPayment > 0 && (
                    <>
                      <div className="flex justify-between text-gray-700">
                        <span>Additional payment</span>
                        <span className="font-semibold" style={{ color: "#F5B800" }}>Rs. {formatAmount(priceCalculation.additionalPayment)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold pt-2">
                        <span>Total to pay</span>
                        <span style={{ color: "#F5B800" }}>Rs. {formatAmount(priceCalculation.additionalPayment)}</span>
                      </div>
                    </>
                  )}

                  {isRefundCase && (
                    <div className="p-3 bg-green-50 rounded border border-green-200">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-green-800">Refund: Rs. {formatAmount(priceCalculation.refundAmount)}</p>
                          <p className="text-xs text-green-700 mt-1">Processed in 5–7 days to your original payment method.</p>
                          {(subscription.vendorName || subscription.vendorPhone) && (
                            <p className="text-xs text-green-700 mt-1 flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {safeStr(subscription.vendorName)} {subscription.vendorPhone ? `— ${subscription.vendorPhone}` : ""}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {priceCalculation.additionalPayment <= 0 && priceCalculation.refundAmount <= 0 && (
                    <div className="p-3 bg-blue-50 rounded border border-blue-200 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <p className="text-sm text-blue-800">No additional payment or refund.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {priceCalculation.additionalPayment > 0 && (
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment method</h3>
                <div className="grid grid-cols-2 gap-3">
                  {["ESEWA", "KHALTI"].map((m) => (
                    <label
                      key={m}
                      className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                        paymentMethod === m ? "border-yellow-500 bg-yellow-50" : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="pm"
                        value={m}
                        checked={paymentMethod === m}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 accent-yellow-500"
                      />
                      <CreditCard className="w-4 h-4 text-gray-600" />
                      <span className="font-medium">{m}</span>
                    </label>
                  ))}
                </div>
                <p className="mt-3 text-sm text-gray-500 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  Secure payment. We do not store your card details.
                </p>
              </div>
            )}

          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {isRefundCase ? "Confirm edit & refund" : "Complete edit"}
              </h3>

              <div className="mb-5 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="space-y-2 text-sm">
                  {priceCalculation.additionalPayment > 0 && (
                    <>
                      <div className="flex justify-between text-gray-700">
                        <span>Payment amount</span>
                        <span className="font-semibold">Rs. {formatAmount(priceCalculation.additionalPayment)}</span>
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span>Payment method</span>
                        <span className="font-semibold">{paymentMethod}</span>
                      </div>
                    </>
                  )}
                  {priceCalculation.refundAmount > 0 && (
                    <div className="flex justify-between text-green-700">
                      <span>Refund amount</span>
                      <span className="font-semibold">Rs. {formatAmount(priceCalculation.refundAmount)}</span>
                    </div>
                  )}
                </div>
                <div className="pt-3 mt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Net amount</span>
                    <span
                      className={`text-base font-bold ${
                        priceCalculation.additionalPayment > 0 ? "text-amber-600" : priceCalculation.refundAmount > 0 ? "text-green-600" : "text-gray-700"
                      }`}
                    >
                      {priceCalculation.additionalPayment > 0
                        ? `Rs. ${formatAmount(priceCalculation.additionalPayment)} to pay`
                        : priceCalculation.refundAmount > 0
                          ? `Rs. ${formatAmount(priceCalculation.refundAmount)} refund`
                          : "No payment required"}
                    </span>
                  </div>
                </div>
              </div>

              {priceCalculation.additionalPayment > 0 ? (
                <button
                  type="button"
                  onClick={handlePayment}
                  disabled={processingPayment || loading}
                  className="w-full py-3 rounded-lg text-white font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2 shadow-sm text-center"
                  style={{ backgroundColor: "#F5B800" }}
                >
                  {processingPayment || loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Processing…
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 flex-shrink-0 ml-2" />
                      <span>Pay Rs. {formatAmount(priceCalculation.additionalPayment)} with {paymentMethod}</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleNoPaymentEdit}
                  disabled={loading}
                  className="w-full py-3.5 rounded-lg text-white font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
                  style={{ backgroundColor: isRefundCase ? "#10B981" : "#3B82F6" }}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Applying changes…
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      {isRefundCase
                        ? `Confirm & receive Rs. ${formatAmount(priceCalculation.refundAmount)} refund`
                        : "Apply changes now"}
                    </>
                  )}
                </button>
              )}

              <p className="text-xs text-gray-500 text-center mt-3">
                You will receive a confirmation after the update.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCheckout;