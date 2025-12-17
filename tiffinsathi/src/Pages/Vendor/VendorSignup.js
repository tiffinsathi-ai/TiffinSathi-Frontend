import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Upload,
  CheckCircle,
  AlertCircle,
  Camera,
  User,
  MapPin,
  Briefcase,
  CreditCard,
  FileText,
  ChefHat,
  ArrowLeft,
} from "lucide-react";
import loginBg from "../../assets/login.jpg";

const CLOUD_NAME = "dew6wizbh";
const UPLOAD_PRESET = "Tiffin";

const uploadFileToCloudinary = async (file) => {
  if (!file) return null;
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  console.log(`Uploading file: ${file.name} to Cloudinary...`);
  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      throw new Error(
        `Cloudinary upload failed with status ${response.status}`
      );
    }
    const data = await response.json();
    console.log("Cloudinary response data:", data);
    return data.secure_url;
  } catch (error) {
    console.error("Error during Cloudinary upload:", error);
    throw new Error(
      "File upload service failed. Please check network and file size."
    );
  }
};

// Convert file to base64
const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

const designTokens = {
  colors: {
    primary: {
      main: "#4A8C39",
      hover: "#3a6d2a",
    },
    accent: {
      yellow: "#F5B800",
      yellowHover: "#e0a500",
    },
    background: {
      primary: "#FFFFFF",
      light: "#F9FAFB",
    },
    text: {
      primary: "#212529",
      secondary: "#6C757D",
    },
    border: {
      light: "#E9ECEF",
    },
    error: {
      red: "#D94826",
    },
  },
};

const VendorSignup = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
    alternatePhone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    cuisineTypes: [],
    yearsInBusiness: "",
    capacity: "",
    priceRange: "",
    description: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    accountHolderName: "",
    panNumber: "",
    fssaiNumber: "",
    termsAccepted: false,
    businessImage: null,
  });
  const [documents, setDocuments] = useState({
    fssaiLicense: null,
    panCard: null,
    bankProof: null,
    menuCard: null,
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Simplified cuisine options as requested
  const cuisineOptions = [
    "Vegetarian",
    "Non-Vegetarian", 
    "Vegan",
    "Gluten-Free"
  ];

  const steps = [
    { num: 1, title: "Business Info", icon: Briefcase },
    { num: 2, title: "Address", icon: MapPin },
    { num: 3, title: "Service Details", icon: ChefHat },
    { num: 4, title: "Bank & Legal", icon: CreditCard },
    { num: 5, title: "Documents", icon: FileText },
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Special handling for capacity (must be positive)
    if (name === "capacity") {
      const numValue = parseInt(value);
      const newValue = numValue < 1 ? "1" : value;
      setFormData((prev) => ({ ...prev, [name]: newValue }));
    } else {
      const newValue = type === "checkbox" ? checked : value;
      setFormData((prev) => ({ ...prev, [name]: newValue }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleCuisineChange = (cuisine) => {
    setFormData((prev) => ({
      ...prev,
      cuisineTypes: prev.cuisineTypes.includes(cuisine)
        ? prev.cuisineTypes.filter((c) => c !== cuisine)
        : [...prev.cuisineTypes, cuisine],
    }));
  };

  const handleFileChange = (e, docType) => {
    const file = e.target.files[0];
    if (file) {
      setDocuments((prev) => ({ ...prev, [docType]: file }));
      if (errors[docType]) {
        setErrors((prev) => ({ ...prev, [docType]: "" }));
      }
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, businessImage: file }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.businessName) newErrors.businessName = "Required";
      if (!formData.ownerName) newErrors.ownerName = "Required";
      if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email))
        newErrors.email = "Valid email required";
      if (!formData.phone || !/^\d{10}$/.test(formData.phone))
        newErrors.phone = "Valid 10-digit phone required";
    }

    if (step === 2) {
      if (!formData.address) newErrors.address = "Required";
      if (!formData.city) newErrors.city = "Required";
      if (!formData.state) newErrors.state = "Required";
      // Updated pincode validation: any number, not just 6 digits
      if (!formData.pincode || !/^\d+$/.test(formData.pincode))
        newErrors.pincode = "Valid pincode required";
    }

    if (step === 3) {
      if (formData.cuisineTypes.length === 0)
        newErrors.cuisineTypes = "Select at least one cuisine";
    }

    if (step === 4) {
      if (!formData.fssaiNumber) newErrors.fssaiNumber = "Required";
    }

    if (step === 5) {
      if (!documents.fssaiLicense) newErrors.fssaiLicense = "Required";
      if (!documents.panCard) newErrors.panCard = "Required";
      if (!formData.termsAccepted) newErrors.terms = "You must accept terms";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) {
      toast.error(
        "Please fill out all required fields and upload required documents."
      );
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setSubmitError("");

    try {
      // Convert business image to base64
      let profilePictureBase64 = null;
      if (formData.businessImage instanceof File) {
        profilePictureBase64 = await convertToBase64(formData.businessImage);
      }

      // Upload documents to Cloudinary
      const uploadedDocumentUrls = {};
      const documentKeys = Object.keys(documents);

      const uploadPromises = documentKeys.map((key) =>
        documents[key]
          ? uploadFileToCloudinary(documents[key]).then((url) => ({ key, url }))
          : null
      );

      const results = await Promise.all(
        uploadPromises.filter((p) => p !== null)
      );
      results.forEach((result) => {
        // Map frontend document keys to backend field names
        const backendFieldName = {
          fssaiLicense: "fssaiLicenseUrl",
          panCard: "panCardUrl", 
          bankProof: "bankProofUrl",
          menuCard: "menuCardUrl"
        }[result.key];
        
        if (backendFieldName) {
          uploadedDocumentUrls[backendFieldName] = result.url;
        }
      });

      // Prepare data for API submission
      const nullIfEmpty = (value) =>
        value && value.trim() !== "" ? value.trim() : null;

      // Combine address fields into business_address
      const addressParts = [
        formData.address,
        formData.city,
        formData.state,
        formData.pincode,
      ].filter((part) => part && part.trim() !== "");
      const businessAddress =
        addressParts.length > 0 ? addressParts.join(", ") : null;

      // Convert cuisine types array to comma-separated string
      const cuisineType =
        formData.cuisineTypes.length > 0
          ? formData.cuisineTypes.join(", ")
          : null;

      // Convert years_in_business to integer if provided
      const yearsInBusiness =
        formData.yearsInBusiness && formData.yearsInBusiness.trim() !== ""
          ? parseInt(formData.yearsInBusiness, 10)
          : 0;

      // Convert capacity to integer (minimum 1)
      const capacity = formData.capacity && formData.capacity.trim() !== ""
        ? Math.max(1, parseInt(formData.capacity, 10))
        : null;

      // Validate required fields
      if (!formData.email || typeof formData.email !== "string") {
        throw new Error("Business email is required");
      }
      const trimmedEmail = formData.email.trim();
      if (!trimmedEmail || !/\S+@\S+\.\S+/.test(trimmedEmail)) {
        throw new Error("Please enter a valid business email address");
      }

      if (!formData.ownerName || typeof formData.ownerName !== "string") {
        throw new Error("Owner name is required");
      }
      const trimmedOwnerName = formData.ownerName.trim();
      if (!trimmedOwnerName) {
        throw new Error("Owner name cannot be empty");
      }

      if (!formData.businessName || typeof formData.businessName !== "string") {
        throw new Error("Business name is required");
      }
      const trimmedBusinessName = formData.businessName.trim();
      if (!trimmedBusinessName) {
        throw new Error("Business name cannot be empty");
      }

      if (!formData.phone || typeof formData.phone !== "string") {
        throw new Error("Phone number is required");
      }
      const trimmedPhone = formData.phone.trim();
      if (!trimmedPhone || !/^\d{10}$/.test(trimmedPhone)) {
        throw new Error("Valid 10-digit phone number is required");
      }

      if (!formData.fssaiNumber || typeof formData.fssaiNumber !== "string") {
        throw new Error("Food license number is required");
      }
      const trimmedFoodLicense = formData.fssaiNumber.trim();
      if (!trimmedFoodLicense) {
        throw new Error("Food license number cannot be empty");
      }

      // Build the payload with validated data
      const apiPayload = {
        userName: trimmedOwnerName,
        businessName: trimmedBusinessName,
        phoneNumber: trimmedPhone,
        email: trimmedEmail,
        password: "defaultPassword123", // Set a default password
        profilePicture: profilePictureBase64, // Base64 string
        businessAddress: businessAddress,
        alternatePhone: nullIfEmpty(formData.alternatePhone),
        yearsInBusiness: yearsInBusiness,
        cuisineType: cuisineType,
        capacity: capacity, // Positive number only
        description: nullIfEmpty(formData.description),
        bankName: nullIfEmpty(formData.bankName),
        accountNumber: nullIfEmpty(formData.accountNumber),
        branchName: nullIfEmpty(formData.ifscCode),
        accountHolderName: nullIfEmpty(formData.accountHolderName),
        panNumber: nullIfEmpty(formData.panNumber),
        vatNumber: null,
        foodLicenseNumber: trimmedFoodLicense,
        companyRegistrationNumber: null,
        ...uploadedDocumentUrls,
      };

      console.log("Submitting vendor registration...");
      console.log("API Payload:", JSON.stringify({
        ...apiPayload,
        profilePicture: profilePictureBase64 ? "base64_image_data" : null
      }, null, 2));

      // Send data to backend API
      await axios.post(
        "http://localhost:8080/auth/signup/vendor",
        apiPayload,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      console.log("✅ Vendor registration successful");
      setSubmitted(true);
    } catch (error) {
      console.error("Submission Error:", error);
      
      let errorMessage = "Failed to register. Please try again.";

    if (error.response) {
      const status = error.response.status;
      const responseData = error.response.data;

      if (status === 403) {
        errorMessage = "Access forbidden. Please check CORS configuration on the server.";
      } else if (status === 400) {
        errorMessage = responseData?.message || "Invalid data. Please check all fields.";
      } else if (status === 409) {
        errorMessage = responseData?.message || "Email or phone number already registered.";
      } else if (status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else {
        errorMessage = `Server error (${status}). Please try again.`;
      }
    } else if (error.code === "ERR_NETWORK") {
      errorMessage = "Cannot connect to server. Please ensure the backend is running on http://localhost:8080";
    } else if (error.code === "ECONNREFUSED") {
      errorMessage = "Connection refused. Please check if the backend server is running.";
    } else if (error.message) {
      errorMessage = error.message;
    }

    setSubmitError(errorMessage);
  } finally {
    setIsSubmitting(false);
  }
  };

  const previewImageUrl = useMemo(() => {
    if (formData.businessImage instanceof File) {
      return URL.createObjectURL(formData.businessImage);
    }
    return null;
  }, [formData.businessImage]);

  const resetForm = () => {
    setSubmitted(false);
    setCurrentStep(1);
    setSubmitError("");
    setFormData({
      businessName: "",
      ownerName: "",
      email: "",
      phone: "",
      alternatePhone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      cuisineTypes: [],
      yearsInBusiness: "",
      capacity: "",
      priceRange: "",
      description: "",
      bankName: "",
      accountNumber: "",
      ifscCode: "",
      accountHolderName: "",
      panNumber: "",
      fssaiNumber: "",
      termsAccepted: false,
      businessImage: null,
    });
    setDocuments({
      fssaiLicense: null,
      panCard: null,
      bankProof: null,
      menuCard: null,
    });
    setErrors({});
  };

  if (submitted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4 relative"
        style={{
          backgroundImage: `url(${loginBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.85)",
          }}
        ></div>
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center relative z-10">
          <CheckCircle
            className="w-16 h-16 mx-auto mb-4"
            style={{ color: designTokens.colors.primary.main }}
          />
          <h2
            className="text-2xl font-bold mb-2"
            style={{ color: designTokens.colors.text.primary }}
          >
            Registration Submitted!
          </h2>
          <p
            className="mb-4"
            style={{ color: designTokens.colors.text.secondary }}
          >
            Thank you for registering with our tiffin service. Our team will
            review your application and get back to you within 2-3 business
            days.
          </p>
          <button
            onClick={resetForm}
            className="px-6 py-2 rounded-lg transition-colors text-white font-medium"
            style={{ backgroundColor: designTokens.colors.accent.yellow }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                designTokens.colors.accent.yellowHover)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor =
                designTokens.colors.accent.yellow)
            }
          >
            Submit Another Registration
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-8 px-4 relative"
      style={{
        backgroundImage: `url(${loginBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.85)",
        }}
      ></div>

      {/* Fixed Back Button - Responsive */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 z-20 p-2 sm:p-3 rounded-lg transition-colors flex items-center gap-2 text-white text-sm sm:text-base"
        style={{
          backgroundColor: "#F5B800",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#e0a500";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#F5B800";
        }}
      >
        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="font-medium">Back</span>
      </button>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div
            className="px-8 py-6 text-white"
            style={{
              background: `linear-gradient(to right, rgba(74, 140, 57, 0.9), rgba(245, 184, 0, 0.9))`,
            }}
          >
            <h1 className="text-3xl font-bold mb-2">Join Our Tiffin Network</h1>
            <p style={{ color: "rgba(255, 255, 255, 0.95)" }}>
              Register your tiffin service and reach thousands of hungry
              customers
            </p>
          </div>

          <div className="px-8 py-6">
            {submitError && (
              <div
                className="mb-6 p-4 rounded-lg text-white text-sm"
                style={{ backgroundColor: designTokens.colors.error.red }}
              >
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-1">Registration Failed</p>
                    <p>{submitError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Restored Original Progress Steps */}
            <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
              {steps.map((step, index) => (
                <div key={step.num} className="flex items-center flex-1 min-w-0">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition flex-shrink-0 ${
                        currentStep >= step.num ? "text-white" : "text-gray-500"
                      }`}
                      style={{
                        backgroundColor:
                          currentStep >= step.num
                            ? designTokens.colors.primary.main
                            : "#E9ECEF",
                      }}
                    >
                      <step.icon className="w-5 h-5 sm:w-5 sm:h-5" />
                    </div>
                    <p
                      className={`text-xs mt-2 font-medium text-center whitespace-nowrap ${
                        currentStep >= step.num ? "" : "text-gray-500"
                      }`}
                      style={{
                        color:
                          currentStep >= step.num
                            ? designTokens.colors.primary.main
                            : designTokens.colors.text.secondary,
                      }}
                    >
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-2 sm:mx-4 rounded transition flex-shrink ${
                        currentStep > step.num ? "" : "bg-gray-200"
                      }`}
                      style={{
                        backgroundColor:
                          currentStep > step.num
                            ? designTokens.colors.primary.main
                            : "#E9ECEF",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div
                      className="w-32 h-32 rounded-full flex items-center justify-center overflow-hidden"
                      style={{
                        backgroundColor: designTokens.colors.background.light,
                      }}
                    >
                      {previewImageUrl ? (
                        <img
                          src={previewImageUrl}
                          alt="Business"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User
                          className="w-16 h-16"
                          style={{ color: designTokens.colors.text.secondary }}
                        />
                      )}
                    </div>
                    <label
                      className="absolute bottom-0 right-0 p-2 text-white rounded-full cursor-pointer transition"
                      style={{
                        backgroundColor: designTokens.colors.accent.yellow,
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          designTokens.colors.accent.yellowHover)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          designTokens.colors.accent.yellow)
                      }
                    >
                      <Camera className="w-4 h-4" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                </div>

                <h2
                  className="text-xl font-semibold mb-4"
                  style={{ color: designTokens.colors.text.primary }}
                >
                  Business Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-sm font-medium mb-1 text-left"
                      style={{ color: designTokens.colors.text.primary }}
                    >
                      Business Name *
                    </label>
                    <input
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
                      style={{
                        border: `1px solid ${errors.businessName ? designTokens.colors.error.red : designTokens.colors.border.light}`,
                      }}
                    />
                    {errors.businessName && (
                      <p
                        className="text-xs mt-1"
                        style={{ color: designTokens.colors.error.red }}
                      >
                        {errors.businessName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium mb-1 text-left"
                      style={{ color: designTokens.colors.text.primary }}
                    >
                      Owner Name *
                    </label>
                    <input
                      type="text"
                      name="ownerName"
                      value={formData.ownerName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
                      style={{
                        border: `1px solid ${errors.ownerName ? designTokens.colors.error.red : designTokens.colors.border.light}`,
                      }}
                    />
                    {errors.ownerName && (
                      <p
                        className="text-xs mt-1"
                        style={{ color: designTokens.colors.error.red }}
                      >
                        {errors.ownerName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium mb-1 text-left"
                      style={{ color: designTokens.colors.text.primary }}
                    >
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
                      style={{
                        border: `1px solid ${errors.email ? designTokens.colors.error.red : designTokens.colors.border.light}`,
                      }}
                    />
                    {errors.email && (
                      <p
                        className="text-xs mt-1"
                        style={{ color: designTokens.colors.error.red }}
                      >
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium mb-1 text-left"
                      style={{ color: designTokens.colors.text.primary }}
                    >
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="10-digit number"
                      className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
                      style={{
                        border: `1px solid ${errors.phone ? designTokens.colors.error.red : designTokens.colors.border.light}`,
                      }}
                    />
                    {errors.phone && (
                      <p
                        className="text-xs mt-1"
                        style={{ color: designTokens.colors.error.red }}
                      >
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium mb-1 text-left"
                      style={{ color: designTokens.colors.text.primary }}
                    >
                      Alternate Phone
                    </label>
                    <input
                      type="tel"
                      name="alternatePhone"
                      value={formData.alternatePhone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
                      style={{
                        border: `1px solid ${designTokens.colors.border.light}`,
                      }}
                    />
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium mb-1 text-left"
                      style={{ color: designTokens.colors.text.primary }}
                    >
                      Years in Business
                    </label>
                    <input
                      type="number"
                      name="yearsInBusiness"
                      value={formData.yearsInBusiness}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
                      style={{
                        border: `1px solid ${designTokens.colors.border.light}`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <h2
                  className="text-xl font-semibold mb-4"
                  style={{ color: designTokens.colors.text.primary }}
                >
                  Address Details
                </h2>
                <div className="space-y-4">
                  <div>
                    <label
                      className="block text-sm font-medium mb-1 text-left"
                      style={{ color: designTokens.colors.text.primary }}
                    >
                      Complete Address *
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
                      style={{
                        border: `1px solid ${errors.address ? designTokens.colors.error.red : designTokens.colors.border.light}`,
                      }}
                    />
                    {errors.address && (
                      <p
                        className="text-xs mt-1"
                        style={{ color: designTokens.colors.error.red }}
                      >
                        {errors.address}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label
                        className="block text-sm font-medium mb-1 text-left"
                        style={{ color: designTokens.colors.text.primary }}
                      >
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
                        style={{
                          border: `1px solid ${errors.city ? designTokens.colors.error.red : designTokens.colors.border.light}`,
                        }}
                      />
                      {errors.city && (
                        <p
                          className="text-xs mt-1"
                          style={{ color: designTokens.colors.error.red }}
                        >
                          {errors.city}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium mb-1 text-left"
                        style={{ color: designTokens.colors.text.primary }}
                      >
                        State *
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
                        style={{
                          border: `1px solid ${errors.state ? designTokens.colors.error.red : designTokens.colors.border.light}`,
                        }}
                      />
                      {errors.state && (
                        <p
                          className="text-xs mt-1"
                          style={{ color: designTokens.colors.error.red }}
                        >
                          {errors.state}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium mb-1 text-left"
                        style={{ color: designTokens.colors.text.primary }}
                      >
                        Pincode *
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        placeholder="Enter pincode"
                        className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
                        style={{
                          border: `1px solid ${errors.pincode ? designTokens.colors.error.red : designTokens.colors.border.light}`,
                        }}
                      />
                      {errors.pincode && (
                        <p
                          className="text-xs mt-1"
                          style={{ color: designTokens.colors.error.red }}
                        >
                          {errors.pincode}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <h2
                  className="text-xl font-semibold mb-4"
                  style={{ color: designTokens.colors.text.primary }}
                >
                  Service Details
                </h2>
                <div>
                  <label
                    className="block text-sm font-medium mb-2 text-left"
                    style={{ color: designTokens.colors.text.primary }}
                  >
                    Cuisine Types * (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {cuisineOptions.map((cuisine) => (
                      <label
                        key={cuisine}
                        className="flex items-center space-x-2 cursor-pointer p-2 border rounded-lg hover:bg-gray-50 transition"
                        style={{
                          borderColor: designTokens.colors.border.light,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={formData.cuisineTypes.includes(cuisine)}
                          onChange={() => handleCuisineChange(cuisine)}
                          className="w-4 h-4 rounded"
                          style={{
                            accentColor: designTokens.colors.primary.main,
                            borderColor: designTokens.colors.border.light,
                          }}
                        />
                        <span
                          className="text-sm text-left"
                          style={{ color: designTokens.colors.text.primary }}
                        >
                          {cuisine}
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.cuisineTypes && (
                    <p
                      className="text-xs mt-1"
                      style={{ color: designTokens.colors.error.red }}
                    >
                      {errors.cuisineTypes}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-sm font-medium mb-1 text-left"
                      style={{ color: designTokens.colors.text.primary }}
                    >
                      Daily Capacity (Tiffins/Day)
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      min="1"
                      step="1"
                      className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
                      style={{
                        border: `1px solid ${designTokens.colors.border.light}`,
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-1">Minimum 1 tiffin per day</p>
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium mb-1 text-left"
                      style={{ color: designTokens.colors.text.primary }}
                    >
                      Price Range per Tiffin
                    </label>
                    <select
                      name="priceRange"
                      value={formData.priceRange}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
                      style={{
                        border: `1px solid ${designTokens.colors.border.light}`,
                      }}
                    >
                      <option value="">Select Range</option>
                      <option value="50-100">₹50 - ₹100</option>
                      <option value="100-150">₹100 - ₹150</option>
                      <option value="150-200">₹150 - ₹200</option>
                      <option value="200-250">₹200 - ₹250</option>
                      <option value="250+">₹250+</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    style={{ color: designTokens.colors.text.primary }}
                  >
                    Business Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Tell us about your tiffin service, specialties, etc."
                    className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      border: `1px solid ${designTokens.colors.border.light}`,
                    }}
                  />
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2
                    className="text-xl font-semibold mb-4"
                    style={{ color: designTokens.colors.text.primary }}
                  >
                    Bank Account Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        className="block text-sm font-medium mb-1 text-left"
                        style={{ color: designTokens.colors.text.primary }}
                      >
                        Bank Name
                      </label>
                      <input
                        type="text"
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
                        style={{
                          border: `1px solid ${designTokens.colors.border.light}`,
                        }}
                      />
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium mb-1 text-left"
                        style={{ color: designTokens.colors.text.primary }}
                      >
                        Account Holder Name
                      </label>
                      <input
                        type="text"
                        name="accountHolderName"
                        value={formData.accountHolderName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
                        style={{
                          border: `1px solid ${designTokens.colors.border.light}`,
                        }}
                      />
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium mb-1 text-left"
                        style={{ color: designTokens.colors.text.primary }}
                      >
                        Account Number
                      </label>
                      <input
                        type="text"
                        name="accountNumber"
                        value={formData.accountNumber}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
                        style={{
                          border: `1px solid ${designTokens.colors.border.light}`,
                        }}
                      />
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium mb-1 text-left"
                        style={{ color: designTokens.colors.text.primary }}
                      >
                        Branch Name
                      </label>
                      <input
                        type="text"
                        name="ifscCode"
                        value={formData.ifscCode}
                        onChange={handleInputChange}
                        placeholder="Bank branch name"
                        className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
                        style={{
                          border: `1px solid ${designTokens.colors.border.light}`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h2
                    className="text-xl font-semibold mb-4"
                    style={{ color: designTokens.colors.text.primary }}
                  >
                    Legal Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        className="block text-sm font-medium mb-1 text-left"
                        style={{ color: designTokens.colors.text.primary }}
                      >
                        Food License Number *
                      </label>
                      <input
                        type="text"
                        name="fssaiNumber"
                        value={formData.fssaiNumber}
                        onChange={handleInputChange}
                        placeholder="FSSAI/Food License Number"
                        className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
                        style={{
                          border: `1px solid ${errors.fssaiNumber ? designTokens.colors.error.red : designTokens.colors.border.light}`,
                        }}
                      />
                      {errors.fssaiNumber && (
                        <p
                          className="text-xs mt-1"
                          style={{ color: designTokens.colors.error.red }}
                        >
                          {errors.fssaiNumber}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium mb-1 text-left"
                        style={{ color: designTokens.colors.text.primary }}
                      >
                        PAN Number
                      </label>
                      <input
                        type="text"
                        name="panNumber"
                        value={formData.panNumber}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
                        style={{
                          border: `1px solid ${designTokens.colors.border.light}`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-6">
                <h2
                  className="text-xl font-semibold mb-4"
                  style={{ color: designTokens.colors.text.primary }}
                >
                  Document Uploads
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: "fssaiLicense", label: "FSSAI License *" },
                    { key: "panCard", label: "PAN Card *" },
                    { key: "bankProof", label: "Cancelled Cheque/Bank Statement" },
                    { key: "menuCard", label: "Sample Menu Card" },
                  ].map((doc) => (
                    <div
                      key={doc.key}
                      className="border-2 border-dashed rounded-lg p-4 transition"
                      style={{
                        borderColor: errors[doc.key] ? designTokens.colors.error.red : designTokens.colors.border.light,
                      }}
                    >
                      <label
                        className="block text-sm font-medium mb-2 text-left"
                        style={{ color: designTokens.colors.text.primary }}
                      >
                        {doc.label}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          onChange={(e) => handleFileChange(e, doc.key)}
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                          id={doc.key}
                        />
                        <label
                          htmlFor={doc.key}
                          className="flex-1 flex items-center justify-center px-4 py-2 rounded-lg cursor-pointer transition"
                          style={{
                            backgroundColor: designTokens.colors.background.light,
                            color: designTokens.colors.text.primary,
                          }}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Choose File
                        </label>
                      </div>
                      {documents[doc.key] && (
                        <span
                          className="text-sm flex items-center mt-2"
                          style={{ color: designTokens.colors.primary.main }}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          <span className="truncate">{documents[doc.key].name}</span>
                        </span>
                      )}
                      {errors[doc.key] && (
                        <p
                          className="text-xs mt-1"
                          style={{ color: designTokens.colors.error.red }}
                        >
                          {errors[doc.key]}
                        </p>
                      )}
                      <p
                        className="text-xs mt-1"
                        style={{ color: designTokens.colors.text.secondary }}
                      >
                        PDF, JPG, PNG (Max 5MB)
                      </p>
                    </div>
                  ))}
                </div>

                <div
                  className="border rounded-lg p-4"
                  style={{
                    backgroundColor: "rgba(74, 140, 57, 0.1)",
                    borderColor: "rgba(74, 140, 57, 0.3)",
                  }}
                >
                  <div className="flex items-start">
                    <AlertCircle
                      className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5"
                      style={{ color: designTokens.colors.primary.main }}
                    />
                    <div
                      className="text-sm"
                      style={{ color: designTokens.colors.text.primary }}
                    >
                      <p className="font-semibold mb-1">Important Notes:</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>All documents should be clear and readable</li>
                        <li>FSSAI license must be valid and up to date</li>
                        <li>
                          Your application will be reviewed within 2-3 business
                          days
                        </li>
                        <li>You will receive updates via email and phone</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="terms"
                    name="termsAccepted"
                    checked={formData.termsAccepted}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded"
                    style={{
                      accentColor: designTokens.colors.primary.main,
                      borderColor: designTokens.colors.border.light,
                    }}
                  />
                  <label
                    htmlFor="terms"
                    className="ml-2 text-sm text-left"
                    style={{ color: designTokens.colors.text.primary }}
                  >
                    I agree to the terms and conditions and confirm that all
                    information provided is accurate *
                  </label>
                </div>
                {errors.terms && (
                  <p
                    className="text-xs mt-1"
                    style={{ color: designTokens.colors.error.red }}
                  >
                    {errors.terms}
                  </p>
                )}
              </div>
            )}

            {/* Restored Original Navigation Buttons */}
            <div
              className="flex justify-between mt-8 pt-6 border-t"
              style={{ borderColor: designTokens.colors.border.light }}
            >
              <button
                onClick={handlePrev}
                disabled={currentStep === 1 || isSubmitting}
                className="px-6 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  border: `1px solid ${designTokens.colors.border.light}`,
                  color: designTokens.colors.text.primary,
                  backgroundColor:
                    currentStep === 1 || isSubmitting ? "transparent" : "white",
                }}
                onMouseEnter={(e) => {
                  if (currentStep !== 1 && !isSubmitting) {
                    e.currentTarget.style.backgroundColor =
                      designTokens.colors.background.light;
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentStep !== 1 && !isSubmitting) {
                    e.currentTarget.style.backgroundColor = "white";
                  }
                }}
              >
                Previous
              </button>

              {currentStep < 5 ? (
                <button
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="px-6 py-2 text-white rounded-lg transition disabled:opacity-50"
                  style={{ backgroundColor: designTokens.colors.accent.yellow }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting) {
                      e.currentTarget.style.backgroundColor =
                        designTokens.colors.accent.yellowHover;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSubmitting) {
                      e.currentTarget.style.backgroundColor =
                        designTokens.colors.accent.yellow;
                    }
                  }}
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  style={{ backgroundColor: designTokens.colors.primary.main }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting) {
                      e.currentTarget.style.backgroundColor =
                        designTokens.colors.primary.hover;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSubmitting) {
                      e.currentTarget.style.backgroundColor =
                        designTokens.colors.primary.main;
                    }
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    "Submit Registration"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorSignup;