import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AlertBanner from '../components/common/AlertBanner';
import { HeartPulse, Lock, Mail, ArrowRight, ShieldCheck, KeyRound, Loader2 } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      return setError('Please enter both email and password.');
    }

    try {
      setLoading(true);
      const res = await login(email, password);
      if (res.success) {
        if (res.user.role === 'admin') navigate('/admin/dashboard');
        else if (res.user.role === 'doctor') navigate('/doctor/dashboard');
        else navigate('/patient/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  // One-click quick fill for college evaluation
  const setDemoCredentials = (role) => {
    if (role === 'admin') {
      setEmail('admin@mediccare.com');
      setPassword('Admin@123');
    } else if (role === 'doctor') {
      setEmail('doctor.vance@mediccare.com');
      setPassword('Doctor@123');
    } else if (role === 'patient') {
      setEmail('patient.john@mediccare.com');
      setPassword('Patient@123');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center space-x-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-medic-600 to-tealbrand-500 flex items-center justify-center text-white shadow-lg shadow-medic-500/20">
            <HeartPulse className="w-7 h-7" />
          </div>
        </Link>
        <h2 className="mt-4 text-2xl font-extrabold text-slate-900 tracking-tight">
          Sign In to MedicCare
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Role-Based Access for Patients, Doctors, and Hospital Administrators
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-100 sm:px-10">
          {error && <AlertBanner type="danger" message={error} onClose={() => setError('')} />}

          {/* Quick Demo Login Credentials Bar for testing */}
          <div className="mb-6 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 text-center">
              One-Click Demo Credentials
            </p>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setDemoCredentials('admin')}
                className="px-2 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg font-semibold border border-purple-200 transition-colors"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('doctor')}
                className="px-2 py-1.5 bg-medic-50 text-medic-700 hover:bg-medic-100 rounded-lg font-semibold border border-medic-200 transition-colors"
              >
                Doctor
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('patient')}
                className="px-2 py-1.5 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-lg font-semibold border border-teal-200 transition-colors"
              >
                Patient
              </button>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Email Address</label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@mediccare.com"
                  className="block w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-medic-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Password</label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-medic-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent rounded-xl shadow-md shadow-medic-500/20 text-xs font-semibold text-white bg-medic-600 hover:bg-medic-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-medic-500 transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-medic-600 hover:text-medic-700">
              Register New Patient Account
            </Link>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-xs text-slate-500 hover:text-slate-800 font-medium">
            ← Return to MedicCare Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
