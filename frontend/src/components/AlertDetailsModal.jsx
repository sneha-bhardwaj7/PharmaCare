// frontend/src/components/AlertDetailsModal.jsx

import React from 'react';
import { X, Package, Calendar, AlertTriangle } from 'lucide-react';

const AlertDetailsModal = ({ isOpen, onClose, type, data, title }) => {
  if (!isOpen) return null;

  const getTypeConfig = () => {
    switch (type) {
      case 'lowStock':
        return {
          icon: Package,
          iconColor: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-900',
          badgeColor: 'bg-yellow-100 text-yellow-800',
        };
      case 'expiringSoon':
        return {
          icon: Calendar,
          iconColor: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-900',
          badgeColor: 'bg-blue-100 text-blue-800',
        };
      case 'expired':
        return {
          icon: AlertTriangle,
          iconColor: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-900',
          badgeColor: 'bg-red-100 text-red-800',
        };
      default:
        return {
          icon: Package,
          iconColor: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-900',
          badgeColor: 'bg-gray-100 text-gray-800',
        };
    }
  };

  const config = getTypeConfig();
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className={`${config.bgColor} ${config.borderColor} border-b px-6 py-4 flex items-center justify-between`}>
          <div className="flex items-center space-x-3">
            <Icon className={`h-6 w-6 ${config.iconColor}`} />
            <h2 className={`text-2xl font-bold ${config.textColor}`}>{title}</h2>
            <span className={`${config.badgeColor} px-3 py-1 rounded-full text-sm font-semibold`}>
              {data.length} {data.length === 1 ? 'Item' : 'Items'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {data.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Icon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">No items to display</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.map((item, idx) => (
                <div
                  key={item._id || idx}
                  className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start justify-between">
                    {/* Medicine Info */}
                    <div className="flex-1">
                      <h3 className={`text-lg font-bold ${config.textColor}`}>
                        {item.name}
                      </h3>
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500 font-medium">Batch:</span>
                          <span className={`ml-2 ${config.textColor}`}>{item.batch}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 font-medium">Category:</span>
                          <span className={`ml-2 ${config.textColor}`}>{item.category}</span>
                        </div>
                        {item.stock !== undefined && (
                          <div>
                            <span className="text-gray-500 font-medium">Stock:</span>
                            <span className={`ml-2 font-semibold ${config.textColor}`}>
                              {item.stock}
                              {item.reorderLevel !== undefined && (
                                <span className="text-gray-500 font-normal">
                                  {' '}/ {item.reorderLevel}
                                </span>
                              )}
                            </span>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-500 font-medium">Expiry:</span>
                          <span className={`ml-2 ${config.textColor}`}>
                            {new Date(item.expiry).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Alert-specific Info */}
                    <div className="ml-4 flex flex-col items-end space-y-2">
                      {type === 'lowStock' && (
                        <div className={`${config.badgeColor} px-3 py-1 rounded-full text-xs font-semibold`}>
                          {item.stock === 0 ? 'OUT OF STOCK' : 'LOW STOCK'}
                        </div>
                      )}
                      {type === 'expiringSoon' && item.daysLeft !== undefined && (
                        <div className={`${config.badgeColor} px-3 py-1 rounded-full text-xs font-semibold`}>
                          {item.daysLeft} {item.daysLeft === 1 ? 'Day' : 'Days'} Left
                        </div>
                      )}
                      {type === 'expired' && (
                        <div className={`${config.badgeColor} px-3 py-1 rounded-full text-xs font-semibold`}>
                          EXPIRED
                          {item.daysExpired !== undefined && (
                            <span className="ml-1">({item.daysExpired}d ago)</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Recommendation */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-600">
                      {type === 'lowStock' && (
                        <>
                          <strong>Action Required:</strong> Reorder immediately to maintain stock levels
                        </>
                      )}
                      {type === 'expiringSoon' && (
                        <>
                          <strong>Action Required:</strong> Plan to sell or use before expiry
                        </>
                      )}
                      {type === 'expired' && (
                        <>
                          <strong>Action Required:</strong> Remove from inventory immediately - Do not sell
                        </>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`${config.bgColor} ${config.borderColor} border-t px-6 py-4 flex justify-end`}>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertDetailsModal;