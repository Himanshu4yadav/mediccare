const Bed = require('../models/Bed');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const CircularQueue = require('../dsa/CircularQueue');

// In-memory waiting queue (with demonstration persistence / rebuild)
const bedWaitingQueue = new CircularQueue(30);

/**
 * @desc    Get all hospital beds with optional filtering by ward & status
 * @route   GET /api/beds
 * @access  Private / Public info
 */
exports.getBeds = async (req, res, next) => {
  try {
    const { ward, status, bedType } = req.query;
    const query = {};

    if (ward) query.ward = ward;
    if (status) query.status = status;
    if (bedType) query.bedType = bedType;

    const beds = await Bed.find(query)
      .populate('assignedPatient', 'name email phone bloodGroup age gender')
      .sort({ ward: 1, bedNumber: 1 });

    const totalBeds = await Bed.countDocuments();
    const availableCount = await Bed.countDocuments({ status: 'Available' });
    const occupiedCount = await Bed.countDocuments({ status: 'Occupied' });
    const reservedCount = await Bed.countDocuments({ status: 'Reserved' });

    res.status(200).json({
      success: true,
      count: beds.length,
      statistics: {
        total: totalBeds,
        available: availableCount,
        occupied: occupiedCount,
        reserved: reservedCount
      },
      data: beds,
      waitingList: bedWaitingQueue.toArray()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new bed (Admin only)
 * @route   POST /api/beds
 * @access  Private (Admin)
 */
exports.createBed = async (req, res, next) => {
  try {
    const { bedNumber, ward, bedType, status = 'Available', notes } = req.body;

    const existingBed = await Bed.findOne({ bedNumber: bedNumber.toUpperCase() });
    if (existingBed) {
      return res.status(400).json({
        success: false,
        message: `Bed with number ${bedNumber.toUpperCase()} already exists.`
      });
    }

    const bed = await Bed.create({
      bedNumber: bedNumber.toUpperCase(),
      ward,
      bedType,
      status,
      notes
    });

    await ActivityLog.create({
      action: `Bed created: ${bed.bedNumber} in ${bed.ward}`,
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      category: 'BED',
      details: `Type: ${bedType}, Initial status: ${status}`
    }).catch(() => {});

    res.status(201).json({
      success: true,
      message: 'Bed created successfully',
      data: bed
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update bed status or assign/discharge patient
 * @route   PUT /api/beds/:id
 * @access  Private (Admin, Doctor)
 */
exports.updateBed = async (req, res, next) => {
  try {
    const { status, assignedPatient, notes, bedType, ward } = req.body;
    let bed = await Bed.findById(req.params.id);

    if (!bed) {
      return res.status(404).json({ success: false, message: 'Bed not found' });
    }

    // If assigning to a patient, verify patient existence and prevent double allocation
    if (assignedPatient && status === 'Occupied') {
      const patient = await User.findById(assignedPatient);
      if (!patient) {
        return res.status(404).json({ success: false, message: 'Patient to assign was not found' });
      }

      // Check if patient already has another occupied bed
      const activeBed = await Bed.findOne({
        assignedPatient,
        _id: { $ne: bed._id },
        status: { $in: ['Occupied', 'Reserved'] }
      });

      if (activeBed) {
        return res.status(400).json({
          success: false,
          message: `Patient ${patient.name} is already assigned to active bed ${activeBed.bedNumber} in ${activeBed.ward}.`
        });
      }

      bed.assignedPatient = assignedPatient;
      bed.status = 'Occupied';
    } else if (status === 'Available') {
      // Discharging patient
      bed.assignedPatient = null;
      bed.status = 'Available';

      // If waiting queue has patients, check if front candidate can be allocated
      if (!bedWaitingQueue.isEmpty()) {
        const nextWaitingPatient = bedWaitingQueue.dequeue();
        console.log(`[Bed Queue] Patient ${nextWaitingPatient.patientName} dequeued for prospective bed assignment.`);
      }
    }

    if (notes !== undefined) bed.notes = notes;
    if (bedType) bed.bedType = bedType;
    if (ward) bed.ward = ward;
    if (status) bed.status = status;
    bed.lastUpdated = new Date();

    await bed.save();

    const populatedBed = await Bed.findById(bed._id).populate('assignedPatient', 'name phone email bloodGroup');

    await ActivityLog.create({
      action: `Bed updated: ${bed.bedNumber}`,
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      category: 'BED',
      details: `Status changed to ${bed.status}`
    }).catch(() => {});

    res.status(200).json({
      success: true,
      message: 'Bed status updated successfully',
      data: populatedBed
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a patient to bed waiting list (Circular Queue)
 * @route   POST /api/beds/waiting-list
 * @access  Private (Admin, Doctor)
 */
exports.addToWaitingList = async (req, res, next) => {
  try {
    const { patientId, patientName, requiredWard, severity = 'Normal' } = req.body;

    if (!patientName || !requiredWard) {
      return res.status(400).json({
        success: false,
        message: 'Patient name and required ward are mandatory.'
      });
    }

    const queueItem = {
      id: `WAIT-${Date.now().toString().slice(-4)}`,
      patientId: patientId || null,
      patientName,
      requiredWard,
      severity,
      queuedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const enqueueResult = bedWaitingQueue.enqueue(queueItem);

    if (!enqueueResult.success) {
      return res.status(400).json(enqueueResult);
    }

    res.status(201).json({
      success: true,
      message: `Patient ${patientName} added to Bed Waiting Circular Queue at position ${enqueueResult.position}.`,
      waitingList: bedWaitingQueue.toArray(),
      queueSize: bedWaitingQueue.size()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Dequeue next waiting patient (Circular Queue)
 * @route   POST /api/beds/waiting-list/dequeue
 * @access  Private (Admin)
 */
exports.dequeueWaitingList = async (req, res, next) => {
  try {
    if (bedWaitingQueue.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'The waiting list queue is currently empty.'
      });
    }

    const dequeued = bedWaitingQueue.dequeue();
    res.status(200).json({
      success: true,
      message: `Dequeued patient ${dequeued.patientName} from waiting list.`,
      dequeuedItem: dequeued,
      remainingCount: bedWaitingQueue.size(),
      waitingList: bedWaitingQueue.toArray()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete bed (Admin only)
 * @route   DELETE /api/beds/:id
 * @access  Private (Admin)
 */
exports.deleteBed = async (req, res, next) => {
  try {
    const bed = await Bed.findById(req.params.id);
    if (!bed) {
      return res.status(404).json({ success: false, message: 'Bed not found' });
    }

    if (bed.status === 'Occupied') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a currently occupied bed. Please discharge or relocate patient first.'
      });
    }

    await bed.deleteOne();
    res.status(200).json({ success: true, message: 'Bed deleted successfully' });
  } catch (error) {
    next(error);
  }
};
