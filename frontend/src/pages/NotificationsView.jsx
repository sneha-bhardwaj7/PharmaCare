import React, { useState, useEffect } from 'react';
import { 
  Bell, X, Check, Package, FileText, ShoppingCart, 
  AlertCircle, Clock, CheckCircle, XCircle, Trash2 
} from 'lucide-react';

const NotificationsView = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // FIX: Properly construct API URL with /api
  const API_URL = React.useMemo(() => {
    let baseUrl = import.meta.env.VITE_BACKEND_BASEURL;
    
    if (!baseUrl) {
      baseUrl = "http://localhost:5000";
    }
    
    // Ensure /api is in the path if not already present
    if (!baseUrl.includes('/api')) {
      baseUrl = `${baseUrl}/api`;
    }
    
    console.log('🔔 Notifications API URL:', baseUrl);
    return baseUrl;
  }, []);

  const authData = JSON.parse(localStorage.getItem('user_auth'));
  const token = authData?.token;

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      console.log('📡 Fetching notifications from:', `${API_URL}/notifications`);
      
      const res = await fetch(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('✅ Notifications loaded:', data);
      
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (err) {
      console.error('❌ Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const res = await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchNotifications();
      }
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch(`${API_URL}/notifications/mark-all-read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchNotifications();
      }
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      const res = await fetch(`${API_URL}/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchNotifications();
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      new_order: <ShoppingCart className="h-5 w-5 text-blue-600" />,
      order_update: <Package className="h-5 w-5 text-green-600" />,
      new_prescription: <FileText className="h-5 w-5 text-purple-600" />,
      prescription_quoted: <Clock className="h-5 w-5 text-orange-600" />,
      prescription_approved: <CheckCircle className="h-5 w-5 text-green-600" />,
      prescription_rejected: <XCircle className="h-5 w-5 text-red-600" />,
      low_stock: <AlertCircle className="h-5 w-5 text-yellow-600" />,
      expiring_soon: <AlertCircle className="h-5 w-5 text-red-600" />
    };
    return icons[type] || <Bell className="h-5 w-5 text-gray-600" />;
  };

  const getNotificationColor = (type) => {
    const colors = {
      new_order: 'bg-blue-50 border-blue-200',
      order_update: 'bg-green-50 border-green-200',
      new_prescription: 'bg-purple-50 border-purple-200',
      prescription_quoted: 'bg-orange-50 border-orange-200',
      prescription_approved: 'bg-green-50 border-green-200',
      prescription_rejected: 'bg-red-50 border-red-200',
      low_stock: 'bg-yellow-50 border-yellow-200',
      expiring_soon: 'bg-red-50 border-red-200'
    };
    return colors[type] || 'bg-gray-50 border-gray-200';
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'read') return n.isRead;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-semibold">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-bold mb-2">Notifications</h2>
            <p className="text-blue-100 text-lg">Stay updated with all your activities</p>
          </div>
          {unreadCount > 0 && (
            <div className="bg-white rounded-full px-6 py-3 flex items-center space-x-3">
              <Bell className="h-6 w-6 text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">{unreadCount}</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === 'unread' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === 'read' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Read ({notifications.length - unreadCount})
            </button>
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold"
            >
              <Check className="h-4 w-4" />
              <span>Mark All as Read</span>
            </button>
          )}
        </div>

        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`rounded-xl p-4 border-2 transition-all ${
                  getNotificationColor(notification.type)
                } ${!notification.isRead ? 'shadow-md' : 'opacity-75'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`rounded-full p-3 ${
                      !notification.isRead ? 'bg-white shadow-sm' : 'bg-white/50'
                    }`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900">{notification.title}</h3>
                        {!notification.isRead && (
                          <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full font-semibold">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 mb-2">{notification.message}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(notification.createdAt).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification._id)}
                        className="p-2 bg-white hover:bg-green-100 text-green-600 rounded-lg transition"
                        title="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification._id)}
                      className="p-2 bg-white hover:bg-red-100 text-red-600 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsView;