const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
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
    month: {
        type: String, // e.g., 'April 2024'
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Paid', 'Unpaid'],
        default: 'Unpaid'
    },
    markedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

// Ensure a student only has one fee record per month per center
feeSchema.index({ student: 1, tuitionCenter: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Fee', feeSchema);
