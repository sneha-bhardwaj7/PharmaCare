// frontend/src/pages/AuthPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Pill, ShoppingCart, Clock, Shield, Star, Users, 
  ArrowRight, CheckCircle, MapPin, TrendingUp, 
  Heart, Award, Phone, Mail, Facebook, Twitter, 
  Instagram, Linkedin, Menu, X, Eye, EyeOff, Smartphone,
  PackageSearch, FileText, Truck, Store, Zap, HeartPulse,
  BadgeCheck, Lock, UserCheck, Building2, Activity, Globe,
  AlertCircle, User,
  Import
} from 'lucide-react';

const API_BASE_URL = (`${import.meta.env.VITE_BACKEND_URL}/api/auth` || 'http://localhost:5000/api/auth');

const AuthPage = ({ onLogin, onLogout }) => { 
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userType, setUserType] = useState('customer');
  const [showPassword, setShowPassword] = useState(false);
  const [authMethod, setAuthMethod] = useState('phone'); // phone or email
  
  // NEW STATE: Tracks if Email method is currently in OTP mode (not password mode)
  const [emailOtpMode, setEmailOtpMode] = useState(false); 
  
  const [otpSent, setOtpSent] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', otp: '', pharmacyName: ''
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
      useEffect(() => {
    const authData = localStorage.getItem('user_auth');
    if (authData) {
        const parsed = JSON.parse(authData);
        const initialView = getInitialAuthView(parsed.userType);
        navigate(`/app/${initialView}`);
    }
    }, []);

    

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const setAuthDataInStorage = (data) => {
      localStorage.setItem('user_auth', JSON.stringify(data));
      setIsLoggedIn(true);
      setShowAuthModal(false);
      onLogin(data.userType);
      
      const initialView = getInitialAuthView(data.userType);
      navigate(`/app/${initialView}`); 
  }

  const handleLogout = () => {
    localStorage.removeItem('user_auth');
    onLogout();
    setIsLoggedIn(false);
    setFormData({
      name: '', email: '', password: '', phone: '', otp: '', pharmacyName: ''
    });
    navigate('/AuthPage');
  };
  
  const getInitialAuthView = (role) => {
      if (role === 'admin' || role === 'pharmacist') {
          return 'dashboard';
      } else if (role === 'customer') {
          return 'find-medicine';
      }
      return 'dashboard'; 
  }
  
  // -----------------------------------------------------------------
  // API HANDLERS 
  // -----------------------------------------------------------------

  // Send OTP (Phone or Email)
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let payload = {};

      if (authMethod === 'phone') {
          if (!formData.phone) throw new Error("Phone number is required.");
          payload = { phone: formData.phone };
      } else if (authMethod === 'email') {
          if (!formData.email) throw new Error("Email address is required.");
          payload = { email: formData.email };
      }

      const response = await fetch(`${API_BASE_URL}/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      setOtpSent(true);
      if (authMethod === 'email') setEmailOtpMode(true); // Switch to OTP mode if email was used
      setError(null);
      alert(`OTP sent successfully! Please check your ${authMethod}.`);
      
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
      setOtpSent(false);
      if (authMethod === 'email') setEmailOtpMode(false);
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP (Phone or Email)
 // Verify OTP (Phone or Email)
const handleVerifyOtp = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  
  try {
    if (!formData.otp) throw new Error("OTP is required.");

    const payload = {
      otp: formData.otp,
      userType: userType, 
      name: formData.name, 
    };
    
    // Add identifier
    if (authMethod === 'phone') {
      payload.phone = formData.phone;
      if (!formData.phone) throw new Error("Phone number is required.");
    } else if (authMethod === 'email') {
      payload.email = formData.email;
      if (!formData.email) throw new Error("Email is required.");
    }

    // Add conditional fields
    if (userType === 'pharmacist') {
      if (!formData.pharmacyName) throw new Error("Pharmacy name is required for pharmacists.");
      payload.pharmacyName = formData.pharmacyName;
    }

    const response = await fetch(`${API_BASE_URL}/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'OTP verification failed');
    }

    // ✅ FIX: Store auth data correctly in ONE place
    const authData = {
      token: data.token,
      userType: data.user.userType,
      userId: data.user._id,
      name: data.user.name,
      email: data.user.email || null,
      phone: data.user.phone || null,
      pharmacyName: data.user.pharmacyName || null
    };

    // Store in localStorage
    localStorage.setItem('user_auth', JSON.stringify(authData));
    
    // Update UI state
    setIsLoggedIn(true);
    setShowAuthModal(false);
    onLogin(data.user.userType);
    
    // Navigate to appropriate view
    const initialView = getInitialAuthView(data.user.userType);
    navigate(`/app/${initialView}`);
    
  } catch (err) {
    setError(err.message || 'OTP verification failed. Please try again.');
  } finally {
    setLoading(false);
  }
};

  // Email/Password Authentication (Kept as requested)
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Fallback safety check: If Email OTP mode is active, prevent password login
      if (emailOtpMode) {
          throw new Error("Cannot use password login while in OTP mode.");
      }
      
      const endpoint = isLogin ? '/login' : '/register';
      
      const payload = {
        email: formData.email,
        password: formData.password,
        userType: userType,
      };

      if (!isLogin) {
        if (!formData.name) throw new Error("Name is required for registration.");
        payload.name = formData.name;

        if (userType === "pharmacist") {
          if (!formData.pharmacyName) throw new Error("Pharmacy name is required for pharmacists.");
          payload.pharmacyName = formData.pharmacyName;
        }
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      // Store auth data and navigate
      setAuthDataInStorage({ 
        userType: data.userType, 
        token: data.token, 
        name: data.name,
        userId: data._id 
      });
      
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null); 

    if (authMethod === 'email') {
      
      if (emailOtpMode) {
          // Path 1: Currently in Email OTP verification mode
          handleVerifyOtp(e);
          
      } else {
          // Path 2: Email is selected, but not in OTP mode (user provides email + password)
          
          if (!isLogin || formData.password) {
              // Registration (always uses password) OR Login (with password)
              handleEmailAuth(e);
          } else if (isLogin && !formData.password) {
              // Login attempt, but password field is empty. We assume user wants OTP.
              handleSendOtp(e);
          }
      }
      
    } else if (authMethod === 'phone') {
        // Path 3: Phone Flow (always OTP)
        if (!otpSent) {
            handleSendOtp(e); // Step 1: Send OTP
        } else {
            handleVerifyOtp(e); // Step 2: Verify OTP & Register/Login
        }
    }
  }

  // Helper function to reset state when switching tabs
  const handleAuthMethodChange = (method) => {
    setAuthMethod(method);
    setOtpSent(false);
    setEmailOtpMode(false);
    setError(null);
    setFormData(prev => ({ ...prev, otp: '', password: '' }));
  }

  const handleSocialLogin = async (provider) => {
    // Implement social login logic here
    alert(`${provider} login is not yet implemented. Please use email or phone login.`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Enhanced Navigation */}
      <nav className="fixed top-0 w-full bg-white/98 backdrop-blur-lg shadow-md z-50 border-b border-blue-100">
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

      {/* Hero Section with Enhanced Images */}
      <section className="pt-32 pb-24 px-4 relative overflow-hidden">
        {/* Decorative Elements */}
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
                    <span>Get Started Free</span>
                    <ArrowRight className="h-6 w-6" />
                  </button>
                )}
                <button className="border-2 border-blue-600 text-blue-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 hover:shadow-xl transition transform hover:scale-105 flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Watch Demo</span>
                </button>
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
            
            {/* Enhanced Image Section */}
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

      {/* Enhanced Services Section */}
      <section id="services" className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
              <Store className="h-4 w-4" />
              <span>Our Services</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">Everything You Need</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Complete healthcare solutions at your fingertips</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: PackageSearch,
                title: 'Find Medicine Instantly',
                description: 'Locate medicines at nearby pharmacies with real-time availability tracking',
                image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=300&fit=crop',
                color: 'blue'
              },
              {
                icon: ShoppingCart,
                title: 'Online Ordering',
                description: 'Order medicines online and get doorstep delivery within hours',
                image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop',
                color: 'blue'
              },
              {
                icon: FileText,
                title: 'Digital Prescriptions',
                description: 'Upload and manage prescriptions digitally with secure cloud storage',
                image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop',
                color: 'blue'
              },
              {
                icon: TrendingUp,
                title: 'Inventory Management',
                description: 'For pharmacists: Track stock, expiry dates, and automate reorders',
                image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop',
                color: 'blue'
              },
              {
                icon: HeartPulse,
                title: 'Health Reminders',
                description: 'Never miss medication with smart reminders and dose tracking',
                image: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&h=300&fit=crop',
                color: 'blue'
              },
              {
                icon: Award,
                title: 'Loyalty Rewards',
                description: 'Earn points on purchases and unlock exclusive member discounts',
                image: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=300&fit=crop',
                color: 'blue'
              }
            ].map((service, idx) => (
              <div 
                key={idx}
                className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3 border-2 border-blue-100 overflow-hidden"
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 bg-white rounded-xl p-3 shadow-xl">
                    <service.icon className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{service.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{service.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced How It Works */}
      <section id="how-it-works" className="py-24 px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
              <Activity className="h-4 w-4" />
              <span>Simple Process</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Get your medicines in 3 simple steps</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: '01',
                title: 'Search Medicine',
                description: 'Search by name or upload your prescription for instant results',
                icon: PackageSearch,
                image: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=400&h=300&fit=crop'
              },
              {
                step: '02',
                title: 'Choose Pharmacy',
                description: 'Select from nearby pharmacies with live stock availability',
                icon: Building2,
                image: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&h=300&fit=crop'
              },
              {
                step: '03',
                title: 'Get Delivered',
                description: 'Receive at doorstep or pickup from store - your choice',
                icon: Truck,
                image: 'https://images.unsplash.com/photo-1605902711622-cfb43c4437f5?w=400&h=300&fit=crop'
              }
            ].map((step, idx) => (
              <div key={idx} className="relative">
                <div className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-blue-100 overflow-hidden">
                  <div className="relative h-56">
                    <img 
                      src={step.image} 
                      alt={step.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/70 to-transparent"></div>
                    <div className="absolute top-4 right-4 bg-blue-600 text-white font-bold text-3xl w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl">
                      {step.step}
                    </div>
                    <div className="absolute bottom-4 left-4 bg-white rounded-xl p-3 shadow-xl">
                      <step.icon className="h-10 w-10 text-blue-600" />
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                </div>
                {idx < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-6 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-12 w-12 text-blue-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials */}
      <section id="testimonials" className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
              <Star className="h-4 w-4" />
              <span>Customer Reviews</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">What People Say</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Trusted by thousands across India</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Priya Sharma',
                role: 'Customer from Delhi',
                image: 'https://i.pravatar.cc/150?img=1',
                rating: 5,
                text: 'PharmaCare made it incredibly easy to find medicines during an emergency. Found exactly what I needed in just 10 minutes! The service is outstanding.'
              },
              {
                name: 'Dr. Rajesh Kumar',
                role: 'Pharmacist, Mumbai',
                image: 'https://i.pravatar.cc/150?img=33',
                rating: 5,
                text: 'The inventory management system is absolutely fantastic. It saves me hours every week and helps prevent stockouts. Best pharmacy software I have used!'
              },
              {
                name: 'Anjali Patel',
                role: 'Customer from Bangalore',
                image: 'https://i.pravatar.cc/150?img=5',
                rating: 5,
                text: 'Love the prescription upload feature! No more carrying physical prescriptions everywhere. Digital storage is secure and accessible anytime.'
              }
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-blue-100 p-8">
                <div className="flex items-center space-x-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-8 text-lg leading-relaxed italic">"{testimonial.text}"</p>
                <div className="flex items-center space-x-4 pt-6 border-t-2 border-blue-100">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full ring-4 ring-blue-100 shadow-lg"
                  />
                  <div>
                    <div className="font-bold text-gray-900 text-lg">{testimonial.name}</div>
                    <div className="text-sm text-gray-600 font-medium">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="py-24 px-4 bg-blue-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-700 opacity-50"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-overlay filter blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-800 rounded-full mix-blend-overlay filter blur-3xl opacity-30"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-4 gap-12 text-center">
            {[
              { number: '5000+', label: 'Happy Customers', icon: Users },
              { number: '200+', label: 'Partner Pharmacies', icon: Building2 },
              { number: '10000+', label: 'Medicines Available', icon: Pill },
              { number: '24/7', label: 'Customer Support', icon: HeartPulse }
            ].map((stat, idx) => (
              <div key={idx} className="transform hover:scale-110 transition-transform duration-300">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border-2 border-white/20">
                  <stat.icon className="h-16 w-16 mx-auto mb-6 text-white" />
                  <div className="text-6xl font-bold mb-4">{stat.number}</div>
                  <div className="text-xl font-semibold">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Contact Section */}
      <section id="contact" className="py-24 px-4 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-bold mb-6">
                <Phone className="h-4 w-4" />
                <span>Contact Us</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">Get In Touch</h2>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">Have questions? Our team is here to help you 24/7!</p>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-5 group bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition border-2 border-blue-100">
                  <div className="bg-blue-100 p-4 rounded-xl shadow-md group-hover:bg-blue-600 transition">
                    <Phone className="h-7 w-7 text-blue-600 group-hover:text-white transition" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-lg">Phone</div>
                    <div className="text-gray-600 text-lg">+91 98765 43210</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-5 group bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition border-2 border-blue-100">
                  <div className="bg-blue-100 p-4 rounded-xl shadow-md group-hover:bg-blue-600 transition">
                    <Mail className="h-7 w-7 text-blue-600 group-hover:text-white transition" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-lg">Email</div>
                    <div className="text-gray-600 text-lg">support@pharmacare.com</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-5 group bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition border-2 border-blue-100">
                  <div className="bg-blue-100 p-4 rounded-xl shadow-md group-hover:bg-blue-600 transition">
                    <MapPin className="h-7 w-7 text-blue-600 group-hover:text-white transition" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-lg">Location</div>
                    <div className="text-gray-600 text-lg">Delhi, India</div>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-4 mt-10">
                {[
                  { icon: Facebook, label: 'Facebook' },
                  { icon: Twitter, label: 'Twitter' },
                  { icon: Instagram, label: 'Instagram' },
                  { icon: Linkedin, label: 'LinkedIn' }
                ].map((social, idx) => (
                  <a 
                    key={idx}
                    href="#" 
                    className="bg-blue-100 p-4 rounded-xl hover:bg-blue-600 hover:shadow-xl transition transform hover:scale-110 group"
                    aria-label={social.label}
                  >
                    <social.icon className="h-7 w-7 text-blue-600 group-hover:text-white transition" />
                  </a>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-3xl shadow-2xl border-2 border-blue-100 overflow-hidden">
              <div className="bg-blue-600 p-8 text-white">
                <h3 className="text-3xl font-bold mb-2">Send us a message</h3>
                <p className="text-blue-100">We'll get back to you within 24 hours</p>
              </div>
              <form className="p-8 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Your Name</label>
                  <input 
                    type="text" 
                    placeholder="John Doe"
                    className="w-full px-5 py-4 rounded-xl border-2 border-blue-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none transition text-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Your Email</label>
                  <input 
                    type="email" 
                    placeholder="john@example.com"
                    className="w-full px-5 py-4 rounded-xl border-2 border-blue-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none transition text-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Your Message</label>
                  <textarea 
                    placeholder="Tell us how we can help you..."
                    rows="5"
                    className="w-full px-5 py-4 rounded-xl border-2 border-blue-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none transition text-lg resize-none"
                  />
                </div>
                <button className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 hover:shadow-xl transition transform hover:scale-105 flex items-center justify-center space-x-2">
                  <span>Send Message</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-blue-600 rounded-2xl p-3 shadow-xl">
                  <Pill className="h-7 w-7 text-white" />
                </div>
                <span className="font-bold text-2xl">PharmaCare</span>
              </div>
              <p className="text-gray-400 leading-relaxed">Your trusted pharmacy management solution for modern healthcare needs</p>
            </div>
            <div>
              <h4 className="font-bold text-xl mb-6 text-white">Quick Links</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-white cursor-pointer transition flex items-center space-x-2">
                  <ArrowRight className="h-4 w-4" />
                  <span>About Us</span>
                </li>
                <li className="hover:text-white cursor-pointer transition flex items-center space-x-2">
                  <ArrowRight className="h-4 w-4" />
                  <span>Careers</span>
                </li>
                <li className="hover:text-white cursor-pointer transition flex items-center space-x-2">
                  <ArrowRight className="h-4 w-4" />
                  <span>Blog</span>
                </li>
                <li className="hover:text-white cursor-pointer transition flex items-center space-x-2">
                  <ArrowRight className="h-4 w-4" />
                  <span>Press</span>
                </li>
              </ul>
              </div>
              <div>
                <h4 className="font-bold text-xl mb-6 text-white">Support</h4>
                <ul className="space-y-3 text-gray-400">
                  <li className="hover:text-white cursor-pointer transition flex items-center space-x-2">
                    <ArrowRight className="h-4 w-4" />
                    <span>Help Center</span>
                  </li>
                  <li className="hover:text-white cursor-pointer transition flex items-center space-x-2">
                    <ArrowRight className="h-4 w-4" />
                    <span>Terms of Service</span>
                  </li>
                  <li className="hover:text-white cursor-pointer transition flex items-center space-x-2">
                    <ArrowRight className="h-4 w-4" />
                    <span>Privacy Policy</span>
                  </li>
                  <li className="hover:text-white cursor-pointer transition flex items-center space-x-2">
                    <ArrowRight className="h-4 w-4" />
                    <span>FAQ</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-xl mb-6 text-white">Newsletter</h4>
                <p className="text-gray-400 mb-6">Subscribe for health tips and updates</p>
                <div className="flex">
                  <input 
                    type="email" 
                    placeholder="Your email"
                    className="flex-1 px-5 py-3 rounded-l-xl bg-gray-800 border-2 border-gray-700 focus:outline-none focus:border-blue-600 text-white"
                  />
                  <button className="bg-blue-600 px-6 py-3 rounded-r-xl hover:bg-blue-700 transition font-bold">
                    →
                  </button>
                </div>
              </div>
          </div>
          <div className="border-t-2 border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 mb-4 md:mb-0">
              © 2025 PharmaCare. All rights reserved.
            </div>
            <div className="flex items-center space-x-6 text-gray-400">
              <BadgeCheck className="h-5 w-5 text-blue-500" />
              <span className="font-semibold">Certified & Trusted Platform</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Enhanced Auth Modal */}
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
                    setOtpSent(false);
                    setEmailOtpMode(false);
                    setError(null); 
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

              {/* Auth Method Selection */}
              <div className="flex gap-2 mb-8 bg-blue-50 p-2 rounded-xl border-2 border-blue-100">
                <button
                  onClick={() => handleAuthMethodChange('phone')}
                  className={`flex-1 py-3 rounded-lg font-bold transition-all duration-300 ${
                    authMethod === 'phone'
                      ? 'bg-white text-blue-600 shadow-md'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  <Smartphone className="inline h-5 w-5 mr-2" />
                  Phone (OTP)
                </button>
                <button
                  onClick={() => handleAuthMethodChange('email')}
                  className={`flex-1 py-3 rounded-lg font-bold transition-all duration-300 ${
                    authMethod === 'email'
                      ? 'bg-white text-blue-600 shadow-md'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  <Mail className="inline h-5 w-5 mr-2" />
                  Email ({authMethod === 'email' && emailOtpMode ? 'OTP' : 'Password'})
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {(!isLogin || (authMethod === 'email' && emailOtpMode) || authMethod === 'phone') && (
                  <>
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
                        // Name required for registration (either method) or for OTP verification
                        required={!isLogin || (authMethod === 'email' && emailOtpMode) || authMethod === 'phone'} 
                      />
                    </div>
                    {userType === 'pharmacist' && (
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
                          required={userType === 'pharmacist' && (!isLogin || (authMethod === 'email' && emailOtpMode) || authMethod === 'phone')}
                        />
                      </div>
                    )}
                  </>
                )}

                {authMethod === 'phone' ? (
                  <>
                    {/* PHONE INPUT */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center space-x-2">
                          <Smartphone className="h-4 w-4" />
                          <span>Phone Number *</span>
                        </label>
                        <div className="relative">
                          <Smartphone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-blue-400" />
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full pl-14 pr-5 py-4 rounded-xl border-2 border-blue-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition text-lg"
                            placeholder="+91 98765 43210"
                            required
                            disabled={!isLogin && otpSent}
                          />
                        </div>
                    </div>
                    
                    {/* PHONE OTP INPUT: Visible only if OTP sent */}
                    {otpSent && (
                        <div className="animate-fadeIn">
                            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center space-x-2">
                                <Lock className="h-4 w-4" />
                                <span>Enter OTP *</span>
                            </label>
                            <input
                                type="text"
                                name="otp"
                                value={formData.otp}
                                onChange={handleInputChange}
                                className="w-full px-5 py-4 rounded-xl border-2 border-blue-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition text-center text-3xl tracking-widest font-bold"
                                placeholder="- - - - - -"
                                maxLength="6"
                                required
                            />
                            <p className="text-sm text-gray-600 mt-3 text-center font-semibold">
                                OTP sent to {formData.phone}
                            </p>
                        </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* EMAIL INPUT: Always visible for Email method */}
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
                          disabled={emailOtpMode}
                        />
                      </div>
                    </div>

                    {/* PASSWORD/OTP FIELD: Conditional display */}
                    {(authMethod === 'email' && emailOtpMode) ? (
                        // EMAIL OTP FIELD
                        <div className="animate-fadeIn">
                            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center space-x-2">
                                <Lock className="h-4 w-4" />
                                <span>Enter OTP *</span>
                            </label>
                            <input
                                type="text"
                                name="otp"
                                value={formData.otp}
                                onChange={handleInputChange}
                                className="w-full px-5 py-4 rounded-xl border-2 border-blue-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition text-center text-3xl tracking-widest font-bold"
                                placeholder="- - - - - -"
                                maxLength="6"
                                required
                            />
                            <p className="text-sm text-gray-600 mt-3 text-center font-semibold">
                                OTP sent to {formData.email}
                            </p>
                            <button
                                type="button"
                                onClick={handleSendOtp} // Option to resend OTP
                                disabled={loading}
                                className="mt-3 w-full text-blue-600 hover:text-blue-700 font-bold text-sm disabled:opacity-50"
                            >
                                {loading ? 'Sending...' : 'Resend OTP'}
                            </button>
                        </div>
                    ) : (
                        // EMAIL PASSWORD FIELD
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
                                    placeholder="Enter your password"
                                    required={!emailOtpMode}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-600 transition"
                                >
                                    {showPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                                </button>
                            </div>
                        </div>
                    )}

                    {isLogin && authMethod === 'email' && !emailOtpMode && (
                      <div className="flex justify-between items-center">
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2 w-5 h-5 text-blue-600 rounded" />
                          <span className="text-sm text-gray-600 font-semibold">Remember me</span>
                        </label>
                        <button 
                            type="button" 
                            // When 'Forgot password?' is clicked, we trigger Send OTP for verification
                            onClick={() => handleSendOtp({ preventDefault: () => {} })} 
                            className="text-sm text-blue-600 hover:text-blue-700 font-bold"
                        >
                          Forgot password? (Or use OTP)
                        </button>
                      </div>
                    )}
                  </>
                )}

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
                      <span>
                        {
                        // Dynamic button text
                        authMethod === 'phone' && !otpSent ? 'Send OTP' : 
                        authMethod === 'phone' && otpSent ? 'Verify & Login' :
                        authMethod === 'email' && emailOtpMode ? 'Verify & Login' :
                        authMethod === 'email' && !emailOtpMode && !isLogin ? 'Create Account' :
                        authMethod === 'email' && !emailOtpMode && isLogin ? 'Login' :
                        'Next'
                        }
                      </span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </form>
              
              {/* ... (Rest of the modal content remains unchanged) ... */}
              
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthPage;