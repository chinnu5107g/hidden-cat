/**
 * User Model / In-memory Store (pluggable with MongoDB / PostgreSQL)
 */

class UserStore {
  constructor() {
    this.users = new Map();
  }

  findOrCreate(username) {
    const cleanUser = username.trim();
    if (!this.users.has(cleanUser)) {
      const newUser = {
        username: cleanUser,
        avatar: 'assets/cats/cat_wizard.svg',
        gamesPlayed: 0,
        gamesWon: 0,
        catsFound: 0,
        bestScore: 0,
        bestTime: null,
        highestLevel: 1,
        livesSaved: 0,
        achievements: [],
        createdAt: new Date()
      };
      this.users.set(cleanUser, newUser);
    }
    return this.users.get(cleanUser);
  }

  findByUsername(username) {
    return this.users.get(username.trim()) || null;
  }

  update(username, updates) {
    const user = this.findByUsername(username);
    if (user) {
      Object.assign(user, updates);
      return user;
    }
    return null;
  }

  getAll() {
    return Array.from(this.users.values());
  }
}

module.exports = new UserStore();
