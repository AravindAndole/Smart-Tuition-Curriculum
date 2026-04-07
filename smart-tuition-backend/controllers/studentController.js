const Attendance = require('../models/Attendance');
const Progress = require('../models/Progress');
const Homework = require('../models/Homework');
const Notice = require('../models/Notice');
const User = require('../models/User');
const Fee = require('../models/Fee');

// @desc    Get all read-only dashboard data for a student/parent
// @route   GET /api/student/dashboard
// @access  Private (Student, Parent)
exports.getStudentDashboard = async (req, res) => {
    try {
        // req.user comes from JWT
        if (req.user.role !== 'student' && req.user.role !== 'parent') {
            return res.status(403).json({ message: 'Access denied: Students and Parents only' });
        }

        const userAccount = await User.findById(req.user.id).populate('student');
        if (!userAccount || !userAccount.student) {
            return res.status(404).json({ message: 'Student profile not found' });
        }

        const studentId = userAccount.student._id;
        const centerId = userAccount.student.tuitionCenter;

        // Fetch Attendance
        const attendance = await Attendance.find({ student: studentId }).sort({ date: -1 }).limit(10);

        // Fetch Progress
        const progress = await Progress.find({ student: studentId }).sort({ createdAt: -1 });

        // Fetch Homework (active/recent for this center)
        const homework = await Homework.find({ tuitionCenter: centerId }).sort({ dueDate: 1 }).limit(5);

        // Fetch Notices (recent for this center)
        const notices = await Notice.find({ tuitionCenter: centerId }).sort({ createdAt: -1 }).limit(5);

        // Fetch Fees
        const fees = await Fee.find({ student: studentId }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: {
                profile: {
                    name: userAccount.name,
                    studentId: userAccount.student.studentId,
                    email: userAccount.email
                },
                attendance,
                progress,
                homework,
                notices,
                fees
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
