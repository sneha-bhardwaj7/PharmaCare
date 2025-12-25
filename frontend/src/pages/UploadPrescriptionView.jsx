import React, { useState } from "react";
import { Upload, Plus, Trash2, Package, Clock, CreditCard, FileText } from "lucide-react";

const UploadPrescriptionView = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [patientName, setPatientName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [dragActive, setDragActive] = useState(false);
  
  // Order-related fields
  const [items, setItems] = useState([{ name: "", quantity: 1, price: 0, category: "" }]);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [deliveryType, setDeliveryType] = useState("standard");
  const [prescriptionType, setPrescriptionType] = useState("acute");
  const [notes, setNotes] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const authData = JSON.parse(localStorage.getItem("user_auth"));
  const token = authData?.token;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setUploadedFile(URL.createObjectURL(file));
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setUploadedFile(URL.createObjectURL(file));
    }
  };

  // Add new item
  const addItem = () => {
    setItems([...items, { name: "", quantity: 1, price: 0, category: "" }]);
  };

  // Remove item
  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  // Update item
  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  // Calculate total
  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      alert("Please upload a prescription!");
      return;
    }

    if (!patientName || !phone || !address) {
      alert("Please fill in all required fields!");
      return;
    }

    // Validate items
    const validItems = items.filter(item => item.name && item.price > 0 && item.quantity > 0);
    if (validItems.length === 0) {
      alert("Please add at least one medicine item!");
      return;
    }

    if (!token) {
      alert("You are not logged in. Please login first.");
      return;
    }

    const formData = new FormData();
    formData.append("prescriptionImage", selectedFile);
    formData.append("patientName", patientName);
    formData.append("phone", phone);
    formData.append("address", address);
    formData.append("items", JSON.stringify(validItems));
    formData.append("totalAmount", calculateTotal());
    formData.append("paymentMethod", paymentMethod);
    formData.append("deliveryType", deliveryType);
    formData.append("prescriptionType", prescriptionType);
    formData.append("notes", notes);

    try {
      const res = await fetch(`${API_URL}/prescriptions/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        alert("Prescription uploaded successfully! Your order will be created after pharmacist approval.");
        
        // Reset form
        setUploadedFile(null);
        setSelectedFile(null);
        setPatientName("");
        setPhone("");
        setAddress("");
        setItems([{ name: "", quantity: 1, price: 0, category: "" }]);
        setPaymentMethod("Cash");
        setDeliveryType("standard");
        setPrescriptionType("acute");
        setNotes("");
      } else {
        alert(data.message || "Upload failed");
      }
    } catch (error) {
      console.log(error);
      alert("Something went wrong!");
    }
  };

  const totalAmount = calculateTotal();

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <h2 className="text-4xl font-bold mb-2">Upload Prescription & Order Details</h2>
        <p className="text-blue-100 text-lg">
          Upload your prescription and provide order details for quick processing
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Prescription Upload */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-600" />
              Upload Prescription Image
            </h3>

            <div
              className={`border-3 border-dashed rounded-xl p-8 text-center transition-all ${
                dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {uploadedFile ? (
                <div className="space-y-4">
                  <img
                    src={uploadedFile}
                    alt="Prescription Preview"
                    className="max-h-64 mx-auto rounded-lg shadow-md"
                  />
                  <button
                    onClick={() => {
                      setUploadedFile(null);
                      setSelectedFile(null);
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition-all"
                  >
                    Remove & Upload New
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
                    <Upload className="h-10 w-10 text-blue-600" />
                  </div>
                  <p className="text-lg font-semibold text-gray-800 mb-2">
                    Drop your prescription here or
                  </p>
                  <label className="cursor-pointer">
                    <span className="text-blue-600 font-semibold hover:underline">
                      browse files
                    </span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-sm text-gray-500">Supports JPG, PNG, PDF (Max 5MB)</p>
                </div>
              )}
            </div>
          </div>

          {/* Patient Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Patient Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Patient Name *
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter patient name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+91 XXXXXXXXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Delivery Address *
                </label>
                <textarea
                  rows="3"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter complete delivery address"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Order Details */}
        <div className="space-y-6">
          {/* Medicine Items */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Package className="h-6 w-6 text-green-600" />
                Medicine Items
              </h3>
              <button
                onClick={addItem}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-all"
              >
                <Plus className="h-4 w-4" />
                Add Item
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {items.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <span className="text-sm font-bold text-gray-700">Item {index + 1}</span>
                    {items.length > 1 && (
                      <button
                        onClick={() => removeItem(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateItem(index, "name", e.target.value)}
                    placeholder="Medicine name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />

                  <input
                    type="text"
                    value={item.category}
                    onChange={(e) => updateItem(index, "category", e.target.value)}
                    placeholder="Category (e.g., Antibiotic, Painkiller)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Quantity</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Price (₹)</label>
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => updateItem(index, "price", parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="text-right text-sm font-semibold text-gray-700">
                    Subtotal: ₹{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Preferences */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Clock className="h-6 w-6 text-purple-600" />
              Order Preferences
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Cash">Cash on Delivery</option>
                  <option value="Card">Credit/Debit Card</option>
                  <option value="UPI">UPI Payment</option>
                  <option value="Insurance">Insurance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Delivery Type
                </label>
                <select
                  value={deliveryType}
                  onChange={(e) => setDeliveryType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="standard">Standard (2-3 days)</option>
                  <option value="express">Express (Same day)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Prescription Type
                </label>
                <select
                  value={prescriptionType}
                  onChange={(e) => setPrescriptionType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="acute">Acute (Short-term)</option>
                  <option value="chronic">Chronic (Long-term)</option>
                  <option value="preventive">Preventive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  rows="3"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any special instructions or allergies..."
                />
              </div>
            </div>
          </div>

          {/* Order Summary & Submit */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg p-6 border-2 border-blue-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-blue-600" />
              Order Summary
            </h3>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold text-gray-800">₹{totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">GST (12%)</span>
                <span className="font-semibold text-gray-800">₹{(totalAmount * 0.12).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery Charges</span>
                <span className="font-semibold text-green-600">
                  {deliveryType === 'express' ? '₹50' : 'Free'}
                </span>
              </div>
              <div className="border-t border-blue-300 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-bold text-gray-800">Total Amount</span>
                  <span className="font-bold text-2xl text-blue-600">
                    ₹{(totalAmount * 1.12 + (deliveryType === 'express' ? 50 : 0)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!uploadedFile || !patientName || !phone || !address}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white px-6 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:cursor-not-allowed"
            >
              Submit Prescription & Order
            </button>

            <p className="text-xs text-gray-500 mt-3 text-center">
              * Order will be created after pharmacist approval
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPrescriptionView;