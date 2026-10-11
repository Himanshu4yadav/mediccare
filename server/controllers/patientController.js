const User = require('../models/User');
const MedicalRecord = require('../models/MedicalRecord');
const Appointment = require('../models/Appointment');

/**
 * @desc    Get all patients (Admin & Doctor view)
 * @route   GET /api/patients
 * @access  Private (Admin, Doctor)
 */
exports.getPatients = async (req, res, next) => {
  try {
    const { search, bloodGroup, page = 1, limit = 20 } = req.query;
    const query = { role: 'patient' };

    if (bloodGroup) query.bloodGroup = bloodGroup;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await User.countDocuments(query);
    const patients = await User.find(query)
      .select('-password')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: patients.length,
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      data: patients
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single patient details + authorized medical records
 * @route   GET /api/patients/:id
 * @access  Private
 */
exports.getPatientById = async (req, res, next) => {
  try {
    // Patients can only view their own record unless Admin or Doctor
    if (req.user.role === 'patient' && req.user.id !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to patient record' });
    }

    const patient = await User.findOne({ _id: req.params.id, role: 'patient' }).select('-password');
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // Fetch patient's medical records
    const medicalRecords = await MedicalRecord.find({ patient: patient._id })
      .populate('doctor', 'name specialization department')
      .sort({ recordDate: -1 });

    // Fetch patient's appointment history
    const appointments = await Appointment.find({ patient: patient._id })
      .populate('doctor', 'name specialization department')
      .sort({ appointmentDate: -1 });

    res.status(200).json({
      success: true,
      data: {
        patient,
        medicalRecords,
        appointments
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create medical record for patient
 * @route   POST /api/patients/:id/medical-records
 * @access  Private (Doctor, Admin)
 */
exports.createMedicalRecord = async (req, res, next) => {
  try {
    const { diagnosis, symptoms, treatmentPlan, medications, labTestsRecommended, notes, appointmentId } = req.body;
    const patientId = req.params.id;

    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const record = await MedicalRecord.create({
      patient: patientId,
      doctor: req.user.id,
      appointment: appointmentId || null,
      diagnosis,
      symptoms: symptoms || [],
      treatmentPlan,
      medications: medications || [],
      labTestsRecommended: labTestsRecommended || [],
      notes
    });

    const populatedRecord = await MedicalRecord.findById(record._id)
      .populate('doctor', 'name specialization department');

    res.status(201).json({
      success: true,
      message: 'Medical record added successfully',
      data: populatedRecord
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update patient details
 * @route   PUT /api/patients/:id
 * @access  Private (Admin, Patient self)
 */
exports.updatePatient = async (req, res, next) => {
  try {
    if (req.user.role === 'patient' && req.user.id !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const updated = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).select('-password');

    res.status(200).json({
      success: true,
      message: 'Patient updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete patient (Admin only)
 * @route   DELETE /api/patients/:id
 * @access  Private (Admin)
 */
exports.deletePatient = async (req, res, next) => {
  try {
    const patient = await User.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    await patient.deleteOne();
    res.status(200).json({ success: true, message: 'Patient removed successfully' });
  } catch (error) {
    next(error);
  }
};
