const express = require('express');
const { getStudentDashboard } = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/dashboard', protect, authorize('student', 'parent'), getStudentDashboard);

module.exports = router;
