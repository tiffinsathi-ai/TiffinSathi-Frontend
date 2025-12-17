import React, { useState, useEffect } from "react";
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
import { UtensilsCrossed, Settings } from "lucide-react";
import logo from "../../assets/logo.png";
import defaultUser from "../../assets/default-user.jpg";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const checkAuthStatus = () => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    console.log("Header - Checking auth status:", { token });

    if (token) {
      setIsAuthenticated(true);
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          console.log("Header - Parsed user data:", parsedUser);
          
          // Use consistent field names - only check userName and email
          setUser({
            userName: parsedUser.userName || parsedUser.name || parsedUser.username || "User",
            email: parsedUser.email || "",
            role: parsedUser.role 
          });
          
          setProfilePicture(parsedUser.profilePicture || null);
        } catch (error) {
          console.error("Error parsing user data:", error);
          setUser({ 
            userName: "User", 
            email: ""
          });
          setProfilePicture(null);
        }
      } else {
        setUser({ 
          userName: "User", 
          email: ""
        });
        setProfilePicture(null);
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
      setProfilePicture(null);
    }
  };

  useEffect(() => {
    checkAuthStatus();

    const handleStorageChange = () => {
      console.log("Header - Storage changed, checking auth status");
      checkAuthStatus();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", checkAuthStatus);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", checkAuthStatus);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
    setProfilePicture(null);
    setShowDropdown(false);
    setMobileMenuOpen(false);
    navigate("/login");
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

  const getDisplayName = () => {
    if (!user) return "User";
    return user.userName || "User";
  };

  const getUserEmail = () => {
    if (!user) return "";
    return user.email || "";
  };


  const getProfilePictureSrc = () => {
    if (profilePicture) {
      if (typeof profilePicture === 'string' && profilePicture.startsWith('data:')) {
        return profilePicture;
      }
      if (typeof profilePicture === 'string' && (profilePicture.startsWith('/9j/') || profilePicture.length > 1000)) {
        return `data:image/jpeg;base64,${profilePicture}`;
      }
      if (typeof profilePicture === 'string') {
        return profilePicture;
      }
    }
    return defaultUser;
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: <HiHome className="w-5 h-5" />, active: true },
    { id: 'packages', label: 'Packages', icon: <HiCube className="w-5 h-5" /> },
    { id: 'restaurant', label: 'Restaurant', icon: <UtensilsCrossed className="w-5 h-5" /> },
    { id: 'subscription', label: 'My Subscription', icon: <HiCalendar className="w-5 h-5" /> },
  ];

  const profileMenuItems = [
    { id: 'profile', label: 'My Profile', icon: <HiUserCircle className="w-5 h-5" />, action: () => navigate("/profile") },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" />, action: () => navigate("/settings") },
  ];

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

      {/* Navigation Links - Centered */}
      <nav className="flex items-center gap-4 absolute left-1/2 transform -translate-x-1/2">
        {/* Home */}
        <Link
          to="/"
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-sm font-medium shadow-sm transition-colors ${
            location.pathname === "/"
              ? "text-white"
              : "text-gray-600 hover:text-gray-800"
          }`}
          style={
            location.pathname === "/" ? { backgroundColor: "#F5B800" } : {}
          }
          onMouseEnter={(e) => {
            if (location.pathname !== "/") {
              e.currentTarget.style.color = "#1f2937";
            }
          }}
          onMouseLeave={(e) => {
            if (location.pathname !== "/") {
              e.currentTarget.style.color = "#4b5563";
            }
          }}
        >
          <HiHome className="w-4 h-4" />
          <span>Home</span>
        </Link>

        {/* Packages */}
        <Link
          to="/packages"
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-sm font-medium shadow-sm transition-colors ${
            location.pathname === "/packages"
              ? "text-white"
              : "text-gray-600 hover:text-gray-800"
          }`}
          style={
            location.pathname === "/packages"
              ? { backgroundColor: "#F5B800" }
              : {}
          }
          onMouseEnter={(e) => {
            if (location.pathname !== "/packages") {
              e.currentTarget.style.color = "#1f2937";
            }
          }}
          onMouseLeave={(e) => {
            if (location.pathname !== "/packages") {
              e.currentTarget.style.color = "#4b5563";
            }
          }}
        >
          <HiCube className="w-4 h-4" />
          <span>Packages</span>
        </Link>

        {/* Restaurant - Inactive */}
        <button className="px-3 py-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors">
          <UtensilsCrossed className="w-4 h-4" style={{ color: "#212529" }} />
          <span>Restaurant</span>
        </button>

        {/* My Subscription - Inactive */}
        <button className="px-3 py-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors">
          <HiCalendar className="w-4 h-4" />
          <span>My Subscription</span>
        </button>
      </nav>

      {/* Desktop Navigation Links - Centered */}
      <nav className="hidden md:flex items-center gap-2 lg:gap-4 absolute left-1/2 transform -translate-x-1/2">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-sm font-medium shadow-sm transition-colors ${
              item.active 
                ? 'text-white' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
            style={item.active ? { backgroundColor: "#F5B800" } : {}}
            onMouseEnter={(e) => item.active && (e.currentTarget.style.backgroundColor = "#e0a500")}
            onMouseLeave={(e) => item.active && (e.currentTarget.style.backgroundColor = "#F5B800")}
          >
            {item.icon}
            <span className="hidden lg:inline">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Desktop Login Button or Profile Dropdown */}
      <div className="hidden md:block">
        {isAuthenticated && user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors hover:bg-gray-100"
            >
              {/* Updated profile picture with visible border */}
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
              <HiChevronDown className={`w-4 h-4 text-gray-800 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
                {/* User Info Section */}
                <div className="px-4 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    {/* Updated profile picture with visible border */}
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
        ) : (
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
      <div className={`
        md:hidden fixed top-0 left-0 h-full w-full max-w-sm bg-white z-50 transform transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Profile Section at the Top */}
          <div className="bg-white p-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              {/* Updated profile picture with visible border */}
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
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                      item.active
                        ? 'text-white hover:bg-yellow-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    style={item.active ? { backgroundColor: "#F5B800" } : {}}
                    onClick={() => {
                      setMobileMenuOpen(false);
                    }}
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
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
              <>
                <Link
                  to="/login"
                  className="w-full block text-center text-white px-4 py-3 rounded-lg font-medium shadow-sm transition-colors mb-3"
                  style={{ backgroundColor: "#F5B800" }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login to Your Account
                </Link>
                <p className="text-xs text-gray-500 text-center">
                  Don't have an account?{' '}
                  <Link 
                    to="/register" 
                    className="text-yellow-600 hover:underline font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign up
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;