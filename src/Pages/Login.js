import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiMail,
  HiLockClosed,
  HiCheckCircle,
  HiInformationCircle,
  HiChevronDown,
} from "react-icons/hi";
import { FaArrowRight } from "react-icons/fa";
import loginBg from "../assets/login.jpg";
import logo from "../assets/logo.png";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    loginAs: "User",
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Redirect to home page
    navigate("/");
  };

  // Added placeholder click handler for now
  const handlePlaceholderClick = (message) => {
    alert(message);
  };

  return (
    <div className="min-h-screen flex">
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

      {/* Right Section - Login Form */}
      <div className="w-full md:w-3/5 bg-white flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Title */}
          <h2 className="text-4xl font-bold text-gray-800 mb-2">
            Welcome Back!
          </h2>
          <p className="text-gray-600 mb-8">Sign in to your account</p>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Login As Dropdown */}
            <div>
              <label className="block text-left text-gray-700 font-medium mb-2">
                Login as
              </label>
              <div className="relative">
                <select
                  name="loginAs"
                  value={formData.loginAs}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent appearance-none bg-white"
                  style={{ borderColor: "#CCCCCC" }}
                >
                  <option value="User">User</option>
                  <option value="Restaurant">Restaurant</option>
                </select>
                <HiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>
            </div>

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
                  style={{ borderColor: "#CCCCCC" }}
                />
              </div>
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
                  style={{ borderColor: "#CCCCCC" }}
                />
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-gray-700">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => handlePlaceholderClick("Forgot password clicked")}
                className="font-medium"
                style={{ color: "#F5B800" }}
              >
                Forgot password?
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full py-3 rounded-lg font-bold text-white flex items-center justify-center gap-2 shadow-lg transition-colors"
              style={{ backgroundColor: "#F5B800" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#e0a500")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#F5B800")
              }
            >
              <FaArrowRight className="w-5 h-5" />
              <span>Sign In</span>
            </button>
          </form>

          {/* Account Management Links */}
          <div className="mt-8 space-y-4 text-center">
            <p className="text-gray-700">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => handlePlaceholderClick("Sign up clicked")}
                className="font-medium"
                style={{ color: "#F5B800" }}
              >
                Sign up here
              </button>
            </p>
            <div className="flex items-center justify-center gap-2 text-gray-700">
              <HiInformationCircle
                className="w-5 h-5"
                style={{ color: "#4A8C39" }}
              />
              <span>
                Want to join as a Restaurant?{" "}
                <button
                  type="button"
                  onClick={() => handlePlaceholderClick("Join as restaurant clicked")}
                  className="font-medium"
                  style={{ color: "#4A8C39" }}
                >
                  Click here
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;