const express = require('express');
const { getChatUsers, getMessageHistory, sendMessage } = require('../controllers/chatController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/users', protect, authorize('teacher', 'parent'), getChatUsers);
router.get('/:userId', protect, authorize('teacher', 'parent'), getMessageHistory);
router.post('/message', protect, authorize('teacher', 'parent'), sendMessage);

module.exports = router;
