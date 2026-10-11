import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HeartPulse,
  LayoutDashboard,
  Calendar,
  AlertTriangle,
  BedDouble,
  Users,
  Code2,
  LogOut,
  UserCheck,
  Shield,
  FileText
} from 'lucide-react';

const DashboardLayout = ({ children, title, subtitle, activeTab }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    if (user?.role === 'admin') {
      return [
        { name: 'Admin Overview', icon: LayoutDashboard, path: '/admin/dashboard' },
        { name: 'DSA Algorithm Lab', icon: Code2, path: '/dsa-lab' }
      ];
    }
    if (user?.role === 'doctor') {
      return [
        { name: 'Doctor Console', icon: LayoutDashboard, path: '/doctor/dashboard' },
        { name: 'DSA Algorithm Lab', icon: Code2, path: '/dsa-lab' }
      ];
    }
    return [
      { name: 'Patient Portal', icon: LayoutDashboard, path: '/patient/dashboard' },
      { name: 'DSA Algorithm Lab', icon: Code2, path: '/dsa-lab' }
    ];
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col justify-between p-4 border-r border-slate-800">
        <div>
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 pb-6 pt-2 border-b border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-medic-500 to-tealbrand-500 flex items-center justify-center text-white shadow-md">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight">MedicCare</span>
              <p className="text-[10px] text-medic-400 font-semibold uppercase tracking-wider">
                {user?.role} Workspace
              </p>
            </div>
          </Link>

          {/* User Brief Card */}
          <div className="mt-5 p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-medic-600/30 border border-medic-500 flex items-center justify-center text-medic-300 font-bold text-sm">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
              <span className="inline-block mt-0.5 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 bg-medic-900 text-medic-300 border border-medic-700 rounded">
                {user?.role}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 space-y-1">
            {getNavLinks().map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.name;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-medic-600 text-white font-semibold shadow-sm shadow-medic-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info & Logout */}
        <div className="pt-6 border-t border-slate-800 space-y-3">
          <Link
            to="/"
            className="block text-center text-xs text-slate-400 hover:text-white py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            ← Back to Public Website
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-red-900/40 p-2.5 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{title}</h1>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>

          {/* Live emergency indicator badge */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-slate-600">Database & Heap Online</span>
          </div>
        </header>

        {/* Child Page Content */}
        <div className="p-6 flex-1">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
