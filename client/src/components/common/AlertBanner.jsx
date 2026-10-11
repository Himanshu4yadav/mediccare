import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

const AlertBanner = ({ type = 'info', title, message, onClose }) => {
  const styles = {
    danger: {
      bg: 'bg-red-50 border-red-200 text-red-800',
      icon: <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-800',
      icon: <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
    },
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
    },
    info: {
      bg: 'bg-medic-50 border-medic-200 text-medic-800',
      icon: <Info className="w-5 h-5 text-medic-600 flex-shrink-0" />
    }
  };

  const current = styles[type] || styles.info;

  return (
    <div className={`p-4 rounded-xl border flex items-start space-x-3 shadow-sm ${current.bg} mb-4 animate-fade-in`}>
      {current.icon}
      <div className="flex-1">
        {title && <h5 className="font-semibold text-sm mb-0.5">{title}</h5>}
        <p className="text-xs leading-relaxed">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 transition-colors p-1"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default AlertBanner;
