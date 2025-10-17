const express = require('express');
const router = express.Router();
const FarmerController = require('../controllers/farmerController');

router.get('/', FarmerController.getAllFarmers);
router.get('/search', FarmerController.searchByLocation);
router.get('/:id', FarmerController.getFarmerById);
router.put('/:id', FarmerController.updateProfile);

module.exports = router;
