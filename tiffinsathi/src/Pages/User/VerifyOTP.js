import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  HiCheckCircle,
  HiInformationCircle,
  HiArrowLeft,
  HiKey,
} from "react-icons/hi";
import { FaArrowRight } from "react-icons/fa";
import loginBg from "../../assets/login.jpg";
import logo from "../../assets/logo.png";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    // Check if token and email exist in localStorage
    const token = localStorage.getItem("forgotPasswordToken");
    const storedEmail = localStorage.getItem("forgotPasswordEmail");

    if (!token || !storedEmail) {
      // Redirect to forgot password if token/email not found
      navigate("/forgot-password");
    } else {
      setEmail(storedEmail);
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { value } = e.target;
    // Only allow numbers
    const numericValue = value.replace(/\D/g, "");
    // Limit to 6 digits
    if (numericValue.length <= 6) {
      setOtp(numericValue);
      // Clear error when user starts typing
      if (errors.otp) {
        setErrors({ ...errors, otp: "" });
      }
    }
  };

  const validateOTP = () => {
    if (!otp.trim()) {
      setErrors({ otp: "OTP is required" });
      return false;
    } else if (otp.length !== 6) {
      setErrors({ otp: "OTP must be 6 digits" });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrors({});

    if (!validateOTP()) {
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
        token = token.trim();
      } catch (e) {
        // If parsing fails, use token as is
        console.log("Token is already a plain string");
      }
    }

    if (
      !token ||
      token.trim() === "" ||
      token === "null" ||
      token === "undefined"
    ) {
      setErrors({
        submit: "Session expired. Please request a new OTP.",
      });
      setTimeout(() => {
        navigate("/forgot-password");
      }, 2000);
      return;
    }

    console.log(
      "Using token for OTP verification:",
      token.substring(0, 30) + "..."
    );

    setIsLoading(true);
    try {
      const response = await axios.post(
        "/auth/verify-otp",
        {
          token: token,
          otp: otp.trim(),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Log the full response to understand the structure
      console.log("=== VERIFY OTP RESPONSE ===");
      console.log("Full response:", JSON.stringify(response.data, null, 2));
      console.log("Response data type:", typeof response.data);
      console.log(
        "Response data keys:",
        response.data ? Object.keys(response.data) : "null"
      );
      console.log(
        "Current token before update:",
        token.substring(0, 50) + "..."
      );

      // Update token if new one is provided, otherwise keep the existing token
      // Token might be in response.data.token, response.data.data.token, response.data, or the entire response.data
      // Also check for message.success or other nested structures
      let newToken = null;

      if (response.data) {
        // Try different possible locations for the token
        newToken =
          response.data.token ||
          response.data.data?.token ||
          response.data.accessToken ||
          (typeof response.data === "string" && response.data.length > 50
            ? response.data
            : null) ||
          null;
      }

      console.log(
        "Extracted newToken:",
        newToken
          ? typeof newToken === "string"
            ? newToken.substring(0, 50) + "..."
            : JSON.stringify(newToken).substring(0, 50) + "..."
          : "null"
      );
      console.log("NewToken type:", typeof newToken);

      // Always ensure we have a valid token stored
      if (
        newToken &&
        newToken !== null &&
        newToken !== undefined &&
        newToken !== "" &&
        typeof newToken === "string" &&
        newToken.length > 10
      ) {
        // Ensure we store it as a plain string
        const tokenString = newToken.trim();
        localStorage.setItem("forgotPasswordToken", tokenString);
        console.log(
          "✅ Token UPDATED after OTP verification:",
          tokenString.substring(0, 50) + "..."
        );
        console.log("✅ Token length:", tokenString.length);
      } else {
        // Keep the existing token if no new token is provided
        console.log("⚠️ No new token in response, keeping existing token");
        // Make sure we still have the token stored (refresh it)
        if (token && token.trim() !== "") {
          localStorage.setItem("forgotPasswordToken", token.trim());
          console.log(
            "✅ Existing token preserved:",
            token.substring(0, 50) + "..."
          );
        } else {
          console.error("❌ ERROR: No token available to preserve!");
        }
      }

      // Final check - verify token is in localStorage
      const storedToken = localStorage.getItem("forgotPasswordToken");
      console.log(
        "Final stored token check:",
        storedToken ? storedToken.substring(0, 50) + "..." : "MISSING!"
      );

      setSuccessMessage("OTP verified successfully! Redirecting...");
      setTimeout(() => {
        navigate("/reset-password");
      }, 1500);
    } catch (error) {
      console.error("Verify OTP error:", error);

      let errorMessage = "Failed to verify OTP. Please try again.";

      if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
        errorMessage =
          "Network error: Cannot connect to server. Please ensure the backend is running on http://localhost:8080";
      } else if (error.code === "ECONNREFUSED") {
        errorMessage =
          "Connection refused: The backend server is not running or not accessible on http://localhost:8080";
      } else if (error.response) {
        const status = error.response.status;
        const responseData = error.response.data;

        if (status === 400 || status === 401) {
          errorMessage =
            responseData?.message || "Invalid OTP. Please try again.";
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

      {/* Right Section - Verify OTP Form */}
      <div className="w-full md:w-3/5 bg-white flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Title */}
          <h2 className="text-4xl font-bold text-gray-800 mb-2">Verify OTP</h2>
          <p className="text-gray-600 mb-2">
            Enter the 6-digit OTP sent to your email
          </p>
          {email && (
            <p className="text-gray-500 text-sm mb-8">
              Email: <span className="font-medium">{email}</span>
            </p>
          )}

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

          {/* Verify OTP Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Input */}
            <div>
              <label className="block text-left text-gray-700 font-medium mb-2">
                Enter OTP<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <HiKey className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="otp"
                  value={otp}
                  onChange={handleChange}
                  required
                  maxLength={6}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-center text-2xl tracking-widest font-mono"
                  style={{
                    borderColor: errors.otp ? "#ef4444" : "#CCCCCC",
                  }}
                  placeholder="000000"
                />
              </div>
              {errors.otp && (
                <p className="text-red-500 text-sm mt-1">{errors.otp}</p>
              )}
            </div>

            {/* Verify Button */}
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
                <span>Verifying...</span>
              ) : (
                <>
                  <FaArrowRight className="w-5 h-5" />
                  <span>Verify OTP</span>
                </>
              )}
            </button>
          </form>

          {/* Back to Forgot Password Link */}
          <div className="mt-8 space-y-4 text-center">
            <button
              onClick={() => navigate("/forgot-password")}
              className="flex items-center justify-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <HiArrowLeft className="w-5 h-5" />
              <span>Back to Forgot Password</span>
            </button>
            <div className="flex items-center justify-center gap-2 text-gray-700">
              <HiInformationCircle
                className="w-5 h-5"
                style={{ color: "#4A8C39" }}
              />
              <span>
                Didn't receive OTP?{" "}
                <a
                  href="/forgot-password"
                  className="font-medium"
                  style={{ color: "#4A8C39" }}
                >
                  Request again
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
