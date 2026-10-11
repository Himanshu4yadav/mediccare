const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema(
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
    appointmentDate: {
      type: String, // YYYY-MM-DD
      required: [true, 'Appointment date is required']
    },
    timeSlot: {
      type: String, // e.g., "10:00 AM - 10:30 AM"
      required: [true, 'Appointment time slot is required']
    },
    reason: {
      type: String,
      required: [true, 'Please provide the appointment reason or symptoms'],
      maxlength: 300
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
      default: 'Pending'
    },
    consultationNotes: {
      type: String,
      default: ''
    },
    prescription: {
      type: String,
      default: ''
    },
    followUpDate: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate booking for same doctor and same time slot on same day
AppointmentSchema.index({ doctor: 1, appointmentDate: 1, timeSlot: 1 }, { unique: false });

module.exports = mongoose.model('Appointment', AppointmentSchema);
