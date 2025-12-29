const express = require('express');
const router = express.Router();
const aiController = require('../controller/aiController');
const authMiddleware = require('../../../kernels/middlewares/authMiddleware');

/**
 * @route POST /api/v1/ai/chat
 * @desc Chat with AI and get related images
 * @access Public (can be used by anyone, even guests)
 */
router.post(
  '/chat',
  aiController.chatWithAI
);

/**
 * @route POST /api/v1/ai/simple-chat
 * @desc Simple chat with AI without images
 * @access Public
 */
router.post(
  '/simple-chat',
  aiController.simpleChat
);

module.exports = router;
