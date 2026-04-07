const express = require('express');
const { registerTeacher, registerParent, login, createStudent, getMe, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register/teacher', registerTeacher);
router.post('/register/parent', registerParent);
router.post('/login', login);

// Teacher creates a student
router.post('/student', protect, authorize('teacher'), createStudent);

// Get current user profile (used on page refresh)
router.get('/me', protect, getMe);

// Example of a role-based protected route
router.get('/dashboard/teacher', protect, authorize('teacher'), (req, res) => {
    res.status(200).json({ success: true, message: 'Welcome to Teacher Dashboard' });
});
// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
