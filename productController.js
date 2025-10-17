const ProductModel = require('../models/productModel');

class ProductController {
  // Create product
  static async createProduct(req, res) {
    try {
      console.log('Received product data:', req.body); // Debug log
      
      const result = await ProductModel.createProduct(req.body);
      
      console.log('Product created:', result); // Debug log
      
      res.status(201).json({ 
        message: 'Product created successfully', 
        productId: result.insertId 
      });
    } catch (error) {
      console.error('Error in createProduct controller:', error);
      res.status(500).json({ 
        error: 'Failed to create product',
        details: error.message 
      });
    }
  }

  // Get all products
  static async getAllProducts(req, res) {
    try {
      const products = await ProductModel.getAllProducts();
      res.json(products);
    } catch (error) {
      console.error('Error in getAllProducts:', error);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  }

  // Get products by farmer
  static async getProductsByFarmer(req, res) {
    try {
      const products = await ProductModel.getProductsByFarmer(req.params.farmerId);
      res.json(products);
    } catch (error) {
      console.error('Error in getProductsByFarmer:', error);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  }

  // Search products
  static async searchProducts(req, res) {
    try {
      const { search, category } = req.query;
      const products = await ProductModel.searchProducts(search, category);
      res.json(products);
    } catch (error) {
      console.error('Error in searchProducts:', error);
      res.status(500).json({ error: 'Failed to search products' });
    }
  }

  // Update product
  static async updateProduct(req, res) {
    try {
      await ProductModel.updateProduct(req.params.id, req.body);
      res.json({ message: 'Product updated successfully' });
    } catch (error) {
      console.error('Error in updateProduct:', error);
      res.status(500).json({ error: 'Failed to update product' });
    }
  }

  // Delete product
  static async deleteProduct(req, res) {
    try {
      await ProductModel.deleteProduct(req.params.id);
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Error in deleteProduct:', error);
      res.status(500).json({ error: 'Failed to delete product' });
    }
  }

  // Update inventory
  static async updateInventory(req, res) {
    try {
      const { product_id, quantity_change, change_type } = req.body;
      await ProductModel.updateInventory(product_id, quantity_change, change_type);
      res.json({ message: 'Inventory updated successfully' });
    } catch (error) {
      console.error('Error in updateInventory:', error);
      res.status(500).json({ error: 'Failed to update inventory' });
    }
  }
}

module.exports = ProductController;