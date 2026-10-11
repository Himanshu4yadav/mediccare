import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import AlertBanner from '../components/common/AlertBanner';
import StatCard from '../components/common/StatCard';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Clock,
  HeartPulse,
  User,
  CheckCircle2,
  AlertTriangle,
  FileEdit,
  ClipboardList,
  Save,
  Filter
} from 'lucide-react';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const [notesForm, setNotesForm] = useState({
    status: 'Completed',
    consultationNotes: '',
    prescription: '',
    followUpDate: ''
  });
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDoctorData();
  }, []);

  const fetchDoctorData = async () => {
    try {
      setLoading(true);
      const [apptRes, emergRes] = await Promise.all([
        api.get('/appointments'),
        api.get('/emergencies')
      ]);

      if (apptRes.data.success) setAppointments(apptRes.data.data);
      if (emergRes.data.success) setEmergencies(emergRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching doctor records.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenConsultation = (appt) => {
    setSelectedAppointment(appt);
    setNotesForm({
      status: appt.status || 'Confirmed',
      consultationNotes: appt.consultationNotes || '',
      prescription: appt.prescription || '',
      followUpDate: appt.followUpDate || ''
    });
    setIsConsultationModalOpen(true);
  };

  const handleSaveConsultation = async (e) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    try {
      setSubmitting(true);
      const { data } = await api.put(`/appointments/${selectedAppointment._id}`, notesForm);
      if (data.success) {
        setNotice(`Appointment for ${selectedAppointment.patient?.name} updated successfully.`);
        setIsConsultationModalOpen(false);
        fetchDoctorData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update consultation record.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateEmergencyStatus = async (emergencyId, newStatus) => {
    try {
      const { data } = await api.put(`/emergencies/${emergencyId}/status`, {
        status: newStatus,
        note: `Doctor marked case as ${newStatus}`
      });
      if (data.success) {
        setNotice(`Emergency case status transitioned to ${newStatus}.`);
        fetchDoctorData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update emergency case.');
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Doctor Clinic Console" subtitle="Loading schedules..." activeTab="Doctor Console">
        <Loader message="Synchronizing clinical appointment slots and emergency queue..." />
      </DashboardLayout>
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter((a) => a.appointmentDate === todayStr);
  const pendingAppointments = appointments.filter((a) => a.status === 'Pending' || a.status === 'Confirmed');

  const filteredAppointments =
    statusFilter === 'All' ? appointments : appointments.filter((a) => a.status === statusFilter);

  return (
    <DashboardLayout
      title={`Dr. ${user?.name?.replace('Dr. ', '')} — Clinic Console`}
      subtitle={`Specialization: ${user?.specialization || 'General Physician'} • Department: ${user?.department || 'Outpatient'}`}
      activeTab="Doctor Console"
    >
      {notice && <AlertBanner type="success" message={notice} onClose={() => setNotice('')} />}
      {error && <AlertBanner type="danger" message={error} onClose={() => setError('')} />}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Today's Appointments"
          value={todayAppointments.length}
          icon={Calendar}
          color="blue"
          subtitle={`${appointments.length} total scheduled`}
        />
        <StatCard
          title="Pending / Confirmed"
          value={pendingAppointments.length}
          icon={ClipboardList}
          color="purple"
          subtitle="Awaiting consult or follow-up"
        />
        <StatCard
          title="Assigned Emergencies"
          value={emergencies.length}
          icon={HeartPulse}
          color="red"
          subtitle="Max-Heap Priority queue"
        />
        <StatCard
          title="Consultation Fee"
          value={`₹${user?.consultationFee || 500}`}
          icon={User}
          color="teal"
          subtitle="Standard OPD charge"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Appointments Section */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Assigned Patient Appointments</h4>
                <p className="text-[11px] text-slate-400">Review patient records and write consultation notes</p>
              </div>

              {/* Status Filter */}
              <div className="flex items-center space-x-2 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1 border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-medic-500 focus:outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((appt) => (
                  <div key={appt._id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-slate-900">{appt.patient?.name || 'Patient'}</span>
                        <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-medium">
                          Blood: {appt.patient?.bloodGroup || 'N/A'} • Age: {appt.patient?.age || 'N/A'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700">Complaint: {appt.reason}</p>
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
                        <p className="text-[11px] text-emerald-700 font-medium mt-1">
                          Prescription: {appt.prescription}
                        </p>
                      )}
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
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
                      <button
                        onClick={() => handleOpenConsultation(appt)}
                        className="px-3 py-1.5 bg-medic-50 hover:bg-medic-100 border border-medic-200 text-medic-700 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors"
                      >
                        <FileEdit className="w-3.5 h-3.5" />
                        <span>Consult / Note</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  No appointments found for the selected filter.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Emergency Triage Section for Doctor */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-800">Priority Emergency Queue</h4>
              <p className="text-[11px] text-slate-400">Ranked by Binary Max-Heap triage score</p>
            </div>

            <div className="divide-y divide-slate-100 p-2">
              {emergencies.length > 0 ? (
                emergencies.map((em) => (
                  <div key={em._id} className="p-3 rounded-xl hover:bg-slate-50 transition-colors space-y-2">
                    <div className="flex items-start justify-between">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          em.severity === 'Critical'
                            ? 'bg-red-100 text-red-800'
                            : em.severity === 'High'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {em.severity} (Triage Score: {em.priorityScore})
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 font-semibold">{em.status}</span>
                    </div>

                    <p className="text-xs font-bold text-slate-900">{em.emergencyType}</p>
                    <p className="text-[11px] text-slate-600 line-clamp-2">{em.description}</p>
                    <p className="text-[10px] text-slate-400">Patient: {em.patient?.name || 'Walk-in'} • {em.location}</p>

                    <div className="pt-2 flex items-center space-x-1.5 text-xs">
                      {em.status !== 'In Progress' && em.status !== 'Resolved' && (
                        <button
                          onClick={() => handleUpdateEmergencyStatus(em._id, 'In Progress')}
                          className="flex-1 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded text-[11px] font-semibold"
                        >
                          Start Treating
                        </button>
                      )}
                      {em.status !== 'Resolved' && (
                        <button
                          onClick={() => handleUpdateEmergencyStatus(em._id, 'Resolved')}
                          className="flex-1 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded text-[11px] font-semibold"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-slate-400">
                  No active emergency cases in queue.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Consultation Modal */}
      <Modal
        isOpen={isConsultationModalOpen}
        onClose={() => setIsConsultationModalOpen(false)}
        title={`Consultation: ${selectedAppointment?.patient?.name || 'Patient'}`}
        subtitle="Record clinical consultation notes, prescriptions, and status transitions."
      >
        <form onSubmit={handleSaveConsultation} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Appointment Status</label>
            <select
              value={notesForm.status}
              onChange={(e) => setNotesForm({ ...notesForm, status: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medic-500 focus:outline-none"
            >
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Clinical Assessment & Notes</label>
            <textarea
              rows="3"
              value={notesForm.consultationNotes}
              onChange={(e) => setNotesForm({ ...notesForm, consultationNotes: e.target.value })}
              placeholder="e.g. Patient presents with mild hypertension. Blood pressure measured at 138/88 mmHg..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medic-500 focus:outline-none"
            ></textarea>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Prescription & Dosage Guidance</label>
            <textarea
              rows="3"
              value={notesForm.prescription}
              onChange={(e) => setNotesForm({ ...notesForm, prescription: e.target.value })}
              placeholder="e.g. Tab Metoprolol 25mg OD for 14 days. Recheck in OPD."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medic-500 focus:outline-none"
            ></textarea>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Recommended Follow-up Date</label>
            <input
              type="date"
              value={notesForm.followUpDate}
              onChange={(e) => setNotesForm({ ...notesForm, followUpDate: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medic-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsConsultationModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-medic-600 hover:bg-medic-700 text-white rounded-lg font-medium flex items-center space-x-1.5 shadow-sm shadow-medic-500/30"
            >
              <Save className="w-4 h-4" />
              <span>Save Consultation Record</span>
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default DoctorDashboard;
