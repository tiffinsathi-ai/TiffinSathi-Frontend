/* eslint-disable no-unused-vars */

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Upload, Bike, Car } from 'lucide-react';

const DeliveryPartnerForm = ({ partner, onSubmit, onClose, api }) => {
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    vehicleInfo: '',
    email: '',
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
        licenseNumber: partner.licenseNumber || '',
        profilePicture: partner.profilePicture || '',
        isActive: partner.isActive ?? true
      });
      setImagePreview(partner.profilePictureUrl || partner.profilePicture || '');
    } else {
      setFormData({
        name: '',
        phoneNumber: '',
        vehicleInfo: '',
        email: '',
        licenseNumber: '',
        profilePicture: '',
        isActive: true
      });
      setImagePreview('');
    }
  }, [partner]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, profilePicture: 'Please select an image file' }));
      return;
    }

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
        const updateData = {
          name: formData.name,
          phoneNumber: formData.phoneNumber,
          vehicleInfo: formData.vehicleInfo,
          email: formData.email,
          licenseNumber: formData.licenseNumber,
          isActive: formData.isActive
        };

        if (formData.profilePicture && formData.profilePicture !== partner.profilePicture) {
          updateData.profilePicture = formData.profilePicture;
        }

        await api.updateDeliveryPartner(partner.partnerId, updateData);
        toast.success('Delivery partner updated successfully');
      } else {
        const createData = {
          name: formData.name,
          phoneNumber: formData.phoneNumber,
          vehicleInfo: formData.vehicleInfo,
          email: formData.email,
          licenseNumber: formData.licenseNumber,
          profilePicture: formData.profilePicture,
          isActive: formData.isActive
        };

        const response = await api.createDeliveryPartner(createData);
        toast.success('Delivery partner created successfully');
        
        if (response && response.tempPassword) {
          toast.info(`Temporary password: ${response.tempPassword}. Please share with the delivery partner.`);
        }
      }
      onSubmit();
    } catch (error) {
      toast.error(error.message || 'Operation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const vehicleOptions = [
    { value: 'bike', label: 'Bike', icon: <Bike size={16} /> },
    { value: 'scooter', label: 'Scooter', icon: <Bike size={16} /> },
    { value: 'car', label: 'Car', icon: <Car size={16} /> },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">
        {partner ? 'Edit Delivery Partner' : 'Add New Delivery Partner'}
      </h3>

      {/* Image upload */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Profile Image
        </label>
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
            {imagePreview && imagePreview !== '/src/assets/admin-banner.jpg' ? (
              <img
                src={imagePreview}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <Upload size={20} className="text-gray-400" />
            )}
          </div>
          <div>
            <input
              type="file"
              id="partner-image-upload"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              disabled={loading}
            />
            <label
              htmlFor="partner-image-upload"
              className="cursor-pointer px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors inline-block disabled:opacity-50"
            >
              Upload Photo
            </label>
            <p className="text-xs text-gray-500 mt-1">
              JPG, PNG or GIF. Max 2MB.
            </p>
            {errors.profilePicture && (
              <p className="text-xs text-red-600 mt-1">{errors.profilePicture}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter full name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={loading}
          />
          {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.phoneNumber ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="98XXXXXXXX"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            disabled={loading}
          />
          {errors.phoneNumber && <p className="text-xs text-red-600 mt-1">{errors.phoneNumber}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="partner@email.com"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
          />
          {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vehicle Information
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Bike, Car, etc."
            name="vehicleInfo"
            value={formData.vehicleInfo}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            License Number
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter license number"
            name="licenseNumber"
            value={formData.licenseNumber}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Initial Status
          </label>
          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            name="isActive"
            value={formData.isActive ? 'active' : 'inactive'}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              isActive: e.target.value === 'active' 
            }))}
            disabled={loading}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end space-x-3">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
        >
          {loading && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          <span>{partner ? 'Update Partner' : 'Add Partner'}</span>
        </button>
      </div>
    </div>
  );
};

export default DeliveryPartnerForm;