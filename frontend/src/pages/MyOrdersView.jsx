import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Package, Truck, CheckCircle, Clock, 
  MapPin, Phone, Eye, Download, Star, FileText, DollarSign,
  AlertCircle, XCircle, User, Calendar, RefreshCw
} from 'lucide-react';

const MyOrdersView = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [orders, setOrders] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const authData = JSON.parse(localStorage.getItem('user_auth'));
  const token = authData?.token;
  const userId = authData?.userId;

  useEffect(() => {
    fetchData();
    // Refresh data every 30 seconds for real-time updates
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch regular orders
      const ordersRes = await fetch(`${API_URL}/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const ordersData = await ordersRes.json();

      // Fetch prescriptions
      const prescriptionsRes = await fetch(`${API_URL}/prescriptions/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const prescriptionsData = await prescriptionsRes.json();

      setOrders(ordersData.orders || ordersData || []);
      setPrescriptions(prescriptionsData.prescriptions || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'delivered':
      case 'completed':
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'processing':
      case 'quoted':
        return <Truck className="h-5 w-5 text-blue-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-orange-500" />;
      case 'rejected':
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'delivered':
      case 'completed':
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'processing':
      case 'quoted':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'rejected':
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Awaiting Review',
      quoted: 'Price Quote Ready',
      approved: 'Order Created',
      rejected: 'Rejected',
      processing: 'Processing',
      completed: 'Completed',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    };
    return labels[status] || status;
  };

  // Get prescription workflow stage
  const getPrescriptionStage = (prescription) => {
    if (prescription.status === 'rejected') {
      return { stage: 4, label: 'Rejected', color: 'red' };
    }
    if (prescription.status === 'approved') {
      return { stage: 4, label: 'Order Created', color: 'green' };
    }
    if (prescription.status === 'quoted') {
      return { stage: 3, label: 'Quote Ready', color: 'blue' };
    }
    if (prescription.status === 'pending') {
      return { stage: 2, label: 'Under Review', color: 'orange' };
    }
    return { stage: 1, label: 'Uploaded', color: 'gray' };
  };

  // Combine and filter data
  const allItems = [
    ...orders.map(o => ({ ...o, type: 'order' })),
    ...prescriptions.map(p => ({ ...p, type: 'prescription' }))
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const filteredItems = activeTab === 'all' 
    ? allItems 
    : allItems.filter(item => item.status === activeTab);

  const statusCounts = {
    all: allItems.length,
    pending: allItems.filter(i => i.status === 'pending').length,
    quoted: allItems.filter(i => i.status === 'quoted').length,
    approved: allItems.filter(i => i.status === 'approved').length,
    processing: allItems.filter(i => i.status === 'processing').length,
    delivered: allItems.filter(i => i.status === 'delivered').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-semibold">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (allItems.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-12 text-center">
        <div className="bg-blue-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
          <ShoppingCart className="h-12 w-12 text-blue-500" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-3">No Orders Yet</h3>
        <p className="text-gray-600 mb-6">
          Upload a prescription or browse medicines to place your first order
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-4xl font-bold mb-2">My Orders & Prescriptions</h2>
            <p className="text-blue-100 text-lg">Track all your orders and prescription requests in one place</p>
          </div>
          <button
            onClick={fetchData}
            className="bg-white/20 hover:bg-white/30 p-3 rounded-xl transition flex items-center gap-2"
          >
            <RefreshCw className="h-5 w-5" />
            <span className="hidden md:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md p-2 flex flex-wrap gap-2">
        {[
          { id: 'all', label: 'All', count: statusCounts.all },
          { id: 'pending', label: 'Pending', count: statusCounts.pending },
          { id: 'quoted', label: 'Quoted', count: statusCounts.quoted },
          { id: 'approved', label: 'Approved', count: statusCounts.approved },
          { id: 'processing', label: 'Processing', count: statusCounts.processing },
          { id: 'delivered', label: 'Delivered', count: statusCounts.delivered }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-[100px] py-3 px-4 rounded-lg font-semibold transition ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.label} {tab.count > 0 && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id ? 'bg-white/20' : 'bg-gray-200'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Items List */}
      <div className="space-y-4">
        {filteredItems.map(item => {
          const prescriptionStage = item.type === 'prescription' ? getPrescriptionStage(item) : null;
          
          return (
            <div 
              key={item._id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden border border-gray-200"
            >
              {/* Item Header */}
              <div className={`p-6 border-b ${
                item.type === 'prescription' 
                  ? 'bg-gradient-to-r from-purple-50 to-blue-50' 
                  : 'bg-gradient-to-r from-blue-50 to-purple-50'
              }`}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      {item.type === 'prescription' ? (
                        <FileText className="h-6 w-6 text-purple-600" />
                      ) : (
                        <Package className="h-6 w-6 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 text-lg">
                          {item.type === 'prescription' ? 'Prescription Request' : 'Order'}
                        </h3>
                        <span className="px-2 py-1 bg-white rounded-full text-xs font-semibold text-gray-600">
                          {item.type === 'prescription' ? 'Rx' : `#${item._id.slice(-6)}`}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(item.createdAt).toLocaleDateString('en-IN', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {item.type === 'prescription' && (
                        <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                          <User className="h-4 w-4" />
                          Patient: {item.patientName}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`flex items-center space-x-2 px-4 py-2 rounded-full border font-semibold ${getStatusColor(item.status)}`}>
                      {getStatusIcon(item.status)}
                      <span>{getStatusLabel(item.status)}</span>
                    </span>
                    {(item.totalAmount > 0 || item.total > 0) && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          ₹{item.totalAmount || item.total}
                        </div>
                        <div className="text-sm text-gray-600">
                          {item.items?.length || 0} items
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Prescription Progress Bar */}
                {item.type === 'prescription' && prescriptionStage && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">Prescription Status</span>
                      <span className={`text-sm font-bold text-${prescriptionStage.color}-600`}>
                        {prescriptionStage.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4].map((stage) => (
                        <div 
                          key={stage}
                          className={`flex-1 h-2 rounded-full transition-all ${
                            stage <= prescriptionStage.stage
                              ? `bg-${prescriptionStage.color}-500`
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Uploaded</span>
                      <span>Review</span>
                      <span>Quoted</span>
                      <span>{item.status === 'approved' ? 'Order' : item.status === 'rejected' ? 'Rejected' : 'Final'}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Item Body */}
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Items/Medicines */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Package className="h-5 w-5 mr-2 text-blue-600" />
                      {item.type === 'prescription' ? 'Medicines' : 'Order Items'}
                    </h4>
                    
                    {item.items && item.items.length > 0 ? (
                      <div className="space-y-2">
                        {item.items.map((medicine, idx) => (
                          <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
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
                            {medicine.price === 0 && item.status === 'pending' && (
                              <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                                Awaiting quote
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">Pharmacist will add items after reviewing prescription</p>
                    )}
                  </div>

                  {/* Delivery Info */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-purple-600" />
                      Delivery Information
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-sm text-gray-600">Address</div>
                          <div className="font-medium text-gray-900">{item.address || item.deliveryAddress}</div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Phone className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-sm text-gray-600">Contact</div>
                          <div className="font-medium text-gray-900">{item.phone}</div>
                        </div>
                      </div>
                      {item.assignedPharmacist && (
                        <div className="flex items-start space-x-3">
                          <User className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="text-sm text-gray-600">Pharmacist</div>
                            <div className="font-medium text-gray-900">
                              {item.assignedPharmacist.pharmacyName || item.assignedPharmacist.name}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Linked Order Info */}
                {item.type === 'prescription' && item.orderId && (
                  <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-green-800 mb-1">✅ Order Created Successfully!</p>
                        <p className="text-sm text-green-700">
                          Your prescription has been approved and converted to Order ID: <span className="font-mono font-bold">#{item.orderId.toString().slice(-8)}</span>
                        </p>
                        <p className="text-sm text-green-600 mt-2">
                          Look for this order in your orders list above for delivery tracking.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Status Messages */}
                {item.status === 'pending' && item.type === 'prescription' && (
                  <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-orange-800 mb-1">📋 Prescription Under Review</p>
                        <p className="text-sm text-orange-700">
                          Your prescription has been sent to nearby pharmacists in your area (Pincode: {item.targetArea}). You'll be notified once they review and provide a price quote.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {item.status === 'quoted' && item.type === 'prescription' && (
                  <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold text-blue-800 mb-2">💰 Price Quote Ready!</p>
                        <p className="text-sm text-blue-700 mb-3">
                          The pharmacist has reviewed your prescription and provided a quote. They will create your order once confirmed.
                        </p>
                        <div className="bg-white rounded-lg p-3 border border-blue-200">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">Total Amount</span>
                            <span className="text-2xl font-bold text-blue-600">₹{item.totalAmount}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Payment Method: {item.paymentMethod}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-200">
                  {item.type === 'prescription' && item.imageUrl && (
                    <a
                      href={item.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition font-medium"
                    >
                      <FileText className="h-4 w-4" />
                      <span>View Prescription</span>
                    </a>
                  )}

                  <button 
                    onClick={() => setSelectedItem(item)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition font-medium"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View Details</span>
                  </button>

                  <button className="flex items-center space-x-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition font-medium ml-auto">
                    <Phone className="h-4 w-4" />
                    <span>Support</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <Package className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            No {activeTab !== 'all' ? getStatusLabel(activeTab) : ''} Items
          </h3>
          <p className="text-gray-600">
            You don't have any {activeTab !== 'all' ? activeTab : ''} orders or prescriptions
          </p>
        </div>
      )}
    </div>
  );
};

export default MyOrdersView;