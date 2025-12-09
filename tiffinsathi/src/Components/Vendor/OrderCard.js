// src/Components/Vendor/OrderCard.js
import React from "react";
import { Package, User, Phone, Clock, MapPin, ChevronDown, ChevronUp, Truck, CheckCircle } from "lucide-react";

const OrderCard = ({ order, deliveryPartners, onUpdateStatus, onAssignDelivery, selectedDeliveryPartner, showActions = true }) => {
  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      confirmed: "bg-blue-100 text-blue-800 border-blue-200",
      preparing: "bg-orange-100 text-orange-800 border-orange-200",
      ready_for_delivery: "bg-purple-100 text-purple-800 border-purple-200",
      assigned: "bg-indigo-100 text-indigo-800 border-indigo-200",
      out_for_delivery: "bg-purple-100 text-purple-800 border-purple-200",
      delivered: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
      completed: "bg-emerald-100 text-emerald-800 border-emerald-200"
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-lg text-gray-900">
            Order #{order.id}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Customer: {order.userName || "N/A"} • 
            Phone: {order.phone || "N/A"}
          </p>
          <p className="text-sm text-gray-500">
            Delivery: {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : "N/A"} at {order.deliveryTime || "N/A"}
          </p>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
            order.status
          )}`}
        >
          {order.status.replace(/_/g, ' ')}
        </span>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Meals</h4>
        <div className="space-y-2">
          {order.items?.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span>
                {item.name} ({item.type || "Regular"})
              </span>
              <span className="font-medium">Qty: {item.quantity || item.qty || 1}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600">
          <strong>Address:</strong> {order.address}
        </p>
      </div>

      {order.specialInstructions && (
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded mb-4">
          <p className="text-sm text-yellow-800">
            <strong>Instructions:</strong> {order.specialInstructions}
          </p>
        </div>
      )}

      {showActions && (
        <div className="flex gap-2 flex-wrap">
          {order.status === "pending" && (
            <button
              onClick={() => onUpdateStatus(order.id, "confirmed")}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Confirm Order
            </button>
          )}

          {order.status === "confirmed" && (
            <button
              onClick={() => onUpdateStatus(order.id, "preparing")}
              className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-700"
            >
              Start Preparing
            </button>
          )}

          {order.status === "preparing" && (
            <button
              onClick={() => onUpdateStatus(order.id, "ready_for_delivery")}
              className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700"
            >
              Mark Ready
            </button>
          )}

          {order.status === "ready_for_delivery" && deliveryPartners && (
            <div className="flex gap-2 items-center w-full">
              <select
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-grow"
                onChange={(e) => onAssignDelivery(order.id, e.target.value)}
                defaultValue=""
              >
                <option value="" disabled>Select Delivery Partner</option>
                {deliveryPartners
                  .filter(partner => partner.isActive || partner.status === "available")
                  .map(partner => (
                    <option key={partner.id} value={partner.id}>
                      {partner.name} {partner.phone ? `(${partner.phone})` : ''}
                    </option>
                  ))
                }
              </select>
            </div>
          )}

          {(order.status === "assigned" || order.status === "out_for_delivery") && (
            <div className="flex items-center gap-2 text-sm text-gray-600 w-full">
              <Truck className="h-4 w-4" />
              <span>
                Assigned to: {
                  selectedDeliveryPartner?.name || 
                  deliveryPartners?.find(p => p.id === order.deliveryPartnerId)?.name || 
                  `Delivery Partner`
                }
              </span>
              {order.deliveryPartnerId && (
                <CheckCircle className="h-4 w-4 text-green-600 ml-2" />
              )}
            </div>
          )}

          {(order.status === "delivered" || order.status === "completed") && (
            <div className="flex items-center gap-2 text-sm text-gray-600 w-full">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-green-600 font-medium">Order Delivered Successfully</span>
            </div>
          )}

          {(order.status === "pending" || order.status === "confirmed") && (
            <button
              onClick={() => onUpdateStatus(order.id, "cancelled")}
              className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
            >
              Cancel Order
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderCard;