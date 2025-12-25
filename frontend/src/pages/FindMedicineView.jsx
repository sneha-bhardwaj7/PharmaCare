import React, { useState } from 'react';
import { Search, MapPin, Clock, Phone, Star, AlertTriangle } from 'lucide-react';

const FindMedicineView = ({ pharmacies }) => {
  const [searchMedicine, setSearchMedicine] = useState('');

  // 🔥 Order placing handler
  const handleOrder = async (pharmacy) => {
    const orderItem = {
      pharmacy: pharmacy.name,
      address: pharmacy.location || "Not Provided",
      items: [
        {
          name: searchMedicine || "Requested Medicine",
          quantity: 1,
          price: 0,
        },
      ],
      total: 0,
    };

    try {
      const authData = JSON.parse(localStorage.getItem("user_auth"));
      const token = authData ? `Bearer ${authData.token}` : "";

      const res = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderItem),
      });

      if (!res.ok) throw new Error("Order failed");

      alert("Order placed successfully 🎉");
    } catch (err) {
      console.error(err);
      alert("Failed to place order");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
        <h2 className="text-4xl font-bold mb-2">Find Medicine Nearby</h2>
        <p className="text-blue-100 text-lg">Get your medicines in 15 minutes or less</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
          <input
            type="text"
            placeholder="Search for medicine..."
            value={searchMedicine}
            onChange={(e) => setSearchMedicine(e.target.value)}
            className="w-full pl-14 pr-4 py-4 border-2 rounded-xl text-lg"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pharmacies.map((pharmacy) => (
          <div
            key={pharmacy.id}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all border-2 hover:border-blue-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">{pharmacy.name}</h3>
                <div className="flex items-center space-x-1 mb-2">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="font-semibold text-gray-700">{pharmacy.rating}</span>
                  <span className="text-gray-500 text-sm">(156 reviews)</span>
                </div>
              </div>
              <span className={`px-3 py-1 text-xs rounded-full font-semibold ${
                  pharmacy.open ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}>
                {pharmacy.open ? "Open Now" : "Closed"}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center text-gray-600">
                <MapPin className="h-5 w-5 mr-3 text-blue-600" />
                <span className="font-semibold">{pharmacy.distance}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="h-5 w-5 mr-3 text-blue-600" />
                <span className="font-semibold">{pharmacy.time}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Phone className="h-5 w-5 mr-3 text-blue-600" />
                <span>{pharmacy.phone}</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => window.open(`tel:${pharmacy.phone}`)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Call
              </button>
              <button
                onClick={() => window.open(`https://maps.google.com/?q=${pharmacy.lat},${pharmacy.lng}`)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg"
              >
                Navigate
              </button>
            </div>

            {/* 🔥 Order button */}
            <div className="mt-3">
              <button
                onClick={() => handleOrder(pharmacy)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg w-full"
              >
                🛒 Order Medicine
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
        <h3 className="text-lg font-bold flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-blue-600" />
          Medicine Not Available Nearby?
        </h3>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg mt-3">
          Request Medicine
        </button>
      </div>
    </div>
  );
};

export default FindMedicineView;
