const db = require('../config/db');

class UserModel {
  // Create new user
  static async createUser(userData) {
    const sql = `INSERT INTO users (email, password, user_type, name, phone, address, city, state) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await db.execute(sql, [
      userData.email,
      userData.password,
      userData.user_type,
      userData.name,
      userData.phone,
      userData.address,
      userData.city,
      userData.state
    ]);
    return result;
  }

  // Find user by email
  static async findByEmail(email) {
    const sql = `SELECT * FROM users WHERE email = ?`;
    const [rows] = await db.execute(sql, [email]);
    return rows[0];
  }

  // Find user by ID
  static async findById(id) {
    const sql = `SELECT * FROM users WHERE id = ?`;
    const [rows] = await db.execute(sql, [id]);
    return rows[0];
  }

  // Update user
  static async updateUser(id, userData) {
    const sql = `UPDATE users SET name = ?, phone = ?, address = ?, city = ?, state = ?`;
    const [result] = await db.execute(sql, [
      userData.name,
      userData.phone,
      userData.address,
      userData.city,
      userData.state
    ]);
    return result;
  }

  // Get all buyers
  static async getAllBuyers() {
    const sql = `SELECT id, name, email, phone, city, state FROM users WHERE user_type = 'buyer'`;
    const [rows] = await db.execute(sql);
    return rows;
  }
}

module.exports = UserModel;
