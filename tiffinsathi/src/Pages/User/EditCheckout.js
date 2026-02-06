import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CreditCard, AlertCircle, CheckCircle, ArrowLeft, Shield, Clock, Phone, Mail } from "lucide-react";
import axios from "axios";
import authStorage from "../../helpers/authStorage";
import { toast } from "react-toastify";

const EditCheckout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { subscription, newSchedule, priceCalculation, editReason } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState("ESEWA");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!subscription || !priceCalculation) {
    navigate("/user/subscriptions");
    return null;
  }

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

      console.log("Creating edit history before payment:", applyRequest);

      // Create/edit history first
      const applyResponse = await axios.post(
        "http://localhost:8080/api/subscriptions/edit/apply",
        applyRequest,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );

      const applyData = applyResponse.data;
      console.log("Edit history created:", applyData);

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
        if (priceCalculation?.refundAmount > 0) {
          toast.success(
            <div>
              <p>Subscription updated successfully!</p>
              <p>A refund of Rs. {priceCalculation.refundAmount.toFixed(2)} has been approved and will be processed.</p>
              {responseData.vendorPhone && (
                <p>For questions, contact vendor: {responseData.vendorName} - {responseData.vendorPhone}</p>
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <button 
            onClick={() => navigate("/subscription/edit", { state: { subscription } })} 
            className="flex items-center gap-2 text-gray-600 mb-4 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5" /> Back to Edit
          </button>

          <h1 className="text-3xl font-bold text-gray-900">
            {isRefundCase ? "Complete Subscription Edit - Refund Available" : "Complete Subscription Edit"}
          </h1>
          <p className="text-gray-600 mt-2">
            {isRefundCase 
              ? "Review changes and confirm to receive your refund"
              : "Review changes and complete payment for schedule update"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold">Edit Summary</h3>
              <div className="mt-3 space-y-2">
                <div className="flex justify-between"><span>Subscription ID:</span><span className="font-medium">{subscription.subscriptionId}</span></div>
                <div className="flex justify-between"><span>Package:</span><span className="font-medium">{subscription.packageName}</span></div>
                <div className="flex justify-between"><span>Remaining Days:</span><span className="font-medium">{getRemainingDays()} days</span></div>
                <div className="flex justify-between"><span>Edit Reason:</span><span className="font-medium text-blue-600">{editReason}</span></div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold">Price Summary</h3>
              <div className="mt-3 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-500">Current Remaining Value</p>
                    <p className="text-lg font-semibold">Rs. {priceCalculation?.oldCost?.toFixed(2) || "0.00"}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-500">New Remaining Value</p>
                    <p className="text-lg font-semibold">Rs. {priceCalculation?.newCost?.toFixed(2) || "0.00"}</p>
                  </div>
                </div>

                {priceCalculation?.additionalPayment > 0 && (
                  <>
                    <div className="flex justify-between py-2 border-t pt-4">
                      <span>Additional Payment Required:</span>
                      <span className="font-bold text-yellow-600">Rs. {priceCalculation.additionalPayment.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-2 text-lg font-bold border-t pt-4">
                      <span>Total to Pay:</span>
                      <span className="text-yellow-600">Rs. {priceCalculation.additionalPayment.toFixed(2)}</span>
                    </div>
                  </>
                )}

                {isRefundCase && (
                  <div className="p-4 bg-green-50 rounded border">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-semibold text-green-700">Refund Available</p>
                        <p className="text-sm text-green-600">
                          You will receive a refund of <span className="font-bold">Rs. {priceCalculation.refundAmount.toFixed(2)}</span> because your new schedule costs less.
                        </p>
                        <div className="mt-2 p-3 bg-green-100 rounded">
                          <p className="text-sm font-medium text-green-800">Refund Details:</p>
                          <ul className="text-xs text-green-700 mt-1 space-y-1">
                            <li>• Refund will be processed within 5-7 business days</li>
                            <li>• Amount will be credited to your original payment method</li>
                            <li>• For questions, contact the vendor directly</li>
                            {subscription.vendorPhone && (
                              <li className="flex items-center gap-1">
                                <Phone className="w-3 h-3" /> Vendor: {subscription.vendorName} - {subscription.vendorPhone}
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {priceCalculation?.additionalPayment <= 0 && priceCalculation?.refundAmount <= 0 && (
                  <div className="p-4 bg-blue-50 rounded border">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-semibold text-blue-700">No Price Change</p>
                        <p className="text-sm text-blue-600">Your changes don't require any additional payment or refund.</p>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {priceCalculation?.additionalPayment > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold">Select Payment Method</h3>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  {["ESEWA", "KHALTI"].map(m => (
                    <label 
                      key={m} 
                      className={`flex items-center gap-3 p-3 border rounded cursor-pointer ${paymentMethod===m ? "border-yellow-500 bg-yellow-50" : "border-gray-200 hover:border-gray-300"}`}
                    >
                      <input 
                        type="radio" 
                        name="pm" 
                        value={m} 
                        checked={paymentMethod===m} 
                        onChange={(e)=>setPaymentMethod(e.target.value)} 
                        className="w-4 h-4"
                      />
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        <span>{m}</span>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded border">
                  <div className="flex items-start gap-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-700">Secure Payment</p>
                      <p className="text-sm text-blue-600">Your payment is processed securely. We never store your payment details.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
              <h3 className="text-lg font-semibold">
                {isRefundCase ? "Confirm Edit & Refund" : "Complete Edit"}
              </h3>

              <div className="mt-4 space-y-4">
                {isRefundCase ? (
                  <>
                    <div className="p-4 bg-green-50 rounded border">
                      <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-green-600"/>
                        <div>
                          <p className="font-semibold">Immediate Update</p>
                          <p className="text-sm">Subscription will be updated immediately after confirmation.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded border">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-green-600" />
                        <div>
                          <p className="font-semibold">Refund Timeline</p>
                          <p className="text-sm">Refund will be processed within 5-7 business days to your original payment method.</p>
                        </div>
                      </div>
                    </div>
                    
                    {subscription.vendorPhone && (
                      <div className="p-4 bg-blue-50 rounded border">
                        <div className="flex items-start gap-2">
                          <Phone className="w-4 h-4 text-blue-600"/>
                          <div>
                            <p className="font-semibold">Vendor Contact</p>
                            <p className="text-sm">For refund questions: {subscription.vendorName} - {subscription.vendorPhone}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="p-4 bg-yellow-50 rounded border">
                      <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-yellow-600"/>
                        <div>
                          <p className="font-semibold">Immediate Update</p>
                          <p className="text-sm">Subscription will be updated after successful payment.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded border">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600"/>
                        <div>
                          <p className="font-semibold">Peace of Mind</p>
                          <p className="text-sm">Changes only apply to future orders.</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="my-4 p-4 bg-gray-50 rounded">
                <div className="space-y-2">
                  {priceCalculation?.additionalPayment > 0 && (
                    <div className="flex justify-between">
                      <span>Payment Amount:</span>
                      <span className="font-semibold">Rs. {priceCalculation.additionalPayment.toFixed(2)}</span>
                    </div>
                  )}
                  {priceCalculation?.additionalPayment > 0 && (
                    <div className="flex justify-between">
                      <span>Payment Method:</span>
                      <span className="font-semibold">{paymentMethod}</span>
                    </div>
                  )}
                  {priceCalculation?.refundAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Refund Amount:</span>
                      <span className="font-semibold">Rs. {priceCalculation.refundAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
                
                <div className="pt-2 border-t mt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Net Amount:</span>
                    <span className={priceCalculation?.additionalPayment > 0 ? "text-yellow-600" : "text-green-600"}>
                      {priceCalculation?.additionalPayment > 0 
                        ? `Rs. ${priceCalculation.additionalPayment.toFixed(2)} to pay`
                        : priceCalculation?.refundAmount > 0
                          ? `Rs. ${priceCalculation.refundAmount.toFixed(2)} refund`
                          : "No payment required"}
                    </span>
                  </div>
                </div>
              </div>

              {priceCalculation?.additionalPayment > 0 ? (
                <button 
                  onClick={handlePayment} 
                  disabled={processingPayment || loading}
                  className="w-full py-3 rounded text-white font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed" 
                  style={{ backgroundColor: "#F5B800" }}
                >
                  {processingPayment || loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                      {processingPayment ? "Processing Payment..." : "Processing..."}
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2 inline-block" /> 
                      Pay Rs. {priceCalculation.additionalPayment.toFixed(2)} with {paymentMethod}
                    </>
                  )}
                </button>
              ) : (
                <button 
                  onClick={handleNoPaymentEdit} 
                  disabled={loading}
                  className="w-full py-3 rounded text-white font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed" 
                  style={{ backgroundColor: isRefundCase ? "#10B981" : "#3B82F6" }}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                      Applying Changes...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2 inline-block" /> 
                      {isRefundCase 
                        ? `Confirm Edit & Receive Rs. ${priceCalculation.refundAmount.toFixed(2)} Refund`
                        : "Apply Changes Now"}
                    </>
                  )}
                </button>
              )}

              <div className="text-xs text-gray-500 text-center mt-4">
                {isRefundCase ? (
                  <p>By confirming, you agree to update your subscription. The refund will be processed to your original payment method within 5-7 business days.</p>
                ) : (
                  <p>By completing this payment, you agree to update your subscription with the new schedule.</p>
                )}
                <p className="mt-1">You will receive a confirmation email once the update is complete.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCheckout;