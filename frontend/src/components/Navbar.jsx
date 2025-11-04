// frontend/src/components/Navbar.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // <--- IMPORT NAVIGATE
import { 
  Pill, Package, FileText, ShoppingCart, BarChart3, Bell, 
  Search, Upload, Home, Settings, Menu, X, User, LogOut,
  ChevronDown, Check
} from 'lucide-react';

const Navbar = ({ activeView, setActiveView, userRole, isMobileMenuOpen, setIsMobileMenuOpen, handleLogout }) => { // <--- RECEIVE handleLogout
  const navigate = useNavigate(); // <--- INITIALIZE NAVIGATE
  const [scrolled, setScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    { id: 1, text: 'New prescription uploaded', time: '5 min ago', read: false },
    { id: 2, text: 'Order #12345 delivered', time: '1 hour ago', read: false },
    { id: 3, text: 'Stock alert: Aspirin low', time: '2 hours ago', read: true },
  ]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- LOGOUT HANDLER ---
  const handleUserLogout = () => {
      // 1. Close menus
      setShowProfileMenu(false);
      setIsMobileMenuOpen(false);
      // 2. Clear state in parent (App.jsx)
      handleLogout();
      // 3. Navigate to AuthPage
      navigate('/AuthPage'); 
  }
  // ----------------------

  const adminMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'prescriptions', label: 'Prescriptions', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];
  
  const customerMenuItems = [
    { id: 'find-medicine', label: 'Find Medicine', icon: Search },
    { id: 'upload-rx', label: 'Upload Rx', icon: Upload },
    { id: 'my-orders', label: 'My Orders', icon: ShoppingCart },
  ];

  const menuItems = userRole === 'admin' ? adminMenuItems : customerMenuItems;
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className={`bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white shadow-lg sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'shadow-2xl backdrop-blur-sm bg-opacity-95' : ''
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="bg-white rounded-full p-2 shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
              <Pill className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">PharmaCare</h1>
              <p className="text-xs text-blue-100 font-medium">
                {userRole === 'admin' ? '🔧 Admin Portal' : '💊 Customer Portal'}
              </p>
            </div>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-1 bg-blue-800 bg-opacity-30 rounded-xl p-1 backdrop-blur-sm">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all duration-200 transform hover:scale-105 ${
                  activeView === item.id 
                    ? 'bg-white text-blue-600 shadow-lg scale-105' 
                    : 'hover:bg-blue-500 hover:bg-opacity-50'
                }`}
              >
                <item.icon className={`h-4 w-4 transition-transform duration-200 ${
                  activeView === item.id ? 'scale-110' : ''
                }`} />
                <span className="text-sm font-semibold">{item.label}</span>
                {activeView === item.id && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-1 h-1 bg-blue-600 rounded-full"></div>
                )}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileMenu(false);
                }}
                className="relative hover:bg-blue-500 hover:bg-opacity-50 p-2.5 rounded-xl transition-all duration-200 transform hover:scale-110 active:scale-95"
              >
                <Bell className={`h-5 w-5 transition-transform duration-300 ${showNotifications ? 'rotate-12' : ''}`} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse shadow-lg">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-200 origin-top-right animate-in">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3">
                    <h3 className="text-white font-bold text-sm">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map(notif => (
                      <div 
                        key={notif.id}
                        className={`px-4 py-3 border-b border-gray-100 hover:bg-blue-50 transition-colors cursor-pointer ${
                          !notif.read ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          {!notif.read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                          )}
                          <div className="flex-1">
                            <p className="text-sm text-gray-800 font-medium">{notif.text}</p>
                            <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-3 bg-gray-50 text-center">
                    <button className="text-sm text-blue-600 font-semibold hover:text-blue-700">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Settings */}
            <button className="hover:bg-blue-500 hover:bg-opacity-50 p-2.5 rounded-xl transition-all duration-200 transform hover:scale-110 hover:rotate-90 active:scale-95">
              <Settings className="h-5 w-5" />
            </button>

            {/* Profile Menu */}
            <div className="relative hidden md:block">
              <button 
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center space-x-2 hover:bg-blue-500 hover:bg-opacity-50 px-3 py-2 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                  <User className="h-4 w-4" />
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-200 origin-top-right">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">John Doe</p>
                        <p className="text-blue-100 text-xs">{userRole === 'admin' ? 'Administrator' : 'Customer'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="py-2">
                    <button className="w-full px-4 py-3 text-left text-gray-700 hover:bg-blue-50 transition-colors flex items-center space-x-3">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">My Profile</span>
                    </button>
                    <button className="w-full px-4 py-3 text-left text-gray-700 hover:bg-blue-50 transition-colors flex items-center space-x-3">
                      <Settings className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Settings</span>
                    </button>
                    <hr className="my-2" />
                    {/* --- DESKTOP LOGOUT BUTTON --- */}
                    <button 
                      onClick={handleUserLogout} // <--- CALL LOGOUT HANDLER
                      className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-3"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="text-sm font-medium">Logout</span>
                    </button>
                    {/* --------------------------- */}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden hover:bg-blue-500 hover:bg-opacity-50 p-2.5 rounded-xl transition-all duration-200 transform hover:scale-110 active:scale-95" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 animate-in">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeView === item.id 
                    ? 'bg-white text-blue-600 shadow-lg transform scale-105' 
                    : 'hover:bg-blue-500 hover:bg-opacity-50'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-semibold">{item.label}</span>
                {activeView === item.id && <Check className="h-4 w-4 ml-auto" />}
              </button>
            ))}
            
            {/* Mobile Profile Section */}
            <div className="pt-4 mt-4 border-t border-blue-500 border-opacity-30">
              <div className="flex items-center space-x-3 px-4 py-3 bg-blue-500 bg-opacity-30 rounded-xl">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-sm">John Doe</p>
                  <p className="text-xs text-blue-100">{userRole === 'admin' ? 'Administrator' : 'Customer'}</p>
                </div>
              </div>
              {/* --- MOBILE LOGOUT BUTTON --- */}
              <button 
                onClick={handleUserLogout} // <--- CALL LOGOUT HANDLER
                className="w-full mt-2 px-4 py-3 text-left hover:bg-blue-500 hover:bg-opacity-50 rounded-xl transition-colors flex items-center space-x-3"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Logout</span>
              </button>
              {/* ---------------------------- */}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;