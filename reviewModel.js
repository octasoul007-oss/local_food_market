const db = require('../config/db');

class ReviewModel {
  // Create review
  static async createReview(reviewData) {
    const sql = `INSERT INTO reviews (farmer_id, buyer_id, order_id, rating, comment) VALUES (?, ?, ?, ?, ?)`;
    const [result] = await db.execute(sql, [
      reviewData.farmer_id,
      reviewData.buyer_id,
      reviewData.order_id,
      reviewData.rating,
      reviewData.comment
    ]);
    return result;
  }

  // Get reviews for farmer
  static async getReviewsByFarmer(farmer_id) {
    const sql = `SELECT r.*, u.name as buyer_name
                 FROM reviews r
                 JOIN users u ON r.buyer_id = u.id
                 WHERE r.farmer_id = ?
                 ORDER BY r.created_at DESC`;
    const [rows] = await db.execute(sql, [farmer_id]);
    return rows;
  }

  // Get average rating for farmer
  static async getAverageRating(farmer_id) {
    const sql = `SELECT AVG(rating) as average_rating, COUNT(*) as total_reviews FROM reviews WHERE farmer_id = ?`;
    const [rows] = await db.execute(sql, [farmer_id]);
    return rows[0];
  }
}

module.exports = ReviewModel;
