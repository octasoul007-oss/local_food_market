const FarmerModel = require('../models/farmerModel');

class FarmerController {
  // Get all farmers
  static async getAllFarmers(req, res) {
    try {
      const farmers = await FarmerModel.getAllFarmers();
      res.json(farmers);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch farmers' });
    }
  }

  // Get farmer by ID
  static async getFarmerById(req, res) {
    try {
      const farmer = await FarmerModel.getFarmerById(req.params.id);
      if (!farmer) {
        return res.status(404).json({ error: 'Farmer not found' });
      }
      res.json(farmer);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch farmer' });
    }
  }

  // Search farmers by location
  static async searchByLocation(req, res) {
    try {
      const { latitude, longitude, radius } = req.query;
      const farmers = await FarmerModel.searchByLocation(latitude, longitude, radius);
      res.json(farmers);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to search farmers' });
    }
  }

  // Update farmer profile
  static async updateProfile(req, res) {
    try {
      const userId = req.params.id;
      await FarmerModel.updateProfile(userId, req.body);
      res.json({ message: 'Farmer profile updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update farmer profile' });
    }
  }
}

module.exports = FarmerController;
