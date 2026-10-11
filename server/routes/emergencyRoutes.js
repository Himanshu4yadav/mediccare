const express = require('express');
const router = express.Router();
const {
  createEmergencyRequest,
  getEmergencyRequests,
  getEmergencyById,
  assignDoctorToEmergency,
  updateEmergencyStatus
} = require('../controllers/emergencyController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .post(createEmergencyRequest)
  .get(getEmergencyRequests);

router.route('/:id')
  .get(getEmergencyById);

router.put('/:id/assign', authorize('admin', 'doctor'), assignDoctorToEmergency);
router.put('/:id/status', authorize('admin', 'doctor'), updateEmergencyStatus);

module.exports = router;
