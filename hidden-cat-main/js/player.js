/**
 * HIDDEN CATS - Player Profile & Stats Manager
 * Handles player identity, statistics, unlocked levels, and achievements
 */

const PlayerManager = (() => {
  const DEFAULT_PROFILE = {
    username: 'Chinnu',
    avatar: 'assets/cats/cat_wizard.svg',
    gamesPlayed: 0,
    gamesWon: 0,
    catsFound: 0,
    bestScore: 0,
    bestTime: null,
    highestLevel: 1,
    livesSaved: 0,
    unlockedLevels: [1],
    levelStats: {}, // { levelNum: { bestScore, bestTime, stars, completed: true } }
    achievements: {
      first_cat: false,
      first_victory: false,
      speed_hunter: false,
      logic_master: false,
      pattern_sage: false,
      cat_master: false
    }
  };

  const ACHIEVEMENTS_DATA = [
    { id: 'first_cat', name: 'First Cat', desc: 'Discovered your first magical feline', icon: '🐱' },
    { id: 'first_victory', name: 'First Victory', desc: 'Successfully completed any realm puzzle', icon: '🏆' },
    { id: 'speed_hunter', name: 'Speed Hunter', desc: 'Solved a puzzle in under 45 seconds', icon: '⚡' },
    { id: 'logic_master', name: 'Logic Master', desc: 'Solved a puzzle with all 3 lives intact', icon: '🧠' },
    { id: 'pattern_sage', name: 'Pattern Sage', desc: 'Conquered a Spiral, Zig-Zag, or Mosaic realm', icon: '🌀' },
    { id: 'cat_master', name: 'Cat Sovereign', desc: 'Conquered 10 or more enchanted realms', icon: '👑' }
  ];

  let currentProfile = null;

  const load = () => {
    const saved = StorageManager.get('player_profile', null);
    if (saved) {
      currentProfile = { ...DEFAULT_PROFILE, ...saved };
      // Ensure arrays and objects exist
      if (!currentProfile.unlockedLevels) currentProfile.unlockedLevels = [1];
      if (!currentProfile.levelStats) currentProfile.levelStats = {};
      if (!currentProfile.achievements) currentProfile.achievements = { ...DEFAULT_PROFILE.achievements };
    } else {
      currentProfile = { ...DEFAULT_PROFILE };
      save();
    }
    return currentProfile;
  };

  const save = () => {
    StorageManager.set('player_profile', currentProfile);
  };

  const getProfile = () => {
    if (!currentProfile) load();
    return currentProfile;
  };

  const setUsername = (name) => {
    const cleanName = (name || '').trim();
    if (!cleanName) return false;
    currentProfile.username = cleanName;
    save();
    return true;
  };

  const setAvatar = (avatarPath) => {
    currentProfile.avatar = avatarPath;
    save();
  };

  const recordCatFound = () => {
    currentProfile.catsFound++;
    if (!currentProfile.achievements.first_cat) {
      unlockAchievement('first_cat');
    }
    save();
  };

  const recordGameLoss = (levelNum) => {
    currentProfile.gamesPlayed++;
    save();
  };

  const recordGameWin = (levelNum, score, timeSeconds, livesRemaining) => {
    currentProfile.gamesPlayed++;
    currentProfile.gamesWon++;
    currentProfile.livesSaved += livesRemaining;

    // Track overall best score
    if (score > currentProfile.bestScore) {
      currentProfile.bestScore = score;
    }

    // Track best time
    if (!currentProfile.bestTime || timeSeconds < currentProfile.bestTime) {
      currentProfile.bestTime = timeSeconds;
    }

    // Stars calculation: 3 lives = 3 stars, 2 lives = 2 stars, 1 life = 1 star
    const stars = Math.min(3, Math.max(1, livesRemaining));

    // Level stats
    if (!currentProfile.levelStats[levelNum]) {
      currentProfile.levelStats[levelNum] = {
        bestScore: score,
        bestTime: timeSeconds,
        stars: stars,
        completed: true
      };
    } else {
      const prev = currentProfile.levelStats[levelNum];
      currentProfile.levelStats[levelNum] = {
        bestScore: Math.max(prev.bestScore || 0, score),
        bestTime: prev.bestTime ? Math.min(prev.bestTime, timeSeconds) : timeSeconds,
        stars: Math.max(prev.stars || 0, stars),
        completed: true
      };
    }

    // Unlock next level
    const nextLevel = levelNum + 1;
    if (!currentProfile.unlockedLevels.includes(nextLevel)) {
      currentProfile.unlockedLevels.push(nextLevel);
    }
    if (levelNum > currentProfile.highestLevel) {
      currentProfile.highestLevel = levelNum;
    }

    // Check Achievements
    if (!currentProfile.achievements.first_victory) {
      unlockAchievement('first_victory');
    }
    if (timeSeconds <= 45 && !currentProfile.achievements.speed_hunter) {
      unlockAchievement('speed_hunter');
    }
    if (livesRemaining === 3 && !currentProfile.achievements.logic_master) {
      unlockAchievement('logic_master');
    }
    if (levelNum >= 5 && !currentProfile.achievements.pattern_sage) {
      unlockAchievement('pattern_sage');
    }
    if (levelNum >= 10 && !currentProfile.achievements.cat_master) {
      unlockAchievement('cat_master');
    }

    save();
  };

  const unlockAchievement = (id) => {
    if (currentProfile && currentProfile.achievements) {
      currentProfile.achievements[id] = true;
      save();
      const ach = ACHIEVEMENTS_DATA.find(a => a.id === id);
      if (ach && window.UIManager) {
        UIManager.showToast(`✨ Achievement Unlocked: ${ach.name}!`, 'success');
      }
    }
  };

  const isLevelUnlocked = (levelNum) => {
    if (!currentProfile) load();
    return currentProfile.unlockedLevels.includes(levelNum);
  };

  const getLevelStat = (levelNum) => {
    if (!currentProfile) load();
    return currentProfile.levelStats[levelNum] || null;
  };

  return {
    load,
    save,
    getProfile,
    setUsername,
    setAvatar,
    recordCatFound,
    recordGameLoss,
    recordGameWin,
    isLevelUnlocked,
    getLevelStat,
    ACHIEVEMENTS_DATA
  };
})();
