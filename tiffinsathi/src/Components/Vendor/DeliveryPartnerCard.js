
import React, { useState } from 'react';
import {
  Phone,
  Mail,
  Car,
  MapPin,
  Calendar,
  Edit,
  Trash2,
  Key,
  Power,
  User,
  Shield
} from 'lucide-react';

const DeliveryPartnerCard = ({
  partner,
  onEdit,
  onDelete,
  onToggleStatus,
  onResetPassword
}) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          {/* Profile Picture */}
          <div className="flex-shrink-0">
            {partner.profilePictureUrl && !imageError ? (
              <img
                src={partner.profilePictureUrl}
                alt={partner.name}
                className="w-16 h-16 rounded-full object-cover"
                onError={handleImageError}
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
            )}
          </div>

          {/* Partner Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {partner.name}
              </h3>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  partner.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {partner.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{partner.phoneNumber}</span>
              </div>

              {partner.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="truncate">{partner.email}</span>
                </div>
              )}

              {partner.vehicleInfo && (
                <div className="flex items-center space-x-2">
                  <Car className="w-4 h-4 text-gray-400" />
                  <span>{partner.vehicleInfo}</span>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>Joined {formatDate(partner.createdAt)}</span>
              </div>
            </div>

            {partner.address && (
              <p className="text-sm text-gray-600 mt-2 flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="flex-1">{partner.address}</span>
              </p>
            )}

            {partner.licenseNumber && (
              <p className="text-sm text-gray-600 mt-2 flex items-center space-x-2">
                <Shield className="w-4 h-4 text-gray-400" />
                <span>License: {partner.licenseNumber}</span>
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={() => onToggleStatus(partner.partnerId)}
            className={`p-2 rounded-md ${
              partner.isActive
                ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                : 'bg-green-100 text-green-600 hover:bg-green-200'
            }`}
            title={partner.isActive ? 'Deactivate' : 'Activate'}
          >
            <Power className="w-4 h-4" />
          </button>

          <button
            onClick={() => onResetPassword(partner.partnerId)}
            className="p-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
            title="Reset Password"
          >
            <Key className="w-4 h-4" />
          </button>

          <button
            onClick={() => onEdit(partner)}
            className="p-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDelete(partner.partnerId)}
            className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeliveryPartnerCard;