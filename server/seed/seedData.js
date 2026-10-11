const mongoose = require('mongoose');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const EmergencyRequest = require('../models/EmergencyRequest');
const Bed = require('../models/Bed');
const MedicalRecord = require('../models/MedicalRecord');
const ActivityLog = require('../models/ActivityLog');

const runSeed = async () => {
  try {
    console.log('[Seed] Clearing previous collections...');
    await User.deleteMany({});
    await Appointment.deleteMany({});
    await EmergencyRequest.deleteMany({});
    await Bed.deleteMany({});
    await MedicalRecord.deleteMany({});
    await ActivityLog.deleteMany({});

    console.log('[Seed] Inserting users...');
    // 1. Admin
    const admin = await User.create({
      name: 'Dr. Sarah Jenkins (Admin)',
      email: 'admin@mediccare.com',
      password: process.env.DEMO_ADMIN_PASSWORD || 'Admin@123',
      role: 'admin',
      phone: '+1-555-0100',
      department: 'Hospital Administration'
    });

    // 2. Doctors
    const doctorCardio = await User.create({
      name: 'Dr. Marcus Vance',
      email: 'doctor.vance@mediccare.com',
      password: 'Doctor@123',
      role: 'doctor',
      phone: '+1-555-0101',
      specialization: 'Cardiologist',
      department: 'Cardiology',
      experienceYears: 12,
      consultationFee: 750,
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    });

    const doctorNeuro = await User.create({
      name: 'Dr. Elena Rostova',
      email: 'doctor.rostova@mediccare.com',
      password: 'Doctor@123',
      role: 'doctor',
      phone: '+1-555-0102',
      specialization: 'Neurologist',
      department: 'Neurology',
      experienceYears: 9,
      consultationFee: 800,
      availableDays: ['Monday', 'Wednesday', 'Friday']
    });

    const doctorEmergency = await User.create({
      name: 'Dr. Alan Grant',
      email: 'doctor.grant@mediccare.com',
      password: 'Doctor@123',
      role: 'doctor',
      phone: '+1-555-0103',
      specialization: 'Emergency Medicine',
      department: 'Trauma & Emergency',
      experienceYears: 14,
      consultationFee: 600,
      availableDays: ['Monday', 'Tuesday', 'Thursday', 'Saturday', 'Sunday']
    });

    // 3. Patients
    const patient1 = await User.create({
      name: 'John Miller',
      email: 'patient.john@mediccare.com',
      password: 'Patient@123',
      role: 'patient',
      phone: '+1-555-0201',
      bloodGroup: 'O+',
      age: 42,
      gender: 'Male',
      emergencyContact: '+1-555-9991',
      address: '742 Evergreen Terrace, Springfield'
    });

    const patient2 = await User.create({
      name: 'Sophia Patel',
      email: 'patient.sophia@mediccare.com',
      password: 'Patient@123',
      role: 'patient',
      phone: '+1-555-0202',
      bloodGroup: 'B+',
      age: 29,
      gender: 'Female',
      emergencyContact: '+1-555-9992',
      address: '108 West Oak Lane, Metropolis'
    });

    console.log('[Seed] Inserting beds...');
    await Bed.create([
      {
        bedNumber: 'ICU-101',
        ward: 'ICU (Intensive Care Unit)',
        bedType: 'ICU Ventilator',
        status: 'Occupied',
        assignedPatient: patient1._id,
        notes: 'Cardiac monitoring continuous'
      },
      {
        bedNumber: 'ICU-102',
        ward: 'ICU (Intensive Care Unit)',
        bedType: 'ICU Ventilator',
        status: 'Available',
        notes: 'Sterilized and prepped'
      },
      {
        bedNumber: 'EMERG-201',
        ward: 'Emergency Ward',
        bedType: 'Oxygen Supported',
        status: 'Available',
        notes: 'Rapid triage intake ready'
      },
      {
        bedNumber: 'EMERG-202',
        ward: 'Emergency Ward',
        bedType: 'Standard',
        status: 'Reserved',
        notes: 'Reserved for incoming ambulance referral'
      },
      {
        bedNumber: 'GEN-301',
        ward: 'General Ward A',
        bedType: 'Standard',
        status: 'Available'
      },
      {
        bedNumber: 'GEN-302',
        ward: 'General Ward A',
        bedType: 'Standard',
        status: 'Occupied',
        assignedPatient: patient2._id
      },
      {
        bedNumber: 'PED-401',
        ward: 'Pediatric Ward',
        bedType: 'Pediatric',
        status: 'Available'
      },
      {
        bedNumber: 'REC-501',
        ward: 'Post-Op Recovery Ward',
        bedType: 'Oxygen Supported',
        status: 'Available'
      }
    ]);

    console.log('[Seed] Inserting demo appointments...');
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    await Appointment.create([
      {
        patient: patient1._id,
        doctor: doctorCardio._id,
        appointmentDate: today,
        timeSlot: '10:00 AM - 10:30 AM',
        reason: 'Routine cardiac arrhythmia checkup and ECG evaluation.',
        status: 'Confirmed'
      },
      {
        patient: patient2._id,
        doctor: doctorNeuro._id,
        appointmentDate: tomorrow,
        timeSlot: '02:00 PM - 02:30 PM',
        reason: 'Recurrent migraine assessment and MRI review.',
        status: 'Pending'
      }
    ]);

    console.log('[Seed] Inserting emergency requests for Max-Heap prioritization...');
    await EmergencyRequest.create([
      {
        patient: patient1._id,
        emergencyType: 'Cardiac Arrest / Chest Pain',
        description: 'Sudden crushing retrosternal pain radiating down left arm with diaphoresis.',
        location: 'Bay Area Station 4, Gate B',
        contactNumber: '+1-555-9111',
        severity: 'Critical',
        priorityScore: 110,
        status: 'In Progress',
        assignedDoctor: doctorEmergency._id,
        statusHistory: [
          {
            status: 'Pending',
            note: 'Request received from bystander hotline.',
            timestamp: new Date(Date.now() - 3600000)
          },
          {
            status: 'In Progress',
            note: 'Triage team deployed to emergency bay.',
            timestamp: new Date(Date.now() - 1800000)
          }
        ]
      },
      {
        patient: patient2._id,
        emergencyType: 'Severe Trauma / Road Accident',
        description: 'Vehicular collision resulting in lower limb compound injury.',
        location: 'Highway 102 Mile Marker 14',
        contactNumber: '+1-555-9112',
        severity: 'High',
        priorityScore: 85,
        status: 'Assigned',
        assignedDoctor: doctorEmergency._id,
        statusHistory: [
          {
            status: 'Pending',
            note: 'Accident reported.',
            timestamp: new Date(Date.now() - 2400000)
          },
          {
            status: 'Assigned',
            note: 'Dr. Alan Grant paged.',
            timestamp: new Date(Date.now() - 1200000)
          }
        ]
      }
    ]);

    console.log('[Seed] Inserting medical records and initial logs...');
    await MedicalRecord.create({
      patient: patient1._id,
      doctor: doctorCardio._id,
      diagnosis: 'Hypertensive heart disease with mild angina',
      symptoms: ['Chest tightness', 'Elevated BP (150/95)'],
      treatmentPlan: 'Low sodium dietary regimen, lifestyle adjustment, medication titration.',
      medications: [
        {
          medicineName: 'Amlodipine',
          dosage: '5mg',
          frequency: 'Once Daily (Morning)',
          duration: '30 Days'
        },
        {
          medicineName: 'Aspirin',
          dosage: '75mg',
          frequency: 'Once Daily (Post Lunch)',
          duration: '30 Days'
        }
      ],
      labTestsRecommended: ['Lipid Profile', 'Standard 12-lead ECG']
    });

    await ActivityLog.create([
      {
        action: 'System Initialized',
        user: admin._id,
        userName: admin.name,
        userRole: 'admin',
        category: 'SYSTEM',
        details: 'Initial database seeds deployed with demo accounts.'
      }
    ]);

    console.log('[Seed] Database initialization complete!');
  } catch (err) {
    console.error('[Seed Error]:', err.message);
  }
};

module.exports = { runSeed };

if (require.main === module) {
  require('dotenv').config();
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mediccare_db';
  mongoose.connect(mongoUri).then(async () => {
    await runSeed();
    process.exit(0);
  }).catch((err) => {
    console.error('Failed to run standalone seed:', err.message);
    process.exit(1);
  });
}
