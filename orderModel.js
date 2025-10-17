const db = require('../config/db');

class OrderModel {
  // Create order
  static async createOrder(orderData) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Create order
      const orderSql = `INSERT INTO orders (buyer_id, farmer_id, total_amount, delivery_address, delivery_date, notes) 
                        VALUES (?, ?, ?, ?, ?, ?)`;
      const [orderResult] = await connection.execute(orderSql, [
        orderData.buyer_id,
        orderData.farmer_id,
        orderData.total_amount,
        orderData.delivery_address,
        orderData.delivery_date,
        orderData.notes
      ]);

      const orderId = orderResult.insertId;

      // Create order items
      for (const item of orderData.items) {
        const itemSql = `INSERT INTO order_items (order_id, product_id, quantity, price, subtotal) VALUES (?, ?, ?, ?, ?)`;
        await connection.execute(itemSql, [
          orderId,
          item.product_id,
          item.quantity,
          item.price,
          item.subtotal
        ]);

        // Update product inventory
        const updateSql = `UPDATE products SET quantity_available = quantity_available - ? WHERE id = ?`;
        await connection.execute(updateSql, [item.quantity, item.product_id]);

        // Log inventory change
        const logSql = `INSERT INTO inventory_logs (product_id, change_type, quantity_change) VALUES (?, 'sale', ?)`;
        await connection.execute(logSql, [item.product_id, item.quantity]);
      }

      await connection.commit();
      return orderId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Get orders by buyer
  static async getOrdersByBuyer(buyer_id) {
    const sql = `SELECT o.*, u.name as farmer_name, u.phone as farmer_phone
                 FROM orders o
                 JOIN users u ON o.farmer_id = u.id
                 WHERE o.buyer_id = ?
                 ORDER BY o.created_at DESC`;
    const [rows] = await db.execute(sql, [buyer_id]);
    return rows;
  }

  // Get orders by farmer
  static async getOrdersByFarmer(farmer_id) {
    const sql = `SELECT o.*, u.name as buyer_name, u.phone as buyer_phone
                 FROM orders o
                 JOIN users u ON o.buyer_id = u.id
                 WHERE o.farmer_id = ?
                 ORDER BY o.created_at DESC`;
    const [rows] = await db.execute(sql, [farmer_id]);
    return rows;
  }

  // Get order details with items
  static async getOrderDetails(order_id) {
    const orderSql = `SELECT o.*, u1.name as buyer_name, u2.name as farmer_name
                      FROM orders o
                      JOIN users u1 ON o.buyer_id = u1.id
                      JOIN users u2 ON o.farmer_id = u2.id
                      WHERE o.id = ?`;
    const [orderRows] = await db.execute(orderSql, [order_id]);

    if (orderRows.length === 0) return null;

    const itemsSql = `SELECT oi.*, p.name as product_name
                      FROM order_items oi
                      JOIN products p ON oi.product_id = p.id
                      WHERE oi.order_id = ?`;
    const [itemRows] = await db.execute(itemsSql, [order_id]);

    return {
      ...orderRows[0],
      items: itemRows
    };
  }

  // Update order status
  static async updateOrderStatus(order_id, status) {
    const sql = `UPDATE orders SET status = ? WHERE id = ?`;
    const [result] = await db.execute(sql, [status, order_id]);
    return result;
  }
}

module.exports = OrderModel;
