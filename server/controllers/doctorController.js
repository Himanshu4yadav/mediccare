const User = require('../models/User');
const Appointment = require('../models/Appointment');

/**
 * @desc    Get all doctors (with optional specialization search)
 * @route   GET /api/doctors
 * @access  Public / Authenticated
 */
exports.getDoctors = async (req, res, next) => {
  try {
    const { specialization, search } = req.query;
    const query = { role: 'doctor' };

    if (specialization && specialization !== 'All') {
      query.specialization = specialization;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } }
      ];
    }

    const doctors = await User.find(query)
      .select('name email phone specialization department experienceYears consultationFee availableDays')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single doctor profile and available slots
 * @route   GET /api/doctors/:id
 * @access  Public / Authenticated
 */
exports.getDoctorById = async (req, res, next) => {
  try {
    const doctor = await User.findOne({ _id: req.params.id, role: 'doctor' }).select(
      'name email phone specialization department experienceYears consultationFee availableDays'
    );

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Default bookable time slots for demo
    const defaultSlots = [
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

    res.status(200).json({
      success: true,
      data: {
        doctor,
        availableSlots: defaultSlots
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create doctor account (Admin only)
 * @route   POST /api/doctors
 * @access  Private (Admin)
 */
exports.createDoctor = async (req, res, next) => {
  try {
    const { name, email, password, specialization, department, phone, experienceYears, consultationFee } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    const doctor = await User.create({
      name,
      email,
      password: password || 'Doctor@123',
      role: 'doctor',
      specialization: specialization || 'General Physician',
      department: department || 'Outpatient',
      phone: phone || '',
      experienceYears: experienceYears || 3,
      consultationFee: consultationFee || 500
    });

    res.status(201).json({
      success: true,
      message: 'Doctor account created successfully',
      data: doctor
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update doctor (Admin only)
 * @route   PUT /api/doctors/:id
 * @access  Private (Admin)
 */
exports.updateDoctor = async (req, res, next) => {
  try {
    const doctor = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'doctor' },
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Doctor updated successfully',
      data: doctor
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete doctor (Admin only)
 * @route   DELETE /api/doctors/:id
 * @access  Private (Admin)
 */
exports.deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await User.findOne({ _id: req.params.id, role: 'doctor' });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    await doctor.deleteOne();
    res.status(200).json({ success: true, message: 'Doctor removed successfully' });
  } catch (error) {
    next(error);
  }
};
