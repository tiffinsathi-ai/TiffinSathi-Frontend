import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  X,
  User,
  Upload,
  Camera
} from 'lucide-react';

const DeliveryPartnerForm = ({ partner, onSubmit, onClose, api }) => {
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    vehicleInfo: '',
    email: '',
    address: '',
    licenseNumber: '',
    profilePicture: '',
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (partner) {
      setFormData({
        name: partner.name || '',
        phoneNumber: partner.phoneNumber || '',
        vehicleInfo: partner.vehicleInfo || '',
        email: partner.email || '',
        address: partner.address || '',
        licenseNumber: partner.licenseNumber || '',
        profilePicture: partner.profilePicture || '',
        isActive: partner.isActive ?? true
      });
      setImagePreview(partner.profilePictureUrl || '');
    }
  }, [partner]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, profilePicture: 'Please select an image file' }));
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, profilePicture: 'Image size should be less than 2MB' }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setFormData(prev => ({ ...prev, profilePicture: base64String }));
        setImagePreview(base64String);
        setErrors(prev => ({ ...prev, profilePicture: '' }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, profilePicture: '' }));
    setImagePreview('');
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be 10 digits';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (partner) {
        await api.updateDeliveryPartner(partner.partnerId, formData);
        toast.success('Delivery partner updated successfully');
      } else {
        await api.createDeliveryPartner(formData);
        toast.success('Delivery partner created successfully');
      }
      onSubmit();
    } catch (error) {
      toast.error(error.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {partner ? 'Edit Delivery Partner' : 'Add New Delivery Partner'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Profile Picture Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Picture
            </label>
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Profile preview"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                    <Camera className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <label className="flex flex-col items-center px-4 py-2 bg-white text-blue-600 rounded-lg border border-blue-300 cursor-pointer hover:bg-blue-50">
                  <Upload className="w-5 h-5 mb-1" />
                  <span className="text-sm font-medium">Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                {errors.profilePicture && (
                  <p className="mt-1 text-sm text-red-600">{errors.profilePicture}</p>
                )}
              </div>
            </div>
          </div>

          {/* Name and Phone Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter full name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                Phone Number *
              </label>
              <input
                type="text"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.phoneNumber ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="10-digit phone number"
              />
              {errors.phoneNumber && <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>}
            </div>
          </div>

          {/* Email and Vehicle Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter email address"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="vehicleInfo" className="block text-sm font-medium text-gray-700">
                Vehicle Information
              </label>
              <input
                type="text"
                id="vehicleInfo"
                name="vehicleInfo"
                value={formData.vehicleInfo}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Bike, Car, etc."
              />
            </div>
          </div>

          {/* License Number */}
          <div>
            <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
              License Number
            </label>
            <input
              type="text"
              id="licenseNumber"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter license number"
            />
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <textarea
              id="address"
              name="address"
              rows={3}
              value={formData.address}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter full address"
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Active delivery partner
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Saving...' : partner ? 'Update Partner' : 'Create Partner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeliveryPartnerForm;