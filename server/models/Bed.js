const mongoose = require('mongoose');

const BedSchema = new mongoose.Schema(
  {
    bedNumber: {
      type: String,
      required: [true, 'Bed number is required (e.g. ICU-01, GEN-12)'],
      unique: true,
      trim: true,
      uppercase: true
    },
    ward: {
      type: String,
      required: [true, 'Ward name is required'],
      enum: [
        'ICU (Intensive Care Unit)',
        'Emergency Ward',
        'General Ward A',
        'General Ward B',
        'Pediatric Ward',
        'Post-Op Recovery Ward'
      ]
    },
    bedType: {
      type: String,
      required: [true, 'Bed type is required'],
      enum: ['Standard', 'ICU Ventilator', 'Oxygen Supported', 'Pediatric', 'Isolation']
    },
    status: {
      type: String,
      enum: ['Available', 'Occupied', 'Reserved'],
      default: 'Available'
    },
    assignedPatient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    notes: {
      type: String,
      default: ''
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Bed', BedSchema);
