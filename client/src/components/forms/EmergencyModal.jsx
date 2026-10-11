import React, { useState } from 'react';
import Modal from '../common/Modal';
import AlertBanner from '../common/AlertBanner';
import api from '../../services/api';
import { AlertTriangle, Send, Loader2 } from 'lucide-react';

const EmergencyModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    emergencyType: 'Cardiac Arrest / Chest Pain',
    severity: 'Critical',
    location: '',
    contactNumber: '',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.location.trim()) {
      return setError('Please provide the physical location or room/ward address.');
    }
    if (!formData.contactNumber.trim()) {
      return setError('Please provide a direct phone number for immediate contact.');
    }
    if (!formData.description.trim()) {
      return setError('Please describe the patient symptoms or condition.');
    }

    try {
      setSubmitting(true);
      const { data } = await api.post('/emergencies', formData);
      if (data.success) {
        onSuccess && onSuccess(data.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit emergency request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rapid Emergency Triage Request"
      subtitle="Submissions are dynamically prioritized by our Binary Max-Heap Triage Engine."
    >
      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start space-x-2">
        <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
        <span>
          <strong>Emergency Protocol:</strong> For catastrophic incidents, contact local 911 first. MedicCare uses algorithmic heap prioritization based on clinical severity scores.
        </span>
      </div>

      {error && <AlertBanner type="danger" message={error} onClose={() => setError('')} />}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-medium text-slate-700 mb-1">Emergency Category *</label>
          <select
            name="emergencyType"
            value={formData.emergencyType}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medic-500 focus:outline-none"
          >
            <option value="Cardiac Arrest / Chest Pain">Cardiac Arrest / Chest Pain (+10 Heap Score)</option>
            <option value="Severe Trauma / Road Accident">Severe Trauma / Road Accident (+10 Heap Score)</option>
            <option value="Respiratory Distress">Respiratory Distress (+10 Heap Score)</option>
            <option value="Stroke Symptoms">Stroke Symptoms</option>
            <option value="Severe Burn">Severe Burn</option>
            <option value="Acute Poisoning">Acute Poisoning</option>
            <option value="Fracture / Orthopedic Trauma">Fracture / Orthopedic Trauma</option>
            <option value="High Fever / Convulsions">High Fever / Convulsions</option>
            <option value="Other Emergency">Other Emergency</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Triage Severity *</label>
            <select
              name="severity"
              value={formData.severity}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medic-500 focus:outline-none font-semibold text-red-700"
            >
              <option value="Critical">Critical (Heap Triage: 100)</option>
              <option value="High">High (Heap Triage: 75)</option>
              <option value="Medium">Medium (Heap Triage: 50)</option>
              <option value="Low">Low (Heap Triage: 25)</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Direct Callback Phone *</label>
            <input
              type="text"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              placeholder="+1-555-0199"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medic-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block font-medium text-slate-700 mb-1">Physical Location / Address *</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g. Ward C Room 302 or Street Address"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medic-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-medium text-slate-700 mb-1">Condition Description & Symptoms *</label>
          <textarea
            rows="3"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Provide concise description of consciousness, pulse, breathing, visible bleeding..."
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
            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center space-x-1.5 shadow-sm shadow-red-500/30"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting to Heap...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Emergency Request</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EmergencyModal;
