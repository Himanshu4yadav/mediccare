const express = require('express');
const router = express.Router();
const {
  testPriorityQueue,
  testCircularQueue,
  testSearch,
  testSort,
  testGraphNavigate
} = require('../controllers/dsaController');

// All DSA demo lab endpoints are open for educational project evaluation
router.post('/priority-queue', testPriorityQueue);
router.post('/circular-queue', testCircularQueue);
router.post('/search', testSearch);
router.post('/sort', testSort);
router.post('/graph-navigate', testGraphNavigate);

module.exports = router;
