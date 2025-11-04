// frontend/src/pages/AuthPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import axios from 'axios'; 
// ... (rest of lucide-react imports)
import { 
  Pill, ShoppingCart, Clock, Shield, Star, Users, 
  ArrowRight, CheckCircle, MapPin, TrendingUp, 
  Heart, Award, Phone, Mail, Facebook, Twitter, 
  Instagram, Linkedin, Menu, X, Eye, EyeOff, Smartphone
} from 'lucide-react';

// Base URL for your backend API
const API_BASE_URL = 'http://localhost:5000/api/auth'; 

// AuthPage now receives onLogin and onLogout
const AuthPage = ({ onLogin, onLogout }) => { 
  const navigate = useNavigate(); // Initialize useNavigate
  const [isLogin, setIsLogin] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userType, setUserType] = useState('customer');
  const [showPassword, setShowPassword] = useState(false);
  const [authMethod, setAuthMethod] = useState('phone');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Local state for visibility
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', otp: '', pharmacyName: ''
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Check local storage only for initial button state and sync with parent on mount
  useEffect(() => {
    const authData = localStorage.getItem('user_auth');
    if (authData) {
        setIsLoggedIn(true);
    } else {
        setIsLoggedIn(false);
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
      
      // *** CONDITIONAL REDIRECT TO THE CORRECT INITIAL VIEW ***
      const initialView = getInitialAuthView(data.userType);
      navigate(`/app/${initialView}`); 
  }

  // NOTE: Logout logic now uses onLogout from parent
  const handleLogout = () => {
    onLogout(); // Clears localStorage and parent state
    setIsLoggedIn(false);
    setFormData({
      name: '', email: '', password: '', phone: '', otp: '', pharmacyName: ''
    });
    navigate('/AuthPage'); // Redirects to AuthPage after logout
  };
  
  // --- UTILITY FUNCTION (Must match the one in App.jsx) ---
  const getInitialAuthView = (role) => {
      if (role === 'admin' || role === 'pharmacist') {
          return 'dashboard';
      } else if (role === 'customer') {
          return 'find-medicine';
      }
      return 'dashboard'; 
  }
  
  // --- Core Auth Logic (HandleSendOtp, HandleVerifyOtpAndRegister, HandleEmailAuth, HandleSubmit) ---
  // (Keep all your existing core logic as it was)
  // ... (Your core logic here, using the updated setAuthDataInStorage function)
  
  // NOTE: You must make sure to include the mock/placeholder API logic in your local AuthPage.jsx 
  // if you want the forms to actually work without a backend.
  
  // Mock implementations for demonstration:
  const handleSendOtp = async (e) => {
       e.preventDefault();
       setLoading(true);
       setError(null);
       console.log('OTP sent (mocked)');
       setOtpSent(true); 
       setLoading(false);
  }

  const handleVerifyOtpAndRegister = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
      
      console.log('Verification/Registration successful (mocked)');
      const mockRes = { 
          data: { 
              userType, 
              token: 'mock_token', 
              name: formData.name || 'Test User' 
          } 
      };
      // Successful authentication redirects via setAuthDataInStorage
      setAuthDataInStorage({ userType: mockRes.data.userType, token: mockRes.data.token, name: mockRes.data.name });
      setLoading(false);
  }

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    console.log('Email Auth successful (mocked)');
    const mockRes = { 
        data: { 
            userType, 
            token: 'mock_token', 
            name: formData.name || 'Test User' 
        } 
    };
    // Successful authentication redirects via setAuthDataInStorage
    setAuthDataInStorage({ userType: mockRes.data.userType, token: mockRes.data.token, name: mockRes.data.name });
    setLoading(false);
  };

  const handleSubmit = (e) => {
      e.preventDefault();

      if (authMethod === 'email') {
          handleEmailAuth(e);
      } else if (authMethod === 'phone') {
          if (!isLogin && !otpSent) { 
              handleSendOtp(e);
          } else if (isLogin || otpSent) { 
              handleVerifyOtpAndRegister(e);
          } 
      }
  }

  const handleSocialLogin = async (provider) => {
    const authData = {
      userType,
      token: `${provider}_token`,
      name: `${provider} User`,
    };
    setAuthDataInStorage(authData);
  };


  return (
    // ... (rest of your AuthPage component JSX, which remains mostly unchanged)
    // The JSX content for AuthPage is the same, using the updated handleLogout
    // function for the Logout button in the Navbar.
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-full p-2">
                <Pill className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                PharmaCare
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#services" className="text-gray-700 hover:text-blue-600 transition font-medium">Services</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 transition font-medium">How It Works</a>
              <a href="#testimonials" className="text-gray-700 hover:text-blue-600 transition font-medium">Testimonials</a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600 transition font-medium">Contact</a>
              {!isLoggedIn ? (
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600  text-white px-6 py-2 rounded-full hover:shadow-xl transition transform hover:scale-105 font-semibold"
                >
                  Get Started
                </button>
              ) : (
                <button 
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 rounded-full hover:shadow-xl transition transform hover:scale-105 font-semibold"
                >
                  Logout
                </button>
              )}
            </div>

            <button 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-4 space-y-3">
              <a href="#services" className="block text-gray-700 hover:text-blue-600">Services</a>
              <a href="#how-it-works" className="block text-gray-700 hover:text-blue-600">How It Works</a>
              <a href="#testimonials" className="block text-gray-700 hover:text-blue-600">Testimonials</a>
              <a href="#contact" className="block text-gray-700 hover:text-blue-600">Contact</a>
              {!isLoggedIn ? (
                <button 
                  onClick={() => { setShowAuthModal(true); setMobileMenuOpen(false); }}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full"
                >
                  Get Started
                </button>
              ) : (
                <button 
                  onClick={handleLogout}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 rounded-full"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
      {/* ... (rest of Hero, Services, How It Works, Testimonials, Stats, Contact, and Footer JSX remain here) */}
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
        {/* Animated Background Elements */}
        {/* <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div> */}
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block bg-gradient-to-r from-blue-100 to-purple-100 text-blue-600 px-4 py-2 rounded-full text-sm font-semibold shadow-md">
                India's Most Trusted Pharmacy Platform
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight">
                Your Health, Our
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Priority</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Find medicines in 15 minutes, manage prescriptions digitally, and get doorstep delivery with PharmaCare
              </p>
              <div className="flex flex-wrap gap-4">
                {!isLoggedIn && (
                  <button 
                    onClick={() => setShowAuthModal(true)}
                    className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-semibold flex items-center space-x-2 hover:shadow-2xl transition transform hover:scale-105"
                  >
                    <span>Get Started </span>
                    <ArrowRight className="h-5 w-5" />
                  </button>
                )}
                <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full font-semibold hover:border-blue-600 hover:text-blue-600 hover:shadow-lg transition transform hover:scale-105">
                  Watch Demo
                </button>
              </div>
              <div className="flex items-center space-x-8 pt-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-600 font-medium">100% Genuine</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-600 font-medium">24/7 Support</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-3xl p-8 shadow-2xl  duration-500">
                <div className="bg-white rounded-2xl p-8 transform ">
                  <img 
                    src="https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600" 
                    alt="Pharmacy" 
                    className="rounded-xl shadow-lg"
                  />
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-2xl p-4 ">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 rounded-full p-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                    <div>
                      <div className="font-bold text-gray-900 text-xl">5000+</div>
                      <div className="text-sm text-gray-600">Happy Customers</div>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-xl text-gray-600">Everything you need for your healthcare journey</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: MapPin,
                title: 'Find Medicine in 15 Min',
                description: 'Locate medicines at nearby pharmacies instantly with real-time availability',
                gradient: 'from-blue-500 to-blue-600'
              },
              {
                icon: ShoppingCart,
                title: 'Online Ordering',
                description: 'Order medicines online and get them delivered to your doorstep',
                gradient: 'from-purple-500 to-purple-600'
              },
              {
                icon: Clock,
                title: 'Prescription Management',
                description: 'Upload and manage your prescriptions digitally with secure storage',
                gradient: 'from-green-500 to-green-600'
              },
              {
                icon: TrendingUp,
                title: 'Inventory Tracking',
                description: 'For pharmacists: Manage stock, expiry dates, and reorders efficiently',
                gradient: 'from-orange-500 to-orange-600'
              },
              {
                icon: Heart,
                title: 'Health Reminders',
                description: 'Never miss a dose with smart medication reminders and tracking',
                gradient: 'from-red-500 to-red-600'
              },
              {
                icon: Award,
                title: 'Loyalty Rewards',
                description: 'Earn points on every purchase and get exclusive discounts',
                gradient: 'from-indigo-500 to-indigo-600'
              }
            ].map((service, idx) => (
              <div 
                key={idx}
                className="group bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3 border border-gray-100 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <div className={`bg-gradient-to-br ${service.gradient} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <service.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Get your medicines in 3 simple steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Search Medicine',
                description: 'Search for your medicine by name or upload prescription',
                icon: '🔍',
                color: 'blue'
              },
              {
                step: '02',
                title: 'Choose Pharmacy',
                description: 'Select from nearby pharmacies with real-time availability',
                icon: '🏥',
                color: 'purple'
              },
              {
                step: '03',
                title: 'Get Delivered',
                description: 'Receive medicines at your doorstep or pickup from store',
                icon: '🚚',
                color: 'pink'
              }
            ].map((step, idx) => (
              <div key={idx} className="relative">
                <div className="bg-white p-8 rounded-2xl shadow-xl text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="text-6xl mb-4 animate-bounce">{step.icon}</div>
                  <div className={`text-5xl font-bold bg-gradient-to-r from-${step.color}-400 to-${step.color}-600 bg-clip-text text-transparent mb-4`}>{step.step}</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {idx < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-8 w-8 text-purple-400 animate-pulse" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-600">Trusted by thousands across India</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Priya Sharma',
                role: 'Customer',
                image: 'https://i.pravatar.cc/150?img=1',
                rating: 5,
                text: 'PharmaCare made it so easy to find medicines during an emergency. Found what I needed in just 10 minutes!'
              },
              {
                name: 'Dr. Rajesh Kumar',
                role: 'Pharmacist',
                image: 'https://i.pravatar.cc/150?img=2',
                rating: 5,
                text: 'The inventory management system is fantastic. It saves me hours every week and helps prevent stockouts.'
              },
              {
                name: 'Anjali Patel',
                role: 'Customer',
                image: 'https://i.pravatar.cc/150?img=3',
                rating: 5,
                text: 'Love the prescription upload feature! No more carrying physical prescriptions everywhere.'
              }
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic text-lg">"{testimonial.text}"</p>
                <div className="flex items-center space-x-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full ring-4 ring-purple-100"
                  />
                  <div>
                    <div className="font-bold text-gray-900 text-lg">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { number: '5000+', label: 'Happy Customers', icon: Users },
              { number: '200+', label: 'Partner Pharmacies', icon: Shield },
              { number: '10000+', label: 'Medicines Available', icon: Pill },
              { number: '24/7', label: 'Customer Support', icon: Clock }
            ].map((stat, idx) => (
              <div key={idx} className="transform hover:scale-110 transition-transform duration-300">
                <stat.icon className="h-12 w-12 mx-auto mb-4 opacity-80" />
                <div className="text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-xl opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Get In Touch</h2>
              <p className="text-xl text-gray-600 mb-8">Have questions? We're here to help!</p>
              <div className="space-y-6">
                <div className="flex items-center space-x-4 group">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-full shadow-lg group-hover:shadow-xl transition">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Phone</div>
                    <div className="text-gray-600">+91 98765 43210</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4 group">
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-full shadow-lg group-hover:shadow-xl transition">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Email</div>
                    <div className="text-gray-600">support@pharmacare.com</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4 group">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-full shadow-lg group-hover:shadow-xl transition">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Location</div>
                    <div className="text-gray-600">Delhi, India</div>
                  </div>
                </div>
              </div>
              <div className="flex space-x-4 mt-8">
                {[
                  { icon: Facebook, color: 'blue' },
                  { icon: Twitter, color: 'blue' },
                  { icon: Instagram, color: 'pink' },
                  { icon: Linkedin, color: 'blue' }
                ].map((social, idx) => (
                  <a 
                    key={idx}
                    href="#" 
                    className={`bg-gradient-to-br from-${social.color}-100 to-${social.color}-200 p-3 rounded-full hover:shadow-lg transition transform hover:scale-110`}
                  >
                    <social.icon className={`h-6 w-6 text-${social.color}-600`} />
                  </a>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8 rounded-2xl shadow-xl">
              <form className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Your Name"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition"
                />
                <input 
                  type="email" 
                  placeholder="Your Email"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition"
                />
                <textarea 
                  placeholder="Your Message"
                  rows="4"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition"
                />
                <button className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:shadow-xl transition transform hover:scale-105">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-full p-2">
                  <Pill className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-xl">PharmaCare</span>
              </div>
              <p className="text-gray-400">Your trusted pharmacy management solution</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="hover:text-white cursor-pointer transition">About Us</li>
                <li className="hover:text-white cursor-pointer transition">Careers</li>
                <li className="hover:text-white cursor-pointer transition">Blog</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="hover:text-white cursor-pointer transition">Help Center</li>
                <li className="hover:text-white cursor-pointer transition">Terms of Service</li>
                <li className="hover:text-white cursor-pointer transition">Privacy Policy</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Newsletter</h4>
              <p className="text-gray-400 mb-4">Subscribe for health tips</p>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Your email"
                  className="flex-1 px-4 py-2 rounded-l-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500"
                />
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 rounded-r-lg hover:shadow-lg transition">
                  →
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            © 2025 PharmaCare. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {isLogin ? 'Welcome Back!' : 'Join PharmaCare'}
                </h2>
                <button 
                  onClick={() => {
                    setShowAuthModal(false);
                    setOtpSent(false);
                    setError(null); 
                  }}
                  className="text-gray-400 hover:text-gray-600 transition transform hover:scale-110"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              {/* Error Display */}
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
              )}

              {/* User Type Selection */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setUserType('customer')}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    userType === 'customer'
                      ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Users className="inline h-5 w-5 mr-2" />
                  Customer
                </button>
                <button
                  onClick={() => setUserType('pharmacist')}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    userType === 'pharmacist'
                      ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Shield className="inline h-5 w-5 mr-2" />
                  Pharmacist
                </button>
              </div>

              {/* Auth Method Selection */}
              <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => {
                    setAuthMethod('phone');
                    setOtpSent(false);
                  }}
                  className={`flex-1 py-2 rounded-lg font-medium transition-all duration-300 ${
                    authMethod === 'phone'
                      ? 'bg-white text-gray-900 shadow-md'
                      : 'text-gray-600'
                  }`}
                >
                  <Smartphone className="inline h-4 w-4 mr-2" />
                  Phone
                </button>
                <button
                  onClick={() => {
                    setAuthMethod('email');
                    setOtpSent(false);
                  }}
                  className={`flex-1 py-2 rounded-lg font-medium transition-all duration-300 ${
                    authMethod === 'email'
                      ? 'bg-white text-gray-900 shadow-md'
                      : 'text-gray-600'
                  }`}
                >
                  <Mail className="inline h-4 w-4 mr-2" />
                  Email
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Registration Fields (Name, Pharmacy Name) */}
                {!isLogin && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    {userType === 'pharmacist' && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Pharmacy Name *</label>
                        <input
                          type="text"
                          name="pharmacyName"
                          value={formData.pharmacyName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                          placeholder="Enter pharmacy name"
                          required
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Phone/OTP Fields */}
                {authMethod === 'phone' ? (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                          placeholder="+91 98765 43210"
                          required
                          disabled={!isLogin && otpSent}
                        />
                      </div>
                    </div>

                    {/* OTP Input */}
                    {(!isLogin && otpSent) && (
                      <div className="animate-fadeIn">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Enter OTP *
                        </label>
                        <input
                          type="text"
                          name="otp"
                          value={formData.otp}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-center text-2xl tracking-widest"
                          placeholder="- - - - - -"
                          maxLength="6"
                          required
                        />
                        <p className="text-sm text-gray-600 mt-2 text-center">
                          OTP sent to {formData.phone}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  // Email/Password Fields
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                          placeholder="Enter your password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {isLogin && authMethod === 'email' && (
                  <div className="flex justify-between items-center">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2 w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-600">Remember me</span>
                    </label>
                    <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                      Forgot password?
                    </a>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading 
                    ? 'Processing...' 
                    : authMethod === 'phone' && !isLogin && !otpSent
                    ? 'Send OTP'
                    : isLogin
                    ? 'Login'
                    : authMethod === 'phone' && otpSent
                    ? 'Verify OTP & Register'
                    : 'Create Account'}
                </button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => handleSocialLogin('google')}
                    className="flex items-center justify-center px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 transform hover:scale-105"
                  >
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="font-medium text-gray-700">Google</span>
                  </button>
                  <button 
                    onClick={() => handleSocialLogin('facebook')}
                    className="flex items-center justify-center px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 transform hover:scale-105"
                  >
                    <Facebook className="h-5 w-5 mr-2 text-blue-600" />
                    <span className="font-medium text-gray-700">Facebook</span>
                  </button>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  {isLogin ? "Don't have an account? " : 'Already have an account? '}
                  <button
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setOtpSent(false);
                      setError(null);
                      setFormData({ ...formData, otp: '' });
                    }}
                    className="text-blue-600 font-semibold hover:text-blue-700 transition"
                  >
                    {isLogin ? 'Sign Up' : 'Login'}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthPage;