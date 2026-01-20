import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Pill, ShoppingCart, Clock, Shield, Star, Users, 
  ArrowRight, CheckCircle, MapPin, TrendingUp, 
  Heart, Award, Phone, Mail, Facebook, Twitter, 
  Instagram, Linkedin, Menu, X, Eye, EyeOff,
  PackageSearch, FileText, Truck, Store, Zap, HeartPulse,
  BadgeCheck, Lock, UserCheck, Building2, Activity, Globe,
  AlertCircle, User
} from 'lucide-react';

import AuthInformation from './AuthInformation.jsx';
import serviceImg1 from "../assets/serviceImg1.png"

const API_BASE_URL = (`${import.meta.env.VITE_BACKEND_BASEURL}/api/auth` || 'http://localhost:5000/api/auth');

const AuthPage = ({ onLogin, onLogout }) => { 
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userType, setUserType] = useState('customer');
  const [showPassword, setShowPassword] = useState(false);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetOtpSent, setResetOtpSent] = useState(false);

  const [formData, setFormData] = useState({
  name: '',
  email: '',
  password: '',
  pharmacyName: '',
  address: '',
  pincode: '',
});


  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // useEffect to redirect already logged-in users away from the Auth page
  useEffect(() => {
    const authData = localStorage.getItem('user_auth');
    const isOnAuthPage = location.pathname.includes("AuthPage");

    if (authData && isOnAuthPage) {
      const parsed = JSON.parse(authData);
      const initialView = getInitialAuthView(parsed.userType);
      navigate(`/app/${initialView}`, { replace: true });
    }
  }, []); // Empty dependency array - only run once on mount


  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogout = () => {
    localStorage.removeItem('user_auth');
    onLogout();
    setIsLoggedIn(false);
    setFormData({
      name: '', email: '', password: '', pharmacyName: ''
    });
    navigate('/AuthPage');
  };
  
  const getInitialAuthView = (role) => {
    if (role === 'pharmacist') {
      return 'inventory';
    } else if (role === 'customer') {
      return 'find-medicine';
    } else if (role === 'admin') {
      return 'dashboard';
    }
    return 'dashboard';
  }

  
  // -----------------------------------------------------------------
  // REGISTER - Email + Password (No OTP)
  // -----------------------------------------------------------------
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { name, email, password, pharmacyName } = formData;

      if (!name || !email || !password) {
        throw new Error("Please fill all required fields");
      }

      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      if (userType === 'pharmacist' && !pharmacyName) {
        throw new Error("Pharmacy name is required for pharmacists");
      }

      const payload = {
        name,
        email,
        password,
        userType,
        address: formData.address,
        pincode: formData.pincode,
        ...(userType === 'pharmacist' && { pharmacyName })
      };

      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Store auth data
      const authData = {
        token: data.token,
        userType: data.userType || data.user?.userType,
        userId: data._id || data.user?._id,
        name: data.name || data.user?.name,
        email: data.email || data.user?.email,
        phone: data.phone || data.user?.phone || null,
        pharmacyName: data.pharmacyName || data.user?.pharmacyName || null
      };


      localStorage.setItem('user_auth', JSON.stringify(authData));
      setIsLoggedIn(true);
      setShowAuthModal(false);
      
      // Call parent's onLogin to update App state
      onLogin();
      
      const initialView = getInitialAuthView(authData.userType);

      // Navigate without reload
      navigate(`/app/${initialView}`, { replace: true });
      
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------------------------------
  // LOGIN - Email + Password
  // -----------------------------------------------------------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { email, password } = formData;

      if (!email || !password) {
        throw new Error("Please enter email and password");
      }

      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store auth data
      const authData = {
        token: data.token,
        userType: data.userType,
        userId: data._id,
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        pharmacyName: data.pharmacyName || null
      };

      localStorage.setItem('user_auth', JSON.stringify(authData));
      setIsLoggedIn(true);
      setShowAuthModal(false);
      
      // Call parent's onLogin to update App state
      onLogin();
      
      const initialView = getInitialAuthView(authData.userType);
      
      // Navigate without reload
      navigate(`/app/${initialView}`, { replace: true });

      
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------------------------------
  // FORGOT PASSWORD - Send OTP
  // -----------------------------------------------------------------
  const handleForgotPassword = () => {
    setShowAuthModal(false);
    setShowResetPasswordModal(true);
    setResetEmail(formData.email || '');
  };

  const handleSendResetOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!resetEmail) throw new Error("Email is required");

      const response = await fetch(`${API_BASE_URL}/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      setResetOtpSent(true);
      alert('OTP sent to your email!');
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!resetEmail || !resetOtp || !newPassword) {
        throw new Error("All fields are required");
      }

      if (newPassword.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      const response = await fetch(`${API_BASE_URL}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: resetEmail, 
          otp: resetOtp, 
          newPassword: newPassword 
        }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server error. Please try again.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      alert('Password reset successfully! Please login with your new password.');
      
      // Close reset modal and open login
      setShowResetPasswordModal(false);
      setResetOtpSent(false);
      setResetEmail('');
      setResetOtp('');
      setNewPassword('');
      setShowAuthModal(true);
      setIsLogin(true);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      handleLogin(e);
    } else {
      handleRegister(e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Navigation */}
      <nav className=" top-0 w-full bg-white/98 backdrop-blur-lg shadow-md z-50 border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-2xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative bg-blue-600 rounded-2xl p-3 shadow-xl transform group-hover:scale-110 transition-transform duration-300">
                  <Pill className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <span className="font-bold text-3xl text-blue-600 tracking-tight">
                  PharmaCare
                </span>
                <div className="flex items-center space-x-1 mt-0.5">
                  <BadgeCheck className="h-3.5 w-3.5 text-blue-500" />
                  <span className="text-xs text-gray-600 font-medium">Trusted Healthcare Platform</span>
                </div>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#services" className="text-gray-700 hover:text-blue-600 transition font-semibold text-sm flex items-center space-x-1 group">
                <Store className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span>Services</span>
              </a>
              <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 transition font-semibold text-sm flex items-center space-x-1 group">
                <Activity className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span>How It Works</span>
              </a>
              <a href="#testimonials" className="text-gray-700 hover:text-blue-600 transition font-semibold text-sm flex items-center space-x-1 group">
                <Star className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span>Testimonials</span>
              </a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600 transition font-semibold text-sm flex items-center space-x-1 group">
                <Phone className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span>Contact</span>
              </a>
              {!isLoggedIn ? (
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 hover:shadow-xl transition transform hover:scale-105 font-semibold flex items-center space-x-2"
                >
                  <UserCheck className="h-5 w-5" />
                  <span>Get Started</span>
                </button>
              ) : (
                <button 
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-8 py-3 rounded-xl hover:bg-red-700 hover:shadow-xl transition transform hover:scale-105 font-semibold flex items-center space-x-2"
                >
                  <X className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              )}
            </div>

            <button 
              className="md:hidden text-gray-700 hover:text-blue-600 transition"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-blue-100 shadow-lg">
            <div className="px-4 py-6 space-y-4">
              <a href="#services" className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 py-2">
                <Store className="h-5 w-5" />
                <span className="font-semibold">Services</span>
              </a>
              <a href="#how-it-works" className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 py-2">
                <Activity className="h-5 w-5" />
                <span className="font-semibold">How It Works</span>
              </a>
              <a href="#testimonials" className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 py-2">
                <Star className="h-5 w-5" />
                <span className="font-semibold">Testimonials</span>
              </a>
              <a href="#contact" className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 py-2">
                <Phone className="h-5 w-5" />
                <span className="font-semibold">Contact</span>
              </a>
              {!isLoggedIn ? (
                <button 
                  onClick={() => { setShowAuthModal(true); setMobileMenuOpen(false); }}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2"
                >
                  <UserCheck className="h-5 w-5" />
                  <span>Get Started</span>
                </button>
              ) : (
                <button 
                  onClick={handleLogout}
                  className="w-full bg-red-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2"
                >
                  <X className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-9 pb-8 px-4 relative overflow-hidden">
        <div className="absolute top-20 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-5 py-2.5 rounded-full text-sm font-bold shadow-lg border border-blue-200">
                <BadgeCheck className="h-4 w-4" />
                <span>India's Most Trusted Pharmacy Platform</span>
              </div>
              <h1 className="text-6xl md:text-7xl font-bold text-gray-900 leading-tight">
                Your Health, Our
                <span className="text-blue-600 block mt-2">Priority</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Find medicines in 15 minutes, manage prescriptions digitally, and get doorstep delivery with PharmaCare - India's fastest growing healthcare platform
              </p>
              <div className="flex flex-wrap gap-4">
                {!isLoggedIn && (
                  <button 
                    onClick={() => setShowAuthModal(true)}
                    className="bg-blue-600 text-white px-10 py-4 rounded-xl font-bold text-lg flex items-center space-x-3 hover:bg-blue-700 hover:shadow-2xl transition transform hover:scale-105"
                  >
                    <span>Get Started </span>
                    <ArrowRight className="h-6 w-6" />
                  </button>
                )}
                {/* <button className="border-2 border-blue-600 text-blue-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 hover:shadow-xl transition transform hover:scale-105 flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Watch Demo</span>
                </button> */}
              </div>
              <div className="flex items-center space-x-8 pt-6">
                <div className="flex items-center space-x-3 bg-white rounded-xl px-4 py-3 shadow-lg border border-blue-100">
                  <div className="bg-green-100 rounded-full p-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="text-gray-900 font-bold">100% Genuine</span>
                </div>
                <div className="flex items-center space-x-3 bg-white rounded-xl px-4 py-3 shadow-lg border border-blue-100">
                  <div className="bg-blue-100 rounded-full p-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-gray-900 font-bold">24/7 Support</span>
                </div>
              </div>
            </div>
            
            {/* Image Section */}
            <div className="relative">
              <div className="relative bg-white rounded-3xl p-6 shadow-2xl border-4 border-blue-100">
                <img 
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop" 
                  alt="Modern Pharmacy" 
                  className="rounded-2xl shadow-xl w-full h-[400px] object-cover"
                />
                <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-2xl p-5 border-2 border-blue-200">
                  <div className="flex items-center space-x-4">
                    <div className="bg-green-100 rounded-xl p-3">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-2xl">5000+</div>
                      <div className="text-sm text-gray-600 font-semibold">Happy Customers</div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -left-4 bg-blue-600 rounded-2xl shadow-2xl p-5">
                  <div className="flex items-center space-x-3">
                    <Zap className="h-8 w-8 text-yellow-300" />
                    <div className="text-white">
                      <div className="font-bold text-xl">15 Min</div>
                      <div className="text-xs font-semibold">Delivery</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <AuthInformation/>
      
   


      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-blue-600 rounded-2xl p-3">
                  <Pill className="h-8 w-8 text-white" />
                </div>
                <span className="font-bold text-2xl">PharmaCare</span>
              </div>
              <p className="text-gray-400 leading-relaxed">Your trusted healthcare partner, delivering quality medicines and care.</p>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Services</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Pharmacies</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">Support</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">FAQs</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">Contact Us</h4>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-blue-500" />
                  <span className="text-gray-400">+91 1800-123-456</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-blue-500" />
                  <span className="text-gray-400">support@pharmacare.com</span>
                </li>
              </ul>
              <div className="flex space-x-4 mt-6">
                <a href="#" className="bg-blue-600 p-3 rounded-xl hover:bg-blue-700 transition">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="bg-blue-600 p-3 rounded-xl hover:bg-blue-700 transition">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="bg-blue-600 p-3 rounded-xl hover:bg-blue-700 transition">
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">© 2026 PharmaCare. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 border-2 border-blue-100">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-4xl font-bold text-blue-600 mb-2">
                    {isLogin ? 'Welcome Back!' : 'Join PharmaCare'}
                  </h2>
                  <p className="text-gray-600">
                    {isLogin ? 'Login to your account' : 'Create your free account'}
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setShowAuthModal(false);
                    setError(null); 
                    setFormData({ name: '', email: '', password: '', pharmacyName: '' });
                  }}
                  className="text-gray-400 hover:text-gray-600 transition transform hover:scale-110 bg-gray-100 rounded-xl p-2"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              {error && (
                <div className="bg-red-100 border-2 border-red-400 text-red-700 px-5 py-4 rounded-xl relative mb-6 flex items-center space-x-3" role="alert">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span className="block">{error}</span>
                </div>
              )}

              {/* User Type Selection */}
              <div className="flex gap-3 mb-8">
                <button
                  onClick={() => setUserType('customer')}
                  className={`flex-1 py-4 rounded-xl font-bold transition-all duration-300 border-2 ${
                    userType === 'customer'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-105'
                      : 'bg-white text-gray-700 border-blue-200 hover:border-blue-400'
                  }`}
                >
                  <Users className="inline h-6 w-6 mr-2" />
                  Customer
                </button>
                <button
                  onClick={() => setUserType('pharmacist')}
                  className={`flex-1 py-4 rounded-xl font-bold transition-all duration-300 border-2 ${
                    userType === 'pharmacist'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-105'
                      : 'bg-white text-gray-700 border-blue-200 hover:border-blue-400'
                  }`}
                >
                  <Shield className="inline h-6 w-6 mr-2" />
                  Pharmacist
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name Field - Only for Registration */}
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Full Name *</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-5 py-4 rounded-xl border-2 border-blue-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition text-lg"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                )}

                {/* Address Field */}
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-5 py-4 rounded-xl border-2 border-blue-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition text-lg"
                      placeholder="Enter your full address"
                      required
                    />
                  </div>
                )}

                {/* Pincode Field */}
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      className="w-full px-5 py-4 rounded-xl border-2 border-blue-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition text-lg"
                      placeholder="Enter your 6-digit pincode"
                      required
                      maxLength="6"
                    />
                  </div>
                )}


                {/* Pharmacy Name - Only for Pharmacist Registration */}
                {!isLogin && userType === 'pharmacist' && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center space-x-2">
                      <Building2 className="h-4 w-4" />
                      <span>Pharmacy Name *</span>
                    </label>
                    <input
                      type="text"
                      name="pharmacyName"
                      value={formData.pharmacyName}
                      onChange={handleInputChange}
                      className="w-full px-5 py-4 rounded-xl border-2 border-blue-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition text-lg"
                      placeholder="Enter pharmacy name"
                      required
                    />
                  </div>
                )}

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>Email Address *</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-blue-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-14 pr-5 py-4 rounded-xl border-2 border-blue-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition text-lg"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center space-x-2">
                    <Lock className="h-4 w-4" />
                    <span>Password *</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-blue-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-14 pr-14 py-4 rounded-xl border-2 border-blue-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition text-lg"
                      placeholder={isLogin ? "Enter your password" : "Create a password (min 6 characters)"}
                      required
                      minLength="6"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-600 transition"
                    >
                      {showPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                    </button>
                  </div>
                  {!isLogin && (
                    <p className="text-xs text-gray-500 mt-2">Password must be at least 6 characters long</p>
                  )}
                </div>

                {/* Remember Me & Forgot Password - Only for Login */}
                {isLogin && (
                  <div className="flex justify-between items-center">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2 w-5 h-5 text-blue-600 rounded" />
                      <span className="text-sm text-gray-600 font-semibold">Remember me</span>
                    </label>
                    <button 
                      type="button" 
                      onClick={handleForgotPassword} 
                      className="text-sm text-blue-600 hover:text-blue-700 font-bold"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Activity className="h-5 w-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>{isLogin ? 'Login' : 'Create Account'}</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </form>
              
              {/* Toggle Login/Register */}
              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                  <button
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError(null);
                      setFormData({ name: '', email: '', password: '', pharmacyName: '' });
                    }}
                    className="text-blue-600 hover:text-blue-700 font-bold ml-2"
                  >
                    {isLogin ? 'Sign Up' : 'Login'}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 border-2 border-blue-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-blue-600">Reset Password</h2>
              <button 
                onClick={() => {
                  setShowResetPasswordModal(false);
                  setResetOtpSent(false);
                  setResetEmail('');
                  setResetOtp('');
                  setNewPassword('');
                  setError(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {error && (
              <div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4 flex items-center space-x-2">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            )}

            {!resetOtpSent ? (
              <form onSubmit={handleSendResetOtp} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full px-5 py-4 rounded-xl border-2 border-blue-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Enter OTP *
                  </label>
                  <input
                    type="text"
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value)}
                    className="w-full px-5 py-4 rounded-xl border-2 border-blue-200 focus:border-blue-600 outline-none text-center text-2xl tracking-widest"
                    placeholder="- - - - - -"
                    maxLength="6"
                    required
                  />
                  <p className="text-sm text-gray-600 mt-2 text-center">
                    OTP sent to {resetEmail}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    New Password *
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-5 py-4 rounded-xl border-2 border-blue-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition"
                    placeholder="Enter new password (min 6 characters)"
                    required
                    minLength="6"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>

                <button
                  type="button"
                  onClick={handleSendResetOtp}
                  className="w-full text-blue-600 hover:text-blue-700 font-bold text-sm"
                  disabled={loading}
                >
                  Resend OTP
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthPage;