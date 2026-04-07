const User = require('../models/User');
const Message = require('../models/Message');
const Student = require('../models/Student');

// @desc    Get Chat Users List
// @route   GET /api/chat/users
// @access  Private (Teacher, Parent)
exports.getChatUsers = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);
        let usersList = [];

        if (currentUser.role === 'teacher') {
            if (!currentUser.tuitionCenter) return res.status(400).json({ message: 'No center linked' });
            // Fetch parents linked to students in teacher's tuition center
            const students = await Student.find({ tuitionCenter: currentUser.tuitionCenter }).select('_id name');
            const studentIds = students.map(s => s._id);

            const parents = await User.find({ role: 'parent', student: { $in: studentIds } })
                .populate('student', 'name studentId');

            usersList = parents.map(p => ({
                _id: p._id,
                name: p.name,
                role: p.role,
                studentName: p.student ? p.student.name : 'Unknown'
            }));
        } else if (currentUser.role === 'parent') {
            if (!currentUser.student) return res.status(400).json({ message: 'No student linked' });
            const student = await Student.findById(currentUser.student);
            if (!student) return res.status(404).json({ message: 'Student not found' });

            // Fetch the teacher associated with the student's center
            const teacher = await User.findOne({ role: 'teacher', tuitionCenter: student.tuitionCenter });
            if (teacher) {
                usersList = [{
                    _id: teacher._id,
                    name: teacher.name,
                    role: teacher.role,
                    tuitionCenterName: 'Assigned Teacher' // We can populate this if stored
                }];
            }
        } else {
            return res.status(403).json({ message: 'Only Teachers and Parents can use chat' });
        }

        res.status(200).json({ success: true, data: usersList });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Message History
// @route   GET /api/chat/:userId
// @access  Private
exports.getMessageHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.id;

        // Fetch messages between currentUser and the target userId
        const messages = await Message.find({
            $or: [
                { senderId: currentUserId, receiverId: userId },
                { senderId: userId, receiverId: currentUserId }
            ]
        }).sort({ createdAt: 1 }); // Oldest first for chat history

        // Mark received messages as read
        await Message.updateMany(
            { senderId: userId, receiverId: currentUserId, readStatus: false },
            { $set: { readStatus: true } }
        );

        res.status(200).json({ success: true, data: messages });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Send a Message via HTTP Post (Useful for assigning homework from non-chat components)
// @route   POST /api/chat/message
// @access  Private
exports.sendMessage = async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        const senderId = req.user.id;

        if (!receiverId || !content) {
            return res.status(400).json({ message: 'Receiver ID and content are required' });
        }

        const newMessage = await Message.create({
            senderId,
            receiverId,
            content
        });

        // If you need to instantly notify the teacher, emitting from HTTP controllers 
        // usually requires attaching the Socket.io instance to `req.app` in server.js.
        // For now, the database insertion is enough since the teacher will see it 
        // when they open the app or socket polls.

        res.status(201).json({ success: true, data: newMessage });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
