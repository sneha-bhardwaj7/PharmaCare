// frontend/src/pages/InventoryView.jsx

import React, { useState } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import { getStockStatus, getDaysUntilExpiry } from '../utils.js';

// Inventory View
const InventoryView = ({ medicines }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const filteredMedicines = medicines.filter(m => 
    (m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      m.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterCategory === 'all' || m.category === filterCategory)
  );

  const categories = ['all', ...new Set(medicines.map(m => m.category))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-3xl font-bold text-gray-800">Inventory Management</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors shadow-md">
          <Plus className="h-5 w-5" />
          <span>Add Medicine</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search medicines by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-blue-50 to-blue-100 text-left">
                <th className="px-6 py-4 text-sm font-semibold text-gray-700">Medicine Name</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700">Category</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700">Stock</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700">Price</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700">Expiry</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMedicines.map(medicine => {
                const stockStatus = getStockStatus(medicine.stock, medicine.reorderLevel);
                const daysToExpiry = getDaysUntilExpiry(medicine.expiry);
                const isExpiringSoon = daysToExpiry <= 30;

                return (
                  <tr key={medicine.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{medicine.name}</div>
                      <div className="text-sm text-gray-500">Batch: {medicine.batch}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                        {medicine.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{medicine.stock}</div>
                      <div className="text-xs text-gray-500">Min: {medicine.reorderLevel}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">₹{medicine.price}</td>
                    <td className="px-6 py-4">
                      <div className={`${isExpiringSoon ? 'text-red-600 font-semibold' : 'text-gray-700'}`}>
                        {medicine.expiry}
                      </div>
                      {isExpiringSoon && (
                        <div className="text-xs text-red-500">{daysToExpiry} days left</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${stockStatus.color} text-white`}>
                        {stockStatus.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryView;