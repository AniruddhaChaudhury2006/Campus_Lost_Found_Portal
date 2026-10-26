const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const upload = require('../middleware/uploadMiddleware');
router.get('/', itemController.getItems);
router.post('/', upload.single('image'), itemController.createItem);
module.exports = router;