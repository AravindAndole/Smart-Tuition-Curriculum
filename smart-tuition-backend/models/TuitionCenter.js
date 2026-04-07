const mongoose = require('mongoose');

const tuitionCenterSchema = new mongoose.Schema({
    name: { type: String, required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('TuitionCenter', tuitionCenterSchema);
