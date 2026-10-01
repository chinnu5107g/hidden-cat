const User = require('../models/User');

const login = (req, res) => {
  const { username } = req.body;
  if (!username || !username.trim()) {
    return res.status(400).json({ error: 'Username cannot be blank' });
  }

  const user = User.findOrCreate(username);
  return res.json({
    message: 'Welcome to the Cat Kingdom!',
    user
  });
};

const getProfile = (req, res) => {
  const user = User.findByUsername(req.username);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.json({ user });
};

const updateProfile = (req, res) => {
  const { avatar, newUsername } = req.body;
  const updates = {};
  if (avatar) updates.avatar = avatar;
  if (newUsername && newUsername.trim()) updates.username = newUsername.trim();

  const updated = User.update(req.username, updates);
  return res.json({ user: updated });
};

module.exports = {
  login,
  getProfile,
  updateProfile
};
