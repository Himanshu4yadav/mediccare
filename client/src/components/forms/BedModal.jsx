import React, { useState } from 'react';
import Modal from '../common/Modal';
import AlertBanner from '../common/AlertBanner';
import api from '../../services/api';
import { BedDouble, Loader2, Check } from 'lucide-react';

const BedModal = ({ isOpen, onClose, onSuccess, initialBed = null }) => {
  const [formData, setFormData] = useState({
    bedNumber: initialBed?.bedNumber || '',
    ward: initialBed?.ward || 'General Ward A',
    bedType: initialBed?.bedType || 'Standard',
    status: initialBed?.status || 'Available',
    notes: initialBed?.notes || ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const wards = [
    'ICU (Intensive Care Unit)',
    'Emergency Ward',
    'General Ward A',
    'General Ward B',
    'Pediatric Ward',
    'Post-Op Recovery Ward'
  ];

  const bedTypes = ['Standard', 'ICU Ventilator', 'Oxygen Supported', 'Pediatric', 'Isolation'];
  const statuses = ['Available', 'Occupied', 'Reserved'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.bedNumber.trim()) return setError('Please enter a bed number (e.g., ICU-03).');

    try {
      setSubmitting(true);
      let res;
      if (initialBed) {
        res = await api.put(`/beds/${initialBed._id}`, formData);
      } else {
        res = await api.post('/beds', formData);
      }

      if (res.data.success) {
        onSuccess && onSuccess(res.data.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save bed details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialBed ? `Edit Bed: ${initialBed.bedNumber}` : 'Add New Hospital Bed'}
      subtitle="Configure hospital capacity, ward allocation, and life-support amenities."
    >
      {error && <AlertBanner type="danger" message={error} onClose={() => setError('')} />}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-medium text-slate-700 mb-1">Bed Identifier *</label>
          <input
            type="text"
            value={formData.bedNumber}
            onChange={(e) => setFormData({ ...formData, bedNumber: e.target.value })}
            placeholder="e.g. ICU-104, GEN-202"
            disabled={!!initialBed}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medic-500 focus:outline-none uppercase"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Hospital Ward *</label>
            <select
              value={formData.ward}
              onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medic-500 focus:outline-none"
            >
              {wards.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Bed Specification *</label>
            <select
              value={formData.bedType}
              onChange={(e) => setFormData({ ...formData, bedType: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medic-500 focus:outline-none"
            >
              {bedTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block font-medium text-slate-700 mb-1">Current Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medic-500 focus:outline-none"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium text-slate-700 mb-1">Clinical Notes & Maintenance Status</label>
          <textarea
            rows="2"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="e.g. Equipped with high-flow oxygen, prepped for incoming cardiac patient."
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
                <span>Saving Bed...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>{initialBed ? 'Update Bed' : 'Create Bed'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default BedModal;
