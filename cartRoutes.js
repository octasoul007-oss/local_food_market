const express = require('express');
const router = express.Router();
const CartController = require('../controllers/cartController');

router.post('/', CartController.addToCart);
router.get('/user/:userId', CartController.getCart);
router.get('/user/:userId/count', CartController.getCartCount);
router.put('/:id', CartController.updateCartItem);
router.delete('/:id', CartController.removeFromCart);
router.delete('/user/:userId/clear', CartController.clearCart);

module.exports = router;
