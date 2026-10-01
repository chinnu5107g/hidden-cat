const User = require('../models/User');

const submitScore = (req, res) => {
  const { username, score, level, timeSeconds, catsFound, livesSaved } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Username required' });
  }

  const user = User.findOrCreate(username);
  user.gamesPlayed++;
  user.catsFound += (catsFound || 0);
  user.livesSaved += (livesSaved || 0);

  if (score > user.bestScore) {
    user.bestScore = score;
  }
  if (!user.bestTime || timeSeconds < user.bestTime) {
    user.bestTime = timeSeconds;
  }
  if (level > user.highestLevel) {
    user.highestLevel = level;
  }

  return res.json({ message: 'Score recorded!', user });
};

const getLeaderboard = (req, res) => {
  const allUsers = User.getAll();
  // Sort descending by score
  const sorted = allUsers
    .filter(u => u.bestScore > 0)
    .sort((a, b) => b.bestScore - a.bestScore)
    .map((u, idx) => ({
      rank: idx + 1,
      username: u.username,
      avatar: u.avatar,
      score: u.bestScore,
      level: u.highestLevel.toString().padStart(2, '0'),
      time: u.bestTime ? `${Math.floor(u.bestTime / 60)}:${(u.bestTime % 60).toString().padStart(2, '0')}` : '--:--'
    }));

  return res.json({ leaderboard: sorted });
};

module.exports = {
  submitScore,
  getLeaderboard
};
