const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// User Authentication Endpoints
router.post('/signin', authController.signin);
router.post('/signup', authController.signin);
router.post('/signout', authController.signout);
router.get('/user/:id', authController.getUserProfile);
router.get('/users', authController.getAllUsers);

module.exports = router;
