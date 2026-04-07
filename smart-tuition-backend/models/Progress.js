const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
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
    subject: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    totalMarks: {
        type: Number,
        required: true
    },
    remarks: {
        type: String
    },
    recordedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Progress', progressSchema);
