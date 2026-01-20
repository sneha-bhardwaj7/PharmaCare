import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  ShoppingCart, Package, Truck, CheckCircle, Clock, 
  MapPin, Phone, Eye, FileText, DollarSign,
  AlertCircle, XCircle, User, Calendar, RefreshCw, 
  ChevronDown, Search, Filter
} from 'lucide-react';

// Global cache to persist data across navigations
const ordersCache = {
  data: null,
  timestamp: null,
  CACHE_DURATION: 5 * 60 * 1000 // 5 minutes
};

const MyOrdersView = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [orders, setOrders] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState(new Set());
  const hasLoadedRef = useRef(false);
  const isMountedRef = useRef(true);

  const API_URL = `${import.meta.env.VITE_BACKEND_BASEURL ?? "http://localhost:5000"}/api`;
  const authData = JSON.parse(localStorage.getItem('user_auth'));
  const token = authData?.token;
  const userId = authData?.userId;

  // Check if cache is valid
  const isCacheValid = useCallback(() => {
    if (!ordersCache.data || !ordersCache.timestamp) return false;
    const now = Date.now();
    return (now - ordersCache.timestamp) < ordersCache.CACHE_DURATION;
  }, []);

  // Fetch data function with caching
  const fetchData = useCallback(async (forceRefresh = false) => {
    // Use cache if valid and not forcing refresh
    if (!forceRefresh && isCacheValid()) {
      setOrders(ordersCache.data.orders);
      setPrescriptions(ordersCache.data.prescriptions);
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

      if (isMountedRef.current) {
        setOrders(newOrders);
        setPrescriptions(newPrescriptions);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [API_URL, token, userId, isCacheValid]);

  // Load data only once on mount
  useEffect(() => {
    isMountedRef.current = true;
    
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      fetchData(false); // Use cache if available
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchData]);

  // Silent auto-refresh every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData(true); // Silent refresh
    }, 120000);
    
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
        return 'bg-green-500 text-white';
      case 'processing':
      case 'quoted':
        return 'bg-blue-500 text-white';
      case 'pending':
        return 'bg-orange-500 text-white';
      case 'rejected':
      case 'cancelled':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
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

  // Show loading only when actually fetching and no cached data
  // if (loading && orders.length === 0 && prescriptions.length === 0) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
  //       <div className="text-center">
  //         <div className="relative w-24 h-24 mx-auto mb-6">
  //           <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
  //           <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
  //         </div>
  //         <p className="text-gray-700 text-lg font-semibold">Loading your orders...</p>
  //         <p className="text-gray-500 text-sm mt-2">Please wait</p>
  //       </div>
  //     </div>
  //   );
  // }

  if (allItems.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <ShoppingCart className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-3">No Orders Yet</h3>
            <p className="text-gray-600 text-lg mb-8">
              Upload a prescription or browse medicines to place your first order
            </p>
            <div className="flex gap-4 justify-center">
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition font-semibold">
                Find Medicine
              </button>
              <button className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 transition font-semibold">
                Upload Prescription
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-8">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                My Orders
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-48 md:w-64"
                />
              </div>
              
              {/* Refresh Button */}
              <button
                onClick={() => fetchData(true)}
                disabled={loading}
                className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-1 flex flex-wrap gap-2 mb-6">
          {[
            { id: 'all', label: 'All', count: statusCounts.all },
            { id: 'pending', label: 'Pending', count: statusCounts.pending },
            { id: 'quoted', label: 'Quoted', count: statusCounts.quoted },
            { id: 'processing', label: 'Processing', count: statusCounts.processing },
            { id: 'delivered', label: 'Delivered', count: statusCounts.delivered },
            { id: 'completed', label: 'Completed', count: statusCounts.completed }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[90px] py-2.5 px-3 rounded-lg font-semibold text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md scale-105'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-white/20' : 'bg-gray-200'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredItems.map((item, index) => {
            const isExpanded = expandedItems.has(item._id);
            
            return (
              <div 
                key={item._id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                {/* Compact Header */}
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => toggleExpand(item._id)}
                >
                  <div className="flex items-center justify-between gap-4">
                    {/* Left: Type & ID */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`p-2.5 rounded-lg ${
                        item.type === 'prescription' ? 'bg-purple-100' : 'bg-blue-100'
                      }`}>
                        {item.type === 'prescription' ? (
                          <FileText className="h-5 w-5 text-purple-600" />
                        ) : (
                          <Package className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900 truncate">
                            {item.type === 'prescription' ? 'Prescription' : 'Order'}
                          </h3>
                          <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-mono text-gray-600">
                            #{item._id.slice(-6).toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(item.createdAt).toLocaleDateString('en-IN', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Center: Status */}
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${getStatusColor(item.status)} shadow-sm`}>
                      {getStatusIcon(item.status)}
                      <span className="text-sm font-semibold">{getStatusLabel(item.status)}</span>
                    </div>

                    {/* Right: Amount */}
                    <div className="flex items-center gap-3">
                      {(item.totalAmount > 0 || item.total > 0) && (
                        <div className="text-right">
                          <div className="text-xl font-bold text-gray-900">
                            ₹{(item.totalAmount || item.total).toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.items?.length || 0} items
                          </div>
                        </div>
                      )}
                      
                      <ChevronDown 
                        className={`h-5 w-5 text-gray-400 transition-transform ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50 p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Items */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Package className="h-4 w-4 text-blue-600" />
                          {item.type === 'prescription' ? 'Medicines' : 'Order Items'}
                        </h4>
                        
                        {item.items && item.items.length > 0 ? (
                          <div className="space-y-2">
                            {item.items.map((medicine, idx) => (
                              <div key={idx} className="flex justify-between items-center p-3 bg-white rounded-lg">
                                <div>
                                  <div className="font-medium text-gray-900">{medicine.name}</div>
                                  <div className="text-sm text-gray-600">
                                    Qty: {medicine.quantity}
                                    {medicine.category && ` • ${medicine.category}`}
                                  </div>
                                </div>
                                {medicine.price > 0 && (
                                  <div className="text-right">
                                    <div className="font-semibold text-gray-900">
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
                          <p className="text-sm text-gray-500 italic bg-white p-4 rounded-lg">
                            Awaiting pharmacist review
                          </p>
                        )}
                      </div>

                      {/* Delivery Info */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-purple-600" />
                          Delivery Information
                        </h4>
                        <div className="space-y-3 bg-white p-4 rounded-lg">
                          <div className="flex items-start gap-3">
                            <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs text-gray-500">Address</div>
                              <div className="font-medium text-gray-900 text-sm break-words">
                                {item.address || item.deliveryAddress}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Phone className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="text-xs text-gray-500">Contact</div>
                              <div className="font-medium text-gray-900 text-sm">{item.phone}</div>
                            </div>
                          </div>
                          {item.assignedPharmacist && (
                            <div className="flex items-start gap-3">
                              <User className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <div className="text-xs text-gray-500">Pharmacist</div>
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
                    <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-gray-200">
                      {item.type === 'prescription' && item.imageUrl && (
                        <a
                          href={item.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium text-sm"
                        >
                          <FileText className="h-4 w-4" />
                          View Prescription
                        </a>
                      )}
                      
                      <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium text-sm ml-auto">
                        <Phone className="h-4 w-4" />
                        Support
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
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <Package className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              No {activeTab !== 'all' ? getStatusLabel(activeTab) : ''} Items
            </h3>
            <p className="text-gray-600">
              {searchQuery ? 'No results found' : `No ${activeTab !== 'all' ? activeTab : ''} orders`}
            </p>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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