// frontend/src/utils.js

export const getStockStatus = (stock, reorderLevel) => {
  if (stock === 0) return { label: 'Out of Stock', color: 'bg-red-500', textColor: 'text-red-600' };
  if (stock <= reorderLevel) return { label: 'Low Stock', color: 'bg-orange-500', textColor: 'text-orange-600' };
  return { label: 'In Stock', color: 'bg-green-500', textColor: 'text-green-600' };
};

export const getDaysUntilExpiry = (expiryDate) => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};