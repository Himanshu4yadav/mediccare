const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userName: {
      type: String,
      default: 'System'
    },
    userRole: {
      type: String,
      default: 'system'
    },
    category: {
      type: String,
      enum: ['AUTH', 'APPOINTMENT', 'EMERGENCY', 'BED', 'PATIENT', 'DOCTOR', 'SYSTEM'],
      default: 'SYSTEM'
    },
    details: {
      type: String,
      default: ''
    },
    ipAddress: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
