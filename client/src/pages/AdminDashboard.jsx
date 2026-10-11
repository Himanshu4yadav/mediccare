import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import AlertBanner from '../components/common/AlertBanner';
import StatCard from '../components/common/StatCard';
import Loader from '../components/common/Loader';
import BedModal from '../components/forms/BedModal';
import Modal from '../components/common/Modal';
import api from '../services/api';
import {
  Users,
  UserCheck,
  Calendar,
  AlertTriangle,
  BedDouble,
  BarChart3,
  Search,
  Plus,
  Trash2,
  Edit,
  ArrowUpDown,
  RefreshCw,
  HeartPulse,
  UserPlus
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'patients' | 'doctors' | 'beds' | 'emergencies'
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [beds, setBeds] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [waitingList, setWaitingList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Modals
  const [isBedModalOpen, setIsBedModalOpen] = useState(false);
  const [selectedBed, setSelectedBed] = useState(null);
  const [isWaitingModalOpen, setIsWaitingModalOpen] = useState(false);
  const [waitingPatientName, setWaitingPatientName] = useState('');
  const [waitingWard, setWaitingWard] = useState('ICU (Intensive Care Unit)');

  // Doctor creation modal
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    email: '',
    password: 'Doctor@123',
    specialization: 'Cardiologist',
    department: 'Cardiology',
    phone: '',
    consultationFee: 700
  });

  useEffect(() => {
    fetchAllAdminData();
  }, []);

  const fetchAllAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, patientsRes, doctorsRes, bedsRes, emergRes] = await Promise.all([
        api.get('/dashboard/stats').catch(() => ({ data: { stats: {}, charts: {} } })),
        api.get('/patients').catch(() => ({ data: { data: [] } })),
        api.get('/doctors').catch(() => ({ data: { data: [] } })),
        api.get('/beds').catch(() => ({ data: { data: [], waitingList: [] } })),
        api.get('/emergencies').catch(() => ({ data: { data: [] } }))
      ]);

      if (statsRes.data.success) setStats(statsRes.data);
      if (patientsRes.data.success) setPatients(patientsRes.data.data);
      if (doctorsRes.data.success) setDoctors(doctorsRes.data.data);
      if (bedsRes.data.success) {
        setBeds(bedsRes.data.data);
        if (bedsRes.data.waitingList) setWaitingList(bedsRes.data.waitingList);
      }
      if (emergRes.data.success) setEmergencies(emergRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading administrator control data.');
    } finally {
      setLoading(false);
    }
  };

  // Bed Deletion
  const handleDeleteBed = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hospital bed record?')) return;
    try {
      const { data } = await api.delete(`/beds/${id}`);
      if (data.success) {
        setNotice('Bed removed successfully.');
        fetchAllAdminData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete bed.');
    }
  };

  // Enqueue waiting list
  const handleAddToWaitingList = async (e) => {
    e.preventDefault();
    if (!waitingPatientName.trim()) return;

    try {
      const { data } = await api.post('/beds/waiting-list', {
        patientName: waitingPatientName,
        requiredWard: waitingWard
      });
      if (data.success) {
        setNotice(data.message);
        setWaitingPatientName('');
        setIsWaitingModalOpen(false);
        fetchAllAdminData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add to waiting list.');
    }
  };

  // Dequeue waiting list
  const handleDequeueWaitingList = async () => {
    try {
      const { data } = await api.post('/beds/waiting-list/dequeue');
      if (data.success) {
        setNotice(data.message);
        fetchAllAdminData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Waiting list queue is currently empty.');
    }
  };

  // Create Doctor
  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/doctors', newDoctor);
      if (data.success) {
        setNotice(`Doctor ${data.data.name} created successfully.`);
        setIsDoctorModalOpen(false);
        setNewDoctor({
          name: '',
          email: '',
          password: 'Doctor@123',
          specialization: 'Cardiologist',
          department: 'Cardiology',
          phone: '',
          consultationFee: 700
        });
        fetchAllAdminData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register doctor.');
    }
  };

  // Delete Patient
  const handleDeletePatient = async (id) => {
    if (!window.confirm('Delete this patient record?')) return;
    try {
      const { data } = await api.delete(`/patients/${id}`);
      if (data.success) {
        setNotice('Patient record deleted.');
        fetchAllAdminData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete patient.');
    }
  };

  // Delete Doctor
  const handleDeleteDoctor = async (id) => {
    if (!window.confirm('Delete this physician account?')) return;
    try {
      const { data } = await api.delete(`/doctors/${id}`);
      if (data.success) {
        setNotice('Doctor account deleted.');
        fetchAllAdminData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete doctor.');
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Admin Command Center" subtitle="Aggregating metrics..." activeTab="Admin Overview">
        <Loader message="Querying MongoDB analytics, Bed inventory, and Triage heap..." />
      </DashboardLayout>
    );
  }

  const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'];

  return (
    <DashboardLayout
      title="Hospital Operations & Administration"
      subtitle="Centralized management of clinical staff, patients, bed availability, and emergency prioritization."
      activeTab="Admin Overview"
    >
      {notice && <AlertBanner type="success" message={notice} onClose={() => setNotice('')} />}
      {error && <AlertBanner type="danger" message={error} onClose={() => setError('')} />}

      {/* Tabs Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-white p-3 rounded-2xl border border-slate-200">
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'overview', label: 'Analytics Overview' },
            { id: 'emergencies', label: `Emergency Cases (${emergencies.length})` },
            { id: 'beds', label: `Bed Management (${beds.length})` },
            { id: 'patients', label: `Patients (${patients.length})` },
            { id: 'doctors', label: `Doctors (${doctors.length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 rounded-xl transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-medic-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={fetchAllAdminData}
          className="p-2 text-slate-500 hover:text-medic-600 hover:bg-slate-50 rounded-lg transition-colors flex items-center space-x-1 text-xs"
          title="Refresh All Records"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Patients"
              value={stats?.stats?.totalPatients ?? patients.length}
              icon={Users}
              color="teal"
              subtitle="Registered patient profiles"
            />
            <StatCard
              title="Medical Doctors"
              value={stats?.stats?.totalDoctors ?? doctors.length}
              icon={UserCheck}
              color="blue"
              subtitle="Certified clinical specialists"
            />
            <StatCard
              title="Active Emergencies"
              value={stats?.stats?.pendingEmergencyCases ?? emergencies.length}
              icon={HeartPulse}
              color="red"
              subtitle={`${stats?.stats?.criticalEmergencies ?? 0} critical in heap`}
            />
            <StatCard
              title="Bed Occupancy"
              value={`${stats?.stats?.bedStats?.occupancyRate ?? 50}%`}
              icon={BedDouble}
              color="purple"
              subtitle={`${stats?.stats?.bedStats?.available ?? 0} beds available`}
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Chart 1: Bed Allocation by Ward */}
            <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <h4 className="text-sm font-bold text-slate-800 mb-1">Ward Bed Capacity & Occupancy</h4>
              <p className="text-[11px] text-slate-400 mb-4">Calculated from live database bed records</p>
              <div className="h-64 w-full">
                {stats?.charts?.bedsByWard?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.charts.bedsByWard} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="ward" tick={{ fontSize: 9 }} interval={0} angle={-15} textAnchor="end" />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="available" fill="#10b981" name="Available Beds" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="occupied" fill="#ef4444" name="Occupied Beds" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    No ward data found. Seed database to render charts.
                  </div>
                )}
              </div>
            </div>

            {/* Chart 2: Emergency Severity Breakdown */}
            <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <h4 className="text-sm font-bold text-slate-800 mb-1">Emergency Cases by Triage Severity</h4>
              <p className="text-[11px] text-slate-400 mb-4">Heap priority distribution (Critical to Low)</p>
              <div className="h-64 w-full flex items-center justify-center">
                {stats?.charts?.emergencyBySeverity?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.charts.emergencyBySeverity}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="count"
                        nameKey="name"
                      >
                        {stats.charts.emergencyBySeverity.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    No emergency cases recorded yet.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent System Activity Log */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h4 className="text-sm font-bold text-slate-800 mb-1">Audit Trail & Administrative Activity Log</h4>
            <p className="text-[11px] text-slate-400 mb-4">Chronological system events and authorization operations</p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {stats?.recentActivity?.length > 0 ? (
                stats.recentActivity.map((log) => (
                  <div key={log._id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-slate-800">{log.action}</span>
                      <p className="text-[11px] text-slate-500">{log.details || 'System transaction'}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <p className="text-[10px] font-semibold text-medic-600">{log.userName}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 text-center py-4">No recent activity logs available.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EMERGENCY CASES */}
      {activeTab === 'emergencies' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-800">Binary Max-Heap Triage Emergency Cases</h4>
              <p className="text-[11px] text-slate-400">
                Sorted deterministically by heap triage score (Critical first, tie-breaker: FIFO)
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Heap Rank</th>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Emergency Type</th>
                  <th className="px-4 py-3">Severity & Score</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Assigned Physician</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {emergencies.map((em, idx) => (
                  <tr key={em._id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-bold text-slate-900">#{idx + 1}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      {em.patient?.name || 'Walk-in'}
                      <p className="text-[10px] font-normal text-slate-400">{em.contactNumber}</p>
                    </td>
                    <td className="px-4 py-3">{em.emergencyType}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          em.severity === 'Critical'
                            ? 'bg-red-100 text-red-800'
                            : em.severity === 'High'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {em.severity} ({em.priorityScore} pts)
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{em.location}</td>
                    <td className="px-4 py-3 font-medium text-medic-600">
                      {em.assignedDoctor?.name || 'Pending Staff Assignment'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-slate-100 rounded-full text-[10px] font-semibold text-slate-700">
                        {em.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: BED MANAGEMENT */}
      {activeTab === 'beds' && (
        <div className="space-y-6">
          {/* Bed Controls Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <div>
              <h4 className="text-sm font-bold text-slate-800">Hospital Bed Inventory & Circular Queue</h4>
              <p className="text-[11px] text-slate-400">Add, edit, assign patients, or enqueue to waiting buffer</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsWaitingModalOpen(true)}
                className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1"
              >
                <span>Enqueue Waiting Patient</span>
              </button>
              <button
                onClick={handleDequeueWaitingList}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1 border"
              >
                <span>Dequeue Buffer (FIFO)</span>
              </button>
              <button
                onClick={() => {
                  setSelectedBed(null);
                  setIsBedModalOpen(true);
                }}
                className="px-3.5 py-2 bg-medic-600 hover:bg-medic-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Hospital Bed</span>
              </button>
            </div>
          </div>

          {/* Waiting List Queue Bar */}
          {waitingList.length > 0 && (
            <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-teal-900 uppercase tracking-wider">
                  DSA Circular Queue Waiting List ({waitingList.length} In Line)
                </span>
                <span className="text-[10px] text-teal-700 font-semibold">Strict FIFO Admission</span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {waitingList.map((item, idx) => (
                  <div key={idx} className="bg-white px-3 py-1.5 rounded-lg border border-teal-200 text-teal-900 font-medium flex items-center space-x-1.5">
                    <span className="font-bold text-[10px] bg-teal-100 text-teal-800 px-1 rounded">#{idx + 1}</span>
                    <span>{item.patientName}</span>
                    <span className="text-[10px] text-slate-400">({item.requiredWard})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Beds Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Bed No</th>
                    <th className="px-4 py-3">Ward</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Assigned Patient</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {beds.map((bed) => (
                    <tr key={bed._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-slate-900">{bed.bedNumber}</td>
                      <td className="px-4 py-3 text-slate-700">{bed.ward}</td>
                      <td className="px-4 py-3 text-slate-500">{bed.bedType}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            bed.status === 'Available'
                              ? 'bg-emerald-100 text-emerald-800'
                              : bed.status === 'Occupied'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {bed.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {bed.assignedPatient?.name || '—'}
                      </td>
                      <td className="px-4 py-3 text-right space-x-1">
                        <button
                          onClick={() => {
                            setSelectedBed(bed);
                            setIsBedModalOpen(true);
                          }}
                          className="p-1 text-slate-500 hover:text-medic-600 rounded"
                          title="Edit Bed"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteBed(bed._id)}
                          className="p-1 text-slate-500 hover:text-red-600 rounded"
                          title="Delete Bed"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PATIENTS MANAGEMENT */}
      {activeTab === 'patients' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-800">Registered Patients Directory</h4>
              <p className="text-[11px] text-slate-400">Total: {patients.length} records</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Blood Group</th>
                  <th className="px-4 py-3">Age / Gender</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients.map((pat) => (
                  <tr key={pat._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-slate-900">{pat.name}</td>
                    <td className="px-4 py-3 text-slate-600">{pat.email}</td>
                    <td className="px-4 py-3 text-slate-600">{pat.phone || 'N/A'}</td>
                    <td className="px-4 py-3 font-semibold text-medic-600">{pat.bloodGroup || 'O+'}</td>
                    <td className="px-4 py-3 text-slate-500">{pat.age} yrs / {pat.gender}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDeletePatient(pat._id)}
                        className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                        title="Delete Patient Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: DOCTORS MANAGEMENT */}
      {activeTab === 'doctors' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
            <div>
              <h4 className="text-sm font-bold text-slate-800">Hospital Physician Registry</h4>
              <p className="text-[11px] text-slate-400">Assign medical specialties and consultation capacities</p>
            </div>
            <button
              onClick={() => setIsDoctorModalOpen(true)}
              className="px-4 py-2 bg-medic-600 hover:bg-medic-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add New Doctor</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Doctor Name</th>
                    <th className="px-4 py-3">Specialization</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Consultation Fee</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {doctors.map((doc) => (
                    <tr key={doc._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-slate-900">{doc.name}</td>
                      <td className="px-4 py-3 text-medic-600 font-semibold">{doc.specialization}</td>
                      <td className="px-4 py-3 text-slate-600">{doc.department}</td>
                      <td className="px-4 py-3 text-slate-500">{doc.email}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">₹{doc.consultationFee}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeleteDoctor(doc._id)}
                          className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                          title="Delete Doctor Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <BedModal
        isOpen={isBedModalOpen}
        initialBed={selectedBed}
        onClose={() => {
          setIsBedModalOpen(false);
          setSelectedBed(null);
        }}
        onSuccess={() => {
          setNotice('Bed records updated.');
          fetchAllAdminData();
        }}
      />

      {/* Waiting List Enqueue Modal */}
      <Modal
        isOpen={isWaitingModalOpen}
        onClose={() => setIsWaitingModalOpen(false)}
        title="Enqueue Patient into Circular Queue Buffer"
        subtitle="Used when all suitable ward beds are occupied. Employs FIFO queue allocation."
      >
        <form onSubmit={handleAddToWaitingList} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Patient Full Name *</label>
            <input
              type="text"
              value={waitingPatientName}
              onChange={(e) => setWaitingPatientName(e.target.value)}
              placeholder="e.g. Samuel Green"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medic-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Required Ward *</label>
            <select
              value={waitingWard}
              onChange={(e) => setWaitingWard(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medic-500 focus:outline-none"
            >
              <option value="ICU (Intensive Care Unit)">ICU (Intensive Care Unit)</option>
              <option value="Emergency Ward">Emergency Ward</option>
              <option value="General Ward A">General Ward A</option>
              <option value="General Ward B">General Ward B</option>
              <option value="Pediatric Ward">Pediatric Ward</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsWaitingModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium shadow-sm"
            >
              Enqueue Patient
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Doctor Modal */}
      <Modal
        isOpen={isDoctorModalOpen}
        onClose={() => setIsDoctorModalOpen(false)}
        title="Register Medical Specialist"
        subtitle="Create an authorized physician account with specific clinical department credentials."
      >
        <form onSubmit={handleCreateDoctor} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Doctor Name *</label>
            <input
              type="text"
              value={newDoctor.name}
              onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
              placeholder="Dr. Gregory House"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medic-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Email *</label>
              <input
                type="email"
                value={newDoctor.email}
                onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
                placeholder="house@mediccare.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medic-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Temporary Password *</label>
              <input
                type="text"
                value={newDoctor.password}
                onChange={(e) => setNewDoctor({ ...newDoctor, password: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medic-500 focus:outline-none font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Specialization</label>
              <input
                type="text"
                value={newDoctor.specialization}
                onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
                placeholder="Cardiologist, Neurologist..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medic-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Department</label>
              <input
                type="text"
                value={newDoctor.department}
                onChange={(e) => setNewDoctor({ ...newDoctor, department: e.target.value })}
                placeholder="Cardiology, Trauma..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medic-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsDoctorModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-medic-600 hover:bg-medic-700 text-white rounded-lg font-medium shadow-sm"
            >
              Register Physician
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default AdminDashboard;
