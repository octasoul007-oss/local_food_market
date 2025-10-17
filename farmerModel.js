const db = require('../config/db');

class FarmerModel {
  // Create farmer profile
  static async createProfile(profileData) {
    const sql = `INSERT INTO farmer_profiles (user_id, farm_name, farm_size, farm_description) 
                 VALUES (?, ?, ?, ?)`;
    const [result] = await db.execute(sql, [
      profileData.user_id,
      profileData.farm_name,
      profileData.farm_size,
      profileData.farm_description
    ]);
    return result;
  }

  // Get all farmers with location
  static async getAllFarmers() {
    const sql = `SELECT u.id, u.name, u.email, u.phone, u.city, u.state, u.latitude, u.longitude,
                 fp.farm_name, fp.farm_size, fp.farm_description, fp.is_verified
                 FROM users u
                 LEFT JOIN farmer_profiles fp ON u.id = fp.user_id
                 WHERE u.user_type = 'farmer'`;
    const [rows] = await db.execute(sql);
    return rows;
  }

  // Get farmer by ID with profile
  static async getFarmerById(id) {
    const sql = `SELECT u.*, fp.farm_name, fp.farm_size, fp.farm_description, fp.is_verified
                 FROM users u
                 LEFT JOIN farmer_profiles fp ON u.id = fp.user_id
                 WHERE u.id = ? AND u.user_type = 'farmer'`;
    const [rows] = await db.execute(sql, [id]);
    return rows[0];
  }

  // Search farmers by location
  static async searchByLocation(latitude, longitude, radius = 50) {
    const sql = `SELECT u.id, u.name, u.email, u.phone, u.city, u.state, u.latitude, u.longitude,
                 fp.farm_name, fp.farm_description, fp.delivery_radius,
                 (6371 * acos(cos(radians(?)) * cos(radians(u.latitude)) * cos(radians(u.longitude) - radians(?)) + sin(radians(?)) * sin(radians(u.latitude)))) AS distance
                 FROM users u
                 LEFT JOIN farmer_profiles fp ON u.id = fp.user_id
                 WHERE u.user_type = 'farmer'
                 HAVING distance < ?
                 ORDER BY distance`;
    const [rows] = await db.execute(sql, [latitude, longitude, latitude, radius]);
    return rows;
  }

  // Update farmer profile
  static async updateProfile(user_id, profileData) {
    const sql = `UPDATE farmer_profiles SET farm_name = ?, farm_size = ?, farm_description = ?, delivery_radius = ?, profile_image = ? WHERE user_id = ?`;
    const [result] = await db.execute(sql, [
      profileData.farm_name,
      profileData.farm_size,
      profileData.farm_description,
      user_id
    ]);
    return result;
  }
}

module.exports = FarmerModel;
