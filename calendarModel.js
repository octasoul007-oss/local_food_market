const db = require('../config/db');

class CalendarModel {
  // Add availability entry
  static async addAvailability(availabilityData) {
    const sql = `INSERT INTO availability_calendar (farmer_id, product_id, available_date, quantity, notes) 
                 VALUES (?, ?, ?, ?, ?)`;
    
    const [result] = await db.execute(sql, [
      availabilityData.farmer_id,
      availabilityData.product_id || null,
      availabilityData.available_date,
      availabilityData.quantity || null,
      availabilityData.notes || null
    ]);
    
    return result;
  }

  // Get availability by farmer
  static async getAvailabilityByFarmer(farmer_id, startDate, endDate) {
    let sql = `SELECT ac.*, p.name as product_name, p.price, p.unit
               FROM availability_calendar ac
               LEFT JOIN products p ON ac.product_id = p.id
               WHERE ac.farmer_id = ?`;
    
    const params = [farmer_id];
    
    if (startDate && endDate) {
      sql += ` AND ac.available_date BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    }
    
    sql += ` ORDER BY ac.available_date ASC`;
    
    const [rows] = await db.execute(sql, params);
    return rows;
  }

  // Get availability by product
  static async getAvailabilityByProduct(product_id) {
    const sql = `SELECT ac.*, u.name as farmer_name, u.city, u.state
                 FROM availability_calendar ac
                 JOIN users u ON ac.farmer_id = u.id
                 WHERE ac.product_id = ? AND ac.available_date >= CURDATE()
                 ORDER BY ac.available_date ASC`;
    
    const [rows] = await db.execute(sql, [product_id]);
    return rows;
  }

  // Update availability
  static async updateAvailability(id, availabilityData) {
    const sql = `UPDATE availability_calendar 
                 SET available_date = ?, quantity = ?, notes = ? 
                 WHERE id = ?`;
    
    const [result] = await db.execute(sql, [
      availabilityData.available_date,
      availabilityData.quantity,
      availabilityData.notes,
      id
    ]);
    
    return result;
  }

  // Delete availability
  static async deleteAvailability(id) {
    const sql = `DELETE FROM availability_calendar WHERE id = ?`;
    const [result] = await db.execute(sql, [id]);
    return result;
  }

  // Get upcoming availability
  static async getUpcomingAvailability(farmer_id, days = 30) {
    const sql = `SELECT ac.*, p.name as product_name, p.price, p.unit
                 FROM availability_calendar ac
                 LEFT JOIN products p ON ac.product_id = p.id
                 WHERE ac.farmer_id = ? 
                 AND ac.available_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
                 ORDER BY ac.available_date ASC`;
    
    const [rows] = await db.execute(sql, [farmer_id, days]);
    return rows;
  }
}

module.exports = CalendarModel;
