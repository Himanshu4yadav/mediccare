const Appointment = require('../models/Appointment');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

/**
 * @desc    Create / Book a new appointment
 * @route   POST /api/appointments
 * @access  Private (Patient, Admin)
 */
exports.createAppointment = async (req, res, next) => {
  try {
    const { doctorId, appointmentDate, timeSlot, reason } = req.body;

    // Determine patient ID based on role
    const patientId = req.user.role === 'patient' ? req.user.id : req.body.patientId || req.user.id;

    if (!doctorId || !appointmentDate || !timeSlot || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Doctor, appointment date, time slot, and reason are required.'
      });
    }

    // Verify doctor exists and has role doctor
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Assigned doctor was not found.'
      });
    }

    // Conflict detection: Check if the doctor already has a confirmed/pending appointment at this slot
    const slotConflict = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate,
      timeSlot,
      status: { $in: ['Pending', 'Confirmed'] }
    });

    if (slotConflict) {
      return res.status(409).json({
        success: false,
        message: `Dr. ${doctor.name} already has a booked appointment on ${appointmentDate} at ${timeSlot}. Please choose another time slot.`
      });
    }

    const appointment = await Appointment.create({
      patient: patientId,
      doctor: doctorId,
      appointmentDate,
      timeSlot,
      reason,
      status: 'Pending'
    });

    await ActivityLog.create({
      action: `Appointment booked with Dr. ${doctor.name}`,
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      category: 'APPOINTMENT',
      details: `Date: ${appointmentDate}, Slot: ${timeSlot}`
    }).catch(() => {});

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('doctor', 'name specialization department consultationFee')
      .populate('patient', 'name email phone age gender bloodGroup');

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully.',
      data: populatedAppointment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get appointments with filtering & role-based scoping
 * @route   GET /api/appointments
 * @access  Private
 */
exports.getAppointments = async (req, res, next) => {
  try {
    const { status, date, doctorId, patientId } = req.query;
    let query = {};

    // Role-based data ownership isolation
    if (req.user.role === 'patient') {
      query.patient = req.user.id;
    } else if (req.user.role === 'doctor') {
      query.doctor = req.user.id;
    } else if (req.user.role === 'admin') {
      if (doctorId) query.doctor = doctorId;
      if (patientId) query.patient = patientId;
    }

    if (status) query.status = status;
    if (date) query.appointmentDate = date;

    const appointments = await Appointment.find(query)
      .populate('doctor', 'name specialization department phone consultationFee')
      .populate('patient', 'name email phone bloodGroup age gender emergencyContact')
      .sort({ appointmentDate: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single appointment by ID
 * @route   GET /api/appointments/:id
 * @access  Private
 */
exports.getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('doctor', 'name specialization department phone')
      .populate('patient', 'name email phone bloodGroup age gender address emergencyContact');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Access control check
    if (
      req.user.role === 'patient' &&
      appointment.patient._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this appointment' });
    }
    if (
      req.user.role === 'doctor' &&
      appointment.doctor._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this appointment' });
    }

    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update appointment status / notes / details
 * @route   PUT /api/appointments/:id
 * @access  Private
 */
exports.updateAppointment = async (req, res, next) => {
  try {
    let appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Role checks
    if (req.user.role === 'patient') {
      if (appointment.patient.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }
      // Patients can only cancel their pending or confirmed appointments
      if (req.body.status === 'Cancelled') {
        appointment.status = 'Cancelled';
      } else {
        return res.status(400).json({
          success: false,
          message: 'Patients can only cancel pending or confirmed appointments.'
        });
      }
    } else if (req.user.role === 'doctor') {
      if (appointment.doctor.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Unauthorized to modify another doctor appointment' });
      }
      if (req.body.status) appointment.status = req.body.status;
      if (req.body.consultationNotes) appointment.consultationNotes = req.body.consultationNotes;
      if (req.body.prescription) appointment.prescription = req.body.prescription;
      if (req.body.followUpDate) appointment.followUpDate = req.body.followUpDate;
    } else if (req.user.role === 'admin') {
      // Admin has full modification capability
      if (req.body.status) appointment.status = req.body.status;
      if (req.body.appointmentDate) appointment.appointmentDate = req.body.appointmentDate;
      if (req.body.timeSlot) appointment.timeSlot = req.body.timeSlot;
      if (req.body.reason) appointment.reason = req.body.reason;
    }

    await appointment.save();

    const updated = await Appointment.findById(appointment._id)
      .populate('doctor', 'name specialization department')
      .populate('patient', 'name email phone');

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete appointment (Admin only)
 * @route   DELETE /api/appointments/:id
 * @access  Private (Admin)
 */
exports.deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    await appointment.deleteOne();
    res.status(200).json({ success: true, message: 'Appointment deleted successfully' });
  } catch (error) {
    next(error);
  }
};
