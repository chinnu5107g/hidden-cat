const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateUsername } = require('../middleware/authMiddleware');

router.post('/login', authController.login);
router.get('/profile', validateUsername, authController.getProfile);
router.put('/profile', validateUsername, authController.updateProfile);

module.exports = router;
