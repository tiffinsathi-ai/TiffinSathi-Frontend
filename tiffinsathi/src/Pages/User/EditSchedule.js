import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Calendar, Plus, Minus, Save, X, Calculator, CreditCard, AlertCircle, RefreshCw } from "lucide-react";
import axios from "axios";
import { authStorage } from "../../helpers/api";
import { toast } from "react-toastify";

const EditSchedule = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { subscription } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const [mealSets, setMealSets] = useState([]);
  const [newSchedule, setNewSchedule] = useState([]);
  const [priceCalculation, setPriceCalculation] = useState(null);
  const [editReason, setEditReason] = useState("");
  const [showRefundInfo, setShowRefundInfo] = useState(false);

  const daysOfWeek = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

  useEffect(() => {
    if (!subscription) {
      navigate("/user/subscriptions");
      return;
    }
    fetchSubscriptionDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscription]);

  useEffect(() => {
    if (subscriptionDetails && subscriptionDetails.packageId) {
      fetchMealSets(subscriptionDetails.packageId);
    }
  }, [subscriptionDetails]);

  useEffect(() => {
    // Show refund info when there's a refund
    if (priceCalculation?.refundAmount && priceCalculation.refundAmount > 0) {
      setShowRefundInfo(true);
    } else {
      setShowRefundInfo(false);
    }
  }, [priceCalculation]);

  const fetchSubscriptionDetails = async () => {
    try {
      const token = authStorage.getToken();
      const response = await axios.get(
        `http://localhost:8080/api/subscriptions/${subscription.subscriptionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubscriptionDetails(response.data);
      initializeSchedule(response.data.schedule || []);
      
      // Fetch payment info to show current status
      await fetchPaymentInfo(subscription.subscriptionId, token);
      
    } catch (error) {
      console.error("Error fetching subscription details:", error);
      toast.error("Failed to load subscription details");
    }
  };

  const fetchPaymentInfo = async (subscriptionId, token) => {
    try {
      const paymentResponse = await axios.get(
        `http://localhost:8080/api/payments/subscription/${subscriptionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Payment info:", paymentResponse.data);
      // You can store payment info in state if needed
    } catch (error) {
      console.error("Error fetching payment info:", error);
    }
  };

  const fetchMealSets = async (packageId) => {
    try {
      const token = authStorage.getToken();
      const pkgResp = await axios.get(
        `http://localhost:8080/api/meal-packages/${packageId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const pkg = pkgResp.data || {};
      let sets = [];
      
      if (Array.isArray(pkg.packageSets) && pkg.packageSets.length) {
        sets = pkg.packageSets.map(ps => {
          const ms = ps.mealSet || ps.set || ps;
          return {
            setId: ms.setId || ms.id || ms.set_id,
            name: ms.name || ms.setName || ms.mealSetName,
            price: ms.price || ms.unitPrice || pkg.pricePerSet || 0,
            type: ms.type || (ms.mealSetType ? ms.mealSetType : "VEG"),
            raw: ms
          };
        });
      } else if (Array.isArray(pkg.mealSets) && pkg.mealSets.length) {
        sets = pkg.mealSets.map(ms => ({
          setId: ms.setId || ms.id,
          name: ms.name || ms.setName,
          price: ms.price || ms.unitPrice || pkg.pricePerSet || 0,
          type: ms.type || "VEG",
          raw: ms
        }));
      }

      if (sets.length > 0) {
        setMealSets(sets);
        return;
      }

      const fallback = await axios.get("http://localhost:8080/api/meal-sets", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allSets = (fallback.data || []).map(ms => ({
        setId: ms.setId || ms.id,
        name: ms.name || ms.setName,
        price: ms.price || ms.unitPrice || subscriptionDetails?.pricePerSet || 0,
        type: ms.type || "VEG",
        raw: ms
      }));
      setMealSets(allSets);

    } catch (error) {
      console.error("Error fetching meal sets (package or fallback):", error);
      setMealSets([]);
    }
  };

  const initializeSchedule = (schedule) => {
    const formatted = daysOfWeek.map(day => {
      const existing = (schedule || []).find(s => s.dayOfWeek === day);
      return {
        dayOfWeek: day,
        enabled: existing ? !!existing.enabled : (day !== "SATURDAY" && day !== "SUNDAY"),
        meals: existing && Array.isArray(existing.meals) ? existing.meals.map(m => ({
          setId: m.setId || m.mealSetId || m.set?.setId || m.mealSet?.setId || m.setId,
          quantity: m.quantity || 1,
          name: m.mealSetName || m.name || m.set?.name || m.mealSet?.name || "Meal",
          price: m.unitPrice || m.price || subscriptionDetails?.pricePerSet || 0
        })) : []
      };
    });
    setNewSchedule(formatted);
  };

  const toggleDay = (dayIndex) => {
    const updated = newSchedule.map((d,i) => i === dayIndex ? { ...d, enabled: !d.enabled, meals: !d.enabled ? d.meals : d.meals } : d);
    if (!updated[dayIndex].enabled) updated[dayIndex].meals = [];
    setNewSchedule(updated);
    setPriceCalculation(null);
  };

  const addMealToDay = (dayIndex) => {
    const updated = newSchedule.map((d,i) => {
      if (i !== dayIndex) return d;
      if (!d.enabled) { toast.error("Please enable the day first"); return d; }
      return { ...d, meals: [...(d.meals || []), { setId: "", quantity: 1, name: "", price: 0 }] };
    });
    setNewSchedule(updated);
    setPriceCalculation(null);
  };

  const removeMealFromDay = (dayIndex, mealIndex) => {
    const updated = newSchedule.map((d, i) => {
      if (i !== dayIndex) return d;
      const newMeals = (d.meals || []).filter((_, idx) => idx !== mealIndex);
      return { ...d, meals: newMeals };
    });
    setNewSchedule(updated);
    setPriceCalculation(null);
  };

  const updateMealSelection = (dayIndex, mealIndex, field, value) => {
    const updated = newSchedule.map((d, i) => {
      if (i !== dayIndex) return d;
      const meals = (d.meals||[]).map((m, idx) => {
        if (idx !== mealIndex) return m;
        const mealCopy = { ...m };
        if (field === "setId") {
          mealCopy.setId = value;
          const selected = mealSets.find(ms => (ms.setId === value) || (ms.raw && (ms.raw.setId === value || ms.raw.id === value)));
          if (selected) {
            mealCopy.name = selected.name || "Meal";
            mealCopy.price = selected.price || subscriptionDetails?.pricePerSet || 0;
          }
        } else if (field === "quantity") {
          const q = parseInt(value,10) || 1;
          mealCopy.quantity = Math.max(1, q);
        }
        return mealCopy;
      });
      return { ...d, meals };
    });
    setNewSchedule(updated);
    setPriceCalculation(null);
  };

  const schedulesEqual = (a, b) => {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    for (let i = 0; i < daysOfWeek.length; i++) {
      const da = a[i] || {}, db = b[i] || {};
      if (!!da.enabled !== !!db.enabled) return false;
      const ma = (da.meals || []).map(m => ({ setId: m.setId, quantity: Number(m.quantity) }));
      const mb = (db.meals || []).map(m => ({ setId: m.setId, quantity: Number(m.quantity) }));
      if (ma.length !== mb.length) return false;
      for (let j=0;j<ma.length;j++){
        if (ma[j].setId !== mb[j].setId || ma[j].quantity !== mb[j].quantity) return false;
      }
    }
    return true;
  };

  const calculatePriceDifference = async () => {
    if (!editReason.trim()) {
      toast.error("Please provide a reason for editing");
      return;
    }

    if (schedulesEqual(
      newSchedule,
      (subscriptionDetails && subscriptionDetails.schedule) || []
    )) {
      setPriceCalculation({ 
        additionalPayment: 0, 
        refundAmount: 0, 
        oldCost: 0,
        newCost: 0,
        message: "No changes detected.",
        editStatus: "PROCESSED"
      });
      toast.info("No changes detected compared to current schedule.");
      return;
    }

    const hasMeals = newSchedule.some(d => d.enabled && Array.isArray(d.meals) && d.meals.length > 0);
    if (!hasMeals) { 
      toast.error("Please select at least one meal for the enabled days."); 
      return; 
    }

    const invalid = newSchedule.some(d => d.enabled && d.meals.some(m => !m.setId));
    if (invalid) { 
      toast.error("Please select a meal set for all meals."); 
      return; 
    }

    try {
      setCalculating(true);
      const token = authStorage.getToken();
      const request = {
        subscriptionId: subscription.subscriptionId,
        newSchedule: newSchedule.map(day => ({
          dayOfWeek: day.dayOfWeek,
          enabled: !!day.enabled,
          meals: (day.meals || []).map(m => ({ setId: m.setId, quantity: m.quantity }))
        })),
        editReason
      };
      console.log("Edit calculate request:", request);

      const resp = await axios.post(
        "http://localhost:8080/api/subscriptions/edit/calculate",
        request,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );

      setPriceCalculation(resp.data);
      if (resp.data.additionalPayment > 0) {
        toast.info(`Additional payment required: Rs. ${resp.data.additionalPayment.toFixed(2)}`);
      } else if (resp.data.refundAmount > 0) {
        toast.info(`Refund available: Rs. ${resp.data.refundAmount.toFixed(2)}`);
      } else {
        toast.success("No price difference! You can apply changes immediately.");
      }
    } catch (err) {
      console.error("Error calculating price:", err);
      const msg = err.response?.data?.message || err.message || "Failed to calculate price";
      toast.error(msg);
    } finally {
      setCalculating(false);
    }
  };

  const applyChanges = async () => {
    if (!priceCalculation) { 
      toast.error("Please calculate price difference first"); 
      return; 
    }

    if (!editReason.trim()) {
      toast.error("Please provide a reason for editing");
      return;
    }

    try {
      setLoading(true);
      const token = authStorage.getToken();
      const request = {
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

      console.log("Applying edit with request:", request);

      // Always call apply endpoint first to create/edit the edit history
      const applyResponse = await axios.post(
        "http://localhost:8080/api/subscriptions/edit/apply", 
        request, 
        {
          headers: { 
            Authorization: `Bearer ${token}`, 
            "Content-Type": "application/json" 
          }
        }
      );

      console.log("Apply response:", applyResponse.data);

      // Check the response status
      const responseData = applyResponse.data;
      
      if (responseData.editStatus === "PENDING_PAYMENT") {
        // Navigate to checkout with payment required
        navigate("/subscription/edit/checkout", {
          state: {
            subscription: subscriptionDetails,
            newSchedule,
            priceCalculation: responseData,
            editReason,
            editHistoryId: responseData.editHistoryId || null,
            paymentId: responseData.paymentId || null
          }
        });
      } else if (responseData.editStatus === "COMPLETED" || responseData.editStatus === "PROCESSED" || responseData.editStatus === "REFUND_APPROVED") {
        // No payment required or refund case
        if (responseData.editStatus === "REFUND_APPROVED") {
          toast.success("Subscription updated successfully! Refund has been approved.");
          toast.info(
            <div>
              <p>A refund of Rs. {priceCalculation.refundAmount.toFixed(2)} has been approved.</p>
              <p className="mt-1">Refund will be processed within 5-7 business days to your original payment method.</p>
              {responseData.vendorPhone && (
                <p className="mt-1">For questions, contact vendor: {responseData.vendorName} - {responseData.vendorPhone}</p>
              )}
            </div>
          );
        } else {
          toast.success("Subscription updated successfully!");
          if (priceCalculation?.refundAmount > 0) {
            toast.info(
              <div>
                <p>Refund of Rs. {priceCalculation.refundAmount.toFixed(2)} will be processed.</p>
                <p className="mt-1">Please check your payment status for refund details.</p>
              </div>
            );
          }
        }
        
        // Refresh subscription details to get updated payment status
        await fetchSubscriptionDetails();
        
        // Navigate after a short delay
        setTimeout(() => {
          navigate("/user/subscriptions");
        }, 2000);
      } else {
        // Handle other statuses
        toast.info(responseData.message || "Edit processed successfully");
        navigate("/user/subscriptions");
      }
      
    } catch (err) {
      console.error("Error applying changes:", err);
      const msg = err.response?.data?.message || err.message || "Failed to apply changes";
      toast.error(msg);
      setLoading(false);
    }
  };

  const getRemainingDays = () => {
    if (!subscriptionDetails) return 0;
    const start = new Date(subscriptionDetails.startDate);
    const end = new Date(subscriptionDetails.endDate);
    const today = new Date();
    const effectiveStart = today > start ? today : start;
    const diff = end.getTime() - effectiveStart.getTime();
    return Math.max(0, Math.ceil(diff / (1000*3600*24)));
  };

  const getCurrentPaymentStatus = () => {
    if (!subscriptionDetails || !subscriptionDetails.payment) return "No payment info";
    return subscriptionDetails.payment.paymentStatus;
  };

  const handleViewPaymentHistory = () => {
    navigate(`/subscription/${subscription.subscriptionId}/payments`);
  };

  const resetChanges = () => {
    if (subscriptionDetails) {
      initializeSchedule(subscriptionDetails.schedule || []);
      setPriceCalculation(null);
      setEditReason("");
      toast.info("Changes reset to original schedule");
    }
  };

  if (!subscriptionDetails) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Subscription Schedule</h1>
              <p className="text-gray-600 mt-2">Modify your meal selections for the remaining {getRemainingDays()} days</p>
            </div>
            <button onClick={() => navigate("/user/subscriptions")} className="px-4 py-2 border rounded hover:bg-gray-50">
              Cancel
            </button>
          </div>

          <div className="mt-6 bg-white p-6 rounded shadow">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Package</p>
                <p className="font-semibold">{subscriptionDetails.packageName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Remaining Days</p>
                <p className="font-semibold">{getRemainingDays()} days</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Total</p>
                <p className="font-semibold text-green-600">Rs. {subscriptionDetails.totalAmount?.toFixed(2) || "0.00"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Status</p>
                <p className={`font-semibold ${
                  getCurrentPaymentStatus() === "REFUNDED" ? "text-green-600" : 
                  getCurrentPaymentStatus() === "COMPLETED" ? "text-blue-600" : 
                  getCurrentPaymentStatus() === "PENDING" ? "text-yellow-600" : 
                  "text-gray-600"
                }`}>
                  {getCurrentPaymentStatus()}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <button 
                onClick={handleViewPaymentHistory}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> View Payment History
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Reason for Edit</h3>
            <button 
              onClick={resetChanges}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Reset Changes
            </button>
          </div>
          <textarea 
            value={editReason} 
            onChange={e => setEditReason(e.target.value)} 
            rows={3}
            className="w-full mt-3 p-3 border rounded focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            placeholder="Why are you editing this subscription? (e.g., dietary change, schedule conflict)"
          />
        </div>

        {showRefundInfo && priceCalculation?.refundAmount > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-green-800">Refund Information</h4>
                <p className="text-sm text-green-700 mt-1">
                  Your changes qualify for a refund of <span className="font-bold">Rs. {priceCalculation.refundAmount.toFixed(2)}</span>.
                  If you apply these changes, a refund payment will be created with status "REFUNDED" and processed within 5-7 business days.
                </p>
                <div className="mt-2 text-xs text-green-600 space-y-1">
                  <p>• Refund will be credited to your original payment method</p>
                  <p>• Your subscription payment history will show the refund transaction</p>
                  <p>• You can check payment status anytime from your subscriptions</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">Weekly Schedule</h3>
            <p className="text-sm text-gray-600 mt-1">Update your meal selections for each day</p>
          </div>

          <div className="p-6">
            {daysOfWeek.map((day, dayIndex) => {
              const daySchedule = newSchedule[dayIndex] || { enabled: false, meals: [] };
              return (
                <div key={day} className="mb-6 border-b pb-6 last:border-0 last:mb-0">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        checked={daySchedule.enabled} 
                        onChange={() => toggleDay(dayIndex)} 
                        className="w-5 h-5 text-yellow-600 rounded focus:ring-yellow-500" 
                      />
                      <label className="ml-2 font-medium">{day.charAt(0) + day.slice(1).toLowerCase()}</label>
                    </div>
                    {daySchedule.enabled && (
                      <button 
                        onClick={() => addMealToDay(dayIndex)} 
                        className="flex items-center gap-1 text-yellow-600 hover:text-yellow-700"
                      >
                        <Plus className="w-4 h-4" /> Add Meal
                      </button>
                    )}
                  </div>

                  {daySchedule.enabled && (
                    <div className="ml-6 space-y-4">
                      {(daySchedule.meals || []).map((meal, mealIndex) => (
                        <div key={mealIndex} className="flex gap-4 items-start p-4 bg-gray-50 rounded">
                          <div className="flex-1">
                            <select 
                              value={meal.setId || ""} 
                              onChange={(e) => updateMealSelection(dayIndex, mealIndex, "setId", e.target.value)}
                              className="w-full p-2 border rounded focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                            >
                              <option value="">Select a meal set</option>
                              {mealSets.map(ms => (
                                <option key={ms.setId} value={ms.setId}>
                                  {ms.name} ({ms.type}) - Rs. {ms.price}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div style={{width: 140}}>
                            <div className="flex items-center border rounded">
                              <button 
                                onClick={() => updateMealSelection(dayIndex, mealIndex, "quantity", meal.quantity - 1)} 
                                disabled={meal.quantity <= 1} 
                                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                              >
                                -
                              </button>
                              <input 
                                type="number" 
                                min="1" 
                                value={meal.quantity} 
                                onChange={(e) => updateMealSelection(dayIndex, mealIndex, "quantity", e.target.value)} 
                                className="w-16 text-center p-1 border-x" 
                              />
                              <button 
                                onClick={() => updateMealSelection(dayIndex, mealIndex, "quantity", meal.quantity + 1)} 
                                className="px-3 py-1 bg-gray-100 hover:bg-gray-200"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <button 
                            onClick={() => removeMealFromDay(dayIndex, mealIndex)} 
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ))}

                      {(daySchedule.meals || []).length === 0 && (
                        <p className="text-sm text-gray-500 italic">
                          No meals selected for this day. Add at least one meal or disable the day.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {priceCalculation && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Price Breakdown</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded border">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Current Remaining Cost</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">Rs. {priceCalculation.oldCost?.toFixed(2) || "0.00"}</p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded border">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">New Remaining Cost</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">Rs. {priceCalculation.newCost?.toFixed(2) || "0.00"}</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-gray-800">Difference:</span>
                  <span className={`text-xl font-bold ${
                    priceCalculation.additionalPayment > 0 
                      ? 'text-yellow-600' 
                      : priceCalculation.refundAmount > 0 
                        ? 'text-green-600' 
                        : 'text-gray-600'
                  }`}>
                    {priceCalculation.additionalPayment > 0 ? (
                      <>+ Rs. {priceCalculation.additionalPayment.toFixed(2)}</>
                    ) : priceCalculation.refundAmount > 0 ? (
                      <>- Rs. {priceCalculation.refundAmount.toFixed(2)}</>
                    ) : (
                      'Rs. 0.00'
                    )}
                  </span>
                </div>
                
                <div className={`p-3 rounded border ${
                  priceCalculation.additionalPayment > 0 
                    ? 'bg-yellow-50 border-yellow-100' 
                    : priceCalculation.refundAmount > 0 
                      ? 'bg-green-50 border-green-100' 
                      : 'bg-blue-50 border-blue-100'
                }`}>
                  <div className="flex items-start gap-2">
                    <AlertCircle className={`w-5 h-5 ${
                      priceCalculation.additionalPayment > 0 
                        ? 'text-yellow-600' 
                        : priceCalculation.refundAmount > 0 
                          ? 'text-green-600' 
                          : 'text-blue-600'
                    } mt-0.5 flex-shrink-0`} />
                    <div>
                      <p className={`font-medium ${
                        priceCalculation.additionalPayment > 0 
                          ? 'text-yellow-700' 
                          : priceCalculation.refundAmount > 0 
                            ? 'text-green-700' 
                            : 'text-blue-700'
                      }`}>
                        {priceCalculation.additionalPayment > 0 ? (
                          `You need to pay an additional Rs. ${priceCalculation.additionalPayment.toFixed(2)} for the changes.`
                        ) : priceCalculation.refundAmount > 0 ? (
                          <div>
                            <p>You will receive a refund of Rs. {priceCalculation.refundAmount.toFixed(2)} for the changes.</p>
                            <p className="text-sm mt-1">A refund payment will be created with status "REFUNDED" and processed within 5-7 business days.</p>
                          </div>
                        ) : (
                          'No additional payment or refund required.'
                        )}
                      </p>
                      {priceCalculation.message && (
                        <p className="text-sm text-blue-600 mt-1">{priceCalculation.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-4">
          <button 
            onClick={() => navigate("/user/subscriptions")} 
            className="px-6 py-3 border rounded hover:bg-gray-50"
          >
            Cancel
          </button>

          <button 
            onClick={calculatePriceDifference} 
            disabled={calculating || !editReason.trim()}
            className="px-6 py-3 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {calculating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Calculating...
              </>
            ) : (
              <>
                <Calculator className="w-5 h-5" /> 
                Calculate Price Difference
              </>
            )}
          </button>

          {priceCalculation && (
            <button 
              onClick={applyChanges} 
              disabled={loading}
              className={`px-6 py-3 text-white rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                priceCalculation.additionalPayment > 0 
                  ? 'bg-yellow-500 hover:bg-yellow-600' 
                  : priceCalculation.refundAmount > 0 
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : priceCalculation.additionalPayment > 0 ? (
                <>
                  <CreditCard className="w-5 h-5" /> 
                  Proceed to Payment
                </>
              ) : priceCalculation.refundAmount > 0 ? (
                <>
                  <Save className="w-5 h-5" /> 
                  Apply Changes with Refund
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" /> 
                  Apply Changes
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditSchedule;