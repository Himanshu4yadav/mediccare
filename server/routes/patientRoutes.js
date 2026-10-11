const express = require('express');
const router = express.Router();
const {
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
  createMedicalRecord
} = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', authorize('admin', 'doctor'), getPatients);
router.get('/:id', getPatientById);
router.put('/:id', updatePatient);
router.delete('/:id', authorize('admin'), deletePatient);
router.post('/:id/medical-records', authorize('admin', 'doctor'), createMedicalRecord);

module.exports = router;
