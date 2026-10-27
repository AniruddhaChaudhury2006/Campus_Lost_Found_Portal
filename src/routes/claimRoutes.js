const express = require('express');
const router = express.Router();
const claimController = require('../controllers/claimController');

router.post('/', claimController.submitClaim);
router.get('/queue', claimController.getReviewQueue);
router.get('/user/:userId', claimController.getUserClaims);
router.post('/review', claimController.reviewClaim);
router.post('/handover', claimController.confirmHandover);

module.exports = router;
