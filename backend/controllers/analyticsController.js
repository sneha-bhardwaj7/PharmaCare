const asyncHandler = require("express-async-handler");
const Order = require("../models/Order");
const Medicine = require("../models/Medicine");

// Get analytics data for pharmacist
const getPharmacistAnalytics = asyncHandler(async (req, res) => {
  const pharmacistId = req.user._id;
  
  try {
    // Get all orders for this pharmacist
    const allOrders = await Order.find({ pharmacyId: pharmacistId }).lean();
    
    // Calculate date ranges
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Calculate revenue by status - ONLY completed/delivered orders count
    const completedOrders = allOrders.filter(o => 
      o.status === 'completed' || o.status === 'delivered'
    );
    
    // Total revenue from completed orders
    const totalRevenue = completedOrders.reduce((sum, order) => {
      const orderTotal = parseFloat(order.total) || 0;
      return sum + orderTotal;
    }, 0);
    
    // Weekly revenue - completed orders from last 7 days
    // KEY FIX: Use updatedAt (when status changed) instead of createdAt
    const weeklyCompletedOrders = completedOrders.filter(order => {
      const completionDate = new Date(order.updatedAt);
      return completionDate >= last7Days;
    });
    
    const weeklyRevenue = weeklyCompletedOrders.reduce((sum, order) => {
      const orderTotal = parseFloat(order.total) || 0;
      return sum + orderTotal;
    }, 0);
    
    // Daily revenue for last 7 days - GROUPED BY COMPLETION DATE
    const dailyRevenue = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      // Filter by updatedAt (completion date) instead of createdAt
      const dayOrders = completedOrders.filter(order => {
        const completionDate = new Date(order.updatedAt);
        return completionDate >= dayStart && completionDate <= dayEnd;
      });
      
      const revenue = dayOrders.reduce((sum, order) => {
        const orderTotal = parseFloat(order.total) || 0;
        return sum + orderTotal;
      }, 0);
      const orderCount = dayOrders.length;
      
      dailyRevenue.push({
        date: dayStart.toISOString(),
        revenue: parseFloat(revenue.toFixed(2)),
        orders: orderCount
      });
    }
    
    // Top selling medicines from completed orders
    const medicineStats = {};
    completedOrders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          if (!item.name) return;
          
          if (!medicineStats[item.name]) {
            medicineStats[item.name] = {
              name: item.name,
              category: item.category || 'Other',
              totalSold: 0,
              revenue: 0
            };
          }
          const quantity = parseInt(item.quantity) || 0;
          const price = parseFloat(item.price) || 0;
          
          medicineStats[item.name].totalSold += quantity;
          medicineStats[item.name].revenue += price * quantity;
        });
      }
    });
    
    const topMedicines = Object.values(medicineStats)
      .map(med => ({
        ...med,
        revenue: parseFloat(med.revenue.toFixed(2))
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    
    // Category distribution
    let categoryStats = {};
    let allMedicines = [];
    
    try {
      allMedicines = await Medicine.find({ user: pharmacistId }).lean();
      
      allMedicines.forEach(med => {
        const cat = med.category || 'Other';
        if (!categoryStats[cat]) {
          categoryStats[cat] = { category: cat, count: 0, value: 0 };
        }
        categoryStats[cat].count++;
        const stock = parseInt(med.stock) || 0;
        const price = parseFloat(med.price) || 0;
        categoryStats[cat].value += stock * price;
      });
    } catch (medicineError) {
      console.error("Medicine fetch error:", medicineError);
    }
    
    const categoryDistribution = Object.values(categoryStats).map(cat => ({
      ...cat,
      value: parseFloat(cat.value.toFixed(2))
    }));
    
    // Calculate inventory value
    const inventoryValue = allMedicines.reduce((sum, m) => {
      const stock = parseInt(m.stock) || 0;
      const price = parseFloat(m.price) || 0;
      return sum + (stock * price);
    }, 0);
    
    // Statistics summary
    const stats = {
      totalOrders: allOrders.length,
      pendingOrders: allOrders.filter(o => o.status === 'pending').length,
      processingOrders: allOrders.filter(o => o.status === 'processing').length,
      completedOrders: completedOrders.length,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      weeklyRevenue: parseFloat(weeklyRevenue.toFixed(2)),
      avgOrderValue: completedOrders.length > 0 
        ? parseFloat((totalRevenue / completedOrders.length).toFixed(2))
        : 0,
      inventoryValue: parseFloat(inventoryValue.toFixed(2)),
      totalMedicines: allMedicines.length
    };
    
    res.json({
      success: true,
      stats,
      dailyRevenue,
      topMedicines,
      categoryDistribution,
      recentOrders: allOrders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10)
        .map(order => ({
          ...order,
          total: parseFloat(order.total) || 0
        }))
    });
    
  } catch (error) {
    console.error("Analytics error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics data",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = {
  getPharmacistAnalytics
};