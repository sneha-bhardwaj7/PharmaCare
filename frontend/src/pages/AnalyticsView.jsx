import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  DollarSign, ShoppingCart, Package, TrendingUp, Download, 
  RefreshCw, Calendar, Award, TrendingDown, Activity 
} from 'lucide-react';

// Create a cache outside the component to persist across unmounts
const analyticsCache = {
  data: null,
  timestamp: null,
  isValid() {
    // Cache is valid for 5 minutes
    return this.data && this.timestamp && (Date.now() - this.timestamp < 5 * 60 * 1000);
  }
};

const AnalyticsView = () => {
  const [analyticsData, setAnalyticsData] = useState(analyticsCache.data);
  const [loading, setLoading] = useState(!analyticsCache.isValid());
  const hasFetched = useRef(false);

  // Move these outside of render cycle - memoize them
  const { API_URL, token } = useMemo(() => {
    const apiUrl = `${import.meta.env.VITE_BACKEND_BASEURL ?? "http://localhost:5000"}/api`;
    const authData = JSON.parse(localStorage.getItem("user_auth") || '{}');
    const authToken = authData?.token;
    return { API_URL: apiUrl, token: authToken };
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/analytics/pharmacist`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        console.log("📊 Analytics data:", data);
        setAnalyticsData(data);
        // Update cache
        analyticsCache.data = data;
        analyticsCache.timestamp = Date.now();
      } else {
        console.error("Failed to fetch analytics");
      }
    } catch (err) {
      console.error("Analytics error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if we don't have valid cached data and haven't fetched yet
    if (!analyticsCache.isValid() && !hasFetched.current) {
      hasFetched.current = true;
      fetchAnalytics();
    } else if (analyticsCache.isValid() && !analyticsData) {
      // Use cached data immediately
      setAnalyticsData(analyticsCache.data);
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
        <p className="text-gray-600 text-lg font-semibold">Loading analytics...</p>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="bg-white rounded-xl shadow-md p-12 text-center">
        <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">No Analytics Data</h3>
        <p className="text-gray-600">Start receiving orders to see your analytics</p>
      </div>
    );
  }

  const { stats, dailyRevenue, topMedicines, categoryDistribution } = analyticsData;

  const handleRefresh = () => {
    hasFetched.current = false;
    fetchAnalytics();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-4xl font-bold mb-2">📊 Analytics & Reports</h2>
            <p className="text-blue-100 text-lg">Real-time insights into your pharmacy business</p>
          </div>
          <button
            onClick={handleRefresh}
            className="bg-white/20 hover:bg-white/30 p-3 rounded-xl transition flex items-center gap-2"
          >
            <RefreshCw className="h-5 w-5" />
            <span className="hidden md:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <h3 className="text-gray-600 text-sm font-semibold mb-1">Total Revenue</h3>
          <p className="text-3xl font-bold text-gray-900">₹{stats.totalRevenue.toFixed(2)}</p>
          <p className="text-sm text-green-600 mt-2">
            This week: ₹{stats.weeklyRevenue.toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
            <Activity className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="text-gray-600 text-sm font-semibold mb-1">Total Orders</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
          <p className="text-sm text-blue-600 mt-2">
            Completed: {stats.completedOrders}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
            <Award className="h-5 w-5 text-purple-600" />
          </div>
          <h3 className="text-gray-600 text-sm font-semibold mb-1">Inventory Value</h3>
          <p className="text-3xl font-bold text-gray-900">₹{stats.inventoryValue.toFixed(2)}</p>
          <p className="text-sm text-purple-600 mt-2">
            {stats.totalMedicines} medicines in stock
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <DollarSign className="h-5 w-5 text-orange-600" />
          </div>
          <h3 className="text-gray-600 text-sm font-semibold mb-1">Avg Order Value</h3>
          <p className="text-3xl font-bold text-gray-900">₹{stats.avgOrderValue.toFixed(2)}</p>
          <p className="text-sm text-orange-600 mt-2">
            Per transaction
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Medicines */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Award className="h-6 w-6 text-yellow-500" />
              Top Selling Medicines
            </h3>
          </div>
          
          {topMedicines && topMedicines.length > 0 ? (
            <div className="space-y-3">
              {topMedicines.map((med, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl hover:shadow-md transition-all">
                  <div className="flex items-center space-x-3">
                    <div className={`
                      ${idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-orange-600' : 'bg-blue-500'}
                      text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm shadow-md
                    `}>
                      #{idx + 1}
                    </div>
                    <div>
                      <div className="font-bold text-gray-800">{med.name}</div>
                      <div className="text-sm text-gray-500">{med.category}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-purple-600 text-lg">₹{med.revenue.toFixed(2)}</div>
                    <div className="text-sm text-gray-600">{med.totalSold} sold</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No sales data yet</p>
            </div>
          )}
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Package className="h-6 w-6 text-blue-500" />
              Category Distribution
            </h3>
          </div>
          
          {categoryDistribution && categoryDistribution.length > 0 ? (
            <div className="space-y-4">
              {categoryDistribution.map((cat, idx) => {
                const totalItems = categoryDistribution.reduce((sum, c) => sum + c.count, 0);
                const percentage = (cat.count / totalItems) * 100;
                const colors = [
                  { bg: 'bg-blue-500', light: 'bg-blue-100' },
                  { bg: 'bg-green-500', light: 'bg-green-100' },
                  { bg: 'bg-yellow-500', light: 'bg-yellow-100' },
                  { bg: 'bg-purple-500', light: 'bg-purple-100' },
                  { bg: 'bg-pink-500', light: 'bg-pink-100' }
                ];
                const color = colors[idx % colors.length];
                
                return (
                  <div key={idx}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`${color.light} p-2 rounded-lg`}>
                          <Package className={`h-4 w-4 text-${color.bg.split('-')[1]}-600`} />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">{cat.category}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-gray-900">{cat.count} items</span>
                        <span className="text-xs text-gray-500 ml-2">₹{cat.value.toFixed(0)}</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`${color.bg} h-3 rounded-full transition-all duration-500 shadow-sm`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}% of inventory</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No inventory data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-green-500" />
              Revenue Trend (Last 7 Days)
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Total: ₹{dailyRevenue.reduce((sum, day) => sum + day.revenue, 0).toFixed(2)}
            </p>
          </div>
          <button 
            onClick={() => window.print()}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-md"
          >
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </button>
        </div>
        
        {dailyRevenue && dailyRevenue.length > 0 ? (
          <div className="h-72 flex items-end space-x-2">
            {dailyRevenue.map((day, idx) => {
              const maxRevenue = Math.max(...dailyRevenue.map(d => d.revenue), 1);
              const heightPercent = (day.revenue / maxRevenue) * 100;
              
              return (
                <div key={idx} className="flex-1 flex flex-col items-center group">
                  <div 
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-600 rounded-t-xl hover:from-blue-600 hover:to-blue-700 transition-all cursor-pointer relative shadow-lg"
                    style={{ height: `${heightPercent}%`, minHeight: day.revenue > 0 ? '10px' : '0' }}
                  >
                    <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
                      <div className="font-bold">₹{day.revenue.toFixed(2)}</div>
                      <div className="text-gray-300">{day.orders} orders</div>
                    </div>
                    {day.revenue > 0 && (
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-gray-700">
                        ₹{day.revenue.toFixed(0)}
                      </div>
                    )}
                  </div>
                  <div className="text-center mt-3">
                    <span className="text-xs font-semibold text-gray-700 block">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                    <span className="text-xs text-gray-500 block">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <TrendingDown className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No revenue data for the past 7 days</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsView;