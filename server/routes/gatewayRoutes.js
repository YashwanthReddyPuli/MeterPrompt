const express = require('express');
const router = express.Router();
const { handleChatCompletion } = require('../controllers/gatewayController');

router.post('/chat/completions', handleChatCompletion);

module.exports = router;
