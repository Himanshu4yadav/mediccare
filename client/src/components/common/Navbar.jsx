import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Activity,
  HeartPulse,
  User,
  LogOut,
  Menu,
  X,
  Stethoscope,
  Code2,
  CalendarCheck,
  AlertTriangle
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'doctor') return '/doctor/dashboard';
    return '/patient/dashboard';
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-medic-600 to-tealbrand-500 flex items-center justify-center text-white shadow-md shadow-medic-500/20 group-hover:scale-105 transition-transform duration-200">
              <HeartPulse className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-medic-700 via-medic-600 to-tealbrand-600 bg-clip-text text-transparent">
                MedicCare
              </span>
              <span className="hidden md:inline-block text-[10px] font-semibold tracking-wider uppercase ml-1.5 px-1.5 py-0.5 bg-medic-50 text-medic-700 border border-medic-200 rounded">
                Smart Hospital
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-7 text-sm font-medium text-slate-600">
            <Link to="/" className="hover:text-medic-600 transition-colors">
              Home
            </Link>
            <a href="/#services" className="hover:text-medic-600 transition-colors">
              Services
            </a>
            <a href="/#doctors" className="hover:text-medic-600 transition-colors">
              Doctors
            </a>
            <a href="/#beds" className="hover:text-medic-600 transition-colors">
              Bed Tracker
            </a>
            <Link
              to="/dsa-lab"
              className="flex items-center space-x-1 text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200 hover:bg-teal-100 transition-colors font-semibold"
            >
              <Code2 className="w-4 h-4" />
              <span>DSA Lab</span>
            </Link>
          </div>

          {/* User Auth Controls */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link
                  to={getDashboardPath()}
                  className="flex items-center space-x-2 text-xs font-semibold bg-medic-50 border border-medic-200 text-medic-700 px-3 py-2 rounded-lg hover:bg-medic-100 transition-colors shadow-sm"
                >
                  <User className="w-4 h-4 text-medic-600" />
                  <span>
                    {user?.name?.split(' ')[0]} ({user?.role?.toUpperCase()})
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-700 hover:text-medic-600 px-3 py-2 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium bg-medic-600 hover:bg-medic-700 text-white px-4 py-2 rounded-lg shadow-sm shadow-medic-600/30 transition-all hover:shadow"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-5 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-slate-700 py-1"
          >
            Home
          </Link>
          <a
            href="/#services"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-slate-700 py-1"
          >
            Services
          </a>
          <a
            href="/#doctors"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-slate-700 py-1"
          >
            Doctors
          </a>
          <Link
            to="/dsa-lab"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-teal-700 py-1"
          >
            DSA Lab (Algorithms)
          </Link>

          <div className="pt-3 border-t border-slate-100 flex flex-col space-y-2">
            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardPath()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 bg-medic-600 text-white rounded-lg font-medium"
                >
                  Go to {user?.role} Dashboard
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-center py-2 bg-slate-100 text-slate-700 rounded-lg font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 border border-slate-300 text-slate-700 rounded-lg font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 bg-medic-600 text-white rounded-lg font-medium"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
