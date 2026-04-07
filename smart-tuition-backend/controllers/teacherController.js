const Student = require('../models/Student');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Fee = require('../models/Fee');
const Homework = require('../models/Homework');
const Progress = require('../models/Progress');
const bcrypt = require('bcryptjs');

exports.getDashboardOverview = async (req, res) => {
    try {
        const teacher = await User.findById(req.user.id);
        if (!teacher.tuitionCenter) {
            return res.status(400).json({ message: 'Teacher is not linked to any Tuition Center' });
        }

        const centerId = teacher.tuitionCenter;

        // 1. Total Students
        const students = await Student.find({ tuitionCenter: centerId });
        const totalStudents = students.length;
        const studentIds = students.map(s => s._id);

        // 2. Attendance Today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const attendanceToday = await Attendance.find({
            student: { $in: studentIds },
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        const presentToday = attendanceToday.filter(a => a.status === 'Present').length;
        const absentToday = attendanceToday.filter(a => a.status === 'Absent').length;

        // 3. Fee Status (Current Month)
        const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
        const feesThisMonth = await Fee.find({
            student: { $in: studentIds },
            month: currentMonth
        });

        const paidStudents = feesThisMonth.filter(f => f.status === 'Paid').length;
        // Unpaid is total minus paid (assuming everyone owes)
        const unpaidStudents = totalStudents - paidStudents;

        res.status(200).json({
            success: true,
            data: {
                totalStudents,
                presentToday,
                absentToday,
                paidStudents,
                unpaidStudents
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getStudentsList = async (req, res) => {
    try {
        const teacher = await User.findById(req.user.id);
        if (!teacher.tuitionCenter) {
            return res.status(400).json({ message: 'Teacher is not linked to any Tuition Center' });
        }

        const students = await Student.find({ tuitionCenter: teacher.tuitionCenter })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: students.length,
            data: students
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.editStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password } = req.body;
        
        const teacher = await User.findById(req.user.id);
        if (!teacher.tuitionCenter) return res.status(400).json({ message: 'Teacher is not linked to any Tuition Center' });

        // Update Student Profile
        const studentProfile = await Student.findOneAndUpdate(
            { _id: id, tuitionCenter: teacher.tuitionCenter },
            { name },
            { new: true }
        );

        if (!studentProfile) return res.status(404).json({ message: 'Student not found or unauthorized' });

        // Update User Profile mapping to this student
        const studentUser = await User.findOne({ student: id });
        if (studentUser) {
            studentUser.name = name;
            if (email) {
                // Check if new email conflicts
                if (email.trim() !== studentUser.email) {
                    const userExists = await User.findOne({ email: new RegExp('^' + email.trim() + '$', 'i') });
                    if (userExists) return res.status(400).json({ message: 'Email already exists. Try another.' });
                    studentUser.email = email.trim();
                }
            }
            if (password && password.trim().length > 0) {
                const salt = await bcrypt.genSalt(10);
                studentUser.password = await bcrypt.hash(password, salt);
            }
            await studentUser.save();
        }

        res.status(200).json({ success: true, message: 'Student updated successfully', data: studentProfile });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const teacher = await User.findById(req.user.id);

        if (!teacher.tuitionCenter) return res.status(400).json({ message: 'Teacher is not linked to any Tuition Center' });

        const student = await Student.findOneAndDelete({ _id: id, tuitionCenter: teacher.tuitionCenter });
        if (!student) return res.status(404).json({ message: 'Student not found or unauthorized' });

        // Delete associated User account
        await User.findOneAndDelete({ student: id });

        // Optionally cascade delete attendance/progress/fees here if required, though keeping for history might be preferred
        
        res.status(200).json({ success: true, message: 'Student deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getManageProgress = async (req, res) => {
    try {
        const { subject } = req.query;
        if (!subject) return res.status(400).json({ message: 'Subject is required' });

        const teacher = await User.findById(req.user.id);
        if (!teacher.tuitionCenter) return res.status(400).json({ message: 'Teacher is not linked to any Tuition Center' });

        const students = await Student.find({ tuitionCenter: teacher.tuitionCenter })
            .select('_id name studentId');
            
        // Fetch the most recent progress record for each student in this subject
        const progressRecords = await Progress.find({
            tuitionCenter: teacher.tuitionCenter,
            subject: subject,
            student: { $in: students.map(s => s._id) }
        }).sort({ createdAt: -1 });

        // Map students to their latest rating
        const studentData = students.map(student => {
            const latestRecord = progressRecords.find(p => p.student.toString() === student._id.toString());
            let rating = null;

            if (latestRecord) {
                const percentage = (latestRecord.score / latestRecord.totalMarks) * 100;
                if (percentage >= 80) rating = 'Good';
                else if (percentage >= 50) rating = 'Average';
                else rating = 'Needs Improvement';
            }

            return {
                _id: student._id,
                name: student.name,
                studentId: student.studentId,
                rating: rating
            };
        });

        res.status(200).json({ success: true, data: studentData });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateStudentProgress = async (req, res) => {
    try {
        const { id } = req.params; // student ID
        const { subject, rating } = req.body;

        const teacher = await User.findById(req.user.id);
        if (!teacher.tuitionCenter) return res.status(400).json({ message: 'Teacher is not linked to any Tuition Center' });

        // We translate the qualitative rating back into a numerical score to fit the schema
        let score = 0;
        if (rating === 'Good') score = 90;
        else if (rating === 'Average') score = 65;
        else if (rating === 'Needs Improvement') score = 40;

        const progress = await Progress.create({
            student: id,
            tuitionCenter: teacher.tuitionCenter,
            subject: subject,
            score: score,
            totalMarks: 100,
            remarks: `Teacher marked as: ${rating}`,
            recordedBy: teacher._id
        });

        res.status(200).json({ success: true, data: progress });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
