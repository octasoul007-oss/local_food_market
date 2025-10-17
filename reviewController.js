const ReviewModel = require('../models/reviewModel');

class ReviewController {
// Create review
static async createReview(req, res) {
try {
const result = await ReviewModel.createReview(req.body);
res.status(201).json({ message: 'Review submitted successfully', reviewId: result.insertId });
} catch (error) {
console.error(error);
res.status(500).json({ error: 'Failed to submit review' });
}
}

// Get reviews for farmer
static async getReviewsByFarmer(req, res) {
try {
const reviews = await ReviewModel.getReviewsByFarmer(req.params.farmerId);
const rating = await ReviewModel.getAverageRating(req.params.farmerId);
res.json({ reviews, averageRating: rating });
} catch (error) {
console.error(error);
res.status(500).json({ error: 'Failed to fetch reviews' });
}
}
}

module.exports = ReviewController;