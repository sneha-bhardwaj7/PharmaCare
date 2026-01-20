// frontend/src/pages/InventoryView.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Plus, Edit, Trash2, X } from 'lucide-react';
import { getStockStatus, getDaysUntilExpiry } from '../utils';

const API_BASE_URL = `${
  import.meta.env.VITE_BACKEND_BASEURL ?? "http://localhost:5000"
}/api/inventory`;

// Helper function to get auth token
const getAuthToken = () => {
  const authData = JSON.parse(localStorage.getItem('user_auth'));
  console.log('Auth Data:', authData); // Debug log
  return authData ? `Bearer ${authData.token}` : '';
};

// --- Component: MedicineModal (for Add/Edit) ---
const MedicineModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    category: initialData?.category || '',
    stock: initialData?.stock || 0,
    reorderLevel: initialData?.reorderLevel || 10,
    price: initialData?.price || 0.00,
    expiry: initialData?.expiry || '',
    batch: initialData?.batch || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      const expiryDate = initialData.expiry 
        ? new Date(initialData.expiry).toISOString().substring(0, 10) 
        : '';
      
      setFormData({
        name: initialData.name,
        category: initialData.category,
        stock: initialData.stock,
        reorderLevel: initialData.reorderLevel,
        price: initialData.price,
        expiry: expiryDate,
        batch: initialData.batch,
      });
    } else {
      setFormData({
        name: '',
        category: '',
        stock: 0,
        reorderLevel: 10,
        price: 0.00,
        expiry: '',
        batch: '',
      });
    }
    setError(null);
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (name === 'price' ? parseFloat(value) : parseInt(value)) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.name || !formData.category || !formData.expiry || !formData.batch) {
      setError("Please fill in all required fields (Name, Category, Batch, Expiry).");
      setLoading(false);
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save medicine');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 m-4">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h3 className="text-2xl font-bold text-gray-800">
            {initialData ? 'Edit Medicine' : 'Add New Medicine'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-gray-700 font-medium">Name <span className="text-red-500">*</span></span>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required
              className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Paracetamol 500mg" 
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-gray-700 font-medium">Category <span className="text-red-500">*</span></span>
              <input 
                type="text" 
                name="category" 
                value={formData.category} 
                onChange={handleChange} 
                required
                className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Pain Relief" 
              />
            </label>
            <label className="block">
              <span className="text-gray-700 font-medium">Batch No. <span className="text-red-500">*</span></span>
              <input 
                type="text" 
                name="batch" 
                value={formData.batch} 
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., A123B" 
              />
            </label>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <label className="block">
              <span className="text-gray-700 font-medium">Stock Quantity</span>
              <input 
                type="number" 
                name="stock" 
                value={formData.stock} 
                onChange={handleChange} 
                min="0" 
                required
                className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500" 
              />
            </label>
            <label className="block">
              <span className="text-gray-700 font-medium">Reorder Level</span>
              <input 
                type="number" 
                name="reorderLevel" 
                value={formData.reorderLevel} 
                onChange={handleChange} 
                min="0" 
                required
                className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500" 
              />
            </label>
            <label className="block">
              <span className="text-gray-700 font-medium">Price (₹)</span>
              <input 
                type="number" 
                name="price" 
                value={formData.price} 
                onChange={handleChange} 
                step="0.01" 
                min="0" 
                required
                className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500" 
              />
            </label>
          </div>

          <label className="block">
            <span className="text-gray-700 font-medium">Expiry Date <span className="text-red-500">*</span></span>
            <input 
              type="date" 
              name="expiry" 
              value={formData.expiry} 
              onChange={handleChange} 
              required
              className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500" 
            />
          </label>

          <div className="pt-4 flex justify-end">
            <button 
              type="button" 
              onClick={onClose} 
              className="mr-3 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors shadow-md disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving...' : (initialData ? 'Save Changes' : 'Add Medicine')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Main Component: InventoryView ---
const InventoryView = () => {
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch medicines from backend
  const fetchMedicines = useCallback(async () => {
    console.log('🔄 Fetching medicines...'); // Debug log
    setLoading(true);
    setError(null);
    
    try {
      const token = getAuthToken();
      console.log('Token:', token ? 'Present' : 'Missing'); // Debug log
      
      const response = await fetch(API_BASE_URL, {
        method: 'GET',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status); // Debug log

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData); // Debug log
        throw new Error(errorData.message || `Failed to fetch medicines: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Fetched medicines:', data); // Debug log
      setMedicines(data);
    } catch (err) {
      console.error('❌ Error fetching medicines:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  // Add or Edit Medicine
  const handleAddOrEditMedicine = async (formData) => {
    console.log('💾 Saving medicine:', formData); // Debug log
    
    const endpoint = editingMedicine 
      ? `${API_BASE_URL}/${editingMedicine._id}` 
      : API_BASE_URL;
    const method = editingMedicine ? 'PUT' : 'POST';

    const response = await fetch(endpoint, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthToken(),
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    console.log('Save response:', data); // Debug log

    if (!response.ok) {
      throw new Error(data.message || 'Failed to save medicine');
    }

    // Refresh the list after successful add/edit
    await fetchMedicines();
    setEditingMedicine(null);
  };

  // Delete Medicine
  const handleDeleteMedicine = async (id) => {
    if (!window.confirm('Are you sure you want to delete this medicine record?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': getAuthToken(),
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete medicine');
      }

      console.log('✅ Medicine deleted'); // Debug log
      // Refresh the list after successful delete
      await fetchMedicines();
    } catch (err) {
      console.error('❌ Error deleting medicine:', err);
      alert(err.message);
    }
  };

  const openAddModal = () => {
    setEditingMedicine(null);
    setIsModalOpen(true);
  };

  const openEditModal = (medicine) => {
    setEditingMedicine(medicine);
    setIsModalOpen(true);
  };

  // Filtering Logic
  const filteredMedicines = medicines.filter(m =>
    (m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterCategory === 'all' || m.category === filterCategory)
  );

  const categories = ['all', ...new Set(medicines.map(m => m.category))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Loading inventory...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md m-4">
        <p className="font-bold">Error loading inventory:</p>
        <p>{error}</p>
        <button 
          onClick={fetchMedicines}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-300 rounded">
          <p className="font-semibold">Troubleshooting:</p>
          <ul className="list-disc list-inside mt-2 text-sm">
            <li>Check browser console (F12) for errors</li>
            <li>Verify backend is running on {VITE_BACKEND_BASEURL}</li>
            <li>Check if you're logged in (token in localStorage)</li>
            <li>Verify CORS is enabled on backend</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Inventory Management</h2>
          <p className="text-sm text-gray-500 mt-1">Total medicines: {medicines.length}</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors shadow-md">
          <Plus className="h-5 w-5" />
          <span>Add Medicine</span>
        </button>
      </div>

      {/* Search and Filter */}
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

        {/* Inventory Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
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
              {filteredMedicines.length > 0 ? filteredMedicines.map(medicine => {
                const stockStatus = getStockStatus(medicine.stock, medicine.reorderLevel);
                const daysToExpiry = getDaysUntilExpiry(medicine.expiry);
                const isExpiringSoon = daysToExpiry <= 30 && daysToExpiry >= 0;

                return (
                  <tr key={medicine._id} className="hover:bg-blue-50 transition-colors">
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
                    <td className="px-6 py-4 font-semibold text-gray-900">₹{medicine.price.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <div className={`${isExpiringSoon ? 'text-red-600 font-semibold' : 'text-gray-700'}`}>
                        {new Date(medicine.expiry).toISOString().substring(0, 10)}
                      </div>
                      {(isExpiringSoon || daysToExpiry < 0) && (
                        <div className="text-xs text-red-500">
                          {daysToExpiry < 0 ? 'Expired!' : `${daysToExpiry} days left`}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${stockStatus.color} text-white`}>
                        {stockStatus.label}
                      </span>
                      {daysToExpiry < 0 && (
                        <div className="text-xs text-red-600 font-bold mt-1">
                          Expired
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 flex space-x-2">
                      <button
                        onClick={() => openEditModal(medicine)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm p-1 rounded-full hover:bg-blue-100 transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMedicine(medicine._id)}
                        className="text-red-600 hover:text-red-800 font-medium text-sm p-1 rounded-full hover:bg-red-100 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No medicines found. Try adjusting your search/filter or add a new medicine.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Medicine Modal */}
      <MedicineModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingMedicine(null);
        }}
        onSubmit={handleAddOrEditMedicine}
        initialData={editingMedicine}
      />
    </div>
  );
};

export default InventoryView;