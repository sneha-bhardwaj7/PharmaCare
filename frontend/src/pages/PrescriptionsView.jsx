import React, { useEffect, useState } from "react";
import { Calendar, X, Package, DollarSign, MapPin, Phone, User, ShoppingCart, CheckCircle, Clock } from "lucide-react";

const PrescriptionsView = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRx, setSelectedRx] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const authData = JSON.parse(localStorage.getItem("user_auth"));
  const token = authData?.token;
  const userRole = authData?.userType;
  const userId = authData?.userId;

  const loadPrescriptions = async () => {
    try {
      setLoading(true);

      const endpoint =
        userRole === "pharmacist" || userRole === "admin"
          ? `${API_URL}/prescriptions/all`
          : `${API_URL}/prescriptions/user/${userId}`;

      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.ok) {
        setPrescriptions(data.prescriptions);
      } else {
        alert(data.message || "Failed to load prescriptions");
      }
    } catch (err) {
      console.log(err);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const approveRx = async (id) => {
    if (userRole !== "pharmacist" && userRole !== "admin") return;

    const res = await fetch(`${API_URL}/prescriptions/approve/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      alert("Prescription approved and order created!");
    }

    loadPrescriptions();
  };

  const rejectRx = async (id) => {
    if (userRole !== "pharmacist" && userRole !== "admin") return;

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

    loadPrescriptions();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'approved': return 'bg-green-600';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
        <h2 className="text-3xl font-bold">
          {userRole === "pharmacist" || userRole === "admin"
            ? "Prescription Management"
            : "My Prescriptions"}
        </h2>
        <p className="text-blue-100 mt-2">
          {userRole === "pharmacist" || userRole === "admin"
            ? "Review and approve customer prescriptions"
            : "Track your prescription uploads and orders"}
        </p>
      </div>

      {/* Loading & Empty State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 font-semibold">Loading prescriptions...</span>
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {userRole === "pharmacist" || userRole === "admin"
              ? "No prescriptions uploaded yet."
              : "You have not uploaded any prescriptions."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prescriptions.map((rx) => (
            <div
              key={rx._id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200"
            >
              {/* Prescription Image */}
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

                {rx.orderId && (
                  <div className="absolute bottom-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <ShoppingCart className="h-3 w-3" />
                    Order Created
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-bold text-lg text-gray-800 mb-3 flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  {rx.patientName}
                </h3>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span>{new Date(rx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>

                  {rx.items && rx.items.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-green-600" />
                      <span>{rx.items.length} item(s)</span>
                    </div>
                  )}

                  {rx.totalAmount > 0 && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-purple-600" />
                      <span className="font-semibold">₹{rx.totalAmount.toFixed(2)}</span>
                    </div>
                  )}

                  {rx.pharmacistNote && (
                    <p className={`font-medium text-xs p-2 rounded-lg ${
                      rx.status === "rejected" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                    }`}>
                      Note: {rx.pharmacistNote}
                    </p>
                  )}
                </div>

                {/* Pharmacist Actions */}
                {(userRole === "pharmacist" || userRole === "admin") && rx.status === "pending" && (
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => approveRx(rx._id)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => rejectRx(rx._id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </button>
                  </div>
                )}

                {/* Customer Status */}
                {userRole === "customer" && (
                  <div className={`text-sm font-medium p-3 rounded-lg ${
                    rx.status === "pending"
                      ? "bg-yellow-50 text-yellow-700"
                      : rx.status === "approved"
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}>
                    {rx.status === "pending" && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Waiting for pharmacist review
                      </div>
                    )}
                    {rx.status === "approved" && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Approved - Order Created ✓
                      </div>
                    )}
                    {rx.status === "rejected" && (
                      <div>Rejected</div>
                    )}
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

      {/* Modal */}
      {selectedRx && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedRx(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">Prescription Details</h3>
                  <p className="text-blue-100 text-sm mt-1">ID: {selectedRx._id}</p>
                </div>
                <button
                  onClick={() => setSelectedRx(null)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Prescription Image */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-bold text-gray-800 mb-3">Prescription Image</h4>
                <img
                  src={selectedRx.imageUrl}
                  alt="Prescription"
                  className="w-full rounded-lg shadow-md"
                />
              </div>

              {/* Patient Info */}
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

              {/* Order Items */}
              {selectedRx.items && selectedRx.items.length > 0 && (
                <div className="bg-green-50 rounded-xl p-4">
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Package className="h-5 w-5 text-green-600" />
                    Medicine Items
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
                          <p className="font-bold text-gray-800">₹{(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Order Summary */}
              {selectedRx.totalAmount > 0 && (
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                  <h4 className="font-bold text-gray-800 mb-3">Order Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-semibold">₹{selectedRx.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">GST (12%)</span>
                      <span className="font-semibold">₹{(selectedRx.totalAmount * 0.12).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Delivery</span>
                      <span className="font-semibold text-green-600">
                        {selectedRx.deliveryType === 'express' ? '₹50' : 'Free'}
                      </span>
                    </div>
                    <div className="border-t border-purple-300 pt-2">
                      <div className="flex justify-between">
                        <span className="font-bold text-gray-800">Total</span>
                        <span className="font-bold text-xl text-purple-600">
                          ₹{(selectedRx.totalAmount * 1.12 + (selectedRx.deliveryType === 'express' ? 50 : 0)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-purple-200 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Payment Method</p>
                      <p className="font-semibold">{selectedRx.paymentMethod}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Delivery Type</p>
                      <p className="font-semibold capitalize">{selectedRx.deliveryType}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Upload Date</p>
                  <p className="font-semibold text-gray-800">
                    {new Date(selectedRx.createdAt).toLocaleDateString('en-IN', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(selectedRx.status)}`}>
                    {selectedRx.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {selectedRx.notes && (
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Additional Notes</p>
                  <p className="text-gray-800">{selectedRx.notes}</p>
                </div>
              )}

              {selectedRx.pharmacistNote && (
                <div className={`rounded-lg p-4 border ${
                  selectedRx.status === 'rejected' 
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-green-50 border-green-200'
                }`}>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Pharmacist Note</p>
                  <p className="text-gray-800">{selectedRx.pharmacistNote}</p>
                </div>
              )}

              {selectedRx.orderId && (
                <div className="bg-green-100 rounded-lg p-4 border-2 border-green-500">
                  <p className="text-sm font-semibold text-green-800 mb-1 flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Order Created Successfully
                  </p>
                  <p className="text-green-700">Order ID: {selectedRx.orderId}</p>
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