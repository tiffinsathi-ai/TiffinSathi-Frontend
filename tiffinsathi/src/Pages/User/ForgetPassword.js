import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  HiMail,
  HiCheckCircle,
  HiInformationCircle,
  HiArrowLeft,
} from "react-icons/hi";
import { FaArrowRight } from "react-icons/fa";
import loginBg from "../../assets/login.jpg";
import logo from "../../assets/logo.png";

const ForgetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { value } = e.target;
    setEmail(value);
    // Clear error when user starts typing
    if (errors.email) {
      setErrors({ ...errors, email: "" });
    }
  };

  const validateEmail = () => {
    if (!email.trim()) {
      setErrors({ email: "Email is required" });
      return false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: "Please enter a valid email address" });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrors({});

    if (!validateEmail()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        "/auth/forgot-password",
        {
          email: email.trim(),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Store email and token in localStorage for next steps
      // Token might be in response.data.token, response.data, or the entire response.data
      const token = response.data?.token || response.data;
      console.log("Forgot password response:", response.data);
      console.log("Extracted token type:", typeof token);
      console.log("Extracted token:", token ? (typeof token === "string" ? token.substring(0, 50) + "..." : JSON.stringify(token).substring(0, 50) + "...") : "null");
      
      if (token) {
        // Always store as a plain string, never as JSON
        const tokenString = typeof token === "string" ? token.trim() : String(token).trim();
        localStorage.setItem("forgotPasswordToken", tokenString);
        localStorage.setItem("forgotPasswordEmail", email.trim());
        console.log("Token stored in localStorage (plain string):", tokenString.substring(0, 50) + "...");
        console.log("Token length:", tokenString.length);
      } else {
        console.error("No token received from forgot-password API");
        setErrors({
          submit: "No token received from server. Please try again.",
        });
        return;
      }

      setSuccessMessage(
        "OTP has been sent to your email. Redirecting to verification..."
      );
      setTimeout(() => {
        navigate("/verify-otp");
      }, 2000);
    } catch (error) {
      console.error("Forgot password error:", error);

      let errorMessage = "Failed to send OTP. Please try again.";

      if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
        errorMessage =
          "Network error: Cannot connect to server. Please ensure the backend is running on http://localhost:8080";
      } else if (error.code === "ECONNREFUSED") {
        errorMessage =
          "Connection refused: The backend server is not running or not accessible on http://localhost:8080";
      } else if (error.response) {
        const status = error.response.status;
        const responseData = error.response.data;

        if (status === 404) {
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

      {/* Right Section - Forgot Password Form */}
      <div className="w-full md:w-3/5 bg-white flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Title */}
          <h2 className="text-4xl font-bold text-gray-800 mb-2">
            Forgot Password?
          </h2>
          <p className="text-gray-600 mb-8">
            Enter your email address and we'll send you an OTP to reset your
            password
          </p>

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

          {/* Forgot Password Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  value={email}
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

            {/* Send OTP Button */}
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
                <span>Sending OTP...</span>
              ) : (
                <>
                  <FaArrowRight className="w-5 h-5" />
                  <span>Send OTP</span>
                </>
              )}
            </button>
          </form>

          {/* Back to Login Link */}
          <div className="mt-8 space-y-4 text-center">
            <button
              onClick={() => navigate("/login")}
              className="flex items-center justify-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <HiArrowLeft className="w-5 h-5" />
              <span>Back to Login</span>
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

export default ForgetPassword;
