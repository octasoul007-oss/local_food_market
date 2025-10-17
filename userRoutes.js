const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');

router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/:id', UserController.getProfile);
router.put('/:id', UserController.updateProfile);

module.exports = router;