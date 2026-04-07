const express = require('express');
const router = express.Router();
const { createNotice, getNotices } = require('../controllers/noticeController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createNotice)
    .get(protect, getNotices);

module.exports = router;
