/**
 * HIDDEN CATS - Core Game Controller
 * Manages game loop, 3-life system, score calculation, timer, hints, victory & defeat
 */

const GameManager = (() => {
  let currentLevel = 1;
  let currentPuzzle = null;
  let lives = 3;
  let score = 0;
  let catsFound = 0;
  let totalCats = 0;
  let timerSeconds = 0;
  let timerInterval = null;
  let isPaused = false;
  let isGameOver = false;
  let hintsRemaining = 2;
  let hintsUsed = 0;

  // DOM Elements cache
  let elLevelPill = null;
  let elHearts = null;
  let elScore = null;
  let elCatsCount = null;
  let elTimer = null;
  let elFeedback = null;

  const init = () => {
    elLevelPill = document.getElementById('hud-level-pill');
    elHearts = document.getElementById('hud-hearts-container');
    elScore = document.getElementById('hud-score-value');
    elCatsCount = document.getElementById('hud-cats-count');
    elTimer = document.getElementById('hud-timer-value');
    elFeedback = document.getElementById('action-feedback-toast');

    // Register board click handler
    BoardManager.init(document.getElementById('game-board-arena'), onCellClicked);

    // Register button controls
    document.getElementById('btn-hint')?.addEventListener('click', useHint);
    document.getElementById('btn-reset')?.addEventListener('click', restartCurrentLevel);
    document.getElementById('btn-pause')?.addEventListener('click', pauseGame);

    // Pause Modal Controls
    document.getElementById('btn-pause-resume')?.addEventListener('click', resumeGame);
    document.getElementById('btn-pause-restart')?.addEventListener('click', () => {
      resumeGame();
      restartCurrentLevel();
    });
    document.getElementById('btn-pause-settings')?.addEventListener('click', () => {
      UIManager.showScreen('screen-settings');
    });
    document.getElementById('btn-pause-menu')?.addEventListener('click', () => {
      resumeGame();
      stopTimer();
      UIManager.showScreen('screen-menu');
    });

    // Victory Modal Controls
    document.getElementById('btn-victory-next')?.addEventListener('click', () => {
      UIManager.hideModal('modal-victory');
      startLevel(currentLevel + 1);
    });
    document.getElementById('btn-victory-again')?.addEventListener('click', () => {
      UIManager.hideModal('modal-victory');
      startLevel(currentLevel);
    });
    document.getElementById('btn-victory-menu')?.addEventListener('click', () => {
      UIManager.hideModal('modal-victory');
      UIManager.showScreen('screen-menu');
    });

    // Game Over Modal Controls
    document.getElementById('btn-defeat-again')?.addEventListener('click', () => {
      UIManager.hideModal('modal-defeat');
      startLevel(currentLevel);
    });
    document.getElementById('btn-defeat-levels')?.addEventListener('click', () => {
      UIManager.hideModal('modal-defeat');
      UIManager.showScreen('screen-levels');
    });
    document.getElementById('btn-defeat-menu')?.addEventListener('click', () => {
      UIManager.hideModal('modal-defeat');
      UIManager.showScreen('screen-menu');
    });
  };

  /**
   * Start or restart a specific level
   */
  const startLevel = (levelNum) => {
    currentLevel = levelNum;
    lives = 3;
    score = 0;
    catsFound = 0;
    timerSeconds = 0;
    isPaused = false;
    isGameOver = false;
    hintsRemaining = 2;
    hintsUsed = 0;

    // Generate fresh puzzle with guaranteed valid N-Queens rectangular solution
    currentPuzzle = PuzzleGenerator.generatePuzzle(currentLevel);
    totalCats = currentPuzzle.totalCats;

    // Render board
    BoardManager.render(currentPuzzle);

    // Update HUD
    updateHUD();

    // Start timer
    startTimer();

    // Transition to game screen
    UIManager.showScreen('screen-game');
  };

  /**
   * Cell click processing
   */
  const onCellClicked = (r, c, cellElement) => {
    if (isGameOver || isPaused) return;

    const catKey = `${r},${c}`;
    const isCat = currentPuzzle.catMap.has(catKey);

    if (isCat) {
      // 🐱 Correct Cell!
      const catData = currentPuzzle.catMap.get(catKey);
      catsFound++;
      score += 100;
      PlayerManager.recordCatFound();

      // Board reveal & audio
      BoardManager.revealCat(cellElement, catsFound);
      AudioManager.playCatFound();

      // Show floating popup
      showActionFeedback('🐱 CAT FOUND! +100', 'correct');

      updateHUD();

      // Check Victory Condition
      if (catsFound === totalCats) {
        handleVictory();
      }
    } else {
      // ❌ Wrong Cell!
      lives--;
      AudioManager.playWrong();
      BoardManager.markWrong(cellElement);

      updateHeartsDisplay();

      if (lives > 0) {
        showActionFeedback(`WRONG CELL! ${lives} ${lives === 1 ? 'LIFE' : 'LIVES'} LEFT`, 'wrong');
      } else {
        // 0 Lives -> Game Over!
        handleGameOver();
      }
    }
  };

  /**
   * Timer management
   */
  const startTimer = () => {
    stopTimer();
    timerInterval = setInterval(() => {
      if (!isPaused && !isGameOver) {
        timerSeconds++;
        updateTimerDisplay();
      }
    }, 1000);
  };

  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  };

  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const updateTimerDisplay = () => {
    if (elTimer) elTimer.textContent = formatTime(timerSeconds);
  };

  /**
   * Update all HUD displays
   */
  const updateHUD = () => {
    const profile = PlayerManager.getProfile();
    
    // Level Pill & Realm Name & Player name
    if (elLevelPill) {
      const patternIcon = currentPuzzle ? (currentPuzzle.patternIcon || '🐾') : '🐾';
      const realmName = currentPuzzle ? currentPuzzle.name : `Level ${currentLevel}`;
      elLevelPill.textContent = `${patternIcon} LVL ${currentLevel.toString().padStart(2, '0')}: ${realmName} • ${profile.username}`;
    }

    // Cats Found
    if (elCatsCount) {
      elCatsCount.textContent = `CATS FOUND: ${catsFound}/${totalCats}`;
    }

    // Score
    if (elScore) {
      elScore.textContent = `SCORE: ${score}`;
    }

    updateHeartsDisplay();
    updateTimerDisplay();
  };

  const updateHeartsDisplay = () => {
    if (!elHearts) return;
    elHearts.innerHTML = '';
    for (let i = 0; i < 3; i++) {
      const heart = document.createElement('span');
      heart.className = `hud-heart ${i < lives ? 'active' : 'lost'}`;
      heart.textContent = i < lives ? '❤️' : '🖤';
      elHearts.appendChild(heart);
    }
  };

  const showActionFeedback = (text, type) => {
    if (!elFeedback) return;
    elFeedback.textContent = text;
    elFeedback.className = `action-feedback-toast ${type} show`;
    setTimeout(() => {
      elFeedback.classList.remove('show');
    }, 1200);
  };

  /**
   * Hint Functionality
   */
  const useHint = () => {
    if (isGameOver || isPaused) return;

    if (hintsRemaining <= 0) {
      UIManager.showToast('No more hints available for this level!', 'warning');
      return;
    }

    // Find a cat that hasn't been discovered yet
    const undiscoveredCats = [];
    currentPuzzle.catPositions.forEach((pos) => {
      const cellEl = BoardManager.getCellElement(pos.r, pos.c);
      if (cellEl && !cellEl.classList.contains('revealed')) {
        undiscoveredCats.push(pos);
      }
    });

    if (undiscoveredCats.length === 0) return;

    // Pick one undiscovered cat to hint
    const targetCat = undiscoveredCats[Math.floor(Math.random() * undiscoveredCats.length)];
    const colorIdx = currentPuzzle.gridColors[targetCat.r][targetCat.c];
    const colorData = currentPuzzle.palette[colorIdx];

    hintsRemaining--;
    hintsUsed++;
    AudioManager.playHint();

    // Pulse highlight all cells of that color region
    BoardManager.highlightColorRegion(colorIdx);

    UIManager.showToast(`💡 A whisper echoes: A hidden cat lurks in the ${colorData.name}!`, 'warning');
  };

  /**
   * Pause & Resume
   */
  const pauseGame = () => {
    if (isGameOver) return;
    isPaused = true;
    AudioManager.playClick();
    UIManager.showModal('modal-pause');
  };

  const resumeGame = () => {
    isPaused = false;
    AudioManager.playClick();
    UIManager.hideModal('modal-pause');
  };

  const restartCurrentLevel = () => {
    startLevel(currentLevel);
  };

  /**
   * Level Victory Handling
   */
  const handleVictory = () => {
    stopTimer();
    isGameOver = true;
    AudioManager.playVictory();

    // Calculate detailed scores
    const baseScore = catsFound * 100;
    const speedBonus = Math.max(0, 300 - timerSeconds * 3);
    const lifeBonus = lives * 100;
    const levelBonus = currentLevel * 200;
    const hintPenalty = hintsUsed * 50;
    const finalScore = Math.max(0, baseScore + speedBonus + lifeBonus + levelBonus - hintPenalty);

    // Record stats
    PlayerManager.recordGameWin(currentLevel, finalScore, timerSeconds, lives);

    // Update Victory Modal Elements
    document.getElementById('victory-stat-cats').textContent = `${catsFound} / ${totalCats}`;
    document.getElementById('victory-stat-score').textContent = finalScore;
    document.getElementById('victory-stat-time').textContent = formatTime(timerSeconds);
    
    // Lives display in victory modal
    const victoryHeartsEl = document.getElementById('victory-stat-lives');
    if (victoryHeartsEl) {
      victoryHeartsEl.textContent = '❤️'.repeat(lives) + '🖤'.repeat(3 - lives);
    }

    // Stars display
    const victoryStarsEl = document.getElementById('victory-stars-display');
    if (victoryStarsEl) {
      victoryStarsEl.textContent = '⭐'.repeat(lives);
    }

    // Confetti and celebratory particles
    if (window.ParticleFX) {
      ParticleFX.spawnConfetti();
    }

    setTimeout(() => {
      UIManager.showModal('modal-victory');
    }, 450);
  };

  /**
   * Game Over Defeat Handling
   */
  const handleGameOver = () => {
    stopTimer();
    isGameOver = true;
    AudioManager.playGameOver();
    PlayerManager.recordGameLoss(currentLevel);

    // Update Defeat Modal Elements
    document.getElementById('defeat-stat-cats').textContent = `${catsFound} / ${totalCats}`;
    document.getElementById('defeat-stat-score').textContent = score;
    document.getElementById('defeat-stat-level').textContent = currentLevel.toString().padStart(2, '0');

    setTimeout(() => {
      UIManager.showModal('modal-defeat');
    }, 500);
  };

  return {
    init,
    startLevel,
    restartCurrentLevel,
    pauseGame,
    resumeGame,
    useHint,
    getCurrentLevel: () => currentLevel,
    formatTime
  };
})();
