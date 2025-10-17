const db = require('../config/db');

class ProductModel {
  // Create product
  static async createProduct(productData) {
    const sql = `INSERT INTO products (farmer_id, name, category, description, price, unit, quantity_available, is_organic) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await db.execute(sql, [
      productData.farmer_id,
      productData.name,
      productData.category,
      productData.description,
      productData.price,
      productData.unit,
      productData.quantity_available,
      productData.is_organic
    ]);
    return result;
  }

  // Get all products
  static async getAllProducts() {
    const sql = `SELECT p.*, u.name as farmer_name, u.city, u.state, u.latitude, u.longitude
                 FROM products p
                 JOIN users u ON p.farmer_id = u.id
                 WHERE p.is_available = TRUE
                 ORDER BY p.created_at DESC`;
    const [rows] = await db.execute(sql);
    return rows;
  }

  // Get products by farmer
  static async getProductsByFarmer(farmer_id) {
    const sql = `SELECT * FROM products WHERE farmer_id = ? ORDER BY created_at DESC`;
    const [rows] = await db.execute(sql, [farmer_id]);
    return rows;
  }

  // Search products
  static async searchProducts(searchTerm, category) {
    let sql = `SELECT p.*, u.name as farmer_name, u.city, u.state
               FROM products p
               JOIN users u ON p.farmer_id = u.id
               WHERE p.is_available = TRUE`;
    const params = [];

    if (searchTerm) {
      sql += ` AND (p.name LIKE ? OR p.description LIKE ?)`;
      params.push(`%${searchTerm}%`, `%${searchTerm}%`);
    }

    if (category) {
      sql += ` AND p.category = ?`;
      params.push(category);
    }

    sql += ` ORDER BY p.created_at DESC`;
    const [rows] = await db.execute(sql, params);
    return rows;
  }

  // Update product
  static async updateProduct(id, productData) {
    const sql = `UPDATE products SET name = ?, category = ?, description = ?, price = ?, unit = ?, is_organic = ?, is_available = ? `;
    const [result] = await db.execute(sql, [
      productData.name,
      productData.category,
      productData.description,
      productData.price,
      productData.unit,
      productData.is_organic,
      productData.is_available
    ]);
    return result;
  }

  // Delete product
  static async deleteProduct(id) {
    const sql = `DELETE FROM products WHERE id = ?`;
    const [result] = await db.execute(sql, [id]);
    return result;
  }

  // Update inventory
  static async updateInventory(product_id, quantity_change, change_type) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Update product quantity
      const updateSql = `UPDATE products SET quantity_available = quantity_available + ? WHERE id = ?`;
      await connection.execute(updateSql, [quantity_change, product_id]);

      // Log inventory change
      const logSql = `INSERT INTO inventory_logs (product_id, change_type, quantity_change) VALUES (?, ?, ?)`;
      await connection.execute(logSql, [product_id, change_type, Math.abs(quantity_change)]);

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = ProductModel;
