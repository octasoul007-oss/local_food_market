const OrderModel = require('../models/orderModel');

class OrderController {
  // Create order
  static async createOrder(req, res) {
    try {
      const orderId = await OrderModel.createOrder(req.body);
      res.status(201).json({ message: 'Order created successfully', orderId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create order' });
    }
  }

  // Get orders by buyer
  static async getOrdersByBuyer(req, res) {
    try {
      const orders = await OrderModel.getOrdersByBuyer(req.params.buyerId);
      res.json(orders);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  }

  // Get orders by farmer
  static async getOrdersByFarmer(req, res) {
    try {
      const orders = await OrderModel.getOrdersByFarmer(req.params.farmerId);
      res.json(orders);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  }

  // Get order details
  static async getOrderDetails(req, res) {
    try {
      const order = await OrderModel.getOrderDetails(req.params.id);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.json(order);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch order details' });
    }
  }

  // Update order status
  static async updateOrderStatus(req, res) {
    try {
      await OrderModel.updateOrderStatus(req.params.id, req.body.status);
      res.json({ message: 'Order status updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update order status' });
    }
  }
}

module.exports = OrderController;
