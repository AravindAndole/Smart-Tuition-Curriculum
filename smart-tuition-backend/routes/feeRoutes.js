const express = require('express');
const { markFee, getFees } = require('../controllers/feeController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .post(protect, authorize('teacher'), markFee) // Only teachers can create/update fees
    .get(protect, authorize('teacher', 'parent', 'student'), getFees); // All roles can view fees

module.exports = router;
