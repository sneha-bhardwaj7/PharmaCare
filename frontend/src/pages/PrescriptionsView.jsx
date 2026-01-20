import React, { useEffect, useState, useMemo, useRef } from "react";
import { Calendar, X, Package, DollarSign, MapPin, Phone, User, ShoppingCart, CheckCircle, Clock, Edit2, Save } from "lucide-react";

// Create a cache outside the component to persist across unmounts
const prescriptionsCache = {
  data: null,
  pharmacistJoinedAt: null,
  timestamp: null,
  isValid() {
    // Cache is valid for 3 minutes
    return this.data && this.timestamp && (Date.now() - this.timestamp < 3 * 60 * 1000);
  }
};

const PrescriptionsView = () => {
  const [prescriptions, setPrescriptions] = useState(prescriptionsCache.data || []);
  const [loading, setLoading] = useState(!prescriptionsCache.isValid());
  const [selectedRx, setSelectedRx] = useState(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [quotedItems, setQuotedItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [pharmacistJoinedAt, setPharmacistJoinedAt] = useState(prescriptionsCache.pharmacistJoinedAt);
  const hasFetched = useRef(false);

  // Memoize API_URL and token to prevent re-reading localStorage
  const { API_URL, token } = useMemo(() => {
    const apiUrl = `${import.meta.env.VITE_BACKEND_BASEURL ?? "http://localhost:5000"}/api`;
    const authData = JSON.parse(localStorage.getItem("user_auth") || '{}');
    const authToken = authData?.token;
    return { API_URL: apiUrl, token: authToken };
  }, []);

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/prescriptions/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setPrescriptions(data.prescriptions);
        setPharmacistJoinedAt(data.pharmacistJoinedAt);
        // Update cache
        prescriptionsCache.data = data.prescriptions;
        prescriptionsCache.pharmacistJoinedAt = data.pharmacistJoinedAt;
        prescriptionsCache.timestamp = Date.now();
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if we don't have valid cached data and haven't fetched yet
    if (!prescriptionsCache.isValid() && !hasFetched.current) {
      hasFetched.current = true;
      loadPrescriptions();
    } else if (prescriptionsCache.isValid() && prescriptions.length === 0) {
      // Use cached data immediately
      setPrescriptions(prescriptionsCache.data);
      setPharmacistJoinedAt(prescriptionsCache.pharmacistJoinedAt);
      setLoading(false);
    }
  }, []);

  const startQuoting = (rx) => {
    setSelectedRx(rx);
    setIsQuoting(true);
    // Initialize quoted items with existing prices or 0
    // If no items exist, start with empty array (pharmacist will add manually)
    setQuotedItems(rx.items && rx.items.length > 0 
      ? rx.items.map(item => ({ 
          ...item, 
          price: item.price || 0 
        }))
      : []
    );
    setPaymentMethod(rx.paymentMethod || "Cash");
  };

  const addManualItem = () => {
    const newItem = {
      name: '',
      category: 'Medicine',
      quantity: 1,
      price: 0,
      isManual: true
    };
    setQuotedItems([...quotedItems, newItem]);
  };

  const updateManualItem = (index, field, value) => {
    const updated = [...quotedItems];
    if (field === 'price' || field === 'quantity') {
      updated[index][field] = parseFloat(value) || 0;
    } else {
      updated[index][field] = value;
    }
    setQuotedItems(updated);
  };

  const removeManualItem = (index) => {
    const updated = quotedItems.filter((_, idx) => idx !== index);
    setQuotedItems(updated);
  };

  const updateItemPrice = (index, price) => {
    const updated = [...quotedItems];
    updated[index].price = parseFloat(price) || 0;
    setQuotedItems(updated);
  };

  const calculateTotal = () => {
    return quotedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const submitQuote = async () => {
    const total = calculateTotal();
    
    if (quotedItems.length === 0) {
      alert("Please add at least one medicine");
      return;
    }

    // Check if all items have names and prices
    const hasEmptyFields = quotedItems.some(item => !item.name.trim() || item.price <= 0);
    if (hasEmptyFields) {
      alert("Please fill in all medicine names and prices");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/prescriptions/quote/${selectedRx._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: quotedItems,
          totalAmount: total,
          paymentMethod
        }),
      });

      if (res.ok) {
        alert("Price quote submitted successfully!");
        setIsQuoting(false);
        setSelectedRx(null);
        hasFetched.current = false;
        loadPrescriptions();
      }
    } catch (err) {
      console.log(err);
      alert("Failed to submit quote");
    }
  };

  const approveRx = async (id) => {
    const res = await fetch(`${API_URL}/prescriptions/approve/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      alert("Prescription approved and order created!");
      hasFetched.current = false;
      loadPrescriptions();
    } else {
      const data = await res.json();
      alert(data.message || "Already approved by another pharmacist");
    }
  };

  const rejectRx = async (id) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    await fetch(`${API_URL}/prescriptions/reject/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ pharmacistNote: reason }),
    });

    hasFetched.current = false;
    loadPrescriptions();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'quoted': return 'bg-blue-500';
      case 'approved': return 'bg-green-600';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
        <h2 className="text-3xl font-bold">Prescription Queue</h2>
        <p className="text-blue-100 mt-2">
          Review prescriptions from your area
          {pharmacistJoinedAt && (
            <span className="block text-sm mt-1 opacity-90">
              (Showing prescriptions uploaded after {new Date(pharmacistJoinedAt).toLocaleDateString('en-IN', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
              })})
            </span>
          )}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 font-semibold">Loading prescriptions...</span>
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No prescriptions in your area yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prescriptions.map((rx) => (
            <div key={rx._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200">
              <div className="relative h-48">
                <img
                  src={rx.imageUrl}
                  alt="Prescription"
                  className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setSelectedRx(rx)}
                />
                <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(rx.status)}`}>
                  {rx.status.toUpperCase()}
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-bold text-lg text-gray-800 mb-3 flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  {rx.patientName}
                </h3>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span>{new Date(rx.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>

                  {rx.items && (
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-green-600" />
                      <span>{rx.items.length} medicine(s)</span>
                    </div>
                  )}

                  {rx.totalAmount > 0 && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-purple-600" />
                      <span className="font-semibold">₹{rx.totalAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {rx.status === "pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => startQuoting(rx)}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      <Edit2 className="h-4 w-4" />
                      Quote Price
                    </button>
                    <button
                      onClick={() => rejectRx(rx._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {rx.status === "quoted" && (
                  <button
                    onClick={() => approveRx(rx._id)}
                    className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve & Create Order
                  </button>
                )}

                {rx.status === "approved" && rx.assignedPharmacist && (
                  <div className="text-sm bg-gray-100 text-gray-600 p-2 rounded-lg text-center">
                    Order created
                  </div>
                )}

                <button
                  onClick={() => setSelectedRx(rx)}
                  className="w-full mt-3 bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg font-semibold transition-all"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quoting Modal */}
      {isQuoting && selectedRx && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setIsQuoting(false)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl z-10">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">Quote Prices</h3>
                  <p className="text-blue-100 text-sm mt-1">Patient: {selectedRx.patientName}</p>
                </div>
                <button onClick={() => setIsQuoting(false)} className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2">
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Medicine Price Input Section */}
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-gray-800 flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    Enter Medicine Prices
                  </h4>
                  <button
                    onClick={addManualItem}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-1"
                  >
                    <span className="text-lg">+</span>
                    Add Medicine
                  </button>
                </div>
                {quotedItems.length === 0 ? (
                  <div className="text-center py-8 bg-white rounded-lg border-2 border-dashed border-blue-300">
                    <Package className="h-12 w-12 text-blue-300 mx-auto mb-2" />
                    <p className="text-gray-500 mb-3">No medicines added yet</p>
                    <button
                      onClick={addManualItem}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                    >
                      + Add First Medicine
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {quotedItems.map((item, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
                        {item.isManual ? (
                          <>
                            <div className="flex justify-between items-start mb-3">
                              <input
                                type="text"
                                value={item.name}
                                onChange={(e) => updateManualItem(idx, 'name', e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-gray-800"
                                placeholder="Medicine name"
                              />
                              <button
                                onClick={() => removeManualItem(idx)}
                                className="ml-2 text-red-500 hover:text-red-700 p-2"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                              <div>
                                <label className="text-xs text-gray-600 mb-1 block font-medium">Quantity</label>
                                <input
                                  type="number"
                                  value={item.quantity || ''}
                                  onChange={(e) => updateManualItem(idx, 'quantity', e.target.value)}
                                  min="1"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Qty"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-gray-600 mb-1 block font-medium">Price per unit (₹)</label>
                                <input
                                  type="number"
                                  value={item.price || ''}
                                  onChange={(e) => updateManualItem(idx, 'price', e.target.value)}
                                  min="0"
                                  step="0.01"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Price"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-gray-600 mb-1 block font-medium">Subtotal</label>
                                <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg font-semibold text-gray-800">
                                  ₹{(item.price * item.quantity).toFixed(2)}
                                </div>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <p className="font-semibold text-gray-800 text-lg">{item.name}</p>
                                <p className="text-sm text-gray-500">{item.category} • Quantity: {item.quantity}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs text-gray-600 mb-1 block font-medium">Price per unit (₹)</label>
                                <input
                                  type="number"
                                  value={item.price || ''}
                                  onChange={(e) => updateItemPrice(idx, e.target.value)}
                                  min="0"
                                  step="0.01"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Enter price"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-gray-600 mb-1 block font-medium">Subtotal</label>
                                <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg font-semibold text-gray-800">
                                  ₹{(item.price * item.quantity).toFixed(2)}
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Cash">Cash on Delivery</option>
                  <option value="Card">Credit/Debit Card</option>
                  <option value="UPI">UPI Payment</option>
                  <option value="Insurance">Insurance</option>
                </select>
              </div>

              {/* Quote Summary */}
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <h4 className="font-bold text-gray-800 mb-3">Quote Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">₹{calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">GST (12%)</span>
                    <span className="font-semibold">₹{(calculateTotal() * 0.12).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery</span>
                    <span className="font-semibold text-green-600">
                      {selectedRx.deliveryType === 'express' ? '₹50' : 'Free'}
                    </span>
                  </div>
                  <div className="border-t border-purple-300 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-800 text-lg">Total Quote</span>
                      <span className="font-bold text-2xl text-purple-600">
                        ₹{(calculateTotal() * 1.12 + (selectedRx.deliveryType === 'express' ? 50 : 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={submitQuote}
                disabled={quotedItems.length === 0}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white px-6 py-4 rounded-xl font-bold text-lg shadow-lg transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Save className="h-5 w-5" />
                Submit Quote to Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedRx && !isQuoting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedRx(null)}>
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl z-10">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">Prescription Details</h3>
                  <p className="text-blue-100 text-sm mt-1">ID: {selectedRx._id}</p>
                </div>
                <button onClick={() => setSelectedRx(null)} className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2">
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-bold text-gray-800 mb-3">Prescription Image</h4>
                <img src={selectedRx.imageUrl} alt="Prescription" className="w-full rounded-lg shadow-md" />
              </div>

              <div className="bg-blue-50 rounded-xl p-4">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Patient Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-semibold text-gray-800">{selectedRx.patientName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-semibold text-gray-800 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      {selectedRx.phone}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-semibold text-gray-800 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      {selectedRx.address}
                    </p>
                  </div>
                </div>
              </div>

              {selectedRx.items && selectedRx.items.length > 0 && (
                <div className="bg-green-50 rounded-xl p-4">
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Package className="h-5 w-5 text-green-600" />
                    Requested Medicines
                  </h4>
                  <div className="space-y-2">
                    {selectedRx.items.map((item, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-lg border border-green-200 flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-800">{item.name}</p>
                          <p className="text-sm text-gray-500">{item.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          {item.price > 0 && (
                            <p className="font-bold text-gray-800">₹{(item.price * item.quantity).toFixed(2)}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionsView;