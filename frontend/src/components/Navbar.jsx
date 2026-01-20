// frontend/src/components/Navbar.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Package, FileText, TrendingUp, 
  Search, Upload, ShoppingCart, LogOut, Menu, X,
  Pill, User, Settings, Bell, Sun, Moon,
  Mail, Check, Clock, Package2, AlertCircle
} from 'lucide-react';

const Navbar = ({ 
  activeView, 
  setActiveView, 
  userRole, 
  isMobileMenuOpen, 
  setIsMobileMenuOpen,
  handleLogout 
}) => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const API_URL = `${import.meta.env.VITE_BACKEND_BASEURL}/api`;

  // Icon mapping for dynamic notifications
  const iconMap = {
    'new_order': ShoppingCart,
    'order_update': Package2,
    'new_prescription': FileText,
    'prescription_quoted': Clock,
    'prescription_approved': Check,
    'prescription_rejected': X,
    'low_stock': AlertCircle,
    'expiring_soon': AlertCircle
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.profile-dropdown') && !event.target.closest('.profile-button')) {
        setShowProfileMenu(false);
      }
      if (!event.target.closest('.notification-dropdown') && !event.target.closest('.notification-button')) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      const auth = JSON.parse(localStorage.getItem('user_auth'));
      if (!auth?.token) return;

      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${auth.token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          localStorage.setItem('user_profile', JSON.stringify(data));
          setUser(data);
        }
      } catch (err) {
        console.log("Profile fetch failed:", err);
      }
    };

    fetchProfile();
  }, []);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      const auth = JSON.parse(localStorage.getItem('user_auth'));
      if (!auth?.token) return;

      setLoadingNotifications(true);
      try {
        const res = await fetch(`${API_URL}/notifications`, {
          headers: {
            Authorization: `Bearer ${auth.token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          console.log("Notifications response:", data);
          
          // ✅ FIX: Handle both response formats
          if (data.success && Array.isArray(data.notifications)) {
            // Latest 5 for dropdown
            setNotifications(data.notifications.slice(0, 5));
            setUnreadCount(data.unreadCount || 0);
          } else if (Array.isArray(data)) {
            setNotifications(data.slice(0, 5));
            setUnreadCount(data.filter(n => !n.isRead).length);
          } else {
            setNotifications([]);
            setUnreadCount(0);
          }
        }
      } catch (err) {
        console.log("Notifications fetch failed:", err);
        setNotifications([]);
        setUnreadCount(0);
      } finally {
        setLoadingNotifications(false);
      }
    };

    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Mark all notifications as read
  const markAllAsRead = async () => {
    const auth = JSON.parse(localStorage.getItem('user_auth'));
    if (!auth?.token) return;

    try {
      const res = await fetch(`${API_URL}/notifications/mark-all-read`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      });

      if (res.ok) {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.log("Mark all read failed:", err);
    }
  };

  // Mark single notification as read
  const markAsRead = async (notificationId) => {
    const auth = JSON.parse(localStorage.getItem('user_auth'));
    if (!auth?.token) return;

    try {
      const res = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      });

      if (res.ok) {
        setNotifications(notifications.map(n => 
          n._id === notificationId ? { ...n, isRead: true } : n
        ));
        setUnreadCount(Math.max(0, unreadCount - 1));
      }
    } catch (err) {
      console.log("Mark as read failed:", err);
    }
  };

  // Get time ago
  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(date).toLocaleDateString('en-IN');
  };

  const getNavigationItems = () => {
    if (userRole === 'admin' || userRole === 'pharmacist') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'inventory', label: 'Inventory', icon: Package },
        { id: 'prescriptions', label: 'Prescriptions', icon: FileText },
        { id: 'analytics', label: 'Analytics', icon: TrendingUp },
        { id: 'orders-dashboard', label: 'Orders', icon: ShoppingCart }
      ];
    } else if (userRole === 'customer') {
      return [
        { id: 'find-medicine', label: 'Find Medicine', icon: Search },
        { id: 'upload-rx', label: 'Upload Prescription', icon: Upload },
        { id: 'my-orders', label: 'My Orders', icon: ShoppingCart }
      ];
    }
    return [];
  };

  const navigationItems = getNavigationItems();

  const getRoleDisplayName = () => {
    if (userRole === 'admin') return 'Admin';
    if (userRole === 'pharmacist') return 'Pharmacist';
    if (userRole === 'customer') return 'Customer';
    return 'User';
  };

  const handleProfileClick = () => {
    navigate('/app/profile');
    setShowProfileMenu(false);
    setIsMobileMenuOpen(false);
  };

  const handleNavigateToNotifications = () => {
    setActiveView('notifications');
    navigate('/app/notifications');
    setShowNotifications(false);
  };

  // Get notification color
  const getNotificationColor = (type) => {
    const colors = {
      new_order: 'bg-blue-100 text-blue-600',
      order_update: 'bg-green-100 text-green-600',
      new_prescription: 'bg-purple-100 text-purple-600',
      prescription_quoted: 'bg-orange-100 text-orange-600',
      prescription_approved: 'bg-green-100 text-green-600',
      prescription_rejected: 'bg-red-100 text-red-600',
      low_stock: 'bg-yellow-100 text-yellow-600',
      expiring_soon: 'bg-red-100 text-red-600'
    };
    return colors[type] || 'bg-blue-100 text-blue-600';
  };

  const getNotificationRoute = (notification, userRole) => {
  switch (notification.type) {
    case 'new_prescription':
      return userRole === 'pharmacist'
        ? '/app/prescriptions'
        : '/app/notifications';

    case 'prescription_quoted':
    case 'prescription_approved':
    case 'prescription_rejected':
      return '/app/my-orders';

    case 'new_order':
      return userRole === 'pharmacist'
        ? '/app/orders-dashboard'
        : '/app/my-orders';

    case 'order_update':
      return '/app/my-orders';

    case 'low_stock':
    case 'expiring_soon':
      return '/app/inventory';

    default:
      return '/app/notifications';
  }
};


  return (
    <nav className={`bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white static shadow-2xl top-0 z-[9999] transition-all duration-300 ${
      scrolled ? 'py-2 shadow-xl backdrop-blur-md bg-opacity-95' : 'py-0'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-white rounded-2xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative bg-white rounded-2xl p-2.5 shadow-xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Pill className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight flex items-center space-x-2">
                <span>PharmaCare</span>
              </h1>
              <p className="text-xs text-blue-100 font-medium flex items-center space-x-1">
                <span>{getRoleDisplayName()} Portal</span>
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1 bg-white/10 backdrop-blur-md rounded-2xl p-1.5 border border-white/20">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-300 transform ${
                  activeView === item.id
                    ? 'bg-white text-blue-600 shadow-lg scale-105'
                    : 'hover:bg-white/10 hover:scale-105'
                }`}
              >
                <item.icon className={`h-4 w-4 transition-transform duration-300 ${
                  activeView === item.id ? 'scale-110' : ''
                }`} />
                <span className="text-sm font-semibold">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {/* Dark Mode Toggle */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="hidden md:flex hover:bg-white/10 p-2.5 rounded-xl transition-all duration-300 transform hover:scale-110 active:scale-95 backdrop-blur-sm"
              title="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Notifications */}
            <div className="relative notification-dropdown">
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileMenu(false);
                }}
                className="notification-button relative hover:bg-white/10 p-2.5 rounded-xl transition-all duration-300 transform hover:scale-110 active:scale-95 backdrop-blur-sm"
              >
                <Bell className={`h-5 w-5 transition-transform duration-300 ${showNotifications ? 'animate-bounce' : ''}`} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center animate-pulse shadow-lg px-1.5">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="fixed top-16 right-6 w-96 bg-white rounded-2xl shadow-2xl z-[9999] overflow-hidden border border-gray-200 animate-in">

                  <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-bold text-lg">Notifications</h3>
                      <p className="text-blue-100 text-xs">{unreadCount} unread</p>
                    </div>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllAsRead}
                        className="text-white hover:bg-white/20 px-3 py-1 rounded-lg text-xs font-semibold transition"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-[70vh] overflow-y-auto">
                    {loadingNotifications ? (
                      <div className="px-6 py-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-sm text-gray-500 mt-2">Loading...</p>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="px-6 py-8 text-center">
                        <Bell className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map(notif => {
                        const IconComponent = iconMap[notif.type] || Bell;
                        
                        return (
                          <div
                            key={notif._id}
                            onClick={async () => {
                              if (!notif.isRead) {
                                await markAsRead(notif._id);
                              }

                              const route = getNotificationRoute(notif, userRole);
                              navigate(route);
                              setShowNotifications(false);
                            }}
                            className={`px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-all cursor-pointer ${
                              !notif.isRead ? 'bg-blue-50/50' : ''
                            }`}
                          >

                            <div className="flex items-start space-x-4">
                              <div className={`${getNotificationColor(notif.type)} p-2.5 rounded-xl shadow-sm group-hover:scale-110 transition-transform`}>
                                <IconComponent className="h-5 w-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <p className="text-sm font-bold text-gray-900">{notif.title}</p>
                                    <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">{notif.message}</p>
                                  </div>
                                  {!notif.isRead && (
                                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0 ml-2"></div>
                                  )}
                                </div>
                                <div className="flex items-center space-x-1 mt-2">
                                  <Clock className="h-3 w-3 text-gray-400" />
                                  <p className="text-xs text-gray-500">{getTimeAgo(notif.createdAt)}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <div className="px-6 py-4 bg-gray-50 text-center border-t border-gray-200">
                    <button 
                      onClick={handleNavigateToNotifications}
                      className="text-sm text-blue-600 font-semibold hover:text-blue-700 transition"
                    >
                      View all notifications →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative hidden md:block profile-dropdown">
              <button 
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                }}
                className="profile-button flex items-center space-x-2 hover:bg-white/10 px-3 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 backdrop-blur-sm border border-white/20"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white/30">
                  <User className="h-5 w-5 text-white" />
                </div>
              </button>

              {/* Profile Dropdown Content */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl z-[9999] overflow-hidden transform transition-all duration-300 origin-top-right animate-in border border-gray-200">
                  <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-2 py-2">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl ring-4 ring-white/30">
                        <User className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-bold text-lg">
                          {user?.name || "User"}
                        </p>
                        <p className="text-blue-100 text-sm font-medium">
                          {user?.email || getRoleDisplayName()}
                        </p>
                        {user?.userType === "pharmacist" && user?.pharmacyName && (
                          <p className="text-xs text-purple-200">{user.pharmacyName}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <button 
                      onClick={handleProfileClick}
                      className="w-full px-4 py-3 text-left text-gray-700 hover:bg-blue-50 rounded-xl transition-all flex items-center space-x-3 group"
                    >
                      <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200 transition">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-semibold">My Profile</span>
                        <p className="text-xs text-gray-500">View and edit profile</p>
                      </div>
                    </button>
                    
                    {/* <button 
                      onClick={() => {
                        navigate('/app/settings');
                        setShowProfileMenu(false);
                      }}
                      className="w-full px-4 py-3 text-left text-gray-700 hover:bg-purple-50 rounded-xl transition-all flex items-center space-x-3 group mt-1"
                    >
                      <div className="bg-purple-100 p-2 rounded-lg group-hover:bg-purple-200 transition">
                        <Settings className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-semibold">Settings</span>
                        <p className="text-xs text-gray-500">Preferences & privacy</p>
                      </div>
                    </button> */}
                    
                    <hr className="my-1" />
                    
                    <button 
                      onClick={handleLogout}
                      className="w-full px-4 py-1 text-left text-red-600 hover:bg-red-50 rounded-xl transition-all flex items-center space-x-3 group"
                    >
                      <div className="bg-red-100 p-2 rounded-lg group-hover:bg-red-200 transition">
                        <LogOut className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-semibold">Logout</span>
                        <p className="text-xs text-red-400">Sign out</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden hover:bg-white/10 p-2.5 rounded-xl transition-all duration-300 transform hover:scale-110 active:scale-95 backdrop-blur-sm border border-white/20" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 animate-in border-t border-white/20 mt-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all duration-300 transform ${
                  activeView === item.id
                    ? 'bg-white text-blue-600 shadow-lg scale-105'
                    : 'hover:bg-white/10'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-semibold">{item.label}</span>
                {activeView === item.id && <Check className="h-4 w-4 ml-auto" />}
              </button>
            ))}
            
            {/* Mobile Notifications Link */}
            <button
              onClick={() => {
                handleNavigateToNotifications();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all duration-300 hover:bg-white/10"
            >
              <Bell className="h-5 w-5" />
              <span className="font-semibold">Notifications</span>
              {unreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                  {unreadCount}
                </span>
              )}
            </button>
            
            {/* Mobile Profile Section */}
            <div className="pt-4 mt-4 border-t border-white/20 space-y-2">
              <div className="flex items-center space-x-3 px-4 py-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-sm">{user?.name || "User"}</p>
                  <p className="text-xs text-blue-100">{getRoleDisplayName()}</p>
                </div>
              </div>
              <button 
                onClick={handleProfileClick}
                className="w-full px-4 py-3 text-left hover:bg-white/10 rounded-xl transition-all flex items-center space-x-3"
              >
                <User className="h-5 w-5" />
                <span className="font-medium">View Profile</span>
              </button>
              <button 
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full px-4 py-3 text-left bg-red-500 hover:bg-red-600 rounded-xl transition-all flex items-center space-x-3 shadow-lg"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;