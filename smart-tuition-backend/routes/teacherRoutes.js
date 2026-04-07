const express = require('express');
const router = express.Router();
const { getDashboardOverview, getStudentsList, editStudent, deleteStudent, getManageProgress, updateStudentProgress } = require('../controllers/teacherController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, authorize('teacher'), getDashboardOverview);
router.get('/students', protect, authorize('teacher'), getStudentsList);
router.put('/students/:id', protect, authorize('teacher'), editStudent);
router.delete('/students/:id', protect, authorize('teacher'), deleteStudent);

router.get('/progress', protect, authorize('teacher'), getManageProgress);
router.put('/progress/:id', protect, authorize('teacher'), updateStudentProgress);

module.exports = router;
