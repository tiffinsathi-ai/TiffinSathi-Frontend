/* eslint-disable no-unused-vars */
import React from "react";
import Modal from "./Modal";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Navigation,
  UserCircle,
  Map,
  Calendar,
  Package,
  Home,
  MessageCircle,
} from "lucide-react";

const MapModal = ({ isOpen, onClose, order, userLocation }) => {
  const getMapUrl = (address) => {
    if (!address) return null;
    const encodedAddress = encodeURIComponent(address);
    return `https://maps.google.com/maps?q=${encodedAddress}&output=embed`;
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return "N/A";
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
    }
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return cleaned.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, "+$1 ($2) $3-$4");
    }
    return phone;
  };

  // Safe extraction of customer data
  const getCustomerInfo = () => {
    if (!order) return null;
    
    const customer = order.customer || {};
    
    return {
      name: customer.userName || customer.name || "Customer",
      phone: customer.phoneNumber || order.phoneNumber || "N/A",
      email: customer.email || order.email || "N/A",
      profilePicture: customer.profilePicture || customer.avatar || null
    };
  };

  const customerInfo = getCustomerInfo();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        order
          ? `Delivery Location - Order #${order.orderId}`
          : "Delivery Location"
      }
      size="lg"
    >
      <div className="p-4">
        {order ? (
          <div className="space-y-4">
            {/* -------------------- CUSTOMER INFO -------------------- */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Customer Information
              </h4>

              <div className="flex items-start gap-4">
                {/* Profile Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    {customerInfo.profilePicture ? (
                      <img
                        src={customerInfo.profilePicture}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.parentElement.innerHTML = `
                            <div class="w-full h-full bg-blue-100 rounded-full flex items-center justify-center">
                              <span class="text-blue-600 font-bold text-lg">
                                ${customerInfo.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          `;
                        }}
                      />
                    ) : customerInfo.name ? (
                      <span className="text-blue-600 font-bold text-lg">
                        {customerInfo.name.charAt(0).toUpperCase()}
                      </span>
                    ) : (
                      <UserCircle className="w-8 h-8 text-blue-400" />
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 w-20">Name:</span>
                    <span className="font-semibold text-gray-900 ml-2">
                      {customerInfo.name}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 w-20">Phone:</span>
                    <span className="font-medium text-gray-900 ml-2">
                      {formatPhoneNumber(customerInfo.phone)}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 w-20">Email:</span>
                    <span className="text-gray-700 ml-2 truncate">
                      {customerInfo.email}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* -------------------- ORDER DETAILS -------------------- */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Details
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-600 w-24">Order ID:</span>
                  <span className="font-semibold ml-2">#{order.orderId}</span>
                </div>

                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-600 w-24">Status:</span>
                  <span className="font-semibold capitalize ml-2">
                    {order.status?.toLowerCase().replace('_', ' ') || 'N/A'}
                  </span>
                </div>

                {order.preferredDeliveryTime && (
                  <div className="flex items-center md:col-span-2">
                    <span className="text-sm font-medium text-gray-600 w-24">Preferred Time:</span>
                    <span className="font-semibold ml-2">
                      {order.preferredDeliveryTime}
                    </span>
                  </div>
                )}

                {order.deliveryDate && (
                  <div className="flex items-center md:col-span-2">
                    <span className="text-sm font-medium text-gray-600 w-24">Delivery Date:</span>
                    <span className="font-semibold ml-2 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(order.deliveryDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* -------------------- DELIVERY ADDRESS -------------------- */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h4 className="font-semibold text-green-900 mb-4 flex items-center gap-2">
                <Home className="w-5 h-5" />
                Delivery Address
              </h4>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-green-600" />
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-start">
                    <span className="text-sm font-medium text-gray-700 mt-0.5">Address:</span>
                    <p className="text-gray-800 ml-2 leading-relaxed">
                      {order.deliveryAddress || 'No address provided'}
                    </p>
                  </div>

                  {order.specialInstructions && (
                    <div className="mt-3 p-3 bg-yellow-50 rounded border border-yellow-200">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-yellow-800">
                          Special Instructions:
                        </span>
                      </div>
                      <p className="text-sm text-yellow-700 mt-1">
                        {order.specialInstructions}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* -------------------- GOOGLE MAP -------------------- */}
            <div className="bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
              {getMapUrl(order.deliveryAddress) ? (
                <iframe
                  title="Google Map"
                  src={getMapUrl(order.deliveryAddress)}
                  width="100%"
                  height="240"
                  className="border-0"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              ) : (
                <div className="h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                  <MapPin className="w-10 h-10" />
                  <p className="ml-2">No map available</p>
                </div>
              )}
            </div>

            {/* -------------------- ACTION BUTTONS -------------------- */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(
                  order.deliveryAddress || ''
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!order.deliveryAddress}
              >
                <Navigation className="w-5 h-5" />
                Open in Maps
              </a>

              {customerInfo.phone && customerInfo.phone !== "N/A" && (
                <>
                  <a
                    href={`tel:${customerInfo.phone.replace(/\D/g, '')}`}
                    className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 transition-colors font-medium"
                  >
                    <Phone className="w-5 h-5" />
                    Call Customer
                  </a>
                  <a
                    href={`https://wa.me/${customerInfo.phone.replace(/\D/g, '').replace(/^1/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 flex items-center justify-center gap-2 transition-colors font-medium"
                  >
                    <MessageCircle className="w-5 h-5" />
                    WhatsApp
                  </a>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <UserCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">No order selected</p>
            <p className="text-gray-400 text-sm mt-1">
              Please select an order to view delivery details
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default MapModal;