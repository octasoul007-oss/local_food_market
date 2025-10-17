const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productController');

router.post('/', ProductController.createProduct);
router.get('/', ProductController.getAllProducts);
router.get('/search', ProductController.searchProducts);
router.get('/farmer/:farmerId', ProductController.getProductsByFarmer);
router.put('/:id', ProductController.updateProduct);
router.delete('/:id', ProductController.deleteProduct);
router.post('/inventory', ProductController.updateInventory);

module.exports = router;
