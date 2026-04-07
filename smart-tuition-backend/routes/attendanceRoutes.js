const express = require('express');
const { markAttendance, getAttendance } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Both Teacher and Parent/Student can hit the base route, but with different methods/authorizations
router.route('/')
    .post(protect, authorize('teacher'), markAttendance) // Only teachers can Mark (POST)
    .get(protect, authorize('teacher', 'parent', 'student'), getAttendance); // All roles can View (GET)

module.exports = router;
