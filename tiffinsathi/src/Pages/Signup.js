import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiMail,
  HiLockClosed,
  HiCheckCircle,
  HiInformationCircle,
  HiUser,
  HiPhone,
  HiLocationMarker,
} from "react-icons/hi";
import { FaArrowRight } from "react-icons/fa";
import loginBg from "../assets/login.jpg";
import logo from "../assets/logo.png";
import { createUser } from "../services/userService";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await createUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        password: formData.password,
      });

      setSuccessMessage(
        "Account created successfully! Redirecting to login..."
      );
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Signup error:", error);
      setErrors({
        submit:
          error.response?.data?.message ||
          error.message ||
          "Failed to create account. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="min-h-screen flex overflow-hidden">
      {/* Left Section - Background and Branding */}
      <div
        className="hidden md:flex md:w-2/5 relative items-center justify-center"
        style={{
          backgroundImage: `url(${loginBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Gradient Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom right, rgba(74, 140, 57, 0.8), rgba(245, 184, 0, 0.8))",
          }}
        ></div>

        {/* Content */}
        <div className="relative z-10 text-center px-8 py-12">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-32 h-32 rounded-full bg-white p-4 flex items-center justify-center shadow-lg">
              <img
                src={logo}
                alt="Tiffin Sathi Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Brand Name */}
          <h1
            className="text-5xl font-bold text-white mb-3"
            style={{
              fontFamily: "'Brush Script MT', 'Lucida Handwriting', cursive",
            }}
          >
            Tiffin Sathi
          </h1>

          {/* Tagline */}
          <p className="text-white text-lg mb-8">
            Fresh Homemade Meals Delivered
          </p>

          {/* Features */}
          <div className="space-y-4 text-left max-w-xs mx-auto">
            <div className="flex items-center gap-3 text-white">
              <HiCheckCircle className="w-6 h-6 flex-shrink-0" />
              <span>Authentic Homemade Taste</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <HiCheckCircle className="w-6 h-6 flex-shrink-0" />
              <span>Daily Fresh Preparation</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <HiCheckCircle className="w-6 h-6 flex-shrink-0" />
              <span>Timely Delivery</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Signup Form with Two Columns */}
      <div className="w-full md:w-3/5 bg-white overflow-y-auto px-6 py-12">
        <div className="w-full max-w-4xl mx-auto">
          {/* Title */}
          <h2 className="text-4xl font-bold text-gray-800 mb-2">
            Create Account
          </h2>
          <p className="text-gray-600 mb-8">Sign up to get started</p>

          {/* Success Message */}
          {successMessage && (
            <div
              className="mb-4 p-3 rounded-lg text-white text-sm"
              style={{ backgroundColor: "#4A8C39" }}
            >
              {successMessage}
            </div>
          )}

          {/* Error Message */}
          {errors.submit && (
            <div className="mb-4 p-3 rounded-lg text-white text-sm bg-red-500">
              {errors.submit}
            </div>
          )}

          {/* Two Column Form Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Left Column of White Section */}
            <div className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-left text-gray-700 font-medium mb-2">
                  Full Name<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <HiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    style={{ borderColor: errors.name ? "#ef4444" : "#CCCCCC" }}
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-left text-gray-700 font-medium mb-2">
                  Phone<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <HiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    style={{
                      borderColor: errors.phone ? "#ef4444" : "#CCCCCC",
                    }}
                    placeholder="Enter your phone number"
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-left text-gray-700 font-medium mb-2">
                  Password<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <HiLockClosed className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    style={{
                      borderColor: errors.password ? "#ef4444" : "#CCCCCC",
                    }}
                    placeholder="Enter your password"
                  />
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>
            </div>

            {/* Right Column of White Section */}
            <div className="space-y-5">
              {/* Email Address */}
              <div>
                <label className="block text-left text-gray-700 font-medium mb-2">
                  Email Address<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <HiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    style={{
                      borderColor: errors.email ? "#ef4444" : "#CCCCCC",
                    }}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-left text-gray-700 font-medium mb-2">
                  Address<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <HiLocationMarker className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    style={{
                      borderColor: errors.address ? "#ef4444" : "#CCCCCC",
                    }}
                    placeholder="Enter your address"
                  />
                </div>
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-left text-gray-700 font-medium mb-2">
                  Confirm Password<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <HiLockClosed className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    style={{
                      borderColor: errors.confirmPassword
                        ? "#ef4444"
                        : "#CCCCCC",
                    }}
                    placeholder="Confirm your password"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sign Up Button - Centered with smaller width */}
          <div className="mt-6 flex justify-center">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full max-w-md py-3 rounded-lg font-bold text-white flex items-center justify-center gap-2 shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#F5B800" }}
              onMouseEnter={(e) => {
                if (!isLoading)
                  e.currentTarget.style.backgroundColor = "#e0a500";
              }}
              onMouseLeave={(e) => {
                if (!isLoading)
                  e.currentTarget.style.backgroundColor = "#F5B800";
              }}
            >
              {isLoading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <FaArrowRight className="w-5 h-5" />
                  <span>Sign Up</span>
                </>
              )}
            </button>
          </div>

          {/* Account Management Links */}
          <div className="mt-8 space-y-4 text-center">
            <p className="text-gray-700">
              Already have an account?{" "}
              <a
                href="/login"
                className="font-medium"
                style={{ color: "#F5B800" }}
              >
                Sign in here
              </a>
            </p>
            <div className="flex items-center justify-center gap-2 text-gray-700">
              <HiInformationCircle
                className="w-5 h-5"
                style={{ color: "#4A8C39" }}
              />
              <span>
                Want to join as a Restaurant?{" "}
                <a
                  href="#"
                  className="font-medium"
                  style={{ color: "#4A8C39" }}
                >
                  Click here
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default Signup;
