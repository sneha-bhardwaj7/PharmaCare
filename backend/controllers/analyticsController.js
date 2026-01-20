const asyncHandler = require("express-async-handler");
const Order = require("../models/Order");
const Medicine = require("../models/Medicine");

// Get analytics data for pharmacist
const getPharmacistAnalytics = asyncHandler(async (req, res) => {
  const pharmacistId = req.user._id;
  
  try {
    // Get all orders for this pharmacist
    const allOrders = await Order.find({ pharmacyId: pharmacistId });
    
    // Calculate date ranges
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Orders from last 7 days
    const recentOrders = allOrders.filter(order => 
      new Date(order.createdAt) >= last7Days
    );
    
    // Calculate revenue by status
    const completedOrders = allOrders.filter(o => 
      o.status === 'completed' || o.status === 'delivered'
    );
    
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total, 0);
    const weeklyRevenue = recentOrders
      .filter(o => o.status === 'completed' || o.status === 'delivered')
      .reduce((sum, order) => sum + order.total, 0);
    
    // Daily revenue for last 7 days
    const dailyRevenue = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const dayOrders = allOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= dayStart && orderDate <= dayEnd && 
               (order.status === 'completed' || order.status === 'delivered');
      });
      
      const revenue = dayOrders.reduce((sum, order) => sum + order.total, 0);
      const orderCount = dayOrders.length;
      
      dailyRevenue.push({
        date: dayStart.toISOString(),
        revenue,
        orders: orderCount
      });
    }
    
    // Top selling medicines from completed orders
    const medicineStats = {};
    completedOrders.forEach(order => {
      order.items.forEach(item => {
        if (!medicineStats[item.name]) {
          medicineStats[item.name] = {
            name: item.name,
            category: item.category || 'Other',
            totalSold: 0,
            revenue: 0
          };
        }
        medicineStats[item.name].totalSold += item.quantity;
        medicineStats[item.name].revenue += item.price * item.quantity;
      });
    });
    
    const topMedicines = Object.values(medicineStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    
    // Category distribution
    const categoryStats = {};
    const allMedicines = await Medicine.find({ user: pharmacistId });
    
    allMedicines.forEach(med => {
      const cat = med.category || 'Other';
      if (!categoryStats[cat]) {
        categoryStats[cat] = { category: cat, count: 0, value: 0 };
      }
      categoryStats[cat].count++;
      categoryStats[cat].value += med.stock * med.price;
    });
    
    // Statistics summary
    const stats = {
      totalOrders: allOrders.length,
      pendingOrders: allOrders.filter(o => o.status === 'pending').length,
      processingOrders: allOrders.filter(o => o.status === 'processing').length,
      completedOrders: completedOrders.length,
      totalRevenue,
      weeklyRevenue,
      avgOrderValue: completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0,
      inventoryValue: allMedicines.reduce((sum, m) => sum + (m.stock * m.price), 0),
      totalMedicines: allMedicines.length
    };
    
    res.json({
      success: true,
      stats,
      dailyRevenue,
      topMedicines,
      categoryDistribution: Object.values(categoryStats),
      recentOrders: recentOrders.slice(0, 10) // Last 10 recent orders
    });
    
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics data",
      error: error.message
    });
  }
});

module.exports = {
  getPharmacistAnalytics
};