const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
    tuitionCenter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TuitionCenter',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Notice', noticeSchema);
