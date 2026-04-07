const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    studentId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    tuitionCenter: { type: mongoose.Schema.Types.ObjectId, ref: 'TuitionCenter', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
