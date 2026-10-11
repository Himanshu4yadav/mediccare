const User = require('../models/User');
const Appointment = require('../models/Appointment');
const EmergencyRequest = require('../models/EmergencyRequest');
const Bed = require('../models/Bed');
const ActivityLog = require('../models/ActivityLog');

/**
 * @desc    Get holistic hospital operational statistics computed from real database records
 * @route   GET /api/dashboard/stats
 * @access  Private (Admin, Doctor)
 */
exports.getDashboardStats = async (req, res, next) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    // Aggregated real database counts
    const [
      totalPatients,
      totalDoctors,
      totalAppointments,
      todayAppointments,
      pendingEmergencyCases,
      criticalEmergencies,
      totalBeds,
      availableBeds,
      occupiedBeds,
      reservedBeds
    ] = await Promise.all([
      User.countDocuments({ role: 'patient' }),
      User.countDocuments({ role: 'doctor' }),
      Appointment.countDocuments(),
      Appointment.countDocuments({ appointmentDate: todayStr }),
      EmergencyRequest.countDocuments({ status: { $in: ['Pending', 'Assigned', 'In Progress'] } }),
      EmergencyRequest.countDocuments({ severity: 'Critical', status: { $ne: 'Resolved' } }),
      Bed.countDocuments(),
      Bed.countDocuments({ status: 'Available' }),
      Bed.countDocuments({ status: 'Occupied' }),
      Bed.countDocuments({ status: 'Reserved' })
    ]);

    // Emergency breakdown by priority / severity
    const emergencyBySeverity = await EmergencyRequest.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);

    // Appointments breakdown by status
    const appointmentStatusBreakdown = await EmergencyRequest.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Beds by Ward breakdown
    const bedsByWard = await Bed.aggregate([
      {
        $group: {
          _id: '$ward',
          total: { $sum: 1 },
          available: { $sum: { $cond: [{ $eq: ['$status', 'Available'] }, 1, 0] } },
          occupied: { $sum: { $cond: [{ $eq: ['$status', 'Occupied'] }, 1, 0] } }
        }
      }
    ]);

    // Recent system activity log (last 10 items)
    const recentActivity = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(10);

    // Recent emergency requests
    const recentEmergencies = await EmergencyRequest.find()
      .populate('patient', 'name phone')
      .populate('assignedDoctor', 'name specialization')
      .sort({ createdAt: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      stats: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        todayAppointments,
        pendingEmergencyCases,
        criticalEmergencies,
        bedStats: {
          total: totalBeds,
          available: availableBeds,
          occupied: occupiedBeds,
          reserved: reservedBeds,
          occupancyRate: totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0
        }
      },
      charts: {
        emergencyBySeverity: emergencyBySeverity.map((item) => ({
          name: item._id || 'Unknown',
          count: item.count
        })),
        bedsByWard: bedsByWard.map((w) => ({
          ward: w._id,
          total: w.total,
          available: w.available,
          occupied: w.occupied
        }))
      },
      recentActivity,
      recentEmergencies
    });
  } catch (error) {
    next(error);
  }
};
