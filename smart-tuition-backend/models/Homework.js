const mongoose = require('mongoose');

const homeworkSchema = new mongoose.Schema({
    tuitionCenter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TuitionCenter',
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Homework', homeworkSchema);
