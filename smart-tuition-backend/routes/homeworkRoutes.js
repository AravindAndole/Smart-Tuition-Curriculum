const express = require('express');
const router = express.Router();
const { createHomework, getHomework, getPendingRequests } = require('../controllers/homeworkController');
const { protect } = require('../middleware/authMiddleware');

router.get('/pending', protect, getPendingRequests);

router.route('/')
    .post(protect, createHomework)
    .get(protect, getHomework);

module.exports = router;
