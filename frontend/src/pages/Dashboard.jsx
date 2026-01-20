import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { 
  DollarSign, Package, AlertTriangle, FileText, TrendingUp, 
  Bell, RefreshCw, ShoppingCart, Award, Activity 
} from 'lucide-react';
import StatsCard from '../components/StatsCard.jsx';
import Alert from '../components/Alert.jsx';

// Create caches outside the component to persist across unmounts
const dashboardCache = {
  analytics: null,
  alerts: null,
  timestamp: null,
  isValid() {
    // Cache is valid for 3 minutes
    return this.analytics && this.alerts && this.timestamp && (Date.now() - this.timestamp < 3 * 60 * 1000);
  }
};

const Dashboard = ({ medicines = [], prescriptions = [], sales = [] }) => {
  const [alerts, setAlerts] = useState(dashboardCache.alerts || {
    lowStock: [],
    expiringSoon: [],
    expired: []
  });
  const [loadingAlerts, setLoadingAlerts] = useState(!dashboardCache.isValid());
  const [alertsError, setAlertsError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [analyticsData, setAnalyticsData] = useState(dashboardCache.analytics);
  const [loadingAnalytics, setLoadingAnalytics] = useState(!dashboardCache.isValid());
  const hasFetched = useRef(false);

  // Memoize API_URL and auth token
  const { API_URL, authToken } = useMemo(() => {
    const apiUrl = `${import.meta.env.VITE_BACKEND_BASEURL ?? "http://localhost:5000"}/api`;
    const authData = JSON.parse(localStorage.getItem('user_auth') || '{}');
    const token = authData?.token ? `Bearer ${authData.token}` : null;
    return { API_URL: apiUrl, authToken: token };
  }, []);

  const fetchAnalytics = useCallback(async () => {
    if (!authToken) return;

    setLoadingAnalytics(true);

    try {
      const res = await fetch(`${API_URL}/analytics/pharmacist`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authToken,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch analytics (${res.status})`);
      }

      const data = await res.json();
      console.log("📊 Analytics Data:", data);
      setAnalyticsData(data);
      // Update cache
      dashboardCache.analytics = data;
      dashboardCache.timestamp = Date.now();
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoadingAnalytics(false);
    }
  }, [API_URL, authToken]);

  const fetchAlerts = useCallback(async () => {
    if (!authToken) return;

    setLoadingAlerts(true);
    setAlertsError(null);

    try {
      const res = await fetch(`${API_URL}/inventory/alerts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authToken,
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Failed to fetch alerts (${res.status})`);
      }

      const data = await res.json();

      const alertsData = {
        lowStock: Array.isArray(data.lowStock) ? data.lowStock : [],
        expiringSoon: Array.isArray(data.expiringSoon) ? data.expiringSoon : [],
        expired: Array.isArray(data.expired) ? data.expired : [],
      };

      setAlerts(alertsData);
      setLastRefresh(new Date());
      
      // Update cache
      dashboardCache.alerts = alertsData;
      dashboardCache.timestamp = Date.now();
    } catch (error) {
      console.error("Error fetching alerts:", error);
      setAlertsError(error.message || "Unable to load alerts");
    } finally {
      setLoadingAlerts(false);
    }
  }, [API_URL, authToken]);

  const refreshData = useCallback(async () => {
    hasFetched.current = false;
    await Promise.all([fetchAlerts(), fetchAnalytics()]);
  }, [fetchAlerts, fetchAnalytics]);

  useEffect(() => {
    // Only fetch if we don't have valid cached data and haven't fetched yet
    if (!dashboardCache.isValid() && !hasFetched.current) {
      hasFetched.current = true;
      refreshData();
    } else if (dashboardCache.isValid()) {
      // Use cached data immediately
      if (!analyticsData) setAnalyticsData(dashboardCache.analytics);
      if (alerts.lowStock.length === 0 && alerts.expiringSoon.length === 0 && alerts.expired.length === 0) {
        setAlerts(dashboardCache.alerts);
      }
      setLoadingAlerts(false);
      setLoadingAnalytics(false);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      hasFetched.current = false;
      refreshData();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [refreshData]);

  const weeklySalesData = analyticsData?.dailyRevenue || [];
  const stats = analyticsData?.stats || {};
  
  const todaySales = weeklySalesData[6] || { revenue: 0, orders: 0 };
  const yesterdaySales = weeklySalesData[5] || { revenue: 0, orders: 0 };
  
  let revenueChange = null;
  if (yesterdaySales.revenue > 0) {
    const change = ((todaySales.revenue - yesterdaySales.revenue) / yesterdaySales.revenue) * 100;
    revenueChange = change >= 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
  } else if (todaySales.revenue > 0) {
    revenueChange = "+100%";
  }

  const lowStockCount = alerts.lowStock.length;
  const expiringCount = alerts.expiringSoon.length;
  const expiredCount = alerts.expired.length;
  const pendingRx = Array.isArray(prescriptions) 
    ? prescriptions.filter(p => p.status === 'pending').length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header with Total Revenue */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-4xl font-bold mb-2">Dashboard Overview</h2>
            <p className="text-blue-100 text-lg mb-4">Real-time insights into your pharmacy business</p>
          </div>
          
          <button
            onClick={refreshData}
            disabled={loadingAlerts || loadingAnalytics}
            className="bg-white/20 hover:bg-white/30 p-4 rounded-xl transition disabled:opacity-50 self-start"
            title="Refresh data"
          >
            <RefreshCw className={`h-6 w-6 ${(loadingAlerts || loadingAnalytics) ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          icon={DollarSign} 
          title="Today's Revenue" 
          value={loadingAnalytics ? '...' : `₹${(todaySales.revenue || 0).toLocaleString()}`}
          subtitle={loadingAnalytics ? 'Loading...' : `${todaySales.orders || 0} orders`}
          color="#10B981"
          trend={revenueChange}
        />
        <StatsCard 
          icon={Package} 
          title="Low Stock Items" 
          value={lowStockCount}
          subtitle="Needs reorder"
          color="#F59E0B"
        />
        <StatsCard 
          icon={AlertTriangle}
          title="Expired Medicines"
          value={expiredCount}
          subtitle="Remove immediately"
          color="#DC2626"
        />
        <StatsCard 
          icon={FileText} 
          title="Pending Rx" 
          value={pendingRx}
          subtitle="Awaiting approval"
          color="#8B5CF6"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Sales Trend */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-blue-600" />
            Revenue Trend (Last 7 Days)
          </h3>

          <div className="space-y-3">
            {loadingAnalytics ? (
              <div className="text-sm text-gray-500 text-center py-8">
                <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
                Loading sales data...
              </div>
            ) : weeklySalesData.length > 0 ? (
              weeklySalesData.map((day, idx) => {
                const maxRevenue = Math.max(...weeklySalesData.map(d => d.revenue), 1);
                const widthPercent = Math.min(100, ((day.revenue || 0) / maxRevenue) * 100);
                const isToday = idx === 6;
                
                return (
                  <div key={idx} className={`flex items-center justify-between ${isToday ? 'bg-blue-50 p-2 rounded-lg' : ''}`}>
                    <span className={`text-sm ${isToday ? 'font-bold text-blue-700' : 'text-gray-600'} w-32`}>
                      {new Date(day.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                      {isToday && ' (Today)'}
                    </span>
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full transition-all duration-500 ${
                            isToday 
                              ? 'bg-gradient-to-r from-green-500 to-green-600' 
                              : 'bg-gradient-to-r from-blue-500 to-blue-600'
                          }`}
                          style={{ width: `${widthPercent}%` }}
                        />
                      </div>
                      <span className={`text-sm ${isToday ? 'font-bold text-blue-700' : 'font-semibold text-gray-700'} w-24 text-right`}>
                        ₹{(day.revenue || 0).toLocaleString()}
                      </span>
                      <span className={`text-xs ${isToday ? 'text-blue-600' : 'text-gray-500'} w-16 text-right`}>
                        {day.orders} {day.orders === 1 ? 'order' : 'orders'}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-gray-500 text-center py-8">No sales data available</div>
            )}
          </div>
        </div>

        {/* Alerts & Notifications */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Bell className="mr-2 h-5 w-5 text-orange-600" />
            Alerts & Notifications
          </h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {loadingAlerts ? (
              <div className="text-sm text-gray-500 text-center py-4">
                <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
                Loading alerts...
              </div>
            ) : alertsError ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <p className="font-semibold">Error loading alerts</p>
                <p className="text-sm">{alertsError}</p>
              </div>
            ) : (
              <>
                {expiredCount > 0 && (
                  <div className="space-y-2">
                    <Alert 
                      type="danger"
                      title={`🚨 ${expiredCount} Medicines Expired`}
                      description="Remove expired medicines from inventory immediately"
                    />
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
                      {alerts.expired.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <div>
                            <span className="font-semibold text-red-900">{item.name}</span>
                            <span className="text-red-700 ml-2">({item.batch})</span>
                          </div>
                          <span className="text-xs text-red-600">
                            Expired: {new Date(item.expiry).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                      {alerts.expired.length > 3 && (
                        <div className="text-xs text-red-600 font-semibold pt-2 border-t border-red-200">
                          + {alerts.expired.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {lowStockCount > 0 && (
                  <div className="space-y-2">
                    <Alert 
                      type="warning"
                      title={`⚠️ ${lowStockCount} Items Low on Stock`}
                      description="These items need to be reordered soon"
                    />
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 space-y-2">
                      {alerts.lowStock.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <div>
                            <span className="font-semibold text-yellow-900">{item.name}</span>
                            <span className="text-yellow-700 ml-2">({item.batch})</span>
                          </div>
                          <span className="text-xs text-yellow-700 font-medium">
                            Stock: {item.stock}
                          </span>
                        </div>
                      ))}
                      {alerts.lowStock.length > 3 && (
                        <div className="text-xs text-yellow-700 font-semibold pt-2 border-t border-yellow-200">
                          + {alerts.lowStock.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {expiringCount > 0 && (
                  <div className="space-y-2">
                    <Alert 
                      type="info"
                      title={`ℹ️ ${expiringCount} Medicines Expiring Soon`}
                      description="Expiring within 30 days"
                    />
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                      {alerts.expiringSoon.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <div>
                            <span className="font-semibold text-blue-900">{item.name}</span>
                          </div>
                          <span className="text-xs text-blue-700 font-medium">
                            {item.daysLeft} days
                          </span>
                        </div>
                      ))}
                      {alerts.expiringSoon.length > 3 && (
                        <div className="text-xs text-blue-700 font-semibold pt-2 border-t border-blue-200">
                          + {alerts.expiringSoon.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {expiredCount === 0 && lowStockCount === 0 && expiringCount === 0 && (
                  <Alert 
                    type="success"
                    title="✅ All Good!"
                    description="Your inventory is healthy. No alerts right now."
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;