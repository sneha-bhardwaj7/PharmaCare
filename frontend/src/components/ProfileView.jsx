// frontend/src/components/ProfileView.jsx

import React, { useState } from 'react';
import { 
  User, Mail, Phone, MapPin, Calendar, Edit2, Save, X,
  Camera, Shield, Award, TrendingUp, Package, FileText,
  Clock, Star, CheckCircle, Lock, Bell, Globe, Smartphone
} from 'lucide-react';

const ProfileView = ({ userRole }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    email: 'john.doe@pharmacare.com',
    phone: '+91 98765 43210',
    address: '123 Medical Street, Delhi, India',
    dateOfBirth: '1990-05-15',
    gender: 'Male',
    licenseNumber: userRole === 'pharmacist' ? 'PH-12345-DL' : '',
    pharmacyName: userRole === 'pharmacist' ? 'HealthPlus Pharmacy' : '',
    memberSince: '2023-01-15'
  });

  const [tempData, setTempData] = useState({ ...profileData });

  const handleEdit = () => {
    setIsEditing(true);
    setTempData({ ...profileData });
  };

  const handleSave = () => {
    setProfileData({ ...tempData });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempData({ ...profileData });
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setTempData({ ...tempData, [field]: value });
  };

  const stats = userRole === 'customer' ? [
    { label: 'Total Orders', value: '24', icon: Package, color: 'blue' },
    { label: 'Prescriptions', value: '8', icon: FileText, color: 'purple' },
    { label: 'Points Earned', value: '1,250', icon: Award, color: 'yellow' },
    { label: 'Member Days', value: '654', icon: Clock, color: 'green' }
  ] : [
    { label: 'Orders Processed', value: '1,234', icon: Package, color: 'blue' },
    { label: 'Prescriptions', value: '456', icon: FileText, color: 'purple' },
    { label: 'Revenue', value: '₹2.5L', icon: TrendingUp, color: 'green' },
    { label: 'Rating', value: '4.8', icon: Star, color: 'yellow' }
  ];

  const activityLog = [
    { action: 'Uploaded prescription', date: '2024-11-08', time: '10:30 AM', status: 'completed' },
    { action: 'Order placed #12345', date: '2024-11-07', time: '03:45 PM', status: 'completed' },
    { action: 'Profile updated', date: '2024-11-05', time: '09:15 AM', status: 'completed' },
    { action: 'Password changed', date: '2024-11-01', time: '02:20 PM', status: 'completed' }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl shadow-2xl overflow-hidden">
        <div className="px-8 py-12 relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          
          <div className="relative flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Profile Picture */}
            <div className="relative group">
              <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl ring-4 ring-white/30 transform group-hover:scale-105 transition-all duration-300">
                <User className="h-16 w-16 text-white" />
              </div>
              <button className="absolute bottom-2 right-2 bg-white text-blue-600 p-2.5 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300">
                <Camera className="h-4 w-4" />
              </button>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500 px-3 py-1 rounded-full text-white text-xs font-bold flex items-center space-x-1 shadow-lg">
                <CheckCircle className="h-3 w-3" />
                <span>Verified</span>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold text-white mb-2">{profileData.name}</h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                <span className="bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-white text-sm font-semibold flex items-center space-x-2 border border-white/30">
                  <Shield className="h-4 w-4" />
                  <span>{userRole === 'admin' ? 'Administrator' : userRole === 'pharmacist' ? 'Pharmacist' : 'Customer'}</span>
                </span>
                <span className="bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-white text-sm font-semibold flex items-center space-x-2 border border-white/30">
                  <Star className="h-4 w-4 fill-yellow-300 text-yellow-300" />
                  <span>Premium Member</span>
                </span>
              </div>
              <p className="text-blue-100 text-lg mb-6">Member since {new Date(profileData.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
              
              {!isEditing && (
                <button 
                  onClick={handleEdit}
                  className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg flex items-center space-x-2 mx-auto md:mx-0"
                >
                  <Edit2 className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const colorClasses = {
            blue: 'from-blue-500 to-blue-600',
            purple: 'from-purple-500 to-purple-600',
            yellow: 'from-yellow-500 to-orange-500',
            green: 'from-green-500 to-emerald-600'
          };
          
          return (
            <div key={idx} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1 border border-gray-100">
              <div className={`bg-gradient-to-r ${colorClasses[stat.color]} w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <p className="text-gray-600 text-sm font-medium mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <User className="h-6 w-6 text-blue-600" />
              <span>Personal Information</span>
            </h2>
            {isEditing && (
              <div className="flex space-x-2">
                <button 
                  onClick={handleSave}
                  className="bg-green-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-green-600 transition flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Save</span>
                </button>
                <button 
                  onClick={handleCancel}
                  className="bg-gray-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-gray-600 transition flex items-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span>Full Name</span>
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={tempData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition"
                />
              ) : (
                <p className="text-gray-900 font-medium bg-gray-50 px-4 py-3 rounded-xl">{profileData.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span>Email Address</span>
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={tempData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition"
                />
              ) : (
                <p className="text-gray-900 font-medium bg-gray-50 px-4 py-3 rounded-xl">{profileData.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span>Phone Number</span>
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={tempData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition"
                />
              ) : (
                <p className="text-gray-900 font-medium bg-gray-50 px-4 py-3 rounded-xl">{profileData.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>Date of Birth</span>
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={tempData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition"
                />
              ) : (
                <p className="text-gray-900 font-medium bg-gray-50 px-4 py-3 rounded-xl">
                  {new Date(profileData.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>Address</span>
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={tempData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition"
                />
              ) : (
                <p className="text-gray-900 font-medium bg-gray-50 px-4 py-3 rounded-xl">{profileData.address}</p>
              )}
            </div>

            {userRole === 'pharmacist' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-gray-500" />
                    <span>License Number</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={tempData.licenseNumber}
                      onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium bg-gray-50 px-4 py-3 rounded-xl">{profileData.licenseNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                    <Package className="h-4 w-4 text-gray-500" />
                    <span>Pharmacy Name</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={tempData.pharmacyName}
                      onChange={(e) => handleInputChange('pharmacyName', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium bg-gray-50 px-4 py-3 rounded-xl">{profileData.pharmacyName}</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Quick Actions & Settings */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <Globe className="h-5 w-5 text-blue-600" />
              <span>Quick Actions</span>
            </h3>
            <div className="space-y-3">
              <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105 flex items-center justify-center space-x-2">
                <Lock className="h-4 w-4" />
                <span>Change Password</span>
              </button>
              <button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-3 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105 flex items-center justify-center space-x-2">
                <Bell className="h-4 w-4" />
                <span>Notification Settings</span>
              </button>
              <button className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105 flex items-center justify-center space-x-2">
                <Smartphone className="h-4 w-4" />
                <span>Two-Factor Auth</span>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span>Recent Activity</span>
            </h3>
            <div className="space-y-3">
              {activityLog.slice(0, 3).map((activity, idx) => (
                <div key={idx} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.date} • {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;