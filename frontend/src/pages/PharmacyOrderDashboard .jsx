import React, { useState, useEffect } from 'react';
import { Package, Calendar, DollarSign, User, Phone, MapPin, Eye, Download, Filter, Search, TrendingUp, ShoppingCart, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

// Order Status Badge Component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: Clock, label: 'Pending' },
    processing: { color: 'bg-blue-100 text-blue-800 border-blue-300', icon: AlertCircle, label: 'Processing' },
    completed: { color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle, label: 'Completed' },
    cancelled: { color: 'bg-red-100 text-red-800 border-red-300', icon: XCircle, label: 'Cancelled' }
  };
  
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${config.color}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
};

// Stats Card Component
const StatsCard = ({ icon: Icon, title, value, subtitle, color, trend }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 hover:shadow-xl transition-all" style={{ borderColor: color }}>
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm text-gray-600 font-medium">{title}</p>
        <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        {trend && (
          <div className={`flex items-center gap-1 mt-2 text-sm font-semibold ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className={`h-4 w-4 ${trend < 0 ? 'rotate-180' : ''}`} />
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="rounded-full p-4" style={{ backgroundColor: `${color}20` }}>
        <Icon className="h-8 w-8" style={{ color }} />
      </div>
    </div>
  </div>
);

// Order Details Modal
const OrderDetailsModal = ({ order, onClose }) => {
  if (!order) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Order Details</h2>
              <p className="text-blue-100 text-sm mt-1">Order ID: #{order.orderId}</p>
            </div>
            <button onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all">
              <XCircle className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Customer Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold text-gray-800">{order.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-semibold text-gray-800 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  {order.customerPhone}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-semibold text-gray-800 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  {order.address}
                </p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Package className="h-5 w-5 text-green-600" />
              Order Items
            </h3>
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    <p className="font-bold text-gray-800">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
            <h3 className="font-bold text-gray-800 mb-3">Payment Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold text-gray-800">₹{order.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">GST (12%)</span>
                <span className="font-semibold text-gray-800">₹{(order.totalAmount * 0.12).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery Charges</span>
                <span className="font-semibold text-green-600">Free</span>
              </div>
              <div className="border-t border-blue-300 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-bold text-gray-800">Total</span>
                  <span className="font-bold text-xl text-blue-600">₹{(order.totalAmount * 1.12).toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-blue-200">
              <p className="text-sm text-gray-600">Payment Method</p>
              <p className="font-semibold text-gray-800">{order.paymentMethod}</p>
            </div>
          </div>

          {/* Order Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Order Date</p>
              <p className="font-semibold text-gray-800 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                {new Date(order.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <StatusBadge status={order.status} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
const PharmacyOrderDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  // Fetch orders from backend
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('No auth token found, using dummy data');
        const dummyOrders = generateDummyOrders();
        setOrders(dummyOrders);
        setFilteredOrders(dummyOrders);
        return;
      }

      // Replace with your actual API endpoint
      const response = await fetch('http://localhost:5000/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Ensure data is an array
      const ordersArray = Array.isArray(data) ? data : [];
      
      // Transform backend data to match frontend structure
      const transformedOrders = ordersArray.map(order => ({
        orderId: order._id || order.id,
        customerName: order.user?.name || 'Unknown Customer',
        customerPhone: order.user?.phone || 'N/A',
        address: order.address || 'N/A',
        items: order.items || [],
        totalAmount: order.total || 0,
        orderDate: order.createdAt || new Date().toISOString(),
        status: order.status || 'pending',
        paymentMethod: order.paymentMethod || 'Not specified'
      }));

      setOrders(transformedOrders);
      setFilteredOrders(transformedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Fallback to dummy data if API fails
      const dummyOrders = generateDummyOrders();
      setOrders(dummyOrders);
      setFilteredOrders(dummyOrders);
    } finally {
      setLoading(false);
    }
  };

  // Generate dummy orders for demo
  const generateDummyOrders = () => {
    const statuses = ['pending', 'processing', 'completed', 'cancelled'];
    const medicines = [
      { name: 'Paracetamol 500mg', category: 'Painkiller', price: 50 },
      { name: 'Amoxicillin 250mg', category: 'Antibiotic', price: 120 },
      { name: 'Cetirizine 10mg', category: 'Antihistamine', price: 80 },
      { name: 'Vitamin D3', category: 'Supplement', price: 250 },
      { name: 'Ibuprofen 400mg', category: 'Painkiller', price: 65 },
      { name: 'Azithromycin 500mg', category: 'Antibiotic', price: 180 }
    ];
    const paymentMethods = ['Cash', 'Card', 'UPI', 'Insurance'];

    return Array.from({ length: 25 }, (_, i) => {
      const itemCount = Math.floor(Math.random() * 4) + 1;
      const orderItems = Array.from({ length: itemCount }, () => {
        const med = medicines[Math.floor(Math.random() * medicines.length)];
        return {
          ...med,
          quantity: Math.floor(Math.random() * 3) + 1
        };
      });
      
      const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const daysAgo = Math.floor(Math.random() * 30);
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - daysAgo);

      return {
        orderId: `ORD${String(1000 + i).padStart(5, '0')}`,
        customerName: ['Raj Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Reddy', 'Vikram Singh'][Math.floor(Math.random() * 5)],
        customerPhone: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        address: ['123 MG Road, Bangalore', '45 Park Street, Delhi', '78 Marine Drive, Mumbai', '12 Anna Salai, Chennai'][Math.floor(Math.random() * 4)],
        items: orderItems,
        totalAmount,
        orderDate: orderDate.toISOString(),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)]
      };
    }).sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
  };

  // Filter orders
  useEffect(() => {
    let filtered = orders;

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(order => order.status === filterStatus);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerPhone.includes(searchTerm)
      );
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.orderDate);
        const diffDays = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));
        
        if (dateFilter === 'today') return diffDays === 0;
        if (dateFilter === 'week') return diffDays <= 7;
        if (dateFilter === 'month') return diffDays <= 30;
        return true;
      });
    }

    setFilteredOrders(filtered);
  }, [filterStatus, searchTerm, dateFilter, orders]);

  // Calculate statistics
  const stats = {
    totalOrders: orders.length,
    totalRevenue: orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + (o.totalAmount * 1.12), 0),
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    completedOrders: orders.filter(o => o.status === 'completed').length,
    cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
    averageOrderValue: orders.length > 0 ? orders.reduce((sum, o) => sum + o.totalAmount, 0) / orders.length : 0
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Order ID', 'Customer', 'Phone', 'Items', 'Total Amount', 'Status', 'Date'];
    const rows = filteredOrders.map(order => [
      order.orderId,
      order.customerName,
      order.customerPhone,
      order.items.length,
      `₹${(order.totalAmount * 1.12).toFixed(2)}`,
      order.status,
      new Date(order.orderDate).toLocaleDateString('en-IN')
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Order Management
              </h1>
              <p className="text-gray-600 mt-2">Track and manage all pharmacy orders</p>
            </div>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <Download className="h-5 w-5" />
              Export Report
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            icon={ShoppingCart}
            title="Total Orders"
            value={stats.totalOrders}
            subtitle="All time orders"
            color="#2563EB"
            trend={12.5}
          />
          <StatsCard
            icon={DollarSign}
            title="Total Revenue"
            value={`₹${Math.round(stats.totalRevenue).toLocaleString()}`}
            subtitle="From completed orders"
            color="#10B981"
            trend={8.3}
          />
          <StatsCard
            icon={Clock}
            title="Pending Orders"
            value={stats.pendingOrders}
            subtitle="Awaiting processing"
            color="#F59E0B"
          />
          <StatsCard
            icon={CheckCircle}
            title="Completed"
            value={stats.completedOrders}
            subtitle={`${((stats.completedOrders / stats.totalOrders) * 100).toFixed(1)}% success rate`}
            color="#8B5CF6"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by ID, name, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <button
              onClick={() => {
                setFilterStatus('all');
                setSearchTerm('');
                setDateFilter('all');
              }}
              className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Order ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Customer</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Items</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Total</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="text-gray-600 font-semibold">Loading orders...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Package className="h-16 w-16 text-gray-300" />
                        <p className="text-gray-500 font-semibold">No orders found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.orderId} className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-blue-600">#{order.orderId}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-800">{order.customerName}</p>
                          <p className="text-sm text-gray-500">{order.customerPhone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                          {order.items.length} items
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-800">₹{(order.totalAmount * 1.12).toFixed(2)}</p>
                        <p className="text-xs text-gray-500">Inc. GST</p>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700">
                          {new Date(order.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.orderDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow hover:shadow-lg"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
};

export default PharmacyOrderDashboard;