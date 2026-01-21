import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Search, Filter, Plus, Edit, Trash2, X, Package, AlertTriangle, TrendingDown, RefreshCw } from 'lucide-react';

// Cache to persist data across navigations
const inventoryCache = {
  data: null,
  timestamp: null,
  isValid() {
    return this.data && this.timestamp && (Date.now() - this.timestamp < 5 * 60 * 1000);
  }
};

// Helper functions
const getStockStatus = (stock, reorderLevel) => {
  if (stock === 0) {
    return { label: 'Out of Stock', color: 'bg-red-500' };
  } else if (stock <= reorderLevel) {
    return { label: 'Low Stock', color: 'bg-yellow-500' };
  }
  return { label: 'In Stock', color: 'bg-green-500' };
};

const getDaysUntilExpiry = (expiryDate) => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Medicine Modal Component
const MedicineModal = ({ isOpen, onClose, onSubmit, initialData, API_BASE_URL, token }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    stock: 0,
    reorderLevel: 10,
    price: 0.00,
    expiry: '',
    batch: '',
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
      setError("Please fill in all required fields.");
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
    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 m-4 transform transition-all">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {initialData ? 'Edit Medicine' : 'Add New Medicine'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition">
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <label className="block col-span-2">
              <span className="text-gray-700 font-semibold flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-600" />
                Medicine Name <span className="text-red-500">*</span>
              </span>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                required
                className="mt-2 block w-full border-2 border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="e.g., Paracetamol 500mg" 
              />
            </label>

            <label className="block">
              <span className="text-gray-700 font-semibold">Category <span className="text-red-500">*</span></span>
              <input 
                type="text" 
                name="category" 
                value={formData.category} 
                onChange={handleChange} 
                required
                className="mt-2 block w-full border-2 border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="e.g., Pain Relief" 
              />
            </label>

            <label className="block">
              <span className="text-gray-700 font-semibold">Batch No. <span className="text-red-500">*</span></span>
              <input 
                type="text" 
                name="batch" 
                value={formData.batch} 
                onChange={handleChange}
                required
                className="mt-2 block w-full border-2 border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="e.g., A123B" 
              />
            </label>

            <label className="block">
              <span className="text-gray-700 font-semibold">Stock Quantity</span>
              <input 
                type="number" 
                name="stock" 
                value={formData.stock} 
                onChange={handleChange} 
                min="0" 
                required
                className="mt-2 block w-full border-2 border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" 
              />
            </label>

            <label className="block">
              <span className="text-gray-700 font-semibold">Reorder Level</span>
              <input 
                type="number" 
                name="reorderLevel" 
                value={formData.reorderLevel} 
                onChange={handleChange} 
                min="0" 
                required
                className="mt-2 block w-full border-2 border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" 
              />
            </label>

            <label className="block">
              <span className="text-gray-700 font-semibold">Price (₹)</span>
              <input 
                type="number" 
                name="price" 
                value={formData.price} 
                onChange={handleChange} 
                step="0.01" 
                min="0" 
                required
                className="mt-2 block w-full border-2 border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" 
              />
            </label>

            <label className="block">
              <span className="text-gray-700 font-semibold">Expiry Date <span className="text-red-500">*</span></span>
              <input 
                type="date" 
                name="expiry" 
                value={formData.expiry} 
                onChange={handleChange} 
                required
                className="mt-2 block w-full border-2 border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" 
              />
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-semibold"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition shadow-lg disabled:opacity-50"
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

// Main Inventory View Component
const InventoryView = () => {
  const [medicines, setMedicines] = useState(inventoryCache.data || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [loading, setLoading] = useState(!inventoryCache.isValid());
  const [error, setError] = useState(null);
  const hasFetched = useRef(false);

  // Memoize API URL and token - CRITICAL FIX
  // Memoize API URL and token - CRITICAL FIX
const { API_BASE_URL, token } = useMemo(() => {
  // Get base URL from environment variable
  let baseUrl = import.meta.env.VITE_BACKEND_BASEURL;
  
  // Fallback to localhost if not set
  if (!baseUrl) {
    baseUrl = "http://localhost:5000";
  }
  
  // Ensure /api is in the path if not already present
  if (!baseUrl.includes('/api')) {
    baseUrl = `${baseUrl}/api`;
  }
  
  const apiUrl = `${baseUrl}/inventory`;
  const authData = JSON.parse(localStorage.getItem('user_auth') || '{}');
  const authToken = authData?.token ? `Bearer ${authData.token}` : '';
  
  console.log('🔧 API Config:', { baseUrl, apiUrl, hasToken: !!authToken });
  
  return { API_BASE_URL: apiUrl, token: authToken };
}, []);

  // Fetch medicines from backend
  const fetchMedicines = useCallback(async (forceRefresh = false) => {
    // Use cache if valid and not forcing refresh
    if (!forceRefresh && inventoryCache.isValid()) {
      setMedicines(inventoryCache.data);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('📡 Fetching from:', API_BASE_URL);
      
      const response = await fetch(API_BASE_URL, {
        method: 'GET',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch medicines: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Medicines loaded:', data.length);
      
      // Update cache
      inventoryCache.data = data;
      inventoryCache.timestamp = Date.now();
      
      setMedicines(data);
      hasFetched.current = true;
    } catch (err) {
      console.error('❌ Error fetching medicines:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token]);

  // Initial fetch - only once
  useEffect(() => {
    if (!inventoryCache.isValid() && !hasFetched.current) {
      hasFetched.current = true;
      fetchMedicines(false);
    } else if (inventoryCache.isValid() && medicines.length === 0) {
      setMedicines(inventoryCache.data);
      setLoading(false);
    }
  }, []);

  // Manual refresh
  const handleRefresh = async () => {
    hasFetched.current = false;
    await fetchMedicines(true);
  };

  // Add or Edit Medicine
  const handleAddOrEditMedicine = async (formData) => {
    const endpoint = editingMedicine 
      ? `${API_BASE_URL}/${editingMedicine._id}` 
      : API_BASE_URL;
    const method = editingMedicine ? 'PUT' : 'POST';

    const response = await fetch(endpoint, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to save medicine');
    }

    // Refresh the list
    hasFetched.current = false;
    await fetchMedicines(true);
    setEditingMedicine(null);
  };

  // Delete Medicine
  const handleDeleteMedicine = async (id) => {
    if (!window.confirm('Are you sure you want to delete this medicine?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete medicine');
      }

      hasFetched.current = false;
      await fetchMedicines(true);
    } catch (err) {
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

  // Filtering
  const filteredMedicines = medicines.filter(m =>
    (m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterCategory === 'all' || m.category === filterCategory)
  );

  const categories = ['all', ...new Set(medicines.map(m => m.category))];

  // Statistics
  const stats = {
    total: medicines.length,
    lowStock: medicines.filter(m => m.stock <= m.reorderLevel && m.stock > 0).length,
    outOfStock: medicines.filter(m => m.stock === 0).length,
    expiringSoon: medicines.filter(m => {
      const days = getDaysUntilExpiry(m.expiry);
      return days <= 30 && days >= 0;
    }).length
  };

  if (loading && medicines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
        <p className="text-gray-600 text-lg font-semibold">Loading inventory...</p>
      </div>
    );
  }

  if (error && medicines.length === 0) {
    return (
      <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl m-4">
        <div className="flex items-center gap-3 mb-3">
          <AlertTriangle className="h-6 w-6" />
          <p className="font-bold text-lg">Error loading inventory</p>
        </div>
        <p className="mb-4">{error}</p>
        <button 
          onClick={handleRefresh}
          className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-semibold transition shadow-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-4xl font-bold mb-2">Inventory Management</h2>
            <p className="text-blue-100 text-lg">Manage your pharmacy stock efficiently</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="bg-white/20 hover:bg-white/30 p-3 rounded-xl transition flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-semibold">Total Items</p>
              <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-semibold">Low Stock</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.lowStock}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <TrendingDown className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-semibold">Out of Stock</p>
              <p className="text-3xl font-bold text-red-600">{stats.outOfStock}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <X className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-semibold">Expiring Soon</p>
              <p className="text-3xl font-bold text-orange-600">{stats.expiringSoon}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search, Filter, Add Button */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search medicines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
          <div className="relative min-w-[200px]">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none transition"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={openAddModal}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition shadow-lg font-semibold">
            <Plus className="h-5 w-5" />
            <span>Add Medicine</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border-2 border-gray-200">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gradient-to-r from-blue-50 to-purple-50">
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Medicine</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Category</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Stock</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Price</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Expiry</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMedicines.length > 0 ? filteredMedicines.map(medicine => {
                const stockStatus = getStockStatus(medicine.stock, medicine.reorderLevel);
                const daysToExpiry = getDaysUntilExpiry(medicine.expiry);
                const isExpiringSoon = daysToExpiry <= 30 && daysToExpiry >= 0;

                return (
                  <tr key={medicine._id} className="hover:bg-blue-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{medicine.name}</div>
                      <div className="text-sm text-gray-500">Batch: {medicine.batch}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                        {medicine.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{medicine.stock}</div>
                      <div className="text-xs text-gray-500">Min: {medicine.reorderLevel}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-purple-600">₹{medicine.price.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <div className={`font-semibold ${isExpiringSoon ? 'text-red-600' : 'text-gray-700'}`}>
                        {new Date(medicine.expiry).toLocaleDateString('en-IN')}
                      </div>
                      {(isExpiringSoon || daysToExpiry < 0) && (
                        <div className="text-xs text-red-500 font-semibold">
                          {daysToExpiry < 0 ? 'Expired!' : `${daysToExpiry} days left`}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-8 py-1 rounded-full text-xs font-bold ${stockStatus.color} text-white`}>
                        {stockStatus.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => openEditModal(medicine)}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-100 transition"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMedicine(medicine._id)}
                        className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-100 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-lg font-semibold">No medicines found</p>
                    <p className="text-sm">Try adjusting your search or add a new medicine</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <MedicineModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingMedicine(null);
        }}
        onSubmit={handleAddOrEditMedicine}
        initialData={editingMedicine}
        API_BASE_URL={API_BASE_URL}
        token={token}
      />
    </div>
  );
};

export default InventoryView;