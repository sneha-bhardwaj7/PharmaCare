// frontend/src/components/Profile.jsx

import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, MapPin, Calendar, Edit2, Save, X, 
  Camera, Shield, Building, Briefcase, Clock, CheckCircle, AlertCircle
} from 'lucide-react';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    pincode: '',  
    pharmacyName: '',
    licenseNumber: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    const auth = JSON.parse(localStorage.getItem('user_auth'));
    if (!auth?.token) {
      setLoading(false);
      setMessage({ type: 'error', text: 'Please login to view your profile' });
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          pincode: data.pincode || '',  
          pharmacyName: data.pharmacyName || '',
          licenseNumber: data.licenseNumber || ''
        });
      } else {
        setMessage({ type: 'error', text: 'Failed to load profile' });
      }
    } catch (err) {
      console.error("Profile fetch failed:", err);
      setMessage({ type: 'error', text: 'Failed to load profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }

    // Phone validation (basic)
    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    // Pincode validation
    if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Please enter a valid 6-digit pincode';
    }

    // Pharmacist-specific validations
    if (user?.userType === 'pharmacist') {
      if (formData.pharmacyName && formData.pharmacyName.trim().length < 2) {
        newErrors.pharmacyName = 'Pharmacy name must be at least 2 characters long';
      }
      if (formData.licenseNumber && formData.licenseNumber.trim().length < 3) {
        newErrors.licenseNumber = 'Please enter a valid license number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

const handleSave = async () => {
  // Validate form before saving
  if (!validateForm()) {
    setMessage({ type: 'error', text: 'Please fix the errors before saving' });
    return;
  }

  setSaving(true);
  setMessage({ type: '', text: '' });

  const auth = JSON.parse(localStorage.getItem('user_auth'));
  
  if (!auth?.token) {
    setMessage({ type: 'error', text: 'Authentication required. Please login again.' });
    setSaving(false);
    return;
  }

  try {
    // Prepare update payload - only include fields that have changed
    const updatePayload = {};

    // Only include fields that have actually changed
    if (formData.name.trim() !== user.name) {
      updatePayload.name = formData.name.trim();
    }
    
    if (formData.phone.trim() !== (user.phone || '')) {
      updatePayload.phone = formData.phone.trim();
    }
    
    if (formData.address.trim() !== (user.address || '')) {
      updatePayload.address = formData.address.trim();
    }
    
    const newPincode = formData.pincode ? Number(formData.pincode) : null;
    if (newPincode !== user.pincode) {
      updatePayload.pincode = newPincode;
    }

    // Add pharmacist-specific fields if user is a pharmacist and they've changed
    if (user?.userType === 'pharmacist') {
      if (formData.pharmacyName.trim() !== (user.pharmacyName || '')) {
        updatePayload.pharmacyName = formData.pharmacyName.trim();
      }
      if (formData.licenseNumber.trim() !== (user.licenseNumber || '')) {
        updatePayload.licenseNumber = formData.licenseNumber.trim();
      }
    }

    // If nothing has changed, don't make the API call
    if (Object.keys(updatePayload).length === 0) {
      setMessage({ type: 'success', text: 'No changes to save!' });
      setIsEditing(false);
      setSaving(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }

    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/update-profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.token}`
      },
      body: JSON.stringify(updatePayload)
    });

    if (res.ok) {
      const updatedUser = await res.json();
      setUser(updatedUser);
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Update localStorage with new user data
      // const currentAuth = JSON.parse(localStorage.getItem('user_auth'));
      // if (currentAuth) {
      //   currentAuth.user = updatedUser;
      //   localStorage.setItem('user_auth', JSON.stringify(currentAuth));
      // }
      
      // // Also update user_profile if it exists
      // localStorage.setItem('user_profile', JSON.stringify(updatedUser));

      if (res.ok) {
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });

      // 🔥 MOST IMPORTANT
      await fetchUserProfile(); // DB se fresh data

      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }

      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } else {
      const errorData = await res.json().catch(() => ({}));
      setMessage({ 
        type: 'error', 
        text: errorData.message || 'Failed to update profile. Please try again.' 
      });
    }
  } catch (err) {
    console.error("Update failed:", err);
    setMessage({ type: 'error', text: 'An error occurred while updating. Please check your connection.' });
  } finally {
    setSaving(false);
  }
};

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to current user data
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      pincode: user?.pincode || '',
      pharmacyName: user?.pharmacyName || '',
      licenseNumber: user?.licenseNumber || ''
    });
    setErrors({});
    setMessage({ type: '', text: '' });
  };

  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
  //         <p className="text-gray-600 font-medium">Loading profile...</p>
  //       </div>
  //     </div>
  //   );
  // }

  const getRoleDisplayName = () => {
    if (user?.userType === 'admin') return 'Administrator';
    if (user?.userType === 'pharmacist') return 'Pharmacist';
    if (user?.userType === 'customer') return 'Customer';
    return 'User';
  };

  const getRoleColor = () => {
    if (user?.userType === 'admin') return 'from-purple-500 to-indigo-600';
    if (user?.userType === 'pharmacist') return 'from-blue-500 to-cyan-600';
    return 'from-green-500 to-teal-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-6">
          <div className={`bg-gradient-to-r ${getRoleColor()} h-32 relative`}>
            <div className="absolute -bottom-16 left-8">
              <div className="relative group">
                <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl ring-8 ring-white">
                  <User className="h-16 w-16 text-white" />
                </div>
                <button className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-all transform hover:scale-110">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="pt-20 pb-6 px-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {user?.name || 'User'}
                </h1>
                <div className="flex items-center space-x-3">
                  <span className={`bg-gradient-to-r ${getRoleColor()} text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-md`}>
                    {getRoleDisplayName()}
                  </span>
                  <div className="flex items-center space-x-1 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Verified</span>
                  </div>
                </div>
              </div>
              
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg transition-all transform hover:scale-105"
                >
                  <Edit2 className="h-4 w-4" />
                  <span className="font-semibold">Edit Profile</span>
                </button>
              ) : (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="flex items-center space-x-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl transition-all disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                    <span className="font-semibold">Cancel</span>
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="h-4 w-4" />
                    <span className="font-semibold">{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl shadow-lg animate-fade-in ${
            message.type === 'success' 
              ? 'bg-green-50 border-2 border-green-200 text-green-800' 
              : 'bg-red-50 border-2 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center space-x-2">
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <span className="font-semibold">{message.text}</span>
            </div>
          </div>
        )}

        {/* Profile Information Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <span>Personal Information</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                <User className="h-4 w-4 text-blue-600" />
                <span>Full Name {isEditing && <span className="text-red-500">*</span>}</span>
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 transition-all outline-none ${
                      errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                    }`}
                    placeholder="Enter your name"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1 flex items-center space-x-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{errors.name}</span>
                    </p>
                  )}
                </div>
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800 font-medium">
                  {user?.name || 'Not provided'}
                </div>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                <Mail className="h-4 w-4 text-blue-600" />
                <span>Email Address</span>
              </label>
              <div className="px-4 py-3 bg-gray-100 rounded-xl text-gray-600 font-medium flex items-center justify-between">
                <span>{user?.email || 'Not provided'}</span>
                <span className="text-xs bg-gray-200 px-2 py-1 rounded">Read-only</span>
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                <Phone className="h-4 w-4 text-blue-600" />
                <span>Phone Number</span>
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 transition-all outline-none ${
                      errors.phone ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                    }`}
                    placeholder="Enter phone number"
                    maxLength={10}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1 flex items-center space-x-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{errors.phone}</span>
                    </p>
                  )}
                </div>
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800 font-medium">
                  {user?.phone || 'Not provided'}
                </div>
              )}
            </div>

            {/* Address */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span>Address</span>
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                  placeholder="Enter address"
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800 font-medium">
                  {user?.address || 'Not provided'}
                </div>
              )}
            </div>

            {/* Pincode */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span>Pincode</span>
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 transition-all outline-none ${
                      errors.pincode ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                    }`}
                    placeholder="Enter pincode"
                    maxLength={6}
                  />
                  {errors.pincode && (
                    <p className="text-red-500 text-xs mt-1 flex items-center space-x-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{errors.pincode}</span>
                    </p>
                  )}
                </div>
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800 font-medium">
                  {user?.pincode || 'Not provided'}
                </div>
              )}
            </div>

            {/* User Type Display */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                <Shield className="h-4 w-4 text-blue-600" />
                <span>User Type</span>
              </label>
              <div className="px-4 py-3 bg-gray-100 rounded-xl text-gray-600 font-medium flex items-center justify-between">
                <span className="capitalize">{getRoleDisplayName()}</span>
                <span className="text-xs bg-gray-200 px-2 py-1 rounded">Read-only</span>
              </div>
            </div>

            {/* Pharmacist-specific fields */}
            {user?.userType === 'pharmacist' && (
              <>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <Building className="h-4 w-4 text-blue-600" />
                    <span>Pharmacy Name</span>
                  </label>
                  {isEditing ? (
                    <div>
                      <input
                        type="text"
                        name="pharmacyName"
                        value={formData.pharmacyName}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 transition-all outline-none ${
                          errors.pharmacyName ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                        }`}
                        placeholder="Enter pharmacy name"
                      />
                      {errors.pharmacyName && (
                        <p className="text-red-500 text-xs mt-1 flex items-center space-x-1">
                          <AlertCircle className="h-3 w-3" />
                          <span>{errors.pharmacyName}</span>
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800 font-medium">
                      {user?.pharmacyName || 'Not provided'}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <Briefcase className="h-4 w-4 text-blue-600" />
                    <span>License Number</span>
                  </label>
                  {isEditing ? (
                    <div>
                      <input
                        type="text"
                        name="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 transition-all outline-none ${
                          errors.licenseNumber ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                        }`}
                        placeholder="Enter license number"
                      />
                      {errors.licenseNumber && (
                        <p className="text-red-500 text-xs mt-1 flex items-center space-x-1">
                          <AlertCircle className="h-3 w-3" />
                          <span>{errors.licenseNumber}</span>
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800 font-medium">
                      {user?.licenseNumber || 'Not provided'}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Member Since */}
            <div className="space-y-2 md:col-span-2">
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span>Member Since</span>
              </label>
              <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800 font-medium">
                {user?.createdAt 
                  ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })
                  : 'Not available'}
              </div>
            </div>
          </div>
        </div>

        {/* Account Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Account Status</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">Active</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Verification</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">Verified</p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Last Login</p>
                <p className="text-lg font-bold text-gray-900 mt-1">Today</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-xl">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;