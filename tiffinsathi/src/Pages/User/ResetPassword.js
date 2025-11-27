import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  HiLockClosed,
  HiCheckCircle,
  HiInformationCircle,
  HiArrowLeft,
  HiEye,
  HiEyeOff,
} from "react-icons/hi";
import { FaArrowRight } from "react-icons/fa";
import loginBg from "../../assets/login.jpg";
import logo from "../../assets/logo.png";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [email, setEmail] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Check if token and email exist in localStorage
    let token = localStorage.getItem("forgotPasswordToken");
    const storedEmail = localStorage.getItem("forgotPasswordEmail");

    // Parse token if it's stored as JSON string
    if (token) {
      try {
        // Remove quotes if it's a JSON string
        if (token.startsWith('"') && token.endsWith('"')) {
          token = JSON.parse(token);
        } else if (token.startsWith("{")) {
          // If it's a JSON object, try to extract token property
          const parsed = JSON.parse(token);
          token = parsed.token || parsed || token;
        }
      } catch (e) {
        // If parsing fails, use token as is
        console.log("Token is already a plain string");
      }
      // Store the cleaned token back
      if (token && typeof token === "string") {
        localStorage.setItem("forgotPasswordToken", token);
      }
    }

    console.log("ResetPassword useEffect - Token exists:", !!token);
    console.log("ResetPassword useEffect - Email exists:", !!storedEmail);
    console.log(
      "ResetPassword useEffect - Token value:",
      token ? token.substring(0, 30) + "..." : "null"
    );

    if (!token || !storedEmail) {
      // Redirect to forgot password if token/email not found
      console.error("Missing token or email, redirecting to forgot-password");
      navigate("/forgot-password");
    } else {
      setEmail(storedEmail);
    }
  }, [navigate]);

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

  // Toggle password visibility functions
  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.newPassword) {
      newErrors.newPassword = "Password is required";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrors({});

    if (!validateForm()) {
      return;
    }

    let token = localStorage.getItem("forgotPasswordToken");

    // Parse token if it's stored as JSON string
    if (token) {
      try {
        // Remove quotes if it's a JSON string
        if (token.startsWith('"') && token.endsWith('"')) {
          token = JSON.parse(token);
        } else if (token.startsWith("{")) {
          // If it's a JSON object, try to extract token property
          const parsed = JSON.parse(token);
          token = parsed.token || parsed || token;
        }
        // Ensure token is a string
        if (typeof token !== "string") {
          token = String(token);
        }
      } catch (e) {
        // If parsing fails, use token as is
        console.log("Token is already a plain string, using as is");
      }
    }

    if (
      !token ||
      token.trim() === "" ||
      token === "null" ||
      token === "undefined"
    ) {
      console.error("Token not found or invalid in localStorage:", token);
      setErrors({
        submit: "Session expired. Please start over.",
      });
      setTimeout(() => {
        navigate("/forgot-password");
      }, 2000);
      return;
    }

    // Clean the token (remove any extra whitespace)
    token = token.trim();
    console.log(
      "Token retrieved for reset password:",
      token.substring(0, 30) + "..."
    );

    setIsLoading(true);
    try {
      const requestPayload = {
        token: token,
        email: email,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      };

      console.log("=== RESET PASSWORD REQUEST ===");
      console.log("Token being sent:", token.substring(0, 50) + "...");
      console.log("Token length:", token.length);
      console.log("Token type:", typeof token);
      console.log("Email:", email);
      console.log("Full payload (passwords hidden):", {
        token: token.substring(0, 50) + "...",
        email: email,
        newPassword: "***",
        confirmPassword: "***",
      });

      const response = await axios.post(
        "/auth/reset-password",
        requestPayload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Clear forgot password data from localStorage
      localStorage.removeItem("forgotPasswordToken");
      localStorage.removeItem("forgotPasswordEmail");

      setSuccessMessage("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Reset password error:", error);

      let errorMessage = "Failed to reset password. Please try again.";

      if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
        errorMessage =
          "Network error: Cannot connect to server. Please ensure the backend is running on http://localhost:8080";
      } else if (error.code === "ECONNREFUSED") {
        errorMessage =
          "Connection refused: The backend server is not running or not accessible on http://localhost:8080";
      } else if (error.response) {
        const status = error.response.status;
        const responseData = error.response.data;

        console.error("Reset password API error:", {
          status,
          responseData,
          token: token ? token.substring(0, 30) + "..." : "null",
        });

        if (status === 400) {
          errorMessage =
            responseData?.message || "Invalid request. Please try again.";
        } else if (status === 401 || status === 403) {
          errorMessage =
            responseData?.message ||
            "Session expired. Please start the process again.";
        } else if (status === 404) {
          errorMessage =
            "Endpoint not found. Please check the backend configuration.";
        } else {
          errorMessage =
            responseData?.message ||
            responseData?.error ||
            `Server error: ${status} ${error.response.statusText}`;
        }
      } else if (error.request) {
        errorMessage =
          "No response from server. Please check if the backend is running and CORS is configured correctly.";
      } else {
        errorMessage = error.message || errorMessage;
      }

      setErrors({
        submit: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
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

      {/* Right Section - Reset Password Form */}
      <div className="w-full md:w-3/5 bg-white flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Title */}
          <h2 className="text-4xl font-bold text-gray-800 mb-2">
            Reset Password
          </h2>
          <p className="text-gray-600 mb-8">Enter your new password below</p>

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

          {/* Reset Password Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div>
              <label className="block text-left text-gray-700 font-medium mb-2">
                New Password<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <HiLockClosed className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  style={{
                    borderColor: errors.newPassword ? "#ef4444" : "#CCCCCC",
                  }}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={toggleNewPasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showNewPassword ? (
                    <HiEyeOff className="w-5 h-5" />
                  ) : (
                    <HiEye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.newPassword}
                </p>
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
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  style={{
                    borderColor: errors.confirmPassword ? "#ef4444" : "#CCCCCC",
                  }}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <HiEyeOff className="w-5 h-5" />
                  ) : (
                    <HiEye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Reset Password Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg font-bold text-white flex items-center justify-center gap-2 shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                <span>Resetting Password...</span>
              ) : (
                <>
                  <FaArrowRight className="w-5 h-5" />
                  <span>Reset Password</span>
                </>
              )}
            </button>
          </form>

          {/* Back to Verify OTP Link */}
          <div className="mt-8 space-y-4 text-center">
            <button
              onClick={() => navigate("/verify-otp")}
              className="flex items-center justify-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <HiArrowLeft className="w-5 h-5" />
              <span>Back to Verify OTP</span>
            </button>
            <div className="flex items-center justify-center gap-2 text-gray-700">
              <HiInformationCircle
                className="w-5 h-5"
                style={{ color: "#4A8C39" }}
              />
              <span>
                Remember your password?{" "}
                <a
                  href="/login"
                  className="font-medium"
                  style={{ color: "#4A8C39" }}
                >
                  Sign in here
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;