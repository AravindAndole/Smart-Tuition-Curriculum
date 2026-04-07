const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    tuitionCenter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TuitionCenter',
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['Present', 'Absent'],
        required: true
    },
    markedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

// Optional: Ensure a student only has one attendance per day per center
attendanceSchema.index({ student: 1, tuitionCenter: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
