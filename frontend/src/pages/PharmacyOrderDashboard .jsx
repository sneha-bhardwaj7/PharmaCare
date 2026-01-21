import React, { useState, useEffect } from 'react';
import { 
  Package, CheckCircle, XCircle, Clock, AlertCircle,
  Phone, MapPin, User, ShoppingCart, TrendingUp,
  Filter, Search, Calendar, DollarSign, Truck,
  PlayCircle, Box, CheckCheck, FileText, Pill
} from 'lucide-react';

const PharmacistOrderDashboard = () => {
  const [activeSection, setActiveSection] = useState('orders'); // 'orders' or 'prescriptions'
  const [orders, setOrders] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [stats, setStats] = useState({
    orders: { total: 0, pending: 0, processing: 0, completed: 0, revenue: 0 },
    prescriptions: { total: 0, pending: 0, quoted: 0, approved: 0, rejected: 0 }
  });

  const API_URL = `${import.meta.env.VITE_BACKEND_BASEURL ?? "http://localhost:5000"}/api`;
  const authData = JSON.parse(localStorage.getItem("user_auth") || '{}');
  const token = authData?.token;

  // Fetch all data
  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch orders
      const ordersRes = await fetch(`${API_URL}/orders/pharmacist-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        const orderList = ordersData.orders || ordersData || [];
        setOrders(Array.isArray(orderList) ? orderList : []);
        calculateOrderStats(Array.isArray(orderList) ? orderList : []);
      }

      // Fetch prescriptions
      const prescriptionsRes = await fetch(`${API_URL}/prescriptions/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (prescriptionsRes.ok) {
        const prescriptionsData = await prescriptionsRes.json();
        const prescriptionList = prescriptionsData.prescriptions || prescriptionsData || [];
        setPrescriptions(Array.isArray(prescriptionList) ? prescriptionList : []);
        calculatePrescriptionStats(Array.isArray(prescriptionList) ? prescriptionList : []);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    
    // Poll for new data every 30 seconds
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Calculate order statistics
  const calculateOrderStats = (orderList) => {
    const orderStats = {
      total: orderList.length,
      pending: orderList.filter(o => o.status === 'pending').length,
      processing: orderList.filter(o => o.status === 'processing').length,
      completed: orderList.filter(o => o.status === 'completed' || o.status === 'delivered').length,
      revenue: orderList
        .filter(o => o.status === 'completed' || o.status === 'delivered')
        .reduce((sum, o) => sum + (o.total || 0), 0)
    };
    setStats(prev => ({ ...prev, orders: orderStats }));
  };

  // Calculate prescription statistics
  const calculatePrescriptionStats = (prescriptionList) => {
    const prescriptionStats = {
      total: prescriptionList.length,
      pending: prescriptionList.filter(p => p.status === 'pending').length,
      quoted: prescriptionList.filter(p => p.status === 'quoted').length,
      approved: prescriptionList.filter(p => p.status === 'approved').length,
      rejected: prescriptionList.filter(p => p.status === 'rejected').length
    };
    setStats(prev => ({ ...prev, prescriptions: prescriptionStats }));
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
        fetchAllData();
        setSelectedItem(null);
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
  const getStatusInfo = (status, type = 'order') => {
    const statusMap = {
      // Order statuses
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
      },
      // Prescription statuses
      quoted: { 
        color: 'bg-blue-500', 
        text: 'Quoted', 
        icon: DollarSign, 
        bgClass: 'bg-blue-50', 
        textClass: 'text-blue-700',
        borderClass: 'border-blue-300'
      },
      approved: { 
        color: 'bg-green-500', 
        text: 'Approved', 
        icon: CheckCircle, 
        bgClass: 'bg-green-50', 
        textClass: 'text-green-700',
        borderClass: 'border-green-300'
      },
      rejected: { 
        color: 'bg-red-500', 
        text: 'Rejected', 
        icon: XCircle, 
        bgClass: 'bg-red-50', 
        textClass: 'text-red-700',
        borderClass: 'border-red-300'
      }
    };
    return statusMap[status] || statusMap.pending;
  };

  // Filter items based on active section
  const getFilteredItems = () => {
    const items = activeSection === 'orders' ? orders : prescriptions;
    
    return items.filter(item => {
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      const matchesSearch = 
        item._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.patientName && item.patientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.user?.name && item.user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.items?.some(i => i.name.toLowerCase().includes(searchQuery.toLowerCase())));
      return matchesStatus && matchesSearch;
    });
  };

  const filteredItems = getFilteredItems();

  // Get available actions
  const getAvailableActions = (item) => {
    if (activeSection === 'orders') {
      const actions = {
        pending: [
          { label: 'Accept Order', status: 'processing', color: 'bg-blue-600 hover:bg-blue-700' },
          { label: 'Cancel', status: 'cancelled', color: 'bg-red-600 hover:bg-red-700' }
        ],
        processing: [
          { label: 'Mark Completed', status: 'completed', color: 'bg-green-600 hover:bg-green-700' },
          { label: 'Out for Delivery', status: 'delivered', color: 'bg-purple-600 hover:bg-purple-700' }
        ],
        completed: [
          { label: 'Mark Delivered', status: 'delivered', color: 'bg-purple-600 hover:bg-purple-700' }
        ]
      };
      return actions[item.status] || [];
    } else {
      // Prescription actions - handled separately
      return [];
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
        <h2 className="text-4xl font-bold mb-2">Dashboard</h2>
        <p className="text-blue-100 text-lg">Manage orders and prescription requests</p>
      </div>

      {/* Section Toggle */}
      <div className="bg-white rounded-xl shadow-md p-2 flex gap-2">
        <button
          onClick={() => {
            setActiveSection('orders');
            setFilterStatus('all');
          }}
          className={`flex-1 py-4 px-6 rounded-lg font-bold text-lg transition-all ${
            activeSection === 'orders'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <div className="flex items-center justify-center gap-3">
            <ShoppingCart className="h-6 w-6" />
            <span>Orders ({stats.orders.total})</span>
          </div>
        </button>
        <button
          onClick={() => {
            setActiveSection('prescriptions');
            setFilterStatus('all');
          }}
          className={`flex-1 py-4 px-6 rounded-lg font-bold text-lg transition-all ${
            activeSection === 'prescriptions'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <div className="flex items-center justify-center gap-3">
            <FileText className="h-6 w-6" />
            <span>Prescriptions ({stats.prescriptions.total})</span>
          </div>
        </button>
      </div>

      {/* Statistics Cards */}
      {activeSection === 'orders' ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 font-semibold">Total Orders</p>
                <p className="text-2xl font-bold text-gray-800">{stats.orders.total}</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-full">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 font-semibold">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.orders.pending}</p>
              </div>
              <div className="bg-yellow-100 p-2 rounded-full">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 font-semibold">Processing</p>
                <p className="text-2xl font-bold text-blue-600">{stats.orders.processing}</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-full">
                <PlayCircle className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 font-semibold">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.orders.completed}</p>
              </div>
              <div className="bg-green-100 p-2 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 font-semibold">Revenue</p>
                <p className="text-xl font-bold text-purple-600">₹{stats.orders.revenue.toFixed(0)}</p>
              </div>
              <div className="bg-purple-100 p-2 rounded-full">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 font-semibold">Total Rx</p>
                <p className="text-2xl font-bold text-gray-800">{stats.prescriptions.total}</p>
              </div>
              <div className="bg-purple-100 p-2 rounded-full">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 font-semibold">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.prescriptions.pending}</p>
              </div>
              <div className="bg-yellow-100 p-2 rounded-full">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 font-semibold">Quoted</p>
                <p className="text-2xl font-bold text-blue-600">{stats.prescriptions.quoted}</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-full">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 font-semibold">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.prescriptions.approved}</p>
              </div>
              <div className="bg-green-100 p-2 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 font-semibold">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.prescriptions.rejected}</p>
              </div>
              <div className="bg-red-100 p-2 rounded-full">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-md p-4 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${activeSection}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto">
          {activeSection === 'orders' ? (
            ['all', 'pending', 'processing', 'completed', 'delivered', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
                  filterStatus === status
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))
          ) : (
            ['all', 'pending', 'quoted', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
                  filterStatus === status
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Items List - 3 per row */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading {activeSection}...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">No {activeSection} Found</h3>
          <p className="text-gray-600">
            {filterStatus === 'all' 
              ? `No ${activeSection} yet.`
              : `No ${filterStatus} ${activeSection} at the moment.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const statusInfo = getStatusInfo(item.status, activeSection);
            const StatusIcon = statusInfo.icon;
            
            return (
              <div
                key={item._id}
                className={`bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all overflow-hidden border-2 ${statusInfo.borderClass}`}
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 text-white">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-sm">
                        {activeSection === 'orders' ? 'Order' : 'Prescription'} #{item._id.slice(-6)}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-blue-100 mt-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(item.createdAt).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>
                    <span className={`${statusInfo.bgClass} ${statusInfo.textClass} px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1`}>
                      <StatusIcon className="h-3 w-3" />
                      {statusInfo.text}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  {/* Customer Info */}
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-blue-600" />
                        <span className="font-semibold">{activeSection === 'orders' ? item.user?.name : item.patientName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-green-600" />
                        <span>{item.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  {item.items && item.items.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-gray-800 mb-2">Items ({item.items.length})</h4>
                      <div className="space-y-1">
                        {item.items.slice(0, 2).map((medicine, idx) => (
                          <div key={idx} className="bg-gray-50 rounded p-2 text-xs flex justify-between">
                            <span className="font-medium">{medicine.name}</span>
                            {medicine.price > 0 && (
                              <span className="font-bold text-purple-600">₹{medicine.price}</span>
                            )}
                          </div>
                        ))}
                        {item.items.length > 2 && (
                          <p className="text-xs text-gray-500 text-center">+{item.items.length - 2} more</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Total */}
                  {(item.total > 0 || item.totalAmount > 0) && (
                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-200 flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-800">Total:</span>
                      <span className="text-lg font-bold text-purple-600">₹{(item.total || item.totalAmount).toFixed(2)}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {getAvailableActions(item).length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {getAvailableActions(item).map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => updateOrderStatus(item._id, action.status)}
                          className={`${action.color} text-white px-3 py-2 rounded-lg text-xs font-semibold transition-all`}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PharmacistOrderDashboard;