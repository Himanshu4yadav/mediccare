const EmergencyRequest = require('../models/EmergencyRequest');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const PriorityQueue = require('../dsa/PriorityQueue');
const { SinglyLinkedList } = require('../dsa/SinglyLinkedList');

// Shared triage priority queue instance
let triageHeap = new PriorityQueue();

/**
 * Helper to rebuild in-memory max-heap from MongoDB records
 */
const rebuildPriorityQueue = async () => {
  const pendingCases = await EmergencyRequest.find({
    status: { $in: ['Pending', 'Assigned', 'In Progress'] }
  })
    .populate('patient', 'name phone email bloodGroup')
    .populate('assignedDoctor', 'name specialization phone')
    .lean();

  triageHeap = new PriorityQueue();
  triageHeap.heapify(pendingCases);
  return triageHeap;
};

/**
 * @desc    Submit emergency request (Patient or staff)
 * @route   POST /api/emergencies
 * @access  Private
 */
exports.createEmergencyRequest = async (req, res, next) => {
  try {
    const {
      emergencyType,
      description,
      location,
      contactNumber,
      severity = 'High'
    } = req.body;

    const patientId = req.user.role === 'patient' ? req.user.id : req.body.patientId || req.user.id;

    if (!emergencyType || !description || !location || !contactNumber) {
      return res.status(400).json({
        success: false,
        message: 'Emergency type, description, location, and contact number are required.'
      });
    }

    const emergency = new EmergencyRequest({
      patient: patientId,
      emergencyType,
      description,
      location,
      contactNumber,
      severity,
      status: 'Pending',
      statusHistory: [
        {
          status: 'Pending',
          updatedBy: req.user._id,
          note: `Case registered. Initial triage severity: ${severity}.`,
          timestamp: new Date()
        }
      ]
    });

    await emergency.save();

    // Populate for heap and client
    const populatedCase = await EmergencyRequest.findById(emergency._id)
      .populate('patient', 'name phone email bloodGroup')
      .populate('assignedDoctor', 'name specialization phone')
      .lean();

    // Insert into DSA Binary Max-Heap
    triageHeap.insert(populatedCase);

    await ActivityLog.create({
      action: `EMERGENCY ALERT: ${severity} - ${emergencyType}`,
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      category: 'EMERGENCY',
      details: `Location: ${location}. Priority Score: ${emergency.priorityScore}`
    }).catch(() => {});

    res.status(201).json({
      success: true,
      message: 'Emergency request registered. Triage queue updated.',
      data: populatedCase,
      priorityRank: triageHeap.size()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get emergency requests with Heap Triage Priority ordering
 * @route   GET /api/emergencies
 * @access  Private
 */
exports.getEmergencyRequests = async (req, res, next) => {
  try {
    // If patient, only return their emergencies
    if (req.user.role === 'patient') {
      const patientCases = await EmergencyRequest.find({ patient: req.user.id })
        .populate('assignedDoctor', 'name specialization phone')
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: patientCases.length,
        data: patientCases
      });
    }

    // If doctor, return cases assigned to them or unassigned
    let query = {};
    if (req.user.role === 'doctor') {
      query = {
        $or: [{ assignedDoctor: req.user.id }, { status: 'Pending' }]
      };
    }

    // Refresh heap from database records
    await rebuildPriorityQueue();

    // For Admin / Staff, retrieve active cases ordered using Max-Heap
    const allCases = await EmergencyRequest.find(query)
      .populate('patient', 'name phone email bloodGroup age gender')
      .populate('assignedDoctor', 'name specialization phone')
      .lean();

    const heapForSort = new PriorityQueue();
    heapForSort.heapify(allCases);
    const triageOrderedCases = heapForSort.getSortedArray();

    res.status(200).json({
      success: true,
      count: triageOrderedCases.length,
      data: triageOrderedCases,
      maxHeapTop: triageHeap.peek()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single emergency case details + Linked List history demonstration
 * @route   GET /api/emergencies/:id
 * @access  Private
 */
exports.getEmergencyById = async (req, res, next) => {
  try {
    const emergency = await EmergencyRequest.findById(req.params.id)
      .populate('patient', 'name phone email bloodGroup age gender address emergencyContact')
      .populate('assignedDoctor', 'name specialization phone department')
      .populate('statusHistory.updatedBy', 'name role');

    if (!emergency) {
      return res.status(404).json({ success: false, message: 'Emergency case not found' });
    }

    // Security check: patients only view their own
    if (req.user.role === 'patient' && emergency.patient._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    // Demonstrate Singly Linked List reconstruction of status history
    const historyLinkedList = new SinglyLinkedList();
    (emergency.statusHistory || []).forEach((hist) => {
      historyLinkedList.append({
        status: hist.status,
        timestamp: hist.timestamp,
        note: hist.note,
        updatedBy: hist.updatedBy ? hist.updatedBy.name : 'System'
      });
    });

    res.status(200).json({
      success: true,
      data: emergency,
      dsaAuditTrail: historyLinkedList.toArray()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Assign doctor to emergency case
 * @route   PUT /api/emergencies/:id/assign
 * @access  Private (Admin, Doctor)
 */
exports.assignDoctorToEmergency = async (req, res, next) => {
  try {
    const { doctorId, notes } = req.body;
    const emergency = await EmergencyRequest.findById(req.params.id);

    if (!emergency) {
      return res.status(404).json({ success: false, message: 'Emergency case not found' });
    }

    const assignedId = doctorId || req.user.id;
    const doctor = await User.findOne({ _id: assignedId, role: 'doctor' });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    emergency.assignedDoctor = doctor._id;
    emergency.status = 'Assigned';
    emergency.statusHistory.push({
      status: 'Assigned',
      updatedBy: req.user._id,
      note: notes || `Dr. ${doctor.name} (${doctor.specialization}) assigned to case.`,
      timestamp: new Date()
    });

    await emergency.save();
    await rebuildPriorityQueue();

    const updated = await EmergencyRequest.findById(emergency._id)
      .populate('patient', 'name phone email bloodGroup')
      .populate('assignedDoctor', 'name specialization phone');

    res.status(200).json({
      success: true,
      message: `Case assigned to Dr. ${doctor.name}`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update status of emergency case
 * @route   PUT /api/emergencies/:id/status
 * @access  Private (Admin, Doctor)
 */
exports.updateEmergencyStatus = async (req, res, next) => {
  try {
    const { status, note, actionTaken } = req.body;
    const validStatuses = ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid emergency status' });
    }

    const emergency = await EmergencyRequest.findById(req.params.id);
    if (!emergency) {
      return res.status(404).json({ success: false, message: 'Emergency case not found' });
    }

    emergency.status = status;
    if (actionTaken) emergency.actionTaken = actionTaken;

    emergency.statusHistory.push({
      status,
      updatedBy: req.user._id,
      note: note || `Status updated to ${status}.`,
      timestamp: new Date()
    });

    await emergency.save();
    await rebuildPriorityQueue();

    const updated = await EmergencyRequest.findById(emergency._id)
      .populate('patient', 'name phone email bloodGroup')
      .populate('assignedDoctor', 'name specialization phone');

    res.status(200).json({
      success: true,
      message: `Emergency status updated to ${status}`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};
