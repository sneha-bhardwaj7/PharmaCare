// frontend/src/pages/Dashboard.jsx

import React from 'react';
import { DollarSign, Package, AlertTriangle, FileText, TrendingUp, Bell } from 'lucide-react';
import StatsCard from '../components/StatsCard.jsx';
import Alert from '../components/Alert.jsx';
import { getDaysUntilExpiry } from '../utils.js';

// Dashboard View
const Dashboard = ({ medicines, prescriptions, sales }) => {
  const todaySales = sales[sales.length - 1];
  const lowStockCount = medicines.filter(m => m.stock <= m.reorderLevel).length;
  const expiringCount = medicines.filter(m => getDaysUntilExpiry(m.expiry) <= 30).length;
  const pendingRx = prescriptions.filter(p => p.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800">Dashboard Overview</h2>
        <div className="text-sm text-gray-500">Last updated: {new Date().toLocaleString()}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          icon={DollarSign} 
          title="Today's Revenue" 
          value={`₹${todaySales.revenue.toLocaleString()}`}
          subtitle={`${todaySales.orders} orders`}
          color="#10B981"
          trend="+12.5%"
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
          title="Expiring Soon" 
          value={expiringCount}
          subtitle="Within 30 days"
          color="#EF4444"
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
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-blue-600" />
            Weekly Sales Trend
          </h3>
          <div className="space-y-3">
            {sales.map((day, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-48 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(day.revenue / 20000) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 w-20 text-right">₹{day.revenue.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Bell className="mr-2 h-5 w-5 text-orange-600" />
            Alerts & Notifications
          </h3>
          <div className="space-y-4">
            <Alert 
              type="danger"
              title="4 Medicines Expired"
              description="Remove expired medicines from inventory immediately"
              action="View Details"
            />
            <Alert 
              type="warning"
              title={`${lowStockCount} Items Low on Stock`}
              description="Create purchase orders to avoid stockouts"
              action="Reorder Now"
            />
            <Alert 
              type="info"
              title={`${pendingRx} Prescriptions Pending`}
              description="Review and approve pending prescriptions"
              action="Review Now"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;