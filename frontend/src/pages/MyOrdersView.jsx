import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  ShoppingCart, Package, Truck, CheckCircle, Clock, 
  MapPin, Phone, Eye, FileText, DollarSign,
  AlertCircle, XCircle, User, Calendar, RefreshCw, 
  ChevronDown, Search, Filter, ChevronRight
} from 'lucide-react';

// Global cache to persist data across navigations
const ordersCache = {
  data: null,
  timestamp: null,
  isValid() {
    // Cache is valid for 5 minutes
    return this.data && this.timestamp && (Date.now() - this.timestamp < 5 * 60 * 1000);
  }
};

const MyOrdersView = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [orders, setOrders] = useState(ordersCache.data?.orders || []);
  const [prescriptions, setPrescriptions] = useState(ordersCache.data?.prescriptions || []);
  const [loading, setLoading] = useState(!ordersCache.isValid());
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState(new Set());
  const hasFetched = useRef(false);

  // Memoize API URL and token
  const { API_URL, token, userId } = useMemo(() => {
    const apiUrl = `${import.meta.env.VITE_BACKEND_BASEURL ?? "http://localhost:5000"}/api`;
    const authData = JSON.parse(localStorage.getItem('user_auth') || '{}');
    return { 
      API_URL: apiUrl, 
      token: authData?.token,
      userId: authData?.userId
    };
  }, []);

  // Fetch data function with caching
  const fetchData = useCallback(async (forceRefresh = false) => {
    // Use cache if valid and not forcing refresh
    if (!forceRefresh && ordersCache.isValid()) {
      setOrders(ordersCache.data.orders);
      setPrescriptions(ordersCache.data.prescriptions);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const [ordersRes, prescriptionsRes] = await Promise.all([
        fetch(`${API_URL}/orders/my-orders`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_URL}/prescriptions/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const ordersData = await ordersRes.json();
      const prescriptionsData = await prescriptionsRes.json();

      const newOrders = ordersData.orders || ordersData || [];
      const newPrescriptions = prescriptionsData.prescriptions || [];

      // Update cache
      ordersCache.data = {
        orders: newOrders,
        prescriptions: newPrescriptions
      };
      ordersCache.timestamp = Date.now();

      setOrders(newOrders);
      setPrescriptions(newPrescriptions);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }, [API_URL, token, userId]);

  // Load data only once on mount
  useEffect(() => {
    if (!ordersCache.isValid() && !hasFetched.current) {
      hasFetched.current = true;
      fetchData(false);
    } else if (ordersCache.isValid() && orders.length === 0 && prescriptions.length === 0) {
      setOrders(ordersCache.data.orders);
      setPrescriptions(ordersCache.data.prescriptions);
      setLoading(false);
    }
  }, []);

  // Silent auto-refresh every 3 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      hasFetched.current = false;
      fetchData(true);
    }, 3 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchData]);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'delivered':
      case 'completed':
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'processing':
      case 'quoted':
        return <Truck className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'rejected':
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'delivered':
      case 'completed':
      case 'approved':
        return 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-green-200';
      case 'processing':
      case 'quoted':
        return 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white shadow-blue-200';
      case 'pending':
        return 'bg-gradient-to-r from-orange-400 to-amber-500 text-white shadow-orange-200';
      case 'rejected':
      case 'cancelled':
        return 'bg-gradient-to-r from-red-400 to-rose-500 text-white shadow-red-200';
      default:
        return 'bg-gradient-to-r from-gray-500 to-slate-600 text-white shadow-gray-200';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pending',
      quoted: 'Quoted',
      approved: 'Approved',
      rejected: 'Rejected',
      processing: 'Processing',
      completed: 'Completed',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    };
    return labels[status] || status;
  };

  // Combine and filter data with search
  const allItems = useMemo(() => {
    const combined = [
      ...orders.map(o => ({ ...o, type: 'order' })),
      ...prescriptions.map(p => ({ ...p, type: 'prescription' }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return combined.filter(item => 
        item._id.toLowerCase().includes(query) ||
        (item.pharmacy && item.pharmacy.toLowerCase().includes(query)) ||
        (item.patientName && item.patientName.toLowerCase().includes(query)) ||
        item.status.toLowerCase().includes(query)
      );
    }

    return combined;
  }, [orders, prescriptions, searchQuery]);

  const filteredItems = useMemo(() => {
    return activeTab === 'all' 
      ? allItems 
      : allItems.filter(item => item.status === activeTab);
  }, [allItems, activeTab]);

  const statusCounts = useMemo(() => ({
    all: allItems.length,
    pending: allItems.filter(i => i.status === 'pending').length,
    quoted: allItems.filter(i => i.status === 'quoted').length,
    processing: allItems.filter(i => i.status === 'processing').length,
    delivered: allItems.filter(i => i.status === 'delivered').length,
    completed: allItems.filter(i => i.status === 'completed').length,
  }), [allItems]);

  const toggleExpand = (itemId) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleRefresh = () => {
    hasFetched.current = false;
    fetchData(true);
  };

   if (loading && orders.length === 0 && prescriptions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg font-semibold">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (allItems.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-purple-50 p-6">
        <div className="max-w-2xl mx-auto mt-20">
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-400/20 to-indigo-400/20 rounded-full -ml-24 -mb-24"></div>
            
            <div className="relative z-10">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full w-28 h-28 flex items-center justify-center mx-auto mb-6 shadow-2xl transform hover:scale-110 transition-transform">
                <ShoppingCart className="h-14 w-14 text-white" />
              </div>
              <h3 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                No Orders Yet
              </h3>
              <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                Start your healthcare journey by uploading a prescription or browsing our medicines
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-2xl transition-all font-bold text-lg transform hover:scale-105">
                  Find Medicine
                </button>
                <button className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:border-purple-400 hover:shadow-lg transition-all font-bold text-lg">
                  Upload Prescription
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Enhanced Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                My Orders
              </h2>
              <p className="text-gray-600 font-medium flex items-center gap-2">
                <Package className="h-4 w-4" />
                {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-64 transition-all"
                />
              </div>
              
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh"
              >
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Enhanced Tabs */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-2 flex flex-wrap gap-2 mb-8">
          {[
            { id: 'all', label: 'All Orders', count: statusCounts.all, gradient: 'from-blue-300 to-indigo-400' },
            { id: 'pending', label: 'Pending', count: statusCounts.pending, gradient: 'from-blue-500 to-indigo-600' },
            { id: 'quoted', label: 'Quoted', count: statusCounts.quoted, gradient: 'from-blue-500 to-indigo-600' },
            { id: 'processing', label: 'Processing', count: statusCounts.processing, gradient: 'from-blue-500 to-indigo-600' },
            { id: 'delivered', label: 'Delivered', count: statusCounts.delivered, gradient: 'from-blue-500 to-indigo-600' },
            { id: 'completed', label: 'Completed', count: statusCounts.completed, gradient: 'from-blue-500 to-indigo-600' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[110px] py-3 px-4 rounded-xl font-bold text-sm transition-all transform ${
                activeTab === tab.id
                  ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg scale-105`
                  : 'text-gray-600 hover:bg-gray-100 hover:scale-102'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === tab.id ? 'bg-white/30' : 'bg-gray-200'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="space-y-5">
          {filteredItems.map((item) => {
            const isExpanded = expandedItems.has(item._id);
            
            return (
              <div 
                key={item._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-purple-200"
              >
                {/* Header */}
                <div 
                  className="p-5 cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all"
                  onClick={() => toggleExpand(item._id)}
                >
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    {/* Left: Type & ID */}
                    <div className="flex items-center gap-4 flex-1 min-w-[200px]">
                      <div className={`p-3 rounded-xl shadow-md ${
                        item.type === 'prescription' 
                          ? 'bg-gradient-to-br from-purple-500 to-purple-500' 
                          : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                      }`}>
                        {item.type === 'prescription' ? (
                          <FileText className="h-6 w-6 text-white" />
                        ) : (
                          <Package className="h-6 w-6 text-white" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <h3 className="font-bold text-lg text-gray-900">
                            {item.type === 'prescription' ? 'Prescription' : 'Order'}
                          </h3>
                          <span className="px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg text-xs font-bold text-gray-700 border border-gray-300">
                            #{item._id.slice(-6).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(item.createdAt).toLocaleDateString('en-IN', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Center: Status */}
                    <div
                    className={`
                      flex items-center justify-center gap-2
                      h-8 w-[140px]
                      rounded-3xl
                      ${getStatusColor(item.status)}
                      shadow-lg
                    `}
                  >
                    {getStatusIcon(item.status)}
                    <span className="text-sm font-bold">
                      {getStatusLabel(item.status)}
                    </span>
                  </div>


                    {/* Right: Amount & Expand */}
                    <div className="flex items-center gap-1">
                      {(item.totalAmount > 0 || item.total > 0) && (
                        <div className="text-right">
                          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {/* ₹{(item.totalAmount || item.total).toLocaleString()} */}
                          </div>
                          <div className="text-xs text-gray-500 font-medium">
                            {/* {item.items?.length || 0} items */}
                          </div>
                        </div>
                      )}
                      
                      <div className={`p-2 rounded-lg transition-all ${
                        isExpanded ? 'bg-purple-100' : 'bg-gray-100'
                      }`}>
                        <ChevronDown 
                          className={`h-3 w-3 text-gray-600 transition-transform duration-300 ${
                            isExpanded ? 'rotate-180 text-purple-600' : ''
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t-2 border-gray-100 bg-gradient-to-br from-gray-50 to-blue-50 p-6">
                    <div className="grid lg:grid-cols-2 gap-6">
                      {/* Items */}
                      <div className="bg-white rounded-xl p-5 shadow-md">
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                          <Package className="h-5 w-5 text-blue-600" />
                          {item.type === 'prescription' ? 'Medicines' : 'Order Items'}
                        </h4>
                        
                        {item.items && item.items.length > 0 ? (
                          <div className="space-y-3">
                            {item.items.map((medicine, idx) => (
                              <div key={idx} className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 hover:shadow-md transition-shadow">
                                <div className="flex-1">
                                  <div className="font-semibold text-gray-900 mb-1">{medicine.name}</div>
                                  <div className="text-sm text-gray-600 flex items-center gap-2">
                                    <span className="bg-white px-2 py-0.5 rounded-md border border-gray-200">
                                      Qty: {medicine.quantity}
                                    </span>
                                    {medicine.category && (
                                      <span className="text-gray-500">• {medicine.category}</span>
                                    )}
                                  </div>
                                </div>
                                {medicine.price > 0 && (
                                  <div className="text-right ml-4">
                                    <div className="font-bold text-lg text-gray-900">
                                      ₹{(medicine.price * medicine.quantity).toFixed(2)}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      ₹{medicine.price} each
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border-2 border-dashed border-orange-200">
                            <Clock className="h-12 w-12 text-orange-400 mx-auto mb-3" />
                            <p className="text-sm text-orange-700 font-medium">
                              Awaiting pharmacist review
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Delivery Info */}
                      <div className="bg-white rounded-xl p-5 shadow-md">
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                          <MapPin className="h-5 w-5 text-purple-600" />
                          Delivery Information
                        </h4>
                        <div className="space-y-4">
                          <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-purple-50 to-purple-50 rounded-lg">
                            <MapPin className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs text-gray-500 font-semibold mb-1">Delivery Address</div>
                              <div className="font-medium text-gray-900 text-sm break-words">
                                {item.address || item.deliveryAddress}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                            <Phone className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="text-xs text-gray-500 font-semibold mb-1">Contact Number</div>
                              <div className="font-medium text-gray-900 text-sm">{item.phone}</div>
                            </div>
                          </div>
                          {item.assignedPharmacist && (
                            <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                              <User className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <div className="text-xs text-gray-500 font-semibold mb-1">Pharmacist</div>
                                <div className="font-medium text-gray-900 text-sm">
                                  {item.assignedPharmacist.pharmacyName || item.assignedPharmacist.name}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 mt-6 pt-5 border-t-2 border-gray-200">
                      {item.type === 'prescription' && item.imageUrl && (
                        <a
                          href={item.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-600 text-white rounded-xl hover:shadow-xl transition-all font-bold transform hover:scale-105"
                        >
                          <FileText className="h-5 w-5" />
                          View Prescription
                        </a>
                      )}
                      
                      <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:shadow-lg transition-all font-bold ml-auto hover:from-gray-200 hover:to-gray-300">
                        <Phone className="h-5 w-5" />
                        Contact Support
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && !loading && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Package className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              No {activeTab !== 'all' ? getStatusLabel(activeTab) : ''} Items Found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery ? 'Try adjusting your search terms' : `No ${activeTab !== 'all' ? activeTab : ''} orders available`}
            </p>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-bold"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrdersView;