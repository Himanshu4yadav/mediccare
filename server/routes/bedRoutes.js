const express = require('express');
const router = express.Router();
const {
  getBeds,
  createBed,
  updateBed,
  deleteBed,
  addToWaitingList,
  dequeueWaitingList
} = require('../controllers/bedController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getBeds);

router.use(protect);

router.post('/', authorize('admin'), createBed);
router.put('/:id', authorize('admin', 'doctor'), updateBed);
router.delete('/:id', authorize('admin'), deleteBed);

router.post('/waiting-list', authorize('admin', 'doctor'), addToWaitingList);
router.post('/waiting-list/dequeue', authorize('admin'), dequeueWaitingList);

module.exports = router;
