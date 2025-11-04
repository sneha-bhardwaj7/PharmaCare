// frontend/src/pages/UploadPrescriptionView.jsx

import React, { useState } from 'react';
import { Upload, FileText, Clock } from 'lucide-react';

// Upload Prescription View (Customer)
const UploadPrescriptionView = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

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
      setUploadedFile(URL.createObjectURL(e.dataTransfer.files[0]));
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(URL.createObjectURL(e.target.files[0]));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-8 text-white">
        <h2 className="text-4xl font-bold mb-2">Upload Prescription</h2>
        <p className="text-purple-100 text-lg">Get your medicines delivered quickly and safely</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Upload Your Prescription</h3>
          
          <div
            className={`border-3 border-dashed rounded-xl p-8 text-center transition-all ${
              dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {uploadedFile ? (
              <div className="space-y-4">
                <img src={uploadedFile} alt="Prescription" className="max-h-64 mx-auto rounded-lg" />
                <button
                  onClick={() => setUploadedFile(null)}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Remove & Upload New
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
                  <Upload className="h-10 w-10 text-blue-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-800 mb-2">
                    Drop your prescription here or
                  </p>
                  <label className="cursor-pointer">
                    <span className="text-blue-600 font-semibold hover:underline">browse files</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-sm text-gray-500">Supports: JPG, PNG, PDF (Max 5MB)</p>
              </div>
            )}
          </div>

          {uploadedFile && (
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Patient Name</label>
                <input
                  type="text"
                  placeholder="Enter patient name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  placeholder="Enter phone number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Address</label>
                <textarea
                  placeholder="Enter delivery address"
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold">
                Submit Prescription
              </button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <FileText className="mr-2 h-5 w-5 text-blue-600" />
              How It Works
            </h3>
            <div className="space-y-4">
              {[
                { step: 1, title: 'Upload Prescription', desc: 'Take a clear photo or upload PDF of your prescription' },
                { step: 2, title: 'Pharmacist Reviews', desc: 'Our licensed pharmacist verifies your prescription' },
                { step: 3, title: 'Get Confirmation', desc: 'Receive confirmation with price and delivery time' },
                { step: 4, title: 'Receive Medicines', desc: 'Get your medicines delivered to your doorstep' }
              ].map(item => (
                <div key={item.step} className="flex items-start space-x-4">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{item.title}</h4>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
            <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-green-600" />
              Quick Delivery Options
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Express (2-4 hours)</span>
                <span className="font-semibold text-green-600">₹50</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Standard (Next Day)</span>
                <span className="font-semibold text-green-600">Free</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Store Pickup</span>
                <span className="font-semibold text-green-600">Free</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPrescriptionView;