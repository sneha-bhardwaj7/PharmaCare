import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Bot, Send, Loader2, Pill, Stethoscope, X, Minimize2, Maximize2, 
  Sparkles, RefreshCw, User, ShoppingCart, Package, AlertCircle, 
  MapPin, Heart, Search, FileText, Calendar, DollarSign, Tag,
  AlertTriangle, CheckCircle, Clock, TrendingUp, Users, Settings,
  Database, Activity, BarChart, FileText as FileTextIcon
} from 'lucide-react';

// ==============================
// 🔍 ENHANCED QUERY PROCESSOR WITH REAL-TIME API
// ==============================

class PharmacyQueryProcessor {
  constructor(medicineData, userData, authToken, fetchMedicineDataCallback) {
    this.medicineData = medicineData || [];
    this.userData = userData || {};
    this.authToken = authToken;
    this.fetchMedicineData = fetchMedicineDataCallback;
    this.intents = this.initializeIntents();
  }

  initializeIntents = () => {
    return {
      'medicine_search': {
        keywords: ['find', 'search', 'looking for', 'need', 'want', 'get', 'buy', 'available', 'where can i get'],
        patterns: [
          /(find|search|where).*(medicine|drug|tablet|capsule|syrup)/i,
          /.*available.*/i,
          /.*stock.*/i,
          /.*buy.*/i,
          /.*purchase.*/i
        ],
        handler: this.handleMedicineSearch
      },
      
      'medicine_info': {
        keywords: ['what is', 'information about', 'details', 'side effects', 'dosage', 'uses', 'how to use', 'benefits'],
        patterns: [
          /what.*(side effect|dosage|use|benefit).*/i,
          /.*information.*medicine.*/i,
          /.*details.*about.*/i,
          /how.*to.*use.*/i
        ],
        handler: this.handleMedicineInfo
      },
      
      'price_check': {
        keywords: ['price', 'cost', 'how much', 'expensive', 'cheap', 'rate', 'value'],
        patterns: [
          /.*price.*/i,
          /how much.*cost/i,
          /.*expensive.*/i,
          /.*rate.*of.*/i
        ],
        handler: this.handlePriceCheck
      },
      
      'availability_check': {
        keywords: ['available', 'in stock', 'out of stock', 'have', 'stock', 'quantity'],
        patterns: [
          /.*available.*/i,
          /.*in stock.*/i,
          /.*out of stock.*/i,
          /how many.*left/i
        ],
        handler: this.handleAvailabilityCheck
      },
      
      'alternatives': {
        keywords: ['alternative', 'substitute', 'instead of', 'similar to', 'generic', 'cheaper', 'other brand'],
        patterns: [
          /.*alternative.*/i,
          /.*substitute.*/i,
          /.*generic.*/i,
          /.*similar.*to.*/i,
          /.*cheaper.*option.*/i
        ],
        handler: this.handleAlternatives
      },
      
      'expiry_check': {
        keywords: ['expiry', 'expiring', 'valid till', 'expire date', 'batch', 'validity'],
        patterns: [
          /.*expir.*/i,
          /.*expiring.*/i,
          /.*batch.*/i,
          /.*valid.*till.*/i
        ],
        handler: this.handleExpiryCheck
      },
      
      'app_feature': {
        keywords: ['how to', 'upload', 'use', 'feature', 'work', 'app', 'function', 'guide'],
        patterns: [
          /how.*to.*/i,
          /.*upload.*prescription/i,
          /.*feature.*/i,
          /.*guide.*/i
        ],
        handler: this.handleAppFeature
      },
      
      'order_status': {
        keywords: ['order', 'track', 'status', 'delivery', 'where is', 'my order', 'pending order'],
        patterns: [
          /.*order.*status.*/i,
          /.*track.*order.*/i,
          /.*delivery.*/i,
          /where.*is.*my.*order/i
        ],
        handler: this.handleOrderStatus
      },
      
      'prescription_status': {
        keywords: ['prescription', 'prescription status', 'uploaded prescription', 'rx', 'doctor'],
        patterns: [
          /.*prescription.*status.*/i,
          /.*uploaded.*prescription.*/i,
          /.*rx.*/i
        ],
        handler: this.handlePrescriptionStatus
      },
      
      'inventory_report': {
        keywords: ['report', 'analytics', 'low stock', 'expiring', 'summary', 'inventory', 'dashboard'],
        patterns: [
          /.*low stock.*/i,
          /.*report.*/i,
          /.*analytics.*/i,
          /.*summary.*/i,
          /.*inventory.*report.*/i
        ],
        handler: this.handleInventoryReport
      },
      
      'sales_report': {
        keywords: ['sales', 'revenue', 'profit', 'earning', 'income', 'business', 'performance'],
        patterns: [
          /.*sales.*/i,
          /.*revenue.*/i,
          /.*profit.*/i,
          /.*business.*performance.*/i
        ],
        handler: this.handleSalesReport
      },
      
      'pharmacy_info': {
        keywords: ['pharmacy', 'store', 'location', 'address', 'contact', 'phone', 'open'],
        patterns: [
          /.*pharmacy.*/i,
          /.*store.*/i,
          /.*location.*/i,
          /.*address.*/i,
          /.*contact.*/i
        ],
        handler: this.handlePharmacyInfo
      }
    };
  }

  // ==============================
  // 🎯 REAL-TIME INTENT HANDLERS
  // ==============================

  handleMedicineSearch = async (query) => {
    const medicineName = this.extractMedicineName(query);
    
    if (!medicineName) {
      return {
        type: 'medicine_search',
        status: 'no_match',
        message: "I couldn't identify the medicine name. Could you please specify which medicine you're looking for?\n\nExamples: 'Find paracetamol', 'Search for amoxicillin', 'Where can I get ibuprofen?'"
      };
    }
    
    if (this.medicineData.length === 0) {
      await this.fetchMedicineData();
    }
    
    const medicines = this.medicineData.filter(med => 
      med.name.toLowerCase().includes(medicineName) ||
      (med.genericName && med.genericName.toLowerCase().includes(medicineName))
    );
    
    if (medicines.length === 0) {
      return {
        type: 'medicine_search',
        status: 'not_found',
        message: `I couldn't find "${medicineName}" in our current inventory.`,
        suggestions: [
          "Check your spelling",
          "Try searching by generic name",
          "Contact your pharmacist for special orders",
          "Try similar medicines like " + this.getSimilarMedicines(medicineName).join(', ')
        ]
      };
    }
    
    // Group by availability
    const inStock = medicines.filter(m => m.stock > 0);
    const lowStock = medicines.filter(m => m.stock > 0 && m.stock <= (m.reorderLevel || 10));
    const outOfStock = medicines.filter(m => m.stock === 0);
    
    return {
      type: 'medicine_search',
      status: 'found',
      message: `🔍 **Search Results for "${medicineName}"**:\n\n📊 **Found ${medicines.length} item(s)**\n✅ **In Stock**: ${inStock.length}\n⚠️ **Low Stock**: ${lowStock.length}\n❌ **Out of Stock**: ${outOfStock.length}`,
      data: medicines.map(med => this.formatMedicineCard(med)),
      suggestions: inStock.length > 0 ? 
        inStock.slice(0, 3).map(m => `• ${m.name} - ₹${m.price} (Stock: ${m.stock})`) : 
        ['No in-stock items found']
    };
  }

  handleMedicineInfo = async (query) => {
    const medicineName = this.extractMedicineName(query);
    
    if (!medicineName) {
      return {
        type: 'medicine_info',
        status: 'no_match',
        message: "Please specify which medicine you want information about.\n\nExamples: 'What is paracetamol used for?', 'Tell me about ibuprofen', 'Side effects of amoxicillin'"
      };
    }
    
    if (this.medicineData.length === 0) {
      await this.fetchMedicineData();
    }
    
    const medicine = this.medicineData.find(med => 
      med.name.toLowerCase().includes(medicineName) ||
      (med.genericName && med.genericName.toLowerCase().includes(medicineName))
    );
    
    if (!medicine) {
      return {
        type: 'medicine_info',
        status: 'not_found',
        message: `I don't have information about "${medicineName}" in our database.`,
        suggestion: "This medicine might not be in our inventory. You can ask the pharmacist for more information."
      };
    }
    
    const info = this.formatMedicineInfo(medicine);
    
    return {
      type: 'medicine_info',
      status: 'found',
      message: `💊 **${medicine.name} Information**:\n\n${info}\n\n⚠️ **Disclaimer**: This is for informational purposes only. Always consult a doctor or pharmacist before taking any medication.`,
      data: medicine
    };
  }

  handlePriceCheck = async (query) => {
    const medicineName = this.extractMedicineName(query);
    
    if (!medicineName) {
      if (this.medicineData.length === 0) {
        await this.fetchMedicineData();
      }
      
      const priceStats = this.getPriceStatistics();
      return {
        type: 'price_summary',
        status: 'summary',
        message: `💰 **Price Overview**:\n\n${priceStats}\n\n💡 **Tip**: Ask about specific medicines for detailed pricing.`,
        data: priceStats
      };
    }
    
    if (this.medicineData.length === 0) {
      await this.fetchMedicineData();
    }
    
    const medicines = this.medicineData.filter(med => 
      med.name.toLowerCase().includes(medicineName) ||
      (med.genericName && med.genericName.toLowerCase().includes(medicineName))
    );
    
    if (medicines.length === 0) {
      return {
        type: 'price_check',
        status: 'not_found',
        message: `I couldn't find price information for "${medicineName}".`
      };
    }
    
    const priceComparison = medicines.map(med => ({
      name: med.name,
      price: `₹${med.price}`,
      stock: med.stock,
      batch: med.batch,
      category: med.category
    }));
    
    const minPrice = Math.min(...medicines.map(m => m.price));
    const maxPrice = Math.max(...medicines.map(m => m.price));
    const avgPrice = medicines.reduce((sum, m) => sum + m.price, 0) / medicines.length;
    
    return {
      type: 'price_check',
      status: 'found',
      message: `💰 **Price Comparison for ${medicineName}**:\n\n${priceComparison.map(p => 
        `• **${p.name}** - ${p.price} | Stock: ${p.stock} | Batch: ${p.batch}`
      ).join('\n')}\n\n📊 **Price Range**: ₹${minPrice} - ₹${maxPrice}\n📈 **Average Price**: ₹${avgPrice.toFixed(2)}`,
      data: priceComparison
    };
  }

  handleAvailabilityCheck = async (query) => {
    const medicineName = this.extractMedicineName(query);
    
    if (!medicineName) {
      if (this.medicineData.length === 0) {
        await this.fetchMedicineData();
      }
      
      const availability = this.getAvailabilitySummary();
      return {
        type: 'availability_summary',
        status: 'summary',
        message: availability.message,
        data: availability.data
      };
    }
    
    if (this.medicineData.length === 0) {
      await this.fetchMedicineData();
    }
    
    const medicines = this.medicineData.filter(med => 
      med.name.toLowerCase().includes(medicineName) ||
      (med.genericName && med.genericName.toLowerCase().includes(medicineName))
    );
    
    const available = medicines.filter(m => m.stock > 0);
    const outOfStock = medicines.filter(m => m.stock === 0);
    const lowStock = medicines.filter(m => m.stock > 0 && m.stock <= 10);
    
    let detailedMessage = '';
    if (available.length > 0) {
      detailedMessage = `\n\n✅ **Available Items**:\n${available.map(m => 
        `• ${m.name} - ${m.stock} units available | ₹${m.price}`
      ).join('\n')}`;
    }
    
    if (lowStock.length > 0) {
      detailedMessage += `\n\n⚠️ **Low Stock Items**:\n${lowStock.map(m => 
        `• ${m.name} - Only ${m.stock} units left`
      ).join('\n')}`;
    }
    
    return {
      type: 'availability_check',
      status: 'found',
      message: `📦 **Availability for "${medicineName}"**:\n\n✅ **In Stock**: ${available.length} item(s)\n⚠️ **Low Stock**: ${lowStock.length} item(s)\n❌ **Out of Stock**: ${outOfStock.length} item(s)${detailedMessage}`,
      data: {
        available,
        lowStock,
        outOfStock
      }
    };
  }

  handleAlternatives = async (query) => {
    const medicineName = this.extractMedicineName(query);
    
    if (!medicineName) {
      return {
        type: 'alternatives',
        status: 'no_match',
        message: "Please specify which medicine you need alternatives for.\n\nExamples: 'Alternatives for paracetamol', 'Generic options for ibuprofen', 'Cheaper substitutes for amoxicillin'"
      };
    }
    
    if (this.medicineData.length === 0) {
      await this.fetchMedicineData();
    }
    
    const targetMedicine = this.medicineData.find(med => 
      med.name.toLowerCase().includes(medicineName) ||
      (med.genericName && med.genericName.toLowerCase().includes(medicineName))
    );
    
    if (!targetMedicine) {
      return {
        type: 'alternatives',
        status: 'not_found',
        message: `I couldn't find "${medicineName}" in our inventory.`,
        suggestion: "Please consult with a pharmacist for suitable alternatives."
      };
    }
    
    const alternatives = this.findAlternatives(targetMedicine);
    
    if (alternatives.length === 0) {
      return {
        type: 'alternatives',
        status: 'no_alternatives',
        message: `I couldn't find direct alternatives for "${targetMedicine.name}".`,
        suggestion: "Please consult with a pharmacist for suitable alternatives."
      };
    }
    
    return {
      type: 'alternatives',
      status: 'found',
      message: `🔄 **Alternatives for ${targetMedicine.name}**:\n\n${alternatives.map(alt => 
        `• **${alt.name}** (${alt.category})\n  Price: ₹${alt.price} | Stock: ${alt.stock} units\n  Similarity: ${alt.similarity}% match`
      ).join('\n\n')}\n\n⚠️ **Important**: Always consult with a doctor or pharmacist before switching medications.`,
      data: alternatives
    };
  }

  handleExpiryCheck = async (query) => {
    if (this.medicineData.length === 0) {
      await this.fetchMedicineData();
    }
    
    const now = new Date();
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const sixtyDays = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    
    const expiringSoon = this.medicineData.filter(med => {
      const expiry = new Date(med.expiry);
      return expiry > now && expiry <= thirtyDays;
    });
    
    const expiringNextMonth = this.medicineData.filter(med => {
      const expiry = new Date(med.expiry);
      return expiry > thirtyDays && expiry <= sixtyDays;
    });
    
    const expired = this.medicineData.filter(med => {
      const expiry = new Date(med.expiry);
      return expiry <= now;
    });
    
    let detailedMessage = '';
    if (expiringSoon.length > 0) {
      detailedMessage += `\n\n⚠️ **Expiring within 30 days**:\n${expiringSoon.map(med => 
        `• ${med.name} - Batch: ${med.batch} | Expires: ${new Date(med.expiry).toLocaleDateString()}`
      ).join('\n')}`;
    }
    
    if (expired.length > 0) {
      detailedMessage += `\n\n❌ **EXPIRED MEDICINES**:\n${expired.map(med => 
        `• ${med.name} - Batch: ${med.batch} | EXPIRED on ${new Date(med.expiry).toLocaleDateString()}`
      ).join('\n')}`;
    }
    
    return {
      type: 'expiry_check',
      status: 'found',
      message: `📅 **Expiry Status Report**:\n\n⚠️ **Expiring within 30 days**: ${expiringSoon.length} items\n📅 **Expiring in 31-60 days**: ${expiringNextMonth.length} items\n❌ **Already Expired**: ${expired.length} items${detailedMessage}`,
      data: {
        expiringSoon,
        expiringNextMonth,
        expired
      },
      warning: expired.length > 0 ? '🚨 CRITICAL: Expired medicines detected! Please remove them immediately.' : ''
    };
  }

  handleAppFeature = (query) => {
    const lowerQuery = query.toLowerCase();
    const userRole = this.userData?.user?.userType;
    
    const features = {
      'upload': {
        title: "📤 How to Upload Prescription",
        steps: [
          "Go to 'Prescriptions' section",
          "Click 'Upload Prescription' button",
          "Take a photo or upload from gallery",
          "Fill patient details",
          "Submit for pharmacist review",
          "Wait for price quote and approval"
        ],
        icon: "📄"
      },
      'find': {
        title: "🔍 Find Medicine Nearby",
        steps: [
          "Go to 'Find Medicine' page",
          "Enter medicine name",
          "System shows nearby pharmacies",
          "Check stock and prices",
          "Contact pharmacy or visit"
        ],
        icon: "📍"
      },
      'order': {
        title: "🛒 Place an Order",
        steps: [
          "Add medicines to cart",
          "Proceed to checkout",
          "Upload prescription (if required)",
          "Select delivery method",
          "Choose payment option",
          "Confirm order"
        ],
        icon: "💳"
      },
      'track': {
        title: "🚚 Track Your Order",
        steps: [
          "Go to 'My Orders' section",
          "Select your order",
          "View real-time status",
          "Check delivery updates",
          "Contact support if needed"
        ],
        icon: "📱"
      }
    };
    
    let matchedFeature = null;
    for (const [key, feature] of Object.entries(features)) {
      if (lowerQuery.includes(key)) {
        matchedFeature = feature;
        break;
      }
    }
    
    if (matchedFeature) {
      return {
        type: 'app_feature',
        status: 'specific',
        message: `${matchedFeature.icon} **${matchedFeature.title}**:\n\n${matchedFeature.steps.map((step, i) => `${i+1}. ${step}`).join('\n')}\n\n💡 Need more help? Ask specific questions!`,
        data: matchedFeature
      };
    }
    
    return {
      type: 'app_feature',
      status: 'general',
      message: `📱 **How to use our Pharmacy App**:\n\n${userRole === 'pharmacist' ? 
        `👨‍⚕️ **For Pharmacists**:\n1. Manage inventory\n2. Process prescriptions\n3. Handle orders\n4. View analytics\n\n` : 
        `👤 **For Customers**:\n1. Find medicines\n2. Upload prescriptions\n3. Place orders\n4. Track delivery\n\n`
      }🔧 **Need help with a specific feature?**\n• "How to upload prescription?"\n• "How to find medicine?"\n• "How to track my order?"`,
      data: features
    };
  }

  handleOrderStatus = async (query) => {
    // This would ideally call your orders API
    return {
      type: 'order_status',
      status: 'info',
      message: `📦 **Order Tracking**:\n\nTo check your order status:\n\n1. Go to **'My Orders'** section\n2. View all your recent orders\n3. Check status: Pending → Processing → Delivered\n4. For real-time updates, contact the pharmacy\n\n📞 **Need immediate help?**\n• Contact pharmacy directly\n• Check order notifications\n• Visit 'My Orders' for details`,
      nextSteps: [
        "Check 'My Orders' page",
        "Contact pharmacy support",
        "View order notifications"
      ]
    };
  }

  handlePrescriptionStatus = async (query) => {
    // This would ideally call your prescriptions API
    return {
      type: 'prescription_status',
      status: 'info',
      message: `📄 **Prescription Status**:\n\nPrescription workflow:\n\n1. **Upload**: You upload prescription\n2. **Pending**: Waiting for pharmacist review\n3. **Quoted**: Pharmacist provides price quote\n4. **Approved**: You accept and order is created\n5. **Rejected**: If issues found (you'll be notified)\n\n🔔 **Check Status**:\n• Go to 'Prescriptions' section\n• View all uploaded prescriptions\n• See current status and pharmacist notes\n• Contact pharmacist for queries`,
      statuses: ['pending', 'quoted', 'approved', 'rejected']
    };
  }

  handleInventoryReport = async (query) => {
    if (this.medicineData.length === 0) {
      await this.fetchMedicineData();
    }
    
    const lowStock = this.medicineData.filter(m => m.stock > 0 && m.stock <= (m.reorderLevel || 10));
    const outOfStock = this.medicineData.filter(m => m.stock === 0);
    const totalValue = this.medicineData.reduce((sum, med) => sum + (med.price * med.stock), 0);
    
    const lowStockMessage = lowStock.length > 0 ? 
      `\n\n⚠️ **Low Stock Items (${lowStock.length})**:\n${lowStock.slice(0, 5).map(m => 
        `• ${m.name} - ${m.stock} units (Reorder at ${m.reorderLevel || 10})`
      ).join('\n')}${lowStock.length > 5 ? `\n... and ${lowStock.length - 5} more` : ''}` : 
      '\n\n✅ No low stock items';
    
    return {
      type: 'inventory_report',
      status: 'report',
      message: `📊 **Inventory Report**:\n\n• **Total Medicines**: ${this.medicineData.length}\n• **Total Inventory Value**: ₹${totalValue.toFixed(2)}\n• **Low Stock Items**: ${lowStock.length}\n• **Out of Stock**: ${outOfStock.length}${lowStockMessage}`,
      data: {
        totalCount: this.medicineData.length,
        totalValue,
        lowStockCount: lowStock.length,
        outOfStockCount: outOfStock.length,
        lowStockItems: lowStock.slice(0, 10)
      }
    };
  }

  handleSalesReport = async (query) => {
    // This would ideally call your analytics API
    return {
      type: 'sales_report',
      status: 'report',
      message: `📈 **Sales Analytics**:\n\nTo view detailed sales reports:\n\n1. Go to **Analytics Dashboard**\n2. View real-time sales data\n3. Check revenue trends\n4. Analyze top-selling medicines\n5. Generate PDF reports\n\n📊 **Available Reports**:\n• Daily/Weekly/Monthly revenue\n• Top 5 selling medicines\n• Category-wise sales\n• Customer demographics\n• Profit margin analysis`,
      reports: [
        "Revenue Trends",
        "Top Selling Medicines", 
        "Category Distribution",
        "Customer Analytics",
        "Inventory Turnover"
      ]
    };
  }

  handlePharmacyInfo = async (query) => {
    const user = this.userData?.user;
    
    if (!user) {
      return {
        type: 'pharmacy_info',
        status: 'no_info',
        message: "I don't have pharmacy information. Please log in to see pharmacy details."
      };
    }
    
    if (user.userType === 'pharmacist') {
      return {
        type: 'pharmacy_info',
        status: 'pharmacist',
        message: `🏥 **Your Pharmacy Information**:\n\n• **Pharmacy Name**: ${user.pharmacyName || 'Not set'}\n• **License Number**: ${user.licenseNumber || 'Not set'}\n• **Address**: ${user.address || 'Not set'}\n• **Pincode**: ${user.pincode || 'Not set'}\n• **Phone**: ${user.phone || 'Not set'}\n• **Email**: ${user.email || 'Not set'}\n\nTo update, go to Profile → Edit`,
        data: user
      };
    } else {
      return {
        type: 'pharmacy_info',
        status: 'customer',
        message: `👤 **Your Profile**:\n\n• **Name**: ${user.name || 'Not set'}\n• **Address**: ${user.address || 'Not set'}\n• **Pincode**: ${user.pincode || 'Not set'}\n• **Phone**: ${user.phone || 'Not set'}\n• **Email**: ${user.email || 'Not set'}\n\nTo update, go to Profile → Edit`,
        data: user
      };
    }
  }

  // ==============================
  // 🛠️ ENHANCED HELPER METHODS
  // ==============================

  extractMedicineName = (query) => {
    const medicineNames = this.medicineData.map(m => m.name.toLowerCase());
    const lowerQuery = query.toLowerCase();
    
    // First, try direct match with medicine names
    for (const medicine of medicineNames) {
      const words = medicine.split(' ');
      for (const word of words) {
        if (word.length > 3 && lowerQuery.includes(word)) {
          return word;
        }
      }
      if (lowerQuery.includes(medicine)) {
        return medicine;
      }
    }
    
    // Common medicine mapping
    const commonMedicines = {
      'paracetamol': ['paracetamol', 'pcm', 'crocin', 'dolo', 'calpol', 'pacimol'],
      'ibuprofen': ['ibuprofen', 'brufen', 'ibu', 'ibugesic', 'combiflam'],
      'amoxicillin': ['amoxicillin', 'amox', 'mox', 'amoxy', 'amoxil'],
      'metformin': ['metformin', 'glycomet', 'met', 'formin', 'glucophage'],
      'atorvastatin': ['atorvastatin', 'atorva', 'lipitor', 'statin'],
      'cetirizine': ['cetirizine', 'cetzine', 'alriz', 'cet', 'zyrtec'],
      'omeprazole': ['omeprazole', 'omez', 'omep', 'prazole', 'prilosec'],
      'azithromycin': ['azithromycin', 'azithro', 'azee', 'zithromax'],
      'vitamin c': ['vitamin c', 'vit c', 'ascorbic acid'],
      'aspirin': ['aspirin', 'disprin', 'ecosprin']
    };
    
    for (const [key, variations] of Object.entries(commonMedicines)) {
      for (const variation of variations) {
        if (lowerQuery.includes(variation)) {
          return key;
        }
      }
    }
    
    // Extract potential medicine names from query
    const medicineKeywords = ['tablet', 'capsule', 'syrup', 'injection', 'cream', 'ointment', 'drops'];
    const words = lowerQuery.split(' ');
    
    for (const word of words) {
      if (word.length > 3 && !medicineKeywords.includes(word)) {
        // Check if it looks like a medicine name (contains letters and numbers)
        if (/[a-z][a-z0-9]*/.test(word)) {
          return word;
        }
      }
    }
    
    return null;
  }

  detectIntent = (query) => {
    const lowerQuery = query.toLowerCase();
    let bestMatch = { intent: 'general', confidence: 0 };
    
    for (const [intentName, intentData] of Object.entries(this.intents)) {
      let confidence = 0;
      
      // Check keywords
      for (const keyword of intentData.keywords) {
        if (lowerQuery.includes(keyword)) {
          confidence += 0.3;
        }
      }
      
      // Check patterns
      for (const pattern of intentData.patterns) {
        if (pattern.test(query)) {
          confidence += 0.5;
        }
      }
      
      // Special boost for exact matches
      if (intentName === 'medicine_search' && (lowerQuery.includes('find') || lowerQuery.includes('search'))) {
        confidence += 0.2;
      }
      
      if (confidence > bestMatch.confidence) {
        bestMatch = { intent: intentName, confidence };
      }
    }
    
    return bestMatch.confidence > 0.3 ? bestMatch : { intent: 'general', confidence: 0 };
  }

  formatMedicineCard = (medicine) => {
    const expiry = new Date(medicine.expiry);
    const today = new Date();
    const daysToExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    
    let stockStatus = '✅ In Stock';
    if (medicine.stock === 0) stockStatus = '❌ Out of Stock';
    else if (medicine.stock <= (medicine.reorderLevel || 10)) stockStatus = '⚠️ Low Stock';
    
    let expiryStatus = '✅ Valid';
    if (daysToExpiry <= 0) expiryStatus = '❌ Expired';
    else if (daysToExpiry <= 30) expiryStatus = '⚠️ Expiring Soon';
    
    return {
      name: medicine.name,
      genericName: medicine.genericName || '',
      category: medicine.category,
      stock: medicine.stock,
      price: medicine.price,
      formattedPrice: `₹${medicine.price}`,
      batch: medicine.batch,
      expiry: expiry.toLocaleDateString(),
      daysToExpiry,
      stockStatus,
      expiryStatus,
      reorderLevel: medicine.reorderLevel || 10
    };
  }

  formatMedicineInfo = (medicine) => {
    const expiry = new Date(medicine.expiry);
    const today = new Date();
    const daysToExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    
    return `
**📋 Basic Information:**
• **Name**: ${medicine.name}
• **Category**: ${medicine.category}
• **Batch**: ${medicine.batch}
• **Price**: ₹${medicine.price}

**📦 Stock Details:**
• **Available Stock**: ${medicine.stock} units
• **Reorder Level**: ${medicine.reorderLevel || 10} units
• **Stock Status**: ${medicine.stock > (medicine.reorderLevel || 10) ? 'Adequate' : 'Low Stock'}

**📅 Expiry Information:**
• **Expiry Date**: ${expiry.toLocaleDateString()}
• **Days Remaining**: ${daysToExpiry > 0 ? `${daysToExpiry} days` : 'EXPIRED'}
• **Expiry Status**: ${daysToExpiry > 30 ? 'Safe' : daysToExpiry > 0 ? 'Expiring Soon' : 'Expired'}
`;
  }

  getSimilarMedicines = (medicineName) => {
    const targetCategory = this.medicineData.find(m => 
      m.name.toLowerCase().includes(medicineName)
    )?.category;
    
    if (!targetCategory) return [];
    
    return this.medicineData
      .filter(m => m.category === targetCategory && m.stock > 0 && m.name.toLowerCase() !== medicineName)
      .slice(0, 3)
      .map(m => m.name);
  }

  findAlternatives = (targetMedicine) => {
    const sameCategory = this.medicineData.filter(m => 
      m.category === targetMedicine.category && 
      m.name !== targetMedicine.name &&
      m.stock > 0
    );
    
    return sameCategory.map(med => ({
      ...med,
      similarity: this.calculateSimilarity(targetMedicine, med)
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5);
  }

  calculateSimilarity = (med1, med2) => {
    let similarity = 0;
    if (med1.category === med2.category) similarity += 40;
    if (med1.genericName === med2.genericName) similarity += 30;
    if (Math.abs(med1.price - med2.price) < 10) similarity += 20;
    if (med1.stock > 0 && med2.stock > 0) similarity += 10;
    return similarity;
  }

  getAvailabilitySummary = () => {
    const total = this.medicineData.length;
    const inStock = this.medicineData.filter(m => m.stock > 0).length;
    const lowStock = this.medicineData.filter(m => m.stock > 0 && m.stock <= 10).length;
    const outOfStock = total - inStock;
    
    return {
      message: `📦 **Overall Inventory Status**:\n\n📊 **Total Medicines**: ${total}\n✅ **In Stock**: ${inStock}\n⚠️ **Low Stock**: ${lowStock}\n❌ **Out of Stock**: ${outOfStock}`,
      data: { total, inStock, lowStock, outOfStock }
    };
  }

  getPriceStatistics = () => {
    const prices = this.medicineData.map(m => m.price).filter(p => p > 0);
    const avgPrice = prices.length > 0 ? 
      (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2) : 0;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    const priceRanges = {
      'Under ₹10': this.medicineData.filter(m => m.price < 10).length,
      '₹10-₹50': this.medicineData.filter(m => m.price >= 10 && m.price <= 50).length,
      '₹51-₹100': this.medicineData.filter(m => m.price > 50 && m.price <= 100).length,
      'Over ₹100': this.medicineData.filter(m => m.price > 100).length
    };
    
    return `
• **Average Price**: ₹${avgPrice}
• **Cheapest**: ₹${minPrice}
• **Most Expensive**: ₹${maxPrice}
• **Price Distribution**:
  - Under ₹10: ${priceRanges['Under ₹10']}
  - ₹10-₹50: ${priceRanges['₹10-₹50']}
  - ₹51-₹100: ${priceRanges['₹51-₹100']}
  - Over ₹100: ${priceRanges['Over ₹100']}
`;
  }

  // Main processing function
  processQuery = async (query) => {
    const { intent } = this.detectIntent(query);
    
    try {
      if (this.intents[intent]) {
        const result = await this.intents[intent].handler(query);
        return {
          ...result,
          timestamp: new Date().toISOString(),
          intentDetected: intent
        };
      } else {
        return {
          type: 'general',
          status: 'unknown',
          message: "I understand you're asking about something, but I need more specific details. Could you rephrase your question?\n\n💡 **Try asking about**:\n• Medicines and availability\n• Prices and alternatives\n• Prescriptions and orders\n• App features and how-tos",
          suggestion: "Try asking about medicines, prices, availability, or app features.",
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('Query processing error:', error);
      return {
        type: 'error',
        status: 'error',
        message: "I encountered an error processing your request. Please try again.\n\n🔧 **Troubleshooting**:\n1. Check your internet connection\n2. Refresh the medicine data\n3. Try a simpler question",
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// ==============================
// 🏥 ENHANCED REAL-TIME CHATBOT
// ==============================

const PharmacyAIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Hello! I\'m your AI  Assistant What would you like to know today?',
      timestamp: new Date(),
      type: 'welcome'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agentType, setAgentType] = useState('auto');
  const [medicineData, setMedicineData] = useState([]);
  const [userData, setUserData] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [queryProcessor, setQueryProcessor] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch user data from localStorage
  const fetchUserData = () => {
    try {
      const authData = JSON.parse(localStorage.getItem('user_auth'));
      if (authData) {
        setUserData(authData);
        return authData;
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
    return null;
  };

  // REAL-TIME API: Fetch medicine inventory from your backend
  const fetchMedicineData = async () => {
    setDataLoading(true);
    try {
      const authData = JSON.parse(localStorage.getItem('user_auth'));
      const token = authData?.token;

      if (!token) {
        console.log('No auth token found');
        setDataLoading(false);
        return;
      }

      const API_URL = `${import.meta.env.VITE_BACKEND_BASEURL ?? "http://localhost:5000"}/api`;

      const response = await fetch(`${API_URL}/inventory`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMedicineData(data);
        console.log(' REAL-TIME Medicine data loaded:', data.length, 'medicines');
        
        // Initialize query processor with real data
        const processor = new PharmacyQueryProcessor(data, authData, token, fetchMedicineData);
        setQueryProcessor(processor);
        
        // Auto-update message if chat is open
        // if (isOpen && messages.length === 1) {
        //   setMessages(prev => [...prev, {
        //     role: 'assistant',
        //     // content: `System Update: Loaded ${data.length} medicines from inventory\n\nNow I can help you with real-time information!`,
        //     timestamp: new Date(),
        //     type: 'system'
        //   }]);
        // }
      } else {
        console.error('Failed to fetch medicine data:', response.status);
        // Fallback to localStorage if available
        const cachedData = localStorage.getItem('cached_medicine_data');
        if (cachedData) {
          const data = JSON.parse(cachedData);
          setMedicineData(data);
          console.log('📦 Using cached medicine data:', data.length, 'medicines');
        }
      }
    } catch (error) {
      console.error('Error fetching medicine data:', error);
      // Try cached data as fallback
      try {
        const cachedData = localStorage.getItem('cached_medicine_data');
        if (cachedData) {
          const data = JSON.parse(cachedData);
          setMedicineData(data);
          console.log('📦 Fallback to cached data:', data.length, 'medicines');
        }
      } catch (cacheError) {
        console.error('Cache error:', cacheError);
      }
    } finally {
      setDataLoading(false);
    }
  };

  // Fetch additional data: Orders, Prescriptions, Analytics
  const fetchAdditionalData = async (type) => {
    try {
      const authData = JSON.parse(localStorage.getItem('user_auth'));
      const token = authData?.token;

      if (!token) return null;

      let endpoint = '';
      const API_URL = `${import.meta.env.VITE_BACKEND_BASEURL ?? "http://localhost:5000"}/api`;

        switch (type) {
          case 'orders':
            endpoint = authData?.user?.userType === 'pharmacist'
              ? `${API_URL}/orders/pharmacist-orders`
              : `${API_URL}/orders/my-orders`;
            break;

          case 'prescriptions':
            endpoint = `${API_URL}/prescriptions/all`;
            break;

          case 'analytics':
            endpoint = `${API_URL}/analytics/pharmacist`;
            break;

          case 'alerts':
            endpoint = `${API_URL}/inventory/alerts`;
            break;
        }
      if (!endpoint) return null;

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
    }
    return null;
  };

  // Initialize query processor when data loads
  useEffect(() => {
    if (medicineData.length > 0 && userData) {
      const authToken = userData?.token;
      const processor = new PharmacyQueryProcessor(medicineData, userData, authToken, fetchMedicineData);
      setQueryProcessor(processor);
    }
  }, [medicineData, userData]);

  // Load data when chat opens
  useEffect(() => {
    if (isOpen) {
      const userData = fetchUserData();
      if (medicineData.length === 0) {
        fetchMedicineData();
      }
    }
  }, [isOpen]);

  // Cache medicine data periodically
  useEffect(() => {
    if (medicineData.length > 0) {
      localStorage.setItem('cached_medicine_data', JSON.stringify(medicineData));
    }
  }, [medicineData]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message
    const newUserMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
      type: 'user_query'
    };
    setMessages(prev => [...prev, newUserMessage]);

    // Process query
    if (queryProcessor) {
      try {
        const result = await queryProcessor.processQuery(userMessage);
        
        const assistantMessage = {
          role: 'assistant',
          content: result.message,
          agentType: result.type,
          timestamp: new Date(),
          type: 'response',
          data: result.data,
          warning: result.warning,
          suggestions: result.suggestions
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        // If result suggests fetching more data, do it
        if (result.type === 'order_status' || result.type === 'prescription_status') {
          // You could trigger additional API calls here
        }
        
      } catch (error) {
        const errorMessage = {
          role: 'assistant',
          content: `❌ **Error Processing Request**\n\nI encountered an issue: ${error.message}\n\nPlease try again or refresh the data.`,
          agentType: 'error',
          timestamp: new Date(),
          type: 'error'
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } else {
      const loadingMessage = {
        role: 'assistant',
        content: "🔄 **Loading Data...**\n\nPlease wait while I load the medicine data. This might take a moment.\n\nYou can also try refreshing the data using the refresh button above.",
        agentType: 'general',
        timestamp: new Date(),
        type: 'loading'
      };
      setMessages(prev => [...prev, loadingMessage]);
      
      // Try to initialize processor
      await fetchMedicineData();
    }
    
    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Quick action suggestions based on user role
  const getQuickActions = () => {
    const userRole = userData?.user?.userType;
    const baseActions = [
      { text: "Find paracetamol", icon: Search, type: 'medicine_search' },
      { text: "Check medicine prices", icon: DollarSign, type: 'price_check' },
      { text: "Show low stock medicines", icon: AlertTriangle, type: 'inventory_report' },
      { text: "What medicines are expiring?", icon: Calendar, type: 'expiry_check' },
    ];

    if (userRole === 'pharmacist') {
      return [
        ...baseActions,
        { text: "How to quote prescription?", icon: FileTextIcon, type: 'app_feature' },
        { text: "View sales analytics", icon: BarChart, type: 'sales_report' },
        { text: "Check inventory alerts", icon: Activity, type: 'inventory_report' },
        { text: "Pharmacy information", icon: Database, type: 'pharmacy_info' },
      ];
    } else if (userRole === 'user' || userRole === 'customer') {
      return [
        ...baseActions,
        { text: "How to upload prescription?", icon: FileTextIcon, type: 'app_feature' },
        { text: "Track my order", icon: Package, type: 'order_status' },
        { text: "Prescription status", icon: FileText, type: 'prescription_status' },
        { text: "Find nearby pharmacy", icon: MapPin, type: 'pharmacy_info' },
      ];
    }

    return baseActions;
  };

  const handleQuickAction = (text) => {
    setInput(text);
  };

  // Refresh all data
  const refreshAllData = async () => {
    setDataLoading(true);
    await fetchMedicineData();
    
    // Fetch additional data based on user role
    const userRole = userData?.user?.userType;
    if (userRole === 'pharmacist') {
      await fetchAdditionalData('alerts');
      await fetchAdditionalData('analytics');
    }
    
    setDataLoading(false);
    
    // Add refresh notification
    // setMessages(prev => [...prev, {
    //   role: 'assistant',
    //   // content: "✅ **Data Refreshed**\n\nAll medicine data has been updated with the latest information from the database.",
    //   timestamp: new Date(),
    //   type: 'system'
    // }]);
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className=" bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-3 rounded-full shadow-2xl transition-all transform hover:scale-110 flex items-center space-x-2 group"
        >
          <Bot className="h-6 w-6" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap text-sm font-medium">
            Ask AI Assistant
          </span>
        </button>
      )}

      {isOpen && (
        <div className={`fixed ${isMinimized ? 'bottom-6 right-6 w-80' : 'bottom-6 right-6 w-[450px]'} z-50 bg-white rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ${isMinimized ? 'h-16' : 'h-[700px]'} border border-gray-200`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-purple-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-full animate-pulse">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg">AI Pharmacy Assistant</h3>
                <p className="text-xs text-blue-100 flex items-center space-x-1">
                  {/* <span>{dataLoading ? 'Loading...' : `${medicineData.length} medicines`}</span>
                  <span>•</span>
                  <span>{userData?.user?.userType || 'Guest'}</span>
                  {queryProcessor && <span className="text-green-300">• Live</span>} */}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={refreshAllData}
                className="hover:bg-white/20 p-2 rounded-lg transition-colors"
                title="Refresh all data"
              >
                <RefreshCw className={`h-4 w-4 ${dataLoading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Mode Selector */}
              <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-blue-50 border-b flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span className="text-xs font-semibold text-gray-700">AI Mode:</span>
                <div className="flex space-x-1 flex-1">
                  {[
                    { value: 'auto', label: 'Auto', icon: Sparkles, color: 'purple' },
                    { value: 'medicine', label: 'Medicine', icon: Pill, color: 'blue' },
                    { value: 'app', label: 'Guide', icon: Stethoscope, color: 'green' },
                    { value: 'reports', label: 'Reports', icon: BarChart, color: 'orange' }
                  ].map(({ value, label, icon: Icon, color }) => (
                    <button
                      key={value}
                      onClick={() => setAgentType(value)}
                      className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        agentType === value
                          ? `bg-${color}-600 text-white shadow-md`
                          : 'bg-white text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-3 w-3" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[90%] rounded-2xl px-4 py-3 shadow-md ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                          : message.type === 'error'
                          ? 'bg-red-50 border border-red-200 text-red-800'
                          : message.type === 'system'
                          ? 'bg-blue-50 border border-blue-200 text-blue-800'
                          : 'bg-white text-gray-800 border border-gray-200'
                      }`}
                    >
                      {message.role === 'assistant' && message.agentType && (
                        <div className="flex items-center space-x-1 mb-2 pb-2 border-b border-gray-200">
                          {message.agentType === 'medicine_search' ? (
                            <Search className="h-4 w-4 text-blue-600" />
                          ) : message.agentType === 'price_check' ? (
                            <DollarSign className="h-4 w-4 text-green-600" />
                          ) : message.agentType === 'inventory_report' ? (
                            <Database className="h-4 w-4 text-orange-600" />
                          ) : message.agentType === 'app_feature' ? (
                            <Stethoscope className="h-4 w-4 text-purple-600" />
                          ) : (
                            <Sparkles className="h-4 w-4 text-gray-600" />
                          )}
                          <span className="text-xs font-bold text-gray-600">
                            {message.agentType === 'medicine_search' ? (
                              <span className="flex items-center">
                                <Search className="h-3 w-3 mr-1" />
                                Search Results
                              </span>
                            ) : message.agentType === 'price_check' ? (
                              <span className="flex items-center">
                                <DollarSign className="h-3 w-3 mr-1" />
                                Price Check
                              </span>
                            ) : message.agentType === 'inventory_report' ? (
                              <span className="flex items-center">
                                <Database className="h-3 w-3 mr-1" />
                                Inventory Report
                              </span>
                            ) : message.agentType === 'app_feature' ? (
                              <span className="flex items-center">
                                <Stethoscope className="h-3 w-3 mr-1" />
                                App Guide
                              </span>
                            ) : message.agentType === 'error' ? (
                              <span className="flex items-center">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Error
                              </span>
                            ) : message.agentType === 'order_status' ? (
                              <span className="flex items-center">
                                <Package className="h-3 w-3 mr-1" />
                                Order Status
                              </span>
                            ) : message.agentType === 'prescription_status' ? (
                              <span className="flex items-center">
                                <FileText className="h-3 w-3 mr-1" />
                                Prescription
                              </span>
                            ) : message.agentType === 'sales_report' ? (
                              <span className="flex items-center">
                                <BarChart className="h-3 w-3 mr-1" />
                                Sales Report
                              </span>
                            ) : message.agentType === 'pharmacy_info' ? (
                              <span className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                Pharmacy Info
                              </span>
                            ) : message.agentType === 'alternatives' ? (
                              <span className="flex items-center">
                                <RefreshCw className="h-3 w-3 mr-1" />
                                Alternatives
                              </span>
                            ) : message.agentType === 'expiry_check' ? (
                              <span className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                Expiry Check
                              </span>
                            ) : message.agentType === 'availability_check' ? (
                              <span className="flex items-center">
                                <Package className="h-3 w-3 mr-1" />
                                Availability
                              </span>
                            ) : message.agentType === 'medicine_info' ? (
                              <span className="flex items-center">
                                <Pill className="h-3 w-3 mr-1" />
                                Medicine Info
                              </span>
                            ) : (
                              <span className="flex items-center">
                                <Sparkles className="h-3 w-3 mr-1" />
                                Assistant
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      
                      {message.warning && (
                        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-xs text-red-700 font-medium flex items-center">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {message.warning}
                          </p>
                        </div>
                      )}
                      
                      {message.suggestions && Array.isArray(message.suggestions) && (
                        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-xs text-blue-700 font-medium mb-1">💡 Suggestions:</p>
                          <ul className="text-xs text-blue-600">
                            {message.suggestions.map((suggestion, idx) => (
                              <li key={idx} className="mb-1">• {suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <p className="text-xs opacity-60 mt-2">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 flex items-center space-x-2 shadow-md">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      <span className="text-sm text-gray-600">Processing your query...</span>
                    </div>
                  </div>
                )}
                
                {/* Quick Actions */}
                {messages.length <= 2 && !isLoading && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 font-semibold"> Quick Actions:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {getQuickActions().slice(0, 6).map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleQuickAction(action.text)}
                          className="flex items-center space-x-2 p-2 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all text-left group"
                        >
                          <action.icon className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                          <span className="text-xs text-gray-700 group-hover:text-blue-700">{action.text}</span>
                        </button>
                      ))}
                    </div>
                    {medicineData.length > 0 && (
                      <p className="text-xs text-green-600 text-center mt-2">
                        {/* ✅ Connected to {medicineData.length} medicines in database */}
                      </p>
                    )}
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t bg-white rounded-b-2xl">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={
                      userData?.user?.userType === 'pharmacist' 
                        ? "Ask about medicines, inventory, orders, or analytics..."
                        : "Ask about medicines, prices, prescriptions, or orders..."
                    }
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white p-3 rounded-xl transition-all shadow-md disabled:shadow-none"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500">
                    {/* {queryProcessor ? '⚡ Real-time API Connected' : '🔌 Connecting to database...'} */}
                  </p>
                  <div className="flex items-center space-x-1">
                    {medicineData.length > 0 && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        {medicineData.length} items
                      </span>
                    )}
                    {userData?.user?.userType && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {userData.user.userType}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default PharmacyAIChatbot;