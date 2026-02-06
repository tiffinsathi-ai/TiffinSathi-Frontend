import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  HiHome,
  HiCube,
  HiCalendar,
  HiChevronDown,
  HiMenu,
  HiX,
  HiUserCircle,
  HiLogout,
} from "react-icons/hi";
import { UtensilsCrossed, Settings, Package, Clock, Bell } from "lucide-react";
import logo from "../../assets/logo.png";
import defaultUser from "../../assets/default-user.jpg";
import UserApi from "../../helpers/UserApi";
import authStorage from "../../helpers/authStorage";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const dropdownRef = useRef(null);

  // Fetch user data from database
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = authStorage.getToken();

      if (!token) {
        console.log("No token found");
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      console.log("Fetching user data...");

      // Try to get current user profile
      let userData;

      try {
        // First try the current user profile endpoint
        userData = await UserApi.getCurrentUserProfile();
        console.log("User data from profile endpoint:", userData);
      } catch (profileError) {
        console.log("Profile endpoint failed, trying other endpoints...");

        // If profile endpoint fails, try alternative endpoints
        try {
          // Try get user by ID or email
          const userEmail =
            localStorage.getItem("userEmail") ||
            JSON.parse(localStorage.getItem("user") || "{}").email;

          if (userEmail) {
            userData = await UserApi.getUserByEmail(userEmail);
          }
        } catch (userError) {
          console.log("User endpoint failed, checking localStorage...");

          // Fallback to localStorage
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            try {
              userData = JSON.parse(storedUser);
            } catch (parseError) {
              console.error("Error parsing stored user:", parseError);
            }
          }
        }
      }

      if (userData) {
        // Normalize user data to consistent structure
        const normalizedUser = {
          id: userData.id || userData.userId,
          userName:
            userData.userName || userData.name || userData.username || "User",
          email:
            userData.email ||
            userData.businessEmail ||
            localStorage.getItem("userEmail") ||
            "",
          phoneNumber: userData.phoneNumber || userData.phone,
          profilePicture:
            userData.profilePicture || userData.avatar || userData.image,
          role: userData.role || "USER",
          fullName:
            userData.fullName ||
            `${userData.firstName || ""} ${userData.lastName || ""}`.trim(),
        };

        setUser(normalizedUser);
        setProfilePicture(normalizedUser.profilePicture);
        setIsAuthenticated(true);

        // Store in localStorage for quick access
        localStorage.setItem("user", JSON.stringify(normalizedUser));
        console.log("User data set successfully:", normalizedUser);

        // Fetch notifications count - Commented out the hardcoded endpoint
        // fetchNotificationsCount();
      } else {
        // Create default user from localStorage
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setProfilePicture(parsedUser.profilePicture);
            setIsAuthenticated(true);
            console.log("Using stored user data:", parsedUser);
          } catch (parseError) {
            console.error("Error parsing stored user:", parseError);
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      // Fallback to localStorage
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setProfilePicture(parsedUser.profilePicture);
          setIsAuthenticated(true);
        } catch (parseError) {
          console.error("Error parsing stored user:", parseError);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    } finally {
      setLoading(false);
    }
  };

  // Remove the fetchNotificationsCount function since it contains the hardcoded endpoint
  // If you need to fetch notifications later, create a proper API helper function

  useEffect(() => {
    fetchUserData();

    // Set up interval to refresh user data periodically
    const interval = setInterval(fetchUserData, 300000); // Refresh every 5 minutes

    // Listen for user data updates from profile page
    const handleUserDataUpdated = (event) => {
      console.log("User data updated event received:", event.detail);
      if (event.detail) {
        setUser(event.detail);
        setProfilePicture(event.detail.profilePicture);
        localStorage.setItem("user", JSON.stringify(event.detail));
      }
    };

    window.addEventListener("userDataUpdated", handleUserDataUpdated);

    // Listen for auth changes
    const handleAuthChange = () => {
      console.log("Auth change detected, refetching user data");
      fetchUserData();
    };

    window.addEventListener("authChange", handleAuthChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("userDataUpdated", handleUserDataUpdated);
      window.removeEventListener("authChange", handleAuthChange);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    // Clear all auth data
    authStorage.clearAuth();
    localStorage.removeItem("user");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("username");
    sessionStorage.clear();

    // Reset state
    setIsAuthenticated(false);
    setUser(null);
    setProfilePicture(null);
    setShowDropdown(false);
    setMobileMenuOpen(false);

    // Dispatch auth change event
    window.dispatchEvent(new Event("authChange"));

    // Navigate to login
    navigate("/login");
  };

  const getDisplayName = () => {
    if (loading) return "Loading...";
    if (!user) return "User";

    return user.userName || user.fullName || "User";
  };

  const getUserEmail = () => {
    if (!user) return "";
    return user.email || "";
  };

  const getProfilePictureSrc = () => {
    if (profilePicture) {
      if (
        typeof profilePicture === "string" &&
        profilePicture.startsWith("data:")
      ) {
        return profilePicture;
      }
      if (typeof profilePicture === "string") {
        // If it's a base64 string without data URL prefix
        if (profilePicture.startsWith("/9j/") || profilePicture.length > 1000) {
          return `data:image/jpeg;base64,${profilePicture}`;
        }
        return profilePicture;
      }
    }
    return defaultUser;
  };

  const navItems = [
    {
      id: "home",
      label: "Home",
      icon: <HiHome className="w-5 h-5" />,
      path: "/",
    },
    {
      id: "packages",
      label: "Packages",
      icon: <HiCube className="w-5 h-5" />,
      path: "/packages",
    },
    {
      id: "restaurant",
      label: "Restaurant",
      icon: <UtensilsCrossed className="w-5 h-5" />,
      path: "/restaurants",
    },
    {
      id: "subscription",
      label: "My Subscription",
      icon: <HiCalendar className="w-5 h-5" />,
      path: "/user/subscriptions",
    },
  ];

  const isNavItemActive = (item) => {
    const path = location.pathname;

    if (item.id === "home") return path === "/";

    // Keep Packages highlighted through the whole subscribe flow
    if (item.id === "packages") {
      return (
        path === "/packages" ||
        path === "/schedule-customization" ||
        path === "/checkout" ||
        path.startsWith("/payment/")
      );
    }

    if (item.id === "restaurant") {
      return path === "/restaurants" || path.startsWith("/restaurants/");
    }

    if (item.id === "subscription") {
      return (
        path === "/user/subscriptions" ||
        path.startsWith("/user/subscriptions/")
      );
    }

    return path === item.path;
  };

  const profileMenuItems = [
    {
      id: "profile",
      label: "My Profile",
      icon: <HiUserCircle className="w-5 h-5" />,
      action: () => navigate("/user/profile"),
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings className="w-5 h-5" />,
      action: () => navigate("/user/settings"),
    },
  ];

  if (loading) {
    return (
      <header className="relative bg-white w-full px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between border-b border-gray-200">
        {/* Logo Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          <img
            src={logo}
            alt="Tiffin Sathi Logo"
            className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
          />
          <h1
            className="text-lg sm:text-xl lg:text-2xl font-bold"
            style={{
              fontFamily: "'Brush Script MT', 'Lucida Handwriting', cursive",
              color: "#4A8C39",
            }}
          >
            Tiffin Sathi
          </h1>
        </div>

        {/* Loading state for right section */}
        <div className="hidden md:flex items-center gap-4">
          <div className="animate-pulse bg-gray-200 h-8 w-8 rounded-full"></div>
          <div className="animate-pulse bg-gray-200 h-4 w-24 rounded"></div>
        </div>

        {/* Mobile menu button skeleton */}
        <div className="md:hidden animate-pulse bg-gray-200 h-8 w-8 rounded"></div>
      </header>
    );
  }

  return (
    <header className="relative bg-white w-full px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between border-b border-gray-200 shadow-sm">
      {/* Logo Section */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Link to="/" className="flex items-center gap-2 sm:gap-3">
          <img
            src={logo}
            alt="Tiffin Sathi Logo"
            className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
          />
          <h1
            className="text-lg sm:text-xl lg:text-2xl font-bold"
            style={{
              fontFamily: "'Brush Script MT', 'Lucida Handwriting', cursive",
              color: "#4A8C39",
            }}
          >
            Tiffin Sathi
          </h1>
        </Link>
      </div>

      {/* Navigation Links - Centered */}
      <nav className="hidden md:flex items-center gap-2 lg:gap-4 absolute left-1/2 transform -translate-x-1/2">
        {navItems.map((item) => {
          const isActive = isNavItemActive(item);
          const Component = item.path === "#" ? "button" : Link;
          const props = item.path === "#" ? {} : { to: item.path };

          return (
            <Component
              key={item.id}
              {...props}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-sm font-medium shadow-sm transition-colors ${
                isActive ? "text-white" : "text-gray-600 hover:text-gray-800"
              }`}
              style={isActive ? { backgroundColor: "#F5B800" } : {}}
              onMouseEnter={(e) => {
                if (isActive) {
                  e.currentTarget.style.backgroundColor = "#e0a500";
                } else {
                  e.currentTarget.style.color = "#1f2937";
                }
              }}
              onMouseLeave={(e) => {
                if (isActive) {
                  e.currentTarget.style.backgroundColor = "#F5B800";
                } else {
                  e.currentTarget.style.color = "#4b5563";
                }
              }}
            >
              {item.icon}
              <span className="hidden lg:inline">{item.label}</span>
            </Component>
          );
        })}
      </nav>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? (
          <HiX className="w-6 h-6" />
        ) : (
          <HiMenu className="w-6 h-6" />
        )}
      </button>

      {/* Desktop Login Button or Profile Dropdown */}
      <div className="hidden md:flex items-center gap-4">
        {isAuthenticated && user ? (
          <>
            {/* Notifications */}
            <button
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => navigate("/user/notifications")}
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {/* Removed unread notifications badge since we removed the endpoint */}
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors hover:bg-gray-100"
              >
                {/* Profile picture with border */}
                <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-300 shadow-sm bg-gray-200">
                  <img
                    src={getProfilePictureSrc()}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = defaultUser;
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-800 hidden lg:inline">
                  {getDisplayName()}
                </span>
                <HiChevronDown
                  className={`w-4 h-4 text-gray-800 transition-transform ${
                    showDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
                  {/* User Info Section */}
                  <div className="px-4 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                      {/* Profile picture with border */}
                      <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-300 shadow-sm bg-gray-200">
                        <img
                          src={getProfilePictureSrc()}
                          alt="Profile"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = defaultUser;
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {getDisplayName()}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {getUserEmail()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    {profileMenuItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setShowDropdown(false);
                          item.action();
                        }}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors text-left"
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Logout */}
                  <div className="border-t border-gray-200">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      <HiLogout className="w-5 h-5 text-red-600" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-white px-4 py-2 rounded-lg inline-flex items-center gap-1.5 text-sm font-medium shadow-sm transition-colors"
              style={{ backgroundColor: "#F5B800" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#e0a500")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#F5B800")
              }
            >
              <span>Login</span>
            </Link>
          </div>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Sidebar */}
      <div
        className={`
        md:hidden fixed top-0 left-0 h-full w-full max-w-sm bg-white z-50 transform transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="flex flex-col h-full">
          {/* Profile Section at the Top */}
          <div className="bg-white p-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              {/* Profile picture with border */}
              <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-300 shadow-sm bg-gray-200">
                <img
                  src={getProfilePictureSrc()}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = defaultUser;
                  }}
                />
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="font-bold text-lg text-gray-900 truncate">
                  {isAuthenticated && user ? getDisplayName() : "Guest"}
                </div>
                {isAuthenticated && user && (
                  <>
                    <div className="text-sm text-gray-600 truncate mt-1">
                      {getUserEmail()}
                    </div>
                    {/* Removed notifications section */}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="flex-1 overflow-y-auto">
            {/* Main Navigation */}
            <div className="p-4 border-b border-gray-100">
              <div className="space-y-2">
                {navItems.map((item) => {
                  const isActive = isNavItemActive(item);
                  const Component = item.path === "#" ? "button" : Link;
                  const props = item.path === "#" ? {} : { to: item.path };

                  return (
                    <Component
                      key={item.id}
                      {...props}
                      className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                        isActive
                          ? "text-white hover:bg-yellow-600"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                      style={isActive ? { backgroundColor: "#F5B800" } : {}}
                      onClick={() => {
                        setMobileMenuOpen(false);
                      }}
                    >
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                    </Component>
                  );
                })}
              </div>
            </div>

            {/* Profile Menu */}
            {isAuthenticated && user && (
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
                  Account
                </h3>
                <div className="space-y-2">
                  {profileMenuItems.map((item) => (
                    <button
                      key={item.id}
                      className="w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        item.action();
                      }}
                    >
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-200 p-4">
            {isAuthenticated && user ? (
              <>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 rounded-lg flex items-center justify-center gap-3 text-red-600 hover:bg-red-50 transition-colors font-medium"
                >
                  <HiLogout className="w-5 h-5" />
                  <span>Logout</span>
                </button>
                <p className="text-xs text-gray-500 text-center mt-3">
                  © {new Date().getFullYear()} Tiffin Sathi
                </p>
              </>
            ) : (
              <Link
                to="/login"
                className="w-full block text-center text-white px-4 py-3 rounded-lg font-medium shadow-sm transition-colors"
                style={{ backgroundColor: "#F5B800" }}
                onClick={() => setMobileMenuOpen(false)}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#e0a500")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#F5B800")
                }
              >
                Login to Your Account
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;