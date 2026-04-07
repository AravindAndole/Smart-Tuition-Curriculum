const User = require('../models/User');
const TuitionCenter = require('../models/TuitionCenter');
const Student = require('../models/Student');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: '30d'
    });
};

exports.registerTeacher = async (req, res) => {
    try {
        let { name, email, password, tuitionCenterName } = req.body;
        email = email.trim();

        const userExists = await User.findOne({ email: new RegExp('^' + email + '$', 'i') });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'teacher'
        });

        const tuitionCenter = await TuitionCenter.create({
            name: tuitionCenterName,
            teacher: user._id
        });

        // Link tuition center back to user mapping
        user.tuitionCenter = tuitionCenter._id;
        await user.save();

        res.status(201).json({
            success: true,
            token: generateToken(user._id, user.role),
            user: { id: user._id, name: user.name, role: user.role, tuitionCenter: tuitionCenter._id }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.registerParent = async (req, res) => {
    try {
        let { name, email, password, studentId } = req.body;
        email = email.trim();

        // Check if student exists
        const student = await Student.findOne({ studentId });
        if (!student) return res.status(404).json({ message: 'Student ID not found' });

        const userExists = await User.findOne({ email: new RegExp('^' + email + '$', 'i') });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'parent',
            student: student._id
        });

        res.status(201).json({
            success: true,
            token: generateToken(user._id, user.role),
            user: { id: user._id, name: user.name, role: user.role, student: student._id }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        let { email, password } = req.body;
        email = email.trim();

        const user = await User.findOne({ email: new RegExp('^' + email + '$', 'i') });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        let userPayload = { id: user._id, name: user.name, role: user.role };
        
        // Append role-specific relations required by frontend Dashboard routing
        if (user.role === 'teacher' && user.tuitionCenter) {
            userPayload.tuitionCenter = user.tuitionCenter;
        } else if (user.role === 'parent' && user.student) {
            userPayload.student = user.student;
        } else if (user.role === 'student' && user.student) {
            userPayload.student = user.student;
        }

        res.status(200).json({
            success: true,
            token: generateToken(user._id, user.role),
            user: userPayload
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createStudent = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Only fetch teachers tuition center
        const teacher = await User.findById(req.user.id);
        if (!teacher.tuitionCenter) return res.status(400).json({ message: 'Teacher is not linked to any Tuition Center' });

        // 1. Determine Credentials Support Manual vs Auto
        const uniqueId = Math.floor(1000 + Math.random() * 9000); // 4 digit random code
        const generatedUsername = `stu${uniqueId}_${name.replace(/\s+/g, '').toLowerCase()}`;
        
        let finalEmail = email ? email.trim() : `${generatedUsername}@tuition.local`;
        let finalPassword = password ? password : Math.random().toString(36).slice(-8);

        // If manual email, check if exists
        const userExists = await User.findOne({ email: new RegExp('^' + finalEmail + '$', 'i') });
        if (userExists) return res.status(400).json({ message: 'Email already exists. Try another.' });

        // 2. Create Student DB Profile
        const studentProfile = await Student.create({
            studentId: generatedUsername, // Internal usage
            name: name,
            tuitionCenter: teacher.tuitionCenter
        });

        // 3. Create Student User Account
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(finalPassword, salt);

        const studentUser = await User.create({
            name,
            email: finalEmail,
            password: hashedPassword,
            role: 'student',
            student: studentProfile._id
        });

        res.status(201).json({
            success: true,
            message: 'Student account generated successfully',
            data: {
                _id: studentProfile._id,
                name: studentProfile.name,
                loginEmail: finalEmail, // Share this with the student
                password: finalPassword, // Share this with the student
                studentId: studentProfile.studentId
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        let userPayload = { id: user._id, name: user.name, role: user.role };
        
        if (user.role === 'teacher' && user.tuitionCenter) {
            userPayload.tuitionCenter = user.tuitionCenter;
        } else if (user.role === 'parent' && user.student) {
            userPayload.student = user.student;
        } else if (user.role === 'student' && user.student) {
            userPayload.student = user.student;
        }

        res.status(200).json({
            success: true,
            data: userPayload
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        let { email } = req.body;
        email = email.trim();

        const user = await User.findOne({ email: new RegExp('^' + email + '$', 'i') });
        if (!user) {
            return res.status(404).json({ message: 'User with that email does not exist' });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        await user.save();

        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
        
        console.log(`\n\n---------------------------------`);
        console.log(`Password reset requested for ${email}`);
        console.log(`Reset URL: ${resetUrl}`);
        console.log(`---------------------------------\n\n`);

        res.status(200).json({
            success: true,
            message: 'Password reset link generated. Check server console or developer tools if real email is not configured.',
            resetUrl 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { password } = req.body;
        const resetToken = req.params.token;

        const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpires: { $gt: Date.now() } 
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired password reset token' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password successfully reset'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
