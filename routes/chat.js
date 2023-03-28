const express = require('express');

const chatController = require('../controllers/chat');

const router = express.Router();

router.get('/chat', chatController.getChat);

module.exports = router;