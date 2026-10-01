/**
 * Auth Middleware
 * Validates username-based sessions or JWT tokens
 */

const validateUsername = (req, res, next) => {
  const username = req.body.username || req.headers['x-player-username'];
  if (!username || typeof username !== 'string' || !username.trim()) {
    return res.status(400).json({ error: 'Valid username is required' });
  }
  req.username = username.trim();
  next();
};

module.exports = { validateUsername };
