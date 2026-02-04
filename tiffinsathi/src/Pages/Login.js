import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../helpers/api";
import authStorage from "../helpers/authStorage";
import { jwtDecode } from "jwt-decode";
import {
  HiMail,
  HiLockClosed,
  HiCheckCircle,
  HiInformationCircle,
  HiChevronDown,
  HiArrowLeft,
  HiEye,
  HiEyeOff,
} from "react-icons/hi";
import { FaArrowRight } from "react-icons/fa";
import loginBg from "../assets/login.jpg";
import logo from "../assets/logo.png";
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    loginAs: "User",
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Check URL parameters for messages and redirect
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const message = searchParams.get('message');
    const redirect = searchParams.get('redirect');
    
    if (message) {
      toast.info(decodeURIComponent(message));
    }
    
    // Check if user is already logged in
    const token = authStorage.getToken();
    const userRole = authStorage.getUserRole();
    
    if (token && userRole) {
      // User is already logged in, redirect to appropriate portal
      const redirectPath = getRedirectPath(userRole);
      
      // Use setTimeout to ensure redirect happens after component mounts
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 100);
    }
  }, [location, navigate]);

  useEffect(() => {
    if (!errors.submit) return;
    toast.error(errors.submit);
    setErrors((prev) => ({ ...prev, submit: "" }));
  }, [errors.submit]);

  // Function to decode JWT token and extract role
  const decodeToken = (token) => {
    try {
      return jwtDecode(token);
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  // Function to determine redirect path based on role
  const getRedirectPath = (role) => {
    switch (role?.toUpperCase()) {
      case "ADMIN":
        return "/admin";
      case "DELIVERY":
        return "/delivery";  // ✅ CHANGED: Fixed to just "/delivery"
      case "VENDOR":
        return "/vendor/dashboard";
      case "USER":
      default:
        return "/";
    }
  };

  // Function to validate if user role matches the selected login type
  const validateRoleAccess = (userRole, loginType) => {
    const userRoles = ["USER", "ADMIN"];
    const restaurantRoles = ["VENDOR", "DELIVERY"];

    if (loginType === "User" && userRoles.includes(userRole.toUpperCase())) {
      return true;
    }
    if (loginType === "Restaurant" && restaurantRoles.includes(userRole.toUpperCase())) {
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
      toast.error("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    try {
      // Use the API helper for login
      const response = await api.login(formData.email, formData.password);

      if (!response.ok) {
        let errorMessage = "Failed to login";
        
        if (response.data?.message) {
          errorMessage = response.data.message;
        } else if (response.status === 403) {
          errorMessage = "Access denied. Please check your credentials.";
        } else if (response.status === 401) {
          errorMessage = "Invalid email or password.";
        }
        
        throw new Error(errorMessage);
      }

      // Extract token from response
      const token = response.data?.token || response.data?.accessToken;
      
      if (!token) {
        throw new Error("No authentication token received");
      }

      // Decode token to get user role and info
      const decodedToken = decodeToken(token);
      const userRole = decodedToken?.role || "USER";
      const userEmail = decodedToken?.email || decodedToken?.sub || formData.email;
      const username = getDisplayName(decodedToken, userEmail);
      
      // Debug logging
      console.log("🔍 User role from token:", userRole);
      console.log("🔍 Decoded token data:", decodedToken);
      console.log("🔍 Login type selected:", formData.loginAs);
      
      // Validate if user has access based on selected login type
      const hasAccess = validateRoleAccess(userRole, formData.loginAs);
      
      console.log("🔍 Has access?", hasAccess);
      
      if (!hasAccess) {
        let errorMessage = "";
        if (formData.loginAs === "User") {
          errorMessage = "This account is not authorized for user login. Please use Restaurant login for vendor/delivery accounts.";
        } else {
          errorMessage = "This account is not authorized for restaurant login. Please use User login for admin/user accounts.";
        }
        
        toast.error(errorMessage);
        setIsLoading(false);
        return;
      }
      
      // Create user data object
      const userData = {
        role: userRole.toUpperCase(),
        email: userEmail,
        username: username,
        // Add other user data from token if available
        ...(decodedToken?.userId && { userId: decodedToken.userId }),
        ...(decodedToken?.vendorId && { vendorId: decodedToken.vendorId }),
        ...(decodedToken?.partnerId && { partnerId: decodedToken.partnerId }),
        ...(decodedToken?.name && { name: decodedToken.name }),
        ...(decodedToken?.userName && { userName: decodedToken.userName }),
        ...(decodedToken?.ownerName && { ownerName: decodedToken.ownerName }),
        ...(decodedToken?.businessName && { businessName: decodedToken.businessName }),
      };
      
      // ✅ CRITICAL FIX: Store BOTH token and user data
      authStorage.setToken(token, formData.rememberMe);
      authStorage.setUser(userData, formData.rememberMe);
      
      console.log("✅ Login successful - Token stored:", !!authStorage.getToken());
      console.log("✅ User data stored:", userData);

      // Get redirect path from URL or based on role
      const searchParams = new URLSearchParams(location.search);
      const redirectParam = searchParams.get('redirect');
      
      let redirectPath;
      if (redirectParam && redirectParam !== '/login') {
        redirectPath = redirectParam;
      } else {
        redirectPath = getRedirectPath(userRole);
      }
      
      console.log(`📍 Redirecting ${userRole} to: ${redirectPath}`);
      
      // Clear any errors and redirect
      setErrors({});
      
      // Use window.location.href for a full page reload to ensure clean state
      window.location.href = redirectPath;
      
    } catch (error) {
      console.error("❌ Login error:", error);
      toast.error(error.message || "Login failed. Please try again.");
      setErrors({ submit: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col md:flex-row">
      {/* Back Button */}
      <button
        type="button"
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 z-50 flex items-center gap-2 text-white px-3 py-2 rounded-lg shadow-md transition-colors"
        aria-label="Back to Home"
        style={{ backgroundColor: "#F5B800" }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e0a500")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#F5B800")}
      >
        <HiArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium">Back</span>
      </button>

      {/* Left Section - Background and Branding */}
      <div
        className="hidden md:flex md:w-2/5 lg:w-2/5 relative items-center justify-center"
        style={{
          backgroundImage: `url(${loginBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "300px",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom right, rgba(74, 140, 57, 0.8), rgba(245, 184, 0, 0.8))",
          }}
        ></div>

        <div className="relative z-10 text-center px-6 lg:px-8 py-8 lg:py-12">
          <div className="flex justify-center mb-4 lg:mb-6">
            <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full bg-white p-3 lg:p-4 flex items-center justify-center shadow-lg">
              <img
                src={logo}
                alt="Tiffin Sathi Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <h1
            className="text-3xl lg:text-5xl font-bold text-white mb-2 lg:mb-3"
            style={{
              fontFamily: "'Brush Script MT', 'Lucida Handwriting', cursive",
            }}
          >
            Tiffin Sathi
          </h1>

          <p className="text-white text-sm lg:text-lg mb-6 lg:mb-8">
            Fresh Homemade Meals Delivered
          </p>

          <div className="space-y-3 lg:space-y-4 text-left max-w-xs mx-auto">
            <div className="flex items-center gap-2 lg:gap-3 text-white">
              <HiCheckCircle className="w-5 h-5 lg:w-6 lg:h-6 flex-shrink-0" />
              <span className="text-sm lg:text-base">Authentic Homemade Taste</span>
            </div>
            <div className="flex items-center gap-2 lg:gap-3 text-white">
              <HiCheckCircle className="w-5 h-5 lg:w-6 lg:h-6 flex-shrink-0" />
              <span className="text-sm lg:text-base">Daily Fresh Preparation</span>
            </div>
            <div className="flex items-center gap-2 lg:gap-3 text-white">
              <HiCheckCircle className="w-5 h-5 lg:w-6 lg:h-6 flex-shrink-0" />
              <span className="text-sm lg:text-base">Timely Delivery</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-center p-4 bg-gradient-to-r from-[#4A8C39] to-[#F5B800] text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white p-2 flex items-center justify-center shadow-md">
            <img
              src={logo}
              alt="Tiffin Sathi Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1
              className="text-2xl font-bold"
              style={{
                fontFamily: "'Brush Script MT', 'Lucida Handwriting', cursive",
              }}
            >
              Tiffin Sathi
            </h1>
            <p className="text-xs opacity-90">Fresh Homemade Meals Delivered</p>
          </div>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="flex-1 w-full md:w-3/5 lg:w-3/5 bg-white flex items-center justify-center px-4 sm:px-6 md:px-8 lg:px-12 py-8 md:py-12">
        <div className="w-full max-w-sm sm:max-w-md md:max-w-md">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-1 md:mb-2">
            Welcome Back!
          </h2>
          <p className="text-gray-600 text-sm sm:text-base md:text-base mb-6 md:mb-8">
            Sign in to your account
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
            <div>
              <label className="block text-left text-gray-700 font-medium mb-1 md:mb-2 text-sm sm:text-base">
                Login as
              </label>
              <div className="relative">
                <select
                  name="loginAs"
                  value={formData.loginAs}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent appearance-none bg-white text-sm sm:text-base"
                  style={{ borderColor: "#CCCCCC" }}
                >
                  <option value="User">User</option>
                  <option value="Restaurant">Restaurant</option>
                </select>
                <HiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-left text-gray-700 font-medium mb-1 md:mb-2 text-sm sm:text-base">
                Email Address<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <HiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-sm sm:text-base"
                  style={{ borderColor: "#CCCCCC" }}
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-left text-gray-700 font-medium mb-1 md:mb-2 text-sm sm:text-base">
                Password<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <HiLockClosed className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-9 sm:pl-10 pr-12 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-sm sm:text-base"
                  style={{ borderColor: "#CCCCCC" }}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? (
                    <HiEyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <HiEye className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="flex items-center gap-2 text-gray-700 text-sm sm:text-base">
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
                className="font-medium text-sm sm:text-base whitespace-nowrap"
                style={{ color: "#F5B800" }}
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 sm:py-3 rounded-lg font-bold text-white flex items-center justify-center gap-2 shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
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
                  <FaArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 sm:mt-8 space-y-3 sm:space-y-4 text-center">
            <p className="text-gray-700 text-sm sm:text-base">
              Don't have an account?{" "}
              <a
                href="/signup"
                className="font-medium"
                style={{ color: "#F5B800" }}
              >
                Sign up here
              </a>
            </p>
            <div className="flex items-center justify-center gap-2 text-gray-700 text-xs sm:text-sm">
              <HiInformationCircle
                className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
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