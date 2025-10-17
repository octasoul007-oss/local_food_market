const express = require('express');
const router = express.Router();
const CalendarController = require('../controllers/calendarController');

router.post('/', CalendarController.addAvailability);
router.get('/farmer/:farmerId', CalendarController.getAvailabilityByFarmer);
router.get('/product/:productId', CalendarController.getAvailabilityByProduct);
router.get('/farmer/:farmerId/upcoming', CalendarController.getUpcomingAvailability);
router.put('/:id', CalendarController.updateAvailability);
router.delete('/:id', CalendarController.deleteAvailability);

module.exports = router;
