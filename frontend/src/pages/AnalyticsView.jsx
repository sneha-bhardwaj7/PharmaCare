// frontend/src/pages/AnalyticsView.jsx

import React from 'react';
import { DollarSign, ShoppingCart, Package, TrendingUp, Download } from 'lucide-react';
import StatsCard from '../components/StatsCard.jsx';

// Analytics View
const AnalyticsView = ({ sales, medicines }) => {
  const totalRevenue = sales.reduce((sum, day) => sum + day.revenue, 0);
  const avgDailyRevenue = totalRevenue / sales.length;
  const totalOrders = sales.reduce((sum, day) => sum + day.orders, 0);
  const totalInventoryValue = medicines.reduce((sum, m) => sum + (m.stock * m.price), 0);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Analytics & Reports</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          icon={DollarSign}
          title="Total Revenue (7 Days)"
          value={`₹${totalRevenue.toLocaleString()}`}
          subtitle={`Avg: ₹${Math.round(avgDailyRevenue).toLocaleString()}/day`}
          color="#10B981"
        />
        <StatsCard 
          icon={ShoppingCart}
          title="Total Orders"
          value={totalOrders}
          subtitle="This week"
          color="#8B5CF6"
        />
        <StatsCard 
          icon={Package}
          title="Inventory Value"
          value={`₹${Math.round(totalInventoryValue).toLocaleString()}`}
          subtitle={`${medicines.length} products`}
          color="#F59E0B"
        />
        <StatsCard 
          icon={TrendingUp}
          title="Avg Order Value"
          value={`₹${Math.round(totalRevenue / totalOrders)}`}
          subtitle="Per transaction"
          color="#EF4444"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Top Selling Medicines</h3>
          <div className="space-y-3">
            {medicines.slice(0, 5).map((med, idx) => (
              <div key={med.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">{med.name}</div>
                    <div className="text-sm text-gray-500">{med.category}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-800">₹{(med.price * 50).toLocaleString()}</div>
                  <div className="text-sm text-gray-500">50 sold</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Category Distribution</h3>
          <div className="space-y-3">
            {['Painkiller', 'Antibiotic', 'Supplement', 'Antihistamine'].map((cat, idx) => {
              const count = medicines.filter(m => m.category === cat).length;
              const percentage = (count / medicines.length) * 100;
              const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'];
              
              return (
                <div key={cat}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{cat}</span>
                    <span className="text-sm font-semibold text-gray-900">{count} items</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`${colors[idx]} h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Revenue Trend</h3>
          <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </button>
        </div>
        <div className="h-64 flex items-end space-x-2">
          {sales.map((day, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-gradient-to-t from-blue-500 to-blue-600 rounded-t-lg hover:from-blue-600 hover:to-blue-700 transition-all cursor-pointer relative group"
                style={{ height: `${(day.revenue / 20000) * 100}%` }}
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  ₹{day.revenue.toLocaleString()}
                </div>
              </div>
              <span className="text-xs text-gray-500 mt-2">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;