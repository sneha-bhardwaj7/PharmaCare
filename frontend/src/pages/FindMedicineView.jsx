import React, { useState, useEffect } from 'react';
import { 
  MapPin, Star, Phone, Package, ShoppingCart, 
  Loader, AlertCircle, User, Building2, Award, 
  Search, Shield, Zap, X, CheckCircle
} from 'lucide-react';

const FindMedicineView = () => {
  const [searchMedicine, setSearchMedicine] = useState('');
  const [pharmacistsWithMedicine, setPharmacistsWithMedicine] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPharmacist, setSelectedPharmacist] = useState(null);
  const [orderItems, setOrderItems] = useState([{ name: '', quantity: 1, price: 0, category: '' }]);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

const API_URL = `${import.meta.env.VITE_BACKEND_BASEURL ?? "http://localhost:5000"}/api`;
  const authData = JSON.parse(localStorage.getItem("user_auth") || '{}');
  const token = authData?.token;

  // Fetch user profile
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setUserProfile(data);
      }
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
    }
  };

  const handleSearchMedicine = async () => {
    if (!searchMedicine.trim()) {
      alert("Please enter a medicine name to search");
      return;
    }

    setLoading(true);
    setSearchPerformed(true);

    try {
      const res = await fetch(
        `${API_URL}/inventory/search?name=${encodeURIComponent(searchMedicine)}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      const data = await res.json();
      
      if (res.ok) {
        setPharmacistsWithMedicine(data.pharmacists || []);
      } else {
        alert(data.message || "Search failed");
        setPharmacistsWithMedicine([]);
      }
    } catch (err) {
      alert("Failed to search. Please check your connection.");
      setPharmacistsWithMedicine([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchMedicine();
    }
  };

  const handleSelectPharmacist = (pharmacist, medicine) => {
    setSelectedPharmacist(pharmacist);
    
    setOrderItems([{
      name: medicine.medicineName,
      quantity: 1,
      price: medicine.price,
      category: medicine.category
    }]);
    
    if (userProfile) {
      setDeliveryAddress(userProfile.address || '');
      setContactPhone(userProfile.phone || '');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedPharmacist) {
      alert("Please select a pharmacist first");
      return;
    }

    if (!deliveryAddress || !contactPhone) {
      alert("Please provide delivery address and contact phone");
      return;
    }

    const validItems = orderItems.filter(item => item.name && item.quantity > 0 && item.price > 0);
    
    if (validItems.length === 0) {
      alert("Please add at least one medicine with price");
      return;
    }

    const total = validItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const orderData = {
      pharmacy: selectedPharmacist.pharmacyName,
      pharmacyId: selectedPharmacist.pharmacistId,
      address: deliveryAddress,
      phone: contactPhone,
      items: validItems,
      total,
      paymentMethod: 'Cash'
    };

    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      if (res.ok) {
        alert("Order placed successfully!");
        setOrderItems([{ name: '', quantity: 1, price: 0, category: '' }]);
        setSelectedPharmacist(null);
        setDeliveryAddress('');
        setContactPhone('');
        setSearchMedicine('');
        setSearchPerformed(false);
      } else {
        const error = await res.json();
        alert(error.message || "Failed to place order");
      }
    } catch (err) {
      alert("Failed to place order");
    }
  };

  const addOrderItem = () => {
    setOrderItems([...orderItems, { name: '', quantity: 1, price: 0, category: '' }]);
  };

  const updateOrderItem = (index, field, value) => {
    const updated = [...orderItems];
    updated[index][field] = field === 'name' || field === 'category' ? value : parseFloat(value) || 0;
    setOrderItems(updated);
  };

  const removeOrderItem = (index) => {
    if (orderItems.length > 1) {
      setOrderItems(orderItems.filter((_, i) => i !== index));
    }
  };

  if (selectedPharmacist) {
    return (
      <div className="space-y-6">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
                <ShoppingCart className="h-9 w-9" />
                Place Order
              </h1>
              <p className="text-blue-100 text-lg">Order from {selectedPharmacist.pharmacyName}</p>
            </div>

            <button
              onClick={() => {
                setSelectedPharmacist(null);
                setOrderItems([{ name: '', quantity: 1, price: 0, category: '' }]);
                setDeliveryAddress('');
                setContactPhone('');
              }}
              className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-xl font-semibold transition"
            >
              Back to Search
            </button>
          </div>
        </div>

        {/* PHARMACY CARD */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold">{selectedPharmacist.pharmacyName}</h3>
              <p className="text-blue-100">{selectedPharmacist.pharmacyAddress}</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm mt-4">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>{selectedPharmacist.pharmacistPhone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-300 fill-current" />
              <span>{selectedPharmacist.rating || 4.5} Rating</span>
            </div>
          </div>
        </div>

        {/* USER DETAILS */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <User className="h-6 w-6 text-purple-600" />
            Your Details
          </h3>

          {userProfile && (userProfile.address || userProfile.phone) && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Auto-filled from your profile. You can edit if needed.</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Phone *</label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Address *</label>
              <input
                type="text"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* MEDICINE SECTION */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Package className="h-6 w-6 text-blue-600" />
              Medicine Details
            </h3>

            <button
              onClick={addOrderItem}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Add Medicine
            </button>
          </div>

          <div className="space-y-4">
            {orderItems.map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">

                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-gray-700">Medicine {index + 1}</span>

                  {orderItems.length > 1 && (
                    <button
                      onClick={() => removeOrderItem(index)}
                      className="text-red-500 hover:text-red-700 flex items-center gap-1"
                    >
                      <X className="h-4 w-4" />
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Medicine Name *
                    </label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateOrderItem(index, 'name', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity *</label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateOrderItem(index, 'quantity', e.target.value)}
                      min="1"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹) *</label>
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => updateOrderItem(index, 'price', e.target.value)}
                      min="0"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl"
                    />
                  </div>

                </div>

                <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-700">Subtotal:</span>
                    <span className="text-lg font-bold text-blue-600">
                      ₹{(item.quantity * item.price).toFixed(2)}
                    </span>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* ORDER SUMMARY */}
          <div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border-2 border-purple-200">
            <h4 className="font-bold text-gray-800 mb-4 text-lg">Order Summary</h4>

            <div className="space-y-2">
              <div className="flex justify-between text-gray-700">
                <span>Items Total:</span>
                <span className="font-semibold">
                  ₹{orderItems.reduce((sum, item) => sum + (item.quantity * item.price), 0).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-gray-700">
                <span>Delivery Fee:</span>
                <span className="font-semibold text-green-600">FREE</span>
              </div>

              <div className="border-t-2 border-purple-300 pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-bold text-gray-800">Total Amount:</span>
                  <span className="text-3xl font-bold text-purple-600">
                    ₹{orderItems.reduce((sum, item) => sum + (item.quantity * item.price), 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* PLACE ORDER */}
          <button
            onClick={handlePlaceOrder}
            disabled={!deliveryAddress || !contactPhone || orderItems.every(item => !item.name || item.price === 0)}
            className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-4 rounded-2xl font-bold text-lg shadow-xl transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {deliveryAddress && contactPhone && orderItems.some(item => item.name && item.price > 0)
              ? (
                <div className="flex items-center justify-center gap-2">
                  <Zap className="h-6 w-6" />
                  Place Order Now
                </div>
              )
              : (
                <div className="flex items-center justify-center gap-2">
                  <AlertCircle className="h-6 w-6" />
                  Complete All Required Fields
                </div>
              )
            }
          </button>

        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* PAGE HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow-2xl">
        <h2 className="text-4xl font-bold mb-2 flex items-center gap-2">
          <Search className="h-8 w-8" />
          Find Medicine Nearby
        </h2>
        <p className="text-blue-100 text-lg">
          Search for any medicine and find nearby pharmacists who have it in stock
        </p>
      </div>

      {/* SEARCH BOX */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />

            <input
              type="text"
              placeholder="Search for medicine (e.g., Paracetamol, Crocin, Dolo)..."
              value={searchMedicine}
              onChange={(e) => setSearchMedicine(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full pl-14 pr-4 py-4 border-2 border-gray-300 rounded-xl text-lg focus:border-blue-500 focus:outline-none"
            />
          </div>

          <button
            onClick={handleSearchMedicine}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg"
          >
            Search
          </button>

        </div>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader className="h-12 w-12 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600 font-semibold">
            Searching for pharmacists with {searchMedicine}...
          </p>
        </div>
      ) : searchPerformed && pharmacistsWithMedicine.length === 0 ? (

        /* NOT FOUND BOX */
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <AlertCircle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Medicine Not Found Nearby</h3>
          <p className="text-gray-600 mb-6">
            No pharmacists in your area currently have "{searchMedicine}" in stock.
          </p>

          <button 
            onClick={() => {
              setSearchMedicine('');
              setSearchPerformed(false);
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Search Another Medicine
          </button>

        </div>
      ) : searchPerformed ? (

        <div className="space-y-4">

          {/* FOUND COUNT */}
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-700" />
            <p className="text-green-800 font-semibold">
              Found {pharmacistsWithMedicine.length} pharmacist(s) with "{searchMedicine}" in your area
            </p>
          </div>

          {/* RESULTS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pharmacistsWithMedicine.map((result) => (
              <div
                key={result.pharmacistId}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all border-2 hover:border-blue-300 overflow-hidden"
              >

                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4">
                  <div className="flex items-center gap-3">

                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <Building2 className="h-7 w-7 text-blue-600" />
                    </div>

                    <div>
                      <h3 className="font-bold text-white text-lg">{result.pharmacyName}</h3>
                      <p className="text-blue-100 text-sm">Stock: {result.stock} units</p>
                    </div>

                  </div>
                </div>

                <div className="p-6 space-y-4">

                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Medicine Available:</p>
                    <p className="font-bold text-gray-800">{result.medicineName}</p>
                    <p className="text-sm text-gray-600 mt-1">Price: ₹{result.price} per unit</p>
                  </div>

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(result.rating || 0)
                              ? 'text-yellow-500 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-2 font-bold text-gray-800">{result.rating || 4.5}</span>
                    </div>

                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Award className="h-4 w-4 text-blue-600" />
                      <span>Licensed</span>
                    </div>

                  </div>

                  <div className="space-y-2 text-sm">

                    <div className="flex items-start gap-2 text-gray-700">
                      <MapPin className="h-4 w-4 text-blue-600 mt-0.5" />
                      <span>{result.pharmacyAddress}</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-700">
                      <Phone className="h-4 w-4 text-green-600" />
                      <span>{result.pharmacistPhone}</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-700">
                      <Shield className="h-4 w-4 text-purple-600" />
                      <span className="text-xs">License: {result.licenseNumber}</span>
                    </div>

                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4">

                    <button
                      onClick={() => window.open(`tel:${result.pharmacistPhone}`)}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2"
                    >
                      <Phone className="h-4 w-4" />
                      Call
                    </button>

                    <button
                      onClick={() => handleSelectPharmacist(result, result)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Order
                    </button>

                  </div>

                </div>

              </div>
            ))}
          </div>

        </div>
      ) : (

        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Search for Any Medicine</h3>
          <p className="text-gray-600">
            Enter the medicine name above to find nearby pharmacists who have it in stock
          </p>
        </div>
      )}

    </div>
  );
};

export default FindMedicineView;
