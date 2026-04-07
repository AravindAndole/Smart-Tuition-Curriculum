const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String }, // Optional field for Twilio SMS
    role: { type: String, enum: ['teacher', 'parent', 'student'], required: true },
    // Link to TuitionCenter if role is 'teacher'
    tuitionCenter: { type: mongoose.Schema.Types.ObjectId, ref: 'TuitionCenter' },
    // Link to Student if role is 'parent'
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    // Password reset fields
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
