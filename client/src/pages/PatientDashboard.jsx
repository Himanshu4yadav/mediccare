import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import AlertBanner from '../components/common/AlertBanner';
import StatCard from '../components/common/StatCard';
import Loader from '../components/common/Loader';
import EmergencyModal from '../components/forms/EmergencyModal';
import AppointmentModal from '../components/forms/AppointmentModal';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Clock,
  User,
  HeartPulse,
  AlertTriangle,
  BedDouble,
  FileText,
  XCircle,
  PlusCircle,
  CheckCircle2,
  CalendarCheck
} from 'lucide-react';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [apptRes, emergRes, bedsRes, patientRes] = await Promise.all([
        api.get('/appointments'),
        api.get('/emergencies'),
        api.get('/beds'),
        user?._id ? api.get(`/patients/${user._id}`).catch(() => ({ data: { data: {} } })) : Promise.resolve({ data: { data: {} } })
      ]);

      if (apptRes.data.success) setAppointments(apptRes.data.data);
      if (emergRes.data.success) setEmergencies(emergRes.data.data);
      if (bedsRes.data.success) setBeds(bedsRes.data.data);
      if (patientRes.data?.data?.medicalRecords) {
        setMedicalRecords(patientRes.data.data.medicalRecords);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading dashboard records.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (apptId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      const { data } = await api.put(`/appointments/${apptId}`, { status: 'Cancelled' });
      if (data.success) {
        setNotice('Appointment cancelled successfully.');
        fetchDashboardData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not cancel appointment.');
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Patient Portal" subtitle="Loading your medical workspace..." activeTab="Patient Portal">
        <Loader message="Synchronizing patient records from database..." />
      </DashboardLayout>
    );
  }

  const upcomingAppointments = appointments.filter((a) => a.status === 'Confirmed' || a.status === 'Pending');

  return (
    <DashboardLayout
      title={`Welcome back, ${user?.name}`}
      subtitle="Manage your personal health schedule, emergency triage requests, and medical histories."
      activeTab="Patient Portal"
    >
      {notice && <AlertBanner type="success" message={notice} onClose={() => setNotice('')} />}
      {error && <AlertBanner type="danger" message={error} onClose={() => setError('')} />}

      {/* Top Action Quick Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-white p-4 rounded-2xl border border-slate-200">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Quick Patient Actions</h3>
          <p className="text-[11px] text-slate-500">Instant triage submission and specialist booking</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsAppointmentModalOpen(true)}
            className="px-4 py-2 bg-medic-600 hover:bg-medic-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-sm shadow-medic-500/20"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Book Appointment</span>
          </button>
          <button
            onClick={() => setIsEmergencyModalOpen(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-sm shadow-red-500/20 glow-emergency"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Request Emergency</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Active Appointments"
          value={upcomingAppointments.length}
          icon={Calendar}
          color="blue"
          subtitle={`${appointments.length} total lifetime consultations`}
        />
        <StatCard
          title="Emergency Alerts"
          value={emergencies.length}
          icon={HeartPulse}
          color="red"
          subtitle="Organized by Max-Heap triage"
        />
        <StatCard
          title="Medical Records"
          value={medicalRecords.length}
          icon={FileText}
          color="purple"
          subtitle="Authorized doctor prescriptions"
        />
        <StatCard
          title="Blood Group"
          value={user?.bloodGroup || 'O+'}
          icon={User}
          color="teal"
          subtitle={`Age: ${user?.age || '30'} yrs • Verified`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Appointments Section */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Your Consultations & Appointments</h4>
                <p className="text-[11px] text-slate-400">Scheduled specialist appointments</p>
              </div>
              <button
                onClick={() => setIsAppointmentModalOpen(true)}
                className="text-xs text-medic-600 font-semibold hover:underline"
              >
                + Book New
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {appointments.length > 0 ? (
                appointments.map((appt) => (
                  <div key={appt._id} className="p-4 hover:bg-slate-50 transition-colors flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-slate-900">{appt.doctor?.name || 'Assigned Doctor'}</span>
                        <span className="text-[10px] text-medic-600 bg-medic-50 px-1.5 py-0.5 rounded font-medium">
                          {appt.doctor?.specialization}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">Reason: {appt.reason}</p>
                      <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{appt.appointmentDate}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{appt.timeSlot}</span>
                        </span>
                      </div>

                      {appt.prescription && (
                        <div className="mt-2 p-2 rounded bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800">
                          <strong>Doctor's Prescription:</strong> {appt.prescription}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          appt.status === 'Confirmed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : appt.status === 'Completed'
                            ? 'bg-slate-100 text-slate-700'
                            : appt.status === 'Cancelled'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {appt.status}
                      </span>
                      {appt.status !== 'Cancelled' && appt.status !== 'Completed' && (
                        <button
                          onClick={() => handleCancelAppointment(appt._id)}
                          className="text-[11px] text-red-600 hover:text-red-700 hover:underline"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  No appointments found. Click "Book Appointment" to schedule with a physician.
                </div>
              )}
            </div>
          </div>

          {/* Emergency Requests Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Your Emergency Case History</h4>
                <p className="text-[11px] text-slate-400">Real-time status tracking via Singly Linked List history</p>
              </div>
              <button
                onClick={() => setIsEmergencyModalOpen(true)}
                className="text-xs text-red-600 font-semibold hover:underline"
              >
                + Emergency Alert
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {emergencies.length > 0 ? (
                emergencies.map((em) => (
                  <div key={em._id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xs text-slate-900">{em.emergencyType}</span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              em.severity === 'Critical'
                                ? 'bg-red-100 text-red-800'
                                : em.severity === 'High'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            Severity: {em.severity} (Score {em.priorityScore})
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{em.description}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Location: {em.location}</p>
                        {em.assignedDoctor && (
                          <p className="text-[11px] text-medic-600 font-semibold mt-1">
                            Assigned Physician: {em.assignedDoctor.name} ({em.assignedDoctor.specialization})
                          </p>
                        )}
                      </div>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border">
                        {em.status}
                      </span>
                    </div>

                    {/* Status History Trail */}
                    {em.statusHistory && em.statusHistory.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          DSA Linked List History:
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-600">
                          {em.statusHistory.map((h, idx) => (
                            <React.Fragment key={idx}>
                              <span className="px-2 py-0.5 bg-slate-100 rounded border">
                                {h.status} ({new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                              </span>
                              {idx < em.statusHistory.length - 1 && <span className="text-slate-400">→</span>}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  No active or past emergency submissions recorded.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Hospital Bed Occupancy & Profile */}
        <div className="lg:col-span-5 space-y-6">
          {/* Patient Profile Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 mb-3">Patient Health Card</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Full Name</span>
                <span className="font-semibold text-slate-800">{user?.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Email Address</span>
                <span className="font-semibold text-slate-800">{user?.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Blood Group</span>
                <span className="font-bold text-medic-600">{user?.bloodGroup || 'O+'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Contact Phone</span>
                <span className="font-semibold text-slate-800">{user?.phone || 'Not added'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Emergency Relative</span>
                <span className="font-semibold text-slate-800">{user?.emergencyContact || 'Not added'}</span>
              </div>
            </div>
          </div>

          {/* Hospital Bed Availability Monitor */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Hospital Bed Monitor</h4>
                <p className="text-[11px] text-slate-400">Live ward occupancy from hospital database</p>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {beds.filter((b) => b.status === 'Available').length} Available
              </span>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {beds.map((bed) => (
                <div key={bed._id} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800">{bed.bedNumber}</span>
                    <p className="text-[10px] text-slate-500">{bed.ward} • {bed.bedType}</p>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      bed.status === 'Available'
                        ? 'bg-emerald-100 text-emerald-800'
                        : bed.status === 'Occupied'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {bed.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        onSuccess={(c) => {
          setNotice(`Emergency alert submitted (Severity: ${c.severity}). Assigned to Heap Queue.`);
          fetchDashboardData();
        }}
      />

      <AppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        onSuccess={(a) => {
          setNotice(`Appointment booked with ${a.doctor?.name || 'doctor'} on ${a.appointmentDate}.`);
          fetchDashboardData();
        }}
      />
    </DashboardLayout>
  );
};

export default PatientDashboard;
