const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const upload = require('../middleware/uploadMiddleware');

router.get('/', itemController.getItems);
router.get('/:id', itemController.getItemById);
router.post('/', upload.single('image'), itemController.createItem);
router.put('/:id', itemController.updateItem);
router.delete('/:id', itemController.deleteItem);

module.exports = router;
