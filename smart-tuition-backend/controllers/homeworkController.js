const Homework = require('../models/Homework');
const User = require('../models/User');
const Message = require('../models/Message');
const Student = require('../models/Student');

exports.createHomework = async (req, res) => {
    try {
        const { subject, title, description, dueDate, requestMessageId } = req.body;

        const teacher = await User.findById(req.user.id);
        if (teacher.role !== 'teacher') {
            return res.status(403).json({ message: 'Only teachers can assign homework' });
        }

        if (!teacher.tuitionCenter) {
            return res.status(400).json({ message: 'Teacher is not linked to any Tuition Center' });
        }

        const homework = await Homework.create({
            subject,
            title,
            description,
            dueDate,
            tuitionCenter: teacher.tuitionCenter,
            assignedBy: teacher._id
        });

        // If this homework was generated from a parent request, mark it as accepted
        if (requestMessageId) {
            const message = await Message.findOne({ _id: requestMessageId, receiverId: teacher._id });
            if (message && message.content.startsWith('[Homework Assignment Request]:')) {
                message.content = message.content.replace('[Homework Assignment Request]:', '[Accepted] [Homework Assignment Request]:');
                await message.save();
            }
        }

        res.status(201).json({
            success: true,
            data: homework
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getHomework = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('student');
        let centerId;

        // Determine center based on role
        if (user.role === 'teacher') {
            centerId = user.tuitionCenter;
        } else if (user.role === 'student') {
            centerId = user.student.tuitionCenter;
        } else if (user.role === 'parent') {
            const Student = require('../models/Student');
            const studentProfile = await Student.findById(user.student);
            centerId = studentProfile.tuitionCenter;
        }

        if (!centerId) {
            return res.status(400).json({ message: 'Could not determine tuition center scope' });
        }

        const homework = await Homework.find({ tuitionCenter: centerId })
            .sort({ dueDate: 1 }) // Soonest due first
            .populate('assignedBy', 'name');

        res.status(200).json({
            success: true,
            count: homework.length,
            data: homework
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getPendingRequests = async (req, res) => {
    try {
        const teacherId = req.user.id;
        
        // Find all messages sent to this teacher that are specifically homework requests
        // and have NOT been accepted yet.
        const pendingMessages = await Message.find({
            receiverId: teacherId,
            content: { $regex: '^^\\[Homework Assignment Request\\]:', $options: 'm' }
        })
        .populate('senderId', 'name student')
        .sort({ createdAt: -1 });

        // We also want to give the teacher the student's name for context
        const requests = await Promise.all(pendingMessages.map(async (msg) => {
            let studentName = 'Unknown Student';
            if (msg.senderId && msg.senderId.student) {
                const studentData = await Student.findById(msg.senderId.student);
                if (studentData) {
                    studentName = studentData.name;
                }
            }

            // Clean the prompt prefix out of the description for the UI
            const description = msg.content.replace('[Homework Assignment Request]: ', '').trim();

            return {
                _id: msg._id,
                parentName: msg.senderId ? msg.senderId.name : 'Unknown Parent',
                studentName: studentName,
                description: description,
                date: msg.createdAt
            };
        }));

        res.status(200).json({
            success: true,
            count: requests.length,
            data: requests
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
