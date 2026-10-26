const express = require('express');
const router = express.Router();
const scoutController = require('../controllers/scoutController');
router.post('/chat', scoutController.handleChat);
module.exports = router;