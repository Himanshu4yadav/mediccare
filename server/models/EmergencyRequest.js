const mongoose = require('mongoose');

const StatusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Cancelled'],
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  note: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const EmergencyRequestSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient reference is required']
    },
    emergencyType: {
      type: String,
      required: [true, 'Emergency type is required'],
      enum: [
        'Cardiac Arrest / Chest Pain',
        'Severe Trauma / Road Accident',
        'Respiratory Distress',
        'Stroke Symptoms',
        'Severe Burn',
        'Acute Poisoning',
        'Fracture / Orthopedic Trauma',
        'High Fever / Convulsions',
        'Other Emergency'
      ]
    },
    description: {
      type: String,
      required: [true, 'Description of emergency is required'],
      maxlength: 500
    },
    location: {
      type: String,
      required: [true, 'Location or entered address is required']
    },
    contactNumber: {
      type: String,
      required: [true, 'Emergency contact phone is required']
    },
    severity: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low'],
      required: true,
      default: 'High'
    },
    /**
     * priorityScore calculated based on triage rules:
     * Critical = 100
     * High = 75
     * Medium = 50
     * Low = 25
     * Plus optional modifier (e.g. cardiac/respiratory adds +10)
     */
    priorityScore: {
      type: Number,
      default: 50
    },
    status: {
      type: String,
      enum: ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Cancelled'],
      default: 'Pending'
    },
    assignedDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    actionTaken: {
      type: String,
      default: ''
    },
    statusHistory: [StatusHistorySchema]
  },
  {
    timestamps: true
  }
);

// Calculate priority score before validation
EmergencyRequestSchema.pre('validate', function (next) {
  let baseScore = 25;
  switch (this.severity) {
    case 'Critical':
      baseScore = 100;
      break;
    case 'High':
      baseScore = 75;
      break;
    case 'Medium':
      baseScore = 50;
      break;
    case 'Low':
      baseScore = 25;
      break;
  }

  // Domain emergency modifier
  if (
    this.emergencyType === 'Cardiac Arrest / Chest Pain' ||
    this.emergencyType === 'Severe Trauma / Road Accident' ||
    this.emergencyType === 'Respiratory Distress'
  ) {
    baseScore += 10;
  }

  this.priorityScore = baseScore;
  next();
});

module.exports = mongoose.model('EmergencyRequest', EmergencyRequestSchema);
