import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  HiMail,
  HiLockClosed,
  HiCheckCircle,
  HiInformationCircle,
  HiChevronDown,
  HiEye,
  HiEyeOff,
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
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Function to decode JWT token and extract role
  const decodeToken = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  // Function to determine redirect path based on role
  const getRedirectPath = (role) => {
    switch (role) {
      case "ADMIN":
        return "/admin";
      case "DELIVERY":
        return "/delivery";
      case "VENDOR":
        return "/vendor";
      case "USER":
      default:
        return "/";
    }
  };

  // Function to validate if user role matches the selected login type
  const validateRoleAccess = (userRole, loginType) => {
    const userRoles = ["USER", "ADMIN"];
    const restaurantRoles = ["VENDOR", "DELIVERY"];

    if (loginType === "User" && userRoles.includes(userRole)) {
      return true;
    }
    if (loginType === "Restaurant" && restaurantRoles.includes(userRole)) {
      return true;
    }
    return false;
  };

  // Function to extract username from email
  const getUsernameFromEmail = (email) => {
    if (!email) return "User";
    return email.split('@')[0];
  };

  // Function to get display name based on user data
  const getDisplayName = (decodedToken, email) => {
    // Try to get name from token claims first
    if (decodedToken.name) return decodedToken.name;
    if (decodedToken.userName) return decodedToken.userName;
    if (decodedToken.ownerName) return decodedToken.ownerName;
    if (decodedToken.businessName) return decodedToken.businessName;
    
    // Fallback to username from email
    return getUsernameFromEmail(email);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!formData.email || !formData.password) {
      setErrors({
        submit: "Please enter both email and password",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:8080/auth/login",
        {
          email: formData.email,
          password: formData.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Store token and user data in localStorage
      const responseData = response.data;
      console.log("Login response:", responseData);

      // Extract token from response
      const token = responseData?.token || responseData?.accessToken;
      console.log("Extracted token:", token);

      if (token) {
        // Store the token
        localStorage.setItem("token", token);
        localStorage.setItem("isAuthenticated", "true");

        // Decode token to get user role and info
        const decodedToken = decodeToken(token);
        console.log("Decoded token:", decodedToken);
        
        if (decodedToken) {
          const userRole = decodedToken.role || "USER";
          const userEmail = decodedToken.email || decodedToken.sub || formData.email;
          const username = getDisplayName(decodedToken, userEmail);
          
          // Validate if user has access based on selected login type
          const hasAccess = validateRoleAccess(userRole, formData.loginAs);
          
          if (!hasAccess) {
            let errorMessage = "";
            if (formData.loginAs === "User") {
              errorMessage = "This account is not authorized for user login. Please use Restaurant login for vendor/delivery accounts.";
            } else {
              errorMessage = "This account is not authorized for restaurant login. Please use User login for admin/user accounts.";
            }
            
            setErrors({ submit: errorMessage });
            setIsLoading(false);
            return;
          }
          
          // Store user information in localStorage
          localStorage.setItem("userRole", userRole);
          localStorage.setItem("userEmail", userEmail);
          localStorage.setItem("username", username);
          
          // Store complete user data
          const userData = {
            role: userRole,
            email: userEmail,
            username: username,
            // Add other user data from token if available
            ...(decodedToken.userId && { userId: decodedToken.userId }),
            ...(decodedToken.vendorId && { vendorId: decodedToken.vendorId }),
            ...(decodedToken.partnerId && { partnerId: decodedToken.partnerId }),
            ...(decodedToken.name && { name: decodedToken.name }),
            ...(decodedToken.userName && { userName: decodedToken.userName }),
            ...(decodedToken.ownerName && { ownerName: decodedToken.ownerName }),
            ...(decodedToken.businessName && { businessName: decodedToken.businessName }),
          };
          localStorage.setItem("user", JSON.stringify(userData));

          console.log("Stored user data:", {
            role: userRole,
            email: userEmail,
            username: username,
            fullData: userData
          });

          // Determine redirect path based on role
          const redirectPath = getRedirectPath(userRole);
          console.log(`Redirecting ${userRole} (${username}) to: ${redirectPath}`);
          
          // Redirect based on role
          navigate(redirectPath);
        } else {
          // If we can't determine role, use default values and redirect to home
          console.warn("Could not determine user role from token, using defaults");
          const defaultUsername = getUsernameFromEmail(formData.email);
          localStorage.setItem("userRole", "USER");
          localStorage.setItem("userEmail", formData.email);
          localStorage.setItem("username", defaultUsername);
          localStorage.setItem("user", JSON.stringify({
            role: "USER",
            email: formData.email,
            username: defaultUsername
          }));
          navigate("/");
        }

        // If remember me is checked, also store email
        if (formData.rememberMe) {
          localStorage.setItem("rememberedEmail", formData.email);
        }
      } else {
        throw new Error("No token received from server");
      }
    } catch (error) {
      console.error("Login error:", error);

      let errorMessage = "Failed to login. Please try again.";

      if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
        errorMessage =
          "Network error: Cannot connect to server. Please ensure the backend is running on http://localhost:8080";
      } else if (error.code === "ECONNREFUSED") {
        errorMessage =
          "Connection refused: The backend server is not running or not accessible on http://localhost:8080";
      } else if (error.response) {
        const status = error.response.status;
        const responseData = error.response.data;

        if (status === 401 || status === 403) {
          errorMessage = responseData?.message || "Invalid email or password";
        } else if (status === 404) {
          errorMessage =
            "Login endpoint not found. Please check the backend configuration.";
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

      {/* Right Section - Login Form */}
      <div className="w-full md:w-3/5 bg-white flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Title */}
          <h2 className="text-4xl font-bold text-gray-800 mb-2">
            Welcome Back!
          </h2>
          <p className="text-gray-600 mb-8">Sign in to your account</p>

          {/* Error Message */}
          {errors.submit && (
            <div className="mb-4 p-3 rounded-lg text-white text-sm bg-red-500">
              {errors.submit}
            </div>
          )}

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
                  placeholder="Enter your email"
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
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  style={{ borderColor: "#CCCCCC" }}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? (
                    <HiEyeOff className="w-5 h-5" />
                  ) : (
                    <HiEye className="w-5 h-5" />
                  )}
                </button>
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
              <a
                href="/forgot-password"
                className="font-medium"
                style={{ color: "#F5B800" }}
              >
                Forgot password?
              </a>
            </div>

            {/* Sign In Button */}
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
                <span>Signing in...</span>
              ) : (
                <>
                  <FaArrowRight className="w-5 h-5" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Account Management Links */}
          <div className="mt-8 space-y-4 text-center">
            <p className="text-gray-700">
              Don't have an account?{" "}
              <a
                href="/signup"
                className="font-medium"
                style={{ color: "#F5B800" }}
              >
                Sign up here
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
                  href="/vendor-signup"
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
    </div>
  );
};

export default Login;