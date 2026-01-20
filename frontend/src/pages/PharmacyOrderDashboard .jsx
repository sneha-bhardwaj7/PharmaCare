import React, { useState, useEffect } from 'react';
import { 
  Package, CheckCircle, XCircle, Clock, AlertCircle,
  Phone, MapPin, User, ShoppingCart, TrendingUp,
  Filter, Search, Calendar, DollarSign, Truck,
  PlayCircle, Box, CheckCheck
} from 'lucide-react';

const PharmacistOrderDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    revenue: 0
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const authData = JSON.parse(localStorage.getItem("user_auth") || '{}');
  const token = authData?.token;

  // Fetch orders for this pharmacist
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/orders/pharmacist-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log("Fetched orders:", data);
        
        // Handle both response formats
        const orderList = data.orders || data || [];
        
        setOrders(Array.isArray(orderList) ? orderList : []);
        calculateStats(Array.isArray(orderList) ? orderList : []);
      } else {
        console.error("Failed to fetch orders:", res.status);
        setOrders([]);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    
    // Poll for new orders every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  // Calculate statistics
  const calculateStats = (orderList) => {
    if (!Array.isArray(orderList)) {
      console.error("calculateStats: orderList is not an array", orderList);
      return;
    }

    const stats = {
      total: orderList.length,
      pending: orderList.filter(o => o.status === 'pending').length,
      processing: orderList.filter(o => o.status === 'processing').length,
      completed: orderList.filter(o => o.status === 'completed' || o.status === 'delivered').length,
      revenue: orderList
        .filter(o => o.status === 'completed' || o.status === 'delivered')
        .reduce((sum, o) => sum + (o.total || 0), 0)
    };
    setStats(stats);
  };

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        alert(`Order status updated to ${newStatus}!`);
        fetchOrders();
        setSelectedOrder(null);
      } else {
        const error = await res.json();
        alert(error.message || "Failed to update order status");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update order status");
    }
  };

  // Get status info
  const getStatusInfo = (status) => {
    const statusMap = {
      pending: { 
        color: 'bg-yellow-500', 
        text: 'Pending', 
        icon: Clock, 
        bgClass: 'bg-yellow-50', 
        textClass: 'text-yellow-700',
        borderClass: 'border-yellow-300'
      },
      processing: { 
        color: 'bg-blue-500', 
        text: 'Processing', 
        icon: PlayCircle, 
        bgClass: 'bg-blue-50', 
        textClass: 'text-blue-700',
        borderClass: 'border-blue-300'
      },
      completed: { 
        color: 'bg-green-500', 
        text: 'Completed', 
        icon: CheckCircle, 
        bgClass: 'bg-green-50', 
        textClass: 'text-green-700',
        borderClass: 'border-green-300'
      },
      delivered: { 
        color: 'bg-purple-500', 
        text: 'Delivered', 
        icon: CheckCheck, 
        bgClass: 'bg-purple-50', 
        textClass: 'text-purple-700',
        borderClass: 'border-purple-300'
      },
      cancelled: { 
        color: 'bg-red-500', 
        text: 'Cancelled', 
        icon: XCircle, 
        bgClass: 'bg-red-50', 
        textClass: 'text-red-700',
        borderClass: 'border-red-300'
      }
    };
    return statusMap[status] || statusMap.pending;
  };

  // Filter orders
  const filteredOrders = Array.isArray(orders) ? orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = 
      order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items?.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  }) : [];

  // Get available actions for order status
  const getAvailableActions = (currentStatus) => {
    const actions = {
      pending: [
        { label: 'Accept Order', status: 'processing', color: 'bg-blue-600 hover:bg-blue-700' },
        { label: 'Reject Order', status: 'cancelled', color: 'bg-red-600 hover:bg-red-700' }
      ],
      processing: [
        { label: 'Mark as Completed', status: 'completed', color: 'bg-green-600 hover:bg-green-700' },
        { label: 'Out for Delivery', status: 'delivered', color: 'bg-purple-600 hover:bg-purple-700' }
      ],
      completed: [
        { label: 'Mark as Delivered', status: 'delivered', color: 'bg-purple-600 hover:bg-purple-700' }
      ]
    };
    return actions[currentStatus] || [];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
        <h2 className="text-4xl font-bold mb-2"> Order Management</h2>
        <p className="text-blue-100 text-lg">Manage incoming orders from customers</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">Everything you need for your healthcare journey, powered by technology and trust
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-semibold">Total Orders</p>
              <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-semibold">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-semibold">Processing</p>
              <p className="text-3xl font-bold text-blue-600">{stats.processing}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <PlayCircle className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-semibold">Completed</p>
              <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-semibold">Revenue</p>
              <p className="text-2xl font-bold text-purple-600">₹{stats.revenue.toFixed(2)}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-md p-4 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Order ID, customer name, or medicine..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto">
          {['all', 'pending', 'processing', 'completed', 'delivered', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
                filterStatus === status
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Orders Found</h3>
          <p className="text-gray-600">
            {filterStatus === 'all' 
              ? "No orders yet. They'll appear here when customers place orders."
              : `No ${filterStatus} orders at the moment.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredOrders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            const StatusIcon = statusInfo.icon;
            
            return (
              <div
                key={order._id}
                className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden border-2 ${statusInfo.borderClass}`}
              >
                {/* Order Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-5 text-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg mb-1">Order #{order._id.slice(-8)}</h3>
                      <div className="flex items-center gap-2 text-sm text-blue-100">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
                        <Clock className="h-4 w-4 ml-2" />
                        <span>{new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    <span className={`${statusInfo.bgClass} ${statusInfo.textClass} px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2`}>
                      <StatusIcon className="h-4 w-4" />
                      {statusInfo.text}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {/* Customer Info */}
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-600" />
                      Customer Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">Name:</span>
                        <span className="text-gray-800">{order.user?.name || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-green-600" />
                        <span className="text-gray-800">{order.phone || order.user?.phone || 'N/A'}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-800">{order.address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Box className="h-5 w-5 text-purple-600" />
                      Order Items ({order.items?.length || 0})
                    </h4>
                    <div className="space-y-2">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-lg p-3 flex justify-between items-center border border-gray-200">
                          <div>
                            <p className="font-semibold text-gray-800">{item.name}</p>
                            <p className="text-sm text-gray-600">Quantity: {item.quantity} × ₹{item.price.toFixed(2)}</p>
                          </div>
                          <p className="font-bold text-purple-600">₹{(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border-2 border-purple-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-purple-600" />
                        <span className="font-bold text-gray-800">Total Amount:</span>
                      </div>
                      <span className="text-2xl font-bold text-purple-600">₹{order.total.toFixed(2)}</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      Payment: {order.paymentMethod || 'Cash on Delivery'}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {getAvailableActions(order.status).length > 0 && (
                    <div className="grid grid-cols-2 gap-3 pt-4">
                      {getAvailableActions(order.status).map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => updateOrderStatus(order._id, action.status)}
                          className={`${action.color} text-white px-4 py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg`}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* View Details Button */}
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-3 rounded-xl font-semibold transition-all"
                  >
                    View Full Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">Order Details</h3>
                  <p className="text-blue-100 text-sm mt-1">Order ID: {selectedOrder._id}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="text-white hover:bg-white/20 rounded-full p-2">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-blue-50 rounded-xl p-4">
                <h4 className="font-bold text-gray-800 mb-3">Customer Information</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold">Name:</span> {selectedOrder.user?.name}</p>
                  <p><span className="font-semibold">Email:</span> {selectedOrder.user?.email}</p>
                  <p><span className="font-semibold">Phone:</span> {selectedOrder.phone || selectedOrder.user?.phone}</p>
                  <p><span className="font-semibold">Address:</span> {selectedOrder.address}</p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                {getAvailableActions(selectedOrder.status).map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      updateOrderStatus(selectedOrder._id, action.status);
                      setSelectedOrder(null);
                    }}
                    className={`${action.color} text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacistOrderDashboard;