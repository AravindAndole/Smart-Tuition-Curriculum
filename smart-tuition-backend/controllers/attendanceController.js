const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const User = require('../models/User');

// @desc    Mark attendance for a student
// @route   POST /api/attendance
// @access  Private (Teacher Only)
exports.markAttendance = async (req, res) => {
    try {
        const { studentId, status, date } = req.body; // studentId here refers to the actual DB _id, not the custom studentId string, or handle both.

        // Get the teacher's User doc to find their tuition center
        const teacher = await User.findById(req.user.id);
        if (!teacher.tuitionCenter) {
            return res.status(400).json({ message: 'Teacher is not linked to any Tuition Center' });
        }

        // Verify student exists and belongs to this center
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found in database' });
        }

        if (student.tuitionCenter.toString() !== teacher.tuitionCenter.toString()) {
            return res.status(403).json({ message: 'Student does not belong to your Tuition Center' });
        }

        // Determine the date (default to today if not provided)
        const attendanceDate = date ? new Date(date) : new Date();
        attendanceDate.setHours(0, 0, 0, 0); // Normalize to start of day

        // Check if attendance already exists for this student on this date
        let attendance = await Attendance.findOne({
            student: studentId,
            tuitionCenter: teacher.tuitionCenter,
            date: attendanceDate
        });

        if (attendance) {
            // Update existing record
            attendance.status = status;
            attendance.markedBy = req.user.id;
            await attendance.save();
            return res.status(200).json({ success: true, message: 'Attendance updated', data: attendance });
        }

        // Create new record
        attendance = await Attendance.create({
            student: studentId,
            tuitionCenter: teacher.tuitionCenter,
            date: attendanceDate,
            status: status,
            markedBy: req.user.id
        });

        res.status(201).json({ success: true, message: 'Attendance marked', data: attendance });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Attendance already marked for this date' });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get attendance records
// @route   GET /api/attendance
// @access  Private (Teacher, Parent, Student)
exports.getAttendance = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        let query = {};

        if (req.user.role === 'teacher') {
            // Teacher sees attendance for their entire center
            if (!user.tuitionCenter) return res.status(400).json({ message: 'No center linked' });
            query.tuitionCenter = user.tuitionCenter;

            // Optionally filter by specific student if passed in query
            if (req.query.studentId) {
                query.student = req.query.studentId;
            }

            // Optionally filter by specific date if passed in query
            if (req.query.date) {
                const searchDate = new Date(req.query.date);
                const startOfDay = new Date(searchDate);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(searchDate);
                endOfDay.setHours(23, 59, 59, 999);
                query.date = { $gte: startOfDay, $lte: endOfDay };
            }
        } else if (req.user.role === 'parent' || req.user.role === 'student') {
            // Parent/Student can only see attendance for their linked student profile
            if (!user.student) return res.status(400).json({ message: 'No student linked to this account' });
            query.student = user.student;
        }

        const attendanceRecords = await Attendance.find(query)
            .populate('student', 'name studentId')
            .populate('markedBy', 'name')
            .sort({ date: -1 }); // Newest first

        res.status(200).json({ success: true, count: attendanceRecords.length, data: attendanceRecords });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
