import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  FileText,
  AlertCircle,
  Clock,
  CheckCircle,
  User,
  Phone,
  MapPin,
  ArrowRight
} from "lucide-react";

// Create a cache outside the component to persist across unmounts
const profileCache = {
  data: null,
  timestamp: null,
  isValid() {
    // Cache is valid for 5 minutes
    return this.data && this.timestamp && (Date.now() - this.timestamp < 5 * 60 * 1000);
  }
};

const UploadPrescriptionView = () => {
  const navigate = useNavigate();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(profileCache.data);
  const [profileLoading, setProfileLoading] = useState(!profileCache.isValid());
  const [missingFields, setMissingFields] = useState([]);
  const hasFetched = useRef(false);

  // Memoize API_URL and token
  const { API_URL, BACKEND_URL, token } = useMemo(() => {
    const apiUrl = `${import.meta.env.VITE_BACKEND_BASEURL ?? "http://localhost:5000"}/api`;
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
    const authData = JSON.parse(localStorage.getItem("user_auth") || '{}');
    const authToken = authData?.token;
    return { API_URL: apiUrl, BACKEND_URL: backendUrl, token: authToken };
  }, []);

  const fetchUserProfile = async () => {
    if (!token) {
      setProfileLoading(false);
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUserProfile(data);
        
        // Check for missing required fields
        const missing = [];
        if (!data.phone) missing.push("Phone Number");
        if (!data.address) missing.push("Address");
        if (!data.pincode) missing.push("Pincode");
        
        setMissingFields(missing);
        
        // Update cache
        profileCache.data = data;
        profileCache.timestamp = Date.now();
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if we don't have valid cached data and haven't fetched yet
    if (!profileCache.isValid() && !hasFetched.current) {
      hasFetched.current = true;
      fetchUserProfile();
    } else if (profileCache.isValid() && !userProfile) {
      // Use cached data immediately
      setUserProfile(profileCache.data);
      
      // Check for missing required fields from cache
      const missing = [];
      if (!profileCache.data.phone) missing.push("Phone Number");
      if (!profileCache.data.address) missing.push("Address");
      if (!profileCache.data.pincode) missing.push("Pincode");
      setMissingFields(missing);
      
      setProfileLoading(false);
    }
  }, []);

  /* -------------------- Drag & Drop -------------------- */
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setUploadedFile(URL.createObjectURL(file));
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setUploadedFile(URL.createObjectURL(file));
    }
  };

  /* -------------------- Submit -------------------- */
  const handleSubmit = async () => {
    if (!token) {
      alert("Please login first");
      return;
    }

    // Check if profile is complete
    if (missingFields.length > 0) {
      alert(`Please complete your profile first. Missing: ${missingFields.join(", ")}`);
      navigate("/app/profile");
      return;
    }

    if (!selectedFile) {
      alert("Please upload a prescription image");
      return;
    }

    const formData = new FormData();
    formData.append("prescriptionImage", selectedFile);
    formData.append("paymentMode", paymentMode);

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/prescriptions/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message || "Prescription uploaded successfully!");
        setUploadedFile(null);
        setSelectedFile(null);
        setPaymentMode("Cash");
      } else {
        alert(data.message || "Upload failed");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <h2 className="text-4xl font-bold mb-2">Upload Prescription</h2>
        <p className="text-blue-100 text-lg">
          Upload prescription and get quotes from nearby pharmacists
        </p>
      </div>

      {/* Profile Incomplete Warning */}
      {missingFields.length > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 shadow-lg">
          <div className="flex items-start space-x-4">
            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-900 mb-2">
                Profile Incomplete
              </h3>
              <p className="text-red-800 mb-3">
                You need to complete your profile before uploading a prescription.
              </p>
              <p className="text-red-700 font-semibold mb-4">
                Missing fields: {missingFields.join(", ")}
              </p>
              <button
                onClick={() => navigate("/app/profile")}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-all transform hover:scale-105 shadow-md"
              >
                <User className="h-5 w-5" />
                <span>Complete Profile Now</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Summary */}
      {userProfile && missingFields.length === 0 && (
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 shadow-lg">
          <div className="flex items-center space-x-2 mb-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-bold text-green-900">Profile Complete</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2 text-green-800">
              <User className="h-4 w-4" />
              <span><strong>Name:</strong> {userProfile.name}</span>
            </div>
            <div className="flex items-center space-x-2 text-green-800">
              <Phone className="h-4 w-4" />
              <span><strong>Phone:</strong> {userProfile.phone}</span>
            </div>
            <div className="flex items-center space-x-2 text-green-800">
              <MapPin className="h-4 w-4" />
              <span><strong>Pincode:</strong> {userProfile.pincode}</span>
            </div>
          </div>
        </div>
      )}

      {/* Upload Box */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FileText className="h-6 w-6 text-blue-600" />
          Prescription Image
        </h3>

        <div
          className={`border-3 border-dashed rounded-xl p-8 text-center transition-all ${
            dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {uploadedFile ? (
            <div className="space-y-4">
              <img
                src={uploadedFile}
                alt="Prescription Preview"
                className="max-h-64 mx-auto rounded-lg shadow-md"
              />
              <button
                onClick={() => {
                  setUploadedFile(null);
                  setSelectedFile(null);
                }}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
                <Upload className="h-10 w-10 text-blue-600" />
              </div>
              <p className="text-lg font-semibold text-gray-800">
                Drop prescription here or
              </p>
              <label className="cursor-pointer">
                <span className="text-blue-600 font-semibold underline">
                  browse files
                </span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleChange}
                  className="hidden"
                />
              </label>
              <p className="text-sm text-gray-500">
                JPG, PNG, PDF (Max 5MB)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Payment Mode */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Clock className="h-6 w-6 text-purple-600" />
          Payment Mode
        </h3>

        <select
          value={paymentMode}
          onChange={(e) => setPaymentMode(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
        >
          <option value="Cash">Cash on Delivery</option>
          <option value="Card">Card Payment</option>
          <option value="UPI">UPI Payment</option>
          <option value="Insurance">Insurance</option>
        </select>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!selectedFile || missingFields.length > 0 || loading}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 disabled:from-gray-400 disabled:to-gray-400 text-white px-6 py-4 rounded-xl font-bold text-lg shadow-lg disabled:cursor-not-allowed"
      >
        {loading ? "Uploading..." : "Submit Prescription"}
      </button>

      {/* Info */}
      {missingFields.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
          <CheckCircle className="inline h-4 w-4 mr-2" />
          Nearby pharmacists in your area (Pincode: {userProfile?.pincode}) will review your prescription and send price quotes.
        </div>
      )}
    </div>
  );
};

export default UploadPrescriptionView;