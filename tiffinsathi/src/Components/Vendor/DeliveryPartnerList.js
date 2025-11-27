
import React from 'react';
import DeliveryPartnerCard from '../../Components/Vendor/DeliveryPartnerCard';
import { Users } from 'lucide-react';

const DeliveryPartnerList = ({
  partners,
  loading,
  onEdit,
  onDelete,
  onToggleStatus,
  onResetPassword
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading delivery partners...</p>
        </div>
      </div>
    );
  }

  if (partners.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-12 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No delivery partners found</h3>
          <p className="text-gray-500 mb-6">Get started by adding your first delivery partner.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Delivery Partners ({partners.length})</h2>
      </div>
      <div className="divide-y divide-gray-200">
        {partners.map((partner) => (
          <DeliveryPartnerCard
            key={partner.partnerId}
            partner={partner}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleStatus={onToggleStatus}
            onResetPassword={onResetPassword}
          />
        ))}
      </div>
    </div>
  );
};

export default DeliveryPartnerList;