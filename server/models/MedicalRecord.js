const mongoose = require('mongoose');

const MedicalRecordSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient reference is required']
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor reference is required']
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      default: null
    },
    diagnosis: {
      type: String,
      required: [true, 'Diagnosis is required']
    },
    symptoms: {
      type: [String],
      default: []
    },
    treatmentPlan: {
      type: String,
      default: ''
    },
    medications: [
      {
        medicineName: String,
        dosage: String,
        frequency: String,
        duration: String
      }
    ],
    labTestsRecommended: {
      type: [String],
      default: []
    },
    notes: {
      type: String,
      default: ''
    },
    recordDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('MedicalRecord', MedicalRecordSchema);
