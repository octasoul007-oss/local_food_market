const express = require('express');
const router = express.Router();
const ReviewController = require('../controllers/reviewController');

router.post('/', ReviewController.createReview);
router.get('/farmer/:farmerId', ReviewController.getReviewsByFarmer);

module.exports = router;
