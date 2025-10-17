const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');

router.post('/', OrderController.createOrder);
router.get('/buyer/:buyerId', OrderController.getOrdersByBuyer);
router.get('/farmer/:farmerId', OrderController.getOrdersByFarmer);
router.get('/:id', OrderController.getOrderDetails);
router.put('/:id/status', OrderController.updateOrderStatus);

module.exports = router;
