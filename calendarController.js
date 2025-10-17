const CalendarModel = require('../models/calendarModel');

class CalendarController {
  // Add availability
  static async addAvailability(req, res) {
    try {
      const availabilityData = {
        farmer_id: req.body.farmer_id,
        product_id: req.body.product_id || null,
        available_date: req.body.available_date,
        quantity: req.body.quantity || null,
        notes: req.body.notes || null
      };

      const result = await CalendarModel.addAvailability(availabilityData);
      
      res.status(201).json({ 
        message: 'Availability added successfully', 
        availabilityId: result.insertId 
      });
    } catch (error) {
      console.error('Error adding availability:', error);
      res.status(500).json({ 
        error: 'Failed to add availability',
        details: error.message 
      });
    }
  }

  // Get availability by farmer
  static async getAvailabilityByFarmer(req, res) {
    try {
      const { farmerId } = req.params;
      const { startDate, endDate } = req.query;
      
      const availability = await CalendarModel.getAvailabilityByFarmer(farmerId, startDate, endDate);
      res.json(availability);
    } catch (error) {
      console.error('Error fetching availability:', error);
      res.status(500).json({ error: 'Failed to fetch availability' });
    }
  }

  // Get availability by product
  static async getAvailabilityByProduct(req, res) {
    try {
      const availability = await CalendarModel.getAvailabilityByProduct(req.params.productId);
      res.json(availability);
    } catch (error) {
      console.error('Error fetching availability:', error);
      res.status(500).json({ error: 'Failed to fetch availability' });
    }
  }

  // Update availability
  static async updateAvailability(req, res) {
    try {
      await CalendarModel.updateAvailability(req.params.id, req.body);
      res.json({ message: 'Availability updated successfully' });
    } catch (error) {
      console.error('Error updating availability:', error);
      res.status(500).json({ error: 'Failed to update availability' });
    }
  }

  // Delete availability
  static async deleteAvailability(req, res) {
    try {
      await CalendarModel.deleteAvailability(req.params.id);
      res.json({ message: 'Availability deleted successfully' });
    } catch (error) {
      console.error('Error deleting availability:', error);
      res.status(500).json({ error: 'Failed to delete availability' });
    }
  }

  // Get upcoming availability
  static async getUpcomingAvailability(req, res) {
    try {
      const days = req.query.days || 30;
      const availability = await CalendarModel.getUpcomingAvailability(req.params.farmerId, days);
      res.json(availability);
    } catch (error) {
      console.error('Error fetching upcoming availability:', error);
      res.status(500).json({ error: 'Failed to fetch upcoming availability' });
    }
  }
}

module.exports = CalendarController;
