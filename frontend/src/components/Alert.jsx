// frontend/src/components/Alert.jsx

import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

const Alert = ({ type = 'info', title, description, action, clickable = false }) => {
  const styles = {
    success: {
      container: 'bg-green-50 border-green-200',
      icon: 'text-green-600',
      title: 'text-green-900',
      description: 'text-green-700',
      IconComponent: CheckCircle
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200',
      icon: 'text-yellow-600',
      title: 'text-yellow-900',
      description: 'text-yellow-700',
      IconComponent: AlertTriangle
    },
    danger: {
      container: 'bg-red-50 border-red-200',
      icon: 'text-red-600',
      title: 'text-red-900',
      description: 'text-red-700',
      IconComponent: AlertCircle
    },
    info: {
      container: 'bg-blue-50 border-blue-200',
      icon: 'text-blue-600',
      title: 'text-blue-900',
      description: 'text-blue-700',
      IconComponent: Info
    }
  };

  const style = styles[type] || styles.info;
  const IconComponent = style.IconComponent;

  return (
    <div 
      className={`${style.container} border rounded-lg p-4 flex items-start space-x-3 ${
        clickable ? 'hover:shadow-md transition-all cursor-pointer' : ''
      }`}
    >
      <IconComponent className={`${style.icon} h-5 w-5 flex-shrink-0 mt-0.5`} />
      <div className="flex-1">
        <h4 className={`${style.title} font-semibold text-sm`}>{title}</h4>
        {description && (
          <p className={`${style.description} text-xs mt-1`}>{description}</p>
        )}
        {action && clickable && (
          <button className={`${style.title} text-xs font-medium mt-2 underline hover:no-underline`}>
            {action}
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;