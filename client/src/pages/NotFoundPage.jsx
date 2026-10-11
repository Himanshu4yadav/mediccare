import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Home } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900">404 - Page Not Found</h1>
      <p className="text-sm text-slate-500 mt-2 max-w-md">
        The hospital directory or portal route you requested could not be located.
      </p>
      <Link
        to="/"
        className="mt-6 px-5 py-2.5 bg-medic-600 hover:bg-medic-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-sm transition-colors"
      >
        <Home className="w-4 h-4" />
        <span>Return to MedicCare Home</span>
      </Link>
    </div>
  );
};

export default NotFoundPage;
