const db = require('../config/db');

class CartModel {
  // Add item to cart
  static async addToCart(cartData) {
    // Check if item already exists
    const checkSql = `SELECT * FROM cart WHERE user_id = ? AND product_id = ?`;
    const [existing] = await db.execute(checkSql, [cartData.user_id, cartData.product_id]);
    
    if (existing.length > 0) {
      // Update quantity if item exists
      const updateSql = `UPDATE cart SET quantity = quantity + ? WHERE id = ?`;
      const [result] = await db.execute(updateSql, [cartData.quantity, existing[0].id]);
      return result;
    } else {
      // Insert new item
      const insertSql = `INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)`;
      const [result] = await db.execute(insertSql, [
        cartData.user_id,
        cartData.product_id,
        cartData.quantity
      ]);
      return result;
    }
  }

  // Get cart items for user
  static async getCartByUser(user_id) {
    const sql = `SELECT c.*, p.name, p.price, p.unit, p.image, p.quantity_available,
                 u.name as farmer_name, u.id as farmer_id
                 FROM cart c
                 JOIN products p ON c.product_id = p.id
                 JOIN users u ON p.farmer_id = u.id
                 WHERE c.user_id = ?
                 ORDER BY c.created_at DESC`;
    
    const [rows] = await db.execute(sql, [user_id]);
    return rows;
  }

  // Update cart item quantity
  static async updateCartItem(id, quantity) {
    const sql = `UPDATE cart SET quantity = ? WHERE id = ?`;
    const [result] = await db.execute(sql, [quantity, id]);
    return result;
  }

  // Remove item from cart
  static async removeFromCart(id) {
    const sql = `DELETE FROM cart WHERE id = ?`;
    const [result] = await db.execute(sql, [id]);
    return result;
  }

  // Clear cart for user
  static async clearCart(user_id) {
    const sql = `DELETE FROM cart WHERE user_id = ?`;
    const [result] = await db.execute(sql, [user_id]);
    return result;
  }

  // Get cart count
  static async getCartCount(user_id) {
    const sql = `SELECT COUNT(*) as count, SUM(quantity) as total_items FROM cart WHERE user_id = ?`;
    const [rows] = await db.execute(sql, [user_id]);
    return rows[0];
  }

  // Get cart total
  static async getCartTotal(user_id) {
    const sql = `SELECT SUM(c.quantity * p.price) as total
                 FROM cart c
                 JOIN products p ON c.product_id = p.id
                 WHERE c.user_id = ?`;
    
    const [rows] = await db.execute(sql, [user_id]);
    return rows[0].total || 0;
  }
}

module.exports = CartModel;
