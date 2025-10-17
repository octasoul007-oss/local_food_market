const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const FarmerModel = require('../models/farmerModel');

class UserController {
  // Register user
  static async register(req, res) {
    try {
      const { email, password, user_type, name, phone, address, city, state, pincode, latitude, longitude } = req.body;

      // Check if user exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const userData = {
        email,
        password: hashedPassword,
        user_type,
        name,
        phone,
        address,
        city,
        state,
        pincode,
        latitude,
        longitude
      };

      const result = await UserModel.createUser(userData);
      const userId = result.insertId;

      // If farmer, create profile
      if (user_type === 'farmer' && req.body.farm_name) {
        await FarmerModel.createProfile({
          user_id: userId,
          farm_name: req.body.farm_name,
          farm_size: req.body.farm_size,
          farm_description: req.body.farm_description,
          delivery_radius: req.body.delivery_radius || 50,
          profile_image: req.body.profile_image
        });
      }

      res.status(201).json({ message: 'User registered successfully', userId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }

  // Login user
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate token
      const token = jwt.sign(
        { userId: user.id, email: user.email, user_type: user.user_type },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          user_type: user.user_type
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Login failed' });
    }
  }

  // Get user profile
  static async getProfile(req, res) {
    try {
      const userId = req.params.id;
      const user = await UserModel.findById(userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      delete user.password;
      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  }

  // Update user profile
  static async updateProfile(req, res) {
    try {
      const userId = req.params.id;
      const userData = req.body;

      await UserModel.updateUser(userId, userData);
      res.json({ message: 'Profile updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
}

module.exports = UserController;
