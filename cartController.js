const CartModel = require('../models/cartModel');

class CartController {
  // Add to cart
  static async addToCart(req, res) {
    try {
      const cartData = {
        user_id: req.body.user_id,
        product_id: req.body.product_id,
        quantity: req.body.quantity || 1
      };

      await CartModel.addToCart(cartData);
      
      res.status(201).json({ 
        message: 'Product added to cart successfully'
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      res.status(500).json({ 
        error: 'Failed to add to cart',
        details: error.message 
      });
    }
  }

  // Get cart items
  static async getCart(req, res) {
    try {
      const cartItems = await CartModel.getCartByUser(req.params.userId);
      const total = await CartModel.getCartTotal(req.params.userId);
      
      res.json({
        items: cartItems,
        total: total
      });
    } catch (error) {
      console.error('Error fetching cart:', error);
      res.status(500).json({ error: 'Failed to fetch cart' });
    }
  }

  // Update cart item
  static async updateCartItem(req, res) {
    try {
      await CartModel.updateCartItem(req.params.id, req.body.quantity);
      res.json({ message: 'Cart updated successfully' });
    } catch (error) {
      console.error('Error updating cart:', error);
      res.status(500).json({ error: 'Failed to update cart' });
    }
  }

  // Remove from cart
  static async removeFromCart(req, res) {
    try {
      await CartModel.removeFromCart(req.params.id);
      res.json({ message: 'Item removed from cart' });
    } catch (error) {
      console.error('Error removing from cart:', error);
      res.status(500).json({ error: 'Failed to remove from cart' });
    }
  }

  // Clear cart
  static async clearCart(req, res) {
    try {
      await CartModel.clearCart(req.params.userId);
      res.json({ message: 'Cart cleared successfully' });
    } catch (error) {
      console.error('Error clearing cart:', error);
      res.status(500).json({ error: 'Failed to clear cart' });
    }
  }

  // Get cart count
  static async getCartCount(req, res) {
    try {
      const count = await CartModel.getCartCount(req.params.userId);
      res.json(count);
    } catch (error) {
      console.error('Error fetching cart count:', error);
      res.status(500).json({ error: 'Failed to fetch cart count' });
    }
  }
}

module.exports = CartController;
