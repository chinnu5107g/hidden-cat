const express = require('express');
const router = express.Router();
const scoreController = require('../controllers/scoreController');

router.post('/submit', scoreController.submitScore);
router.get('/leaderboard', scoreController.getLeaderboard);

module.exports = router;
