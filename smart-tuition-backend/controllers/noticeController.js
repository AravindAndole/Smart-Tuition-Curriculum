const Notice = require('../models/Notice');
const User = require('../models/User');

exports.createNotice = async (req, res) => {
    try {
        const { title, content } = req.body;

        // Ensure user is teacher
        const teacher = await User.findById(req.user.id);
        if (teacher.role !== 'teacher') {
            return res.status(403).json({ message: 'Only teachers can create notices' });
        }

        if (!teacher.tuitionCenter) {
            return res.status(400).json({ message: 'Teacher is not linked to any Tuition Center' });
        }

        const notice = await Notice.create({
            title,
            content,
            tuitionCenter: teacher.tuitionCenter,
            postedBy: teacher._id
        });

        res.status(201).json({
            success: true,
            data: notice
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getNotices = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('student');
        let centerId;

        // Determine user's center based on role
        if (user.role === 'teacher') {
            centerId = user.tuitionCenter;
        } else if (user.role === 'student') {
            centerId = user.student.tuitionCenter;
        } else if (user.role === 'parent') {
            // Parent's child determines the center
            const studentUser = await User.findById(user.student).populate('student');
            // Actually user.student from token is the profile ObjectId, not User. Let's fetch directly:
            const Student = require('../models/Student');
            const studentProfile = await Student.findById(user.student);
            centerId = studentProfile.tuitionCenter;
        }

        if (!centerId) {
            return res.status(400).json({ message: 'Could not determine tuition center scope' });
        }

        const notices = await Notice.find({ tuitionCenter: centerId })
            .sort({ date: -1 }) // newest first
            .populate('postedBy', 'name');

        res.status(200).json({
            success: true,
            count: notices.length,
            data: notices
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
