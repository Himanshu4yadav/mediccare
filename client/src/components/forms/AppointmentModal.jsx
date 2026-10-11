import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import AlertBanner from '../common/AlertBanner';
import api from '../../services/api';
import { Calendar, Clock, Stethoscope, Loader2, CheckCircle2 } from 'lucide-react';

const AppointmentModal = ({ isOpen, onClose, onSuccess, initialDoctorId = null }) => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(initialDoctorId || '');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [reason, setReason] = useState('');
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const timeSlots = [
    '09:00 AM - 09:30 AM',
    '09:30 AM - 10:00 AM',
    '10:00 AM - 10:30 AM',
    '10:30 AM - 11:00 AM',
    '11:30 AM - 12:00 PM',
    '02:00 PM - 02:30 PM',
    '02:30 PM - 03:00 PM',
    '03:30 PM - 04:00 PM',
    '04:00 PM - 04:30 PM'
  ];

  useEffect(() => {
    if (isOpen) {
      fetchDoctors();
      // default date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDate(tomorrow.toISOString().split('T')[0]);
      if (initialDoctorId) setSelectedDoctor(initialDoctorId);
    }
  }, [isOpen, initialDoctorId]);

  const fetchDoctors = async () => {
    try {
      setLoadingDoctors(true);
      const { data } = await api.get('/doctors');
      if (data.success) {
        setDoctors(data.data);
        if (!selectedDoctor && data.data.length > 0) {
          setSelectedDoctor(data.data[0]._id);
        }
      }
    } catch (err) {
      setError('Failed to fetch available doctors list.');
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedDoctor) return setError('Please select a doctor.');
    if (!date) return setError('Please pick an appointment date.');
    if (!timeSlot) return setError('Please select a consultation time slot.');
    if (!reason.trim()) return setError('Please explain symptoms or appointment reason.');

    try {
      setSubmitting(true);
      const { data } = await api.post('/appointments', {
        doctorId: selectedDoctor,
        appointmentDate: date,
        timeSlot,
        reason
      });

      if (data.success) {
        onSuccess && onSuccess(data.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Book Doctor Consultation"
      subtitle="Select a certified specialist, schedule a slot, and receive instant confirmation."
    >
      {error && <AlertBanner type="danger" message={error} onClose={() => setError('')} />}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-medium text-slate-700 mb-1">Select Doctor / Specialist *</label>
          {loadingDoctors ? (
            <p className="text-slate-400">Loading specialist registry...</p>
          ) : (
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medic-500 focus:outline-none"
            >
              {doctors.map((doc) => (
                <option key={doc._id} value={doc._id}>
                  {doc.name} — {doc.specialization} ({doc.department}) [Fee: ₹{doc.consultationFee}]
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Preferred Date *</label>
            <input
              type="date"
              value={date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medic-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Available Time Slot *</label>
            <select
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medic-500 focus:outline-none"
            >
              <option value="">Select a slot</option>
              {timeSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block font-medium text-slate-700 mb-1">Chief Complaint / Medical Reason *</label>
          <textarea
            rows="3"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Experiencing persistent dizziness and migraine for 3 days, needing consultation..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medic-500 focus:outline-none"
          ></textarea>
        </div>

        <div className="pt-2 flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 bg-medic-600 hover:bg-medic-700 text-white rounded-lg font-medium flex items-center space-x-1.5 shadow-sm shadow-medic-500/30"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Checking Slot & Booking...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Appointment</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AppointmentModal;
