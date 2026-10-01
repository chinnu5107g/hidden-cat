/**
 * HIDDEN CATS - UI & View Controller & Particle Engine
 * Handles screen routing, loading transitions, canvas VFX, and level cards
 */

// Canvas Particle Engine
const ParticleFX = (() => {
  let canvas = null;
  let ctx = null;
  let width = 0;
  let height = 0;
  let particles = [];
  let animId = null;
  let quality = 'high'; // 'high' | 'medium' | 'low'

  const MAX_FIREFLIES = 40;

  class Firefly {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.radius = Math.random() * 2.2 + 0.8;
      this.vx = (Math.random() - 0.5) * 0.45;
      this.vy = (Math.random() - 0.5) * 0.45;
      this.alpha = Math.random() * 0.7 + 0.2;
      this.pulseSpeed = Math.random() * 0.03 + 0.01;
      this.hue = Math.random() > 0.6 ? 280 : (Math.random() > 0.3 ? 180 : 45); // purple, cyan, gold
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.alpha += Math.sin(Date.now() * this.pulseSpeed * 0.05) * 0.01;
      if (this.alpha < 0.1) this.alpha = 0.1;
      if (this.alpha > 0.9) this.alpha = 0.9;

      if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
        this.reset();
      }
    }
    draw(c) {
      c.save();
      c.beginPath();
      c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      c.fillStyle = `hsla(${this.hue}, 90%, 65%, ${this.alpha})`;
      c.shadowBlur = 10;
      c.shadowColor = `hsl(${this.hue}, 90%, 65%)`;
      c.fill();
      c.restore();
    }
  }

  // Burst particle for paws and confetti
  class BurstParticle {
    constructor(x, y, color, isPaw = false) {
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.5) * (isPaw ? 6 : 9);
      this.vy = (Math.random() - 0.5) * (isPaw ? 6 : 9) - 2;
      this.alpha = 1;
      this.decay = Math.random() * 0.02 + 0.015;
      this.size = Math.random() * 6 + 3;
      this.color = color;
      this.isPaw = isPaw;
      this.rot = Math.random() * Math.PI * 2;
      this.vRot = (Math.random() - 0.5) * 0.2;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.15; // gravity
      this.rot += this.vRot;
      this.alpha -= this.decay;
    }
    draw(c) {
      if (this.alpha <= 0) return;
      c.save();
      c.translate(this.x, this.y);
      c.rotate(this.rot);
      c.globalAlpha = this.alpha;
      c.fillStyle = this.color;
      c.shadowBlur = 8;
      c.shadowColor = this.color;

      if (this.isPaw) {
        // Draw tiny paw dot
        c.beginPath();
        c.arc(0, 0, this.size, 0, Math.PI * 2);
        c.fill();
      } else {
        // Confetti rect
        c.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 1.5);
      }
      c.restore();
    }
  }

  const init = () => {
    canvas = document.getElementById('fx-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    resize();
    window.addEventListener('resize', resize);

    // Populate ambient fireflies
    const count = quality === 'low' ? 15 : (quality === 'medium' ? 25 : MAX_FIREFLIES);
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push(new Firefly());
    }

    loop();
  };

  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    if (canvas) {
      canvas.width = width;
      canvas.height = height;
    }
  };

  const loop = () => {
    ctx.clearRect(0, 0, width, height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update();
      p.draw(ctx);

      if (p instanceof BurstParticle && p.alpha <= 0) {
        particles.splice(i, 1);
      }
    }

    animId = requestAnimationFrame(loop);
  };

  const spawnPawBurst = (x, y) => {
    const colors = ['#e040fb', '#00e5ff', '#ffd166', '#b388ff'];
    for (let i = 0; i < 20; i++) {
      const col = colors[Math.floor(Math.random() * colors.length)];
      particles.push(new BurstParticle(x, y, col, true));
    }
  };

  const spawnConfetti = () => {
    const colors = ['#ffd166', '#06d6a0', '#00e5ff', '#e040fb', '#ff3366', '#7c4dff'];
    for (let i = 0; i < 70; i++) {
      const x = width * 0.5 + (Math.random() - 0.5) * 200;
      const y = height * 0.45 + (Math.random() - 0.5) * 100;
      const col = colors[Math.floor(Math.random() * colors.length)];
      particles.push(new BurstParticle(x, y, col, false));
    }
  };

  const setQuality = (q) => {
    quality = q;
    // Adjust fireflies
    particles = particles.filter(p => !(p instanceof Firefly));
    const count = quality === 'low' ? 12 : (quality === 'medium' ? 24 : MAX_FIREFLIES);
    for (let i = 0; i < count; i++) {
      particles.push(new Firefly());
    }
  };

  return { init, spawnPawBurst, spawnConfetti, setQuality };
})();

// UI Manager
const UIManager = (() => {
  let currentScreenId = null;

  const init = () => {
    ParticleFX.init();

    // Global navigation bindings
    document.querySelectorAll('[data-goto]').forEach(el => {
      el.addEventListener('click', (e) => {
        const targetScreen = el.dataset.goto;
        AudioManager.playClick();
        showScreen(targetScreen);
      });
    });

    // Close Modal buttons
    document.querySelectorAll('[data-close-modal]').forEach(el => {
      el.addEventListener('click', () => {
        const modalId = el.dataset.closeModal;
        AudioManager.playClick();
        hideModal(modalId);
      });
    });

    // Edit Username Handler
    document.getElementById('btn-edit-username')?.addEventListener('click', () => {
      const profile = PlayerManager.getProfile();
      const newName = prompt('Enter your cat hunter username:', profile.username);
      if (newName && newName.trim()) {
        PlayerManager.setUsername(newName.trim());
        updateProfileScreen();
        updatePlayerPill();
        showToast('Username updated successfully!', 'success');
      }
    });

    // Avatar Picker Modal Open
    document.getElementById('btn-change-avatar')?.addEventListener('click', () => {
      renderAvatarPicker();
      showModal('modal-avatar-picker');
    });

    // Global Sound Toggle in Main Menu
    document.getElementById('menu-audio-btn')?.addEventListener('click', () => {
      const current = AudioManager.getSfxEnabled();
      AudioManager.setSfxEnabled(!current);
      AudioManager.setMusicEnabled(!current);
      updateAudioToggleIcon();
      showToast(current ? '🔇 Audio muted' : '🔊 Audio enabled', 'info');
    });
  };

  const showScreen = (screenId) => {
    const allScreens = document.querySelectorAll('.screen');
    allScreens.forEach(s => s.classList.remove('active'));

    const target = document.getElementById(screenId);
    if (target) {
      target.classList.add('active');
      currentScreenId = screenId;
    }

    // Refresh context-specific views
    if (screenId === 'screen-menu') {
      updatePlayerPill();
      updateAudioToggleIcon();
    } else if (screenId === 'screen-levels') {
      renderLevelSelect();
    } else if (screenId === 'screen-profile') {
      updateProfileScreen();
    } else if (screenId === 'screen-leaderboard') {
      LeaderboardManager.render();
    }
  };

  const showModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
  };

  const hideModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  };

  /**
   * Run the magical animated loading sequence
   */
  const runLoadingSequence = (onComplete) => {
    showScreen('screen-loading');
    const progressBar = document.getElementById('loading-bar-fill');
    const paws = document.querySelectorAll('.loading-paw');

    let progress = 0;
    let pawIndex = 0;

    // Reset paws
    paws.forEach(p => p.classList.remove('active'));

    const interval = setInterval(() => {
      progress += 5;
      if (progressBar) progressBar.style.width = `${progress}%`;

      // Activate paws sequentially
      if (progress % 20 === 0 && pawIndex < paws.length) {
        paws[pawIndex].classList.add('active');
        pawIndex++;
      }

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 300);
      }
    }, 60);
  };

  /**
   * Render Level Select Screen
   */
  const renderLevelSelect = () => {
    const container = document.getElementById('level-cards-container');
    if (!container) return;

    container.innerHTML = '';
    const configs = PuzzleGenerator.getLevelConfigs();

    configs.forEach(cfg => {
      const unlocked = PlayerManager.isLevelUnlocked(cfg.level);
      const stat = PlayerManager.getLevelStat(cfg.level);

      const card = document.createElement('div');
      card.className = `level-card glass-panel ${unlocked ? 'unlocked' : 'locked'}`;

      let badgeHtml = '';
      if (!unlocked) {
        badgeHtml = `<span class="level-badge status-locked">🔒 LOCKED</span>`;
      } else if (stat && stat.completed) {
        badgeHtml = `<span class="level-badge status-completed">✓ COMPLETED</span>`;
      } else {
        badgeHtml = `<span class="level-badge status-unlocked">PLAY</span>`;
      }

      let starsHtml = '';
      const starCount = stat ? (stat.stars || 0) : 0;
      for (let s = 1; s <= 3; s++) {
        starsHtml += s <= starCount ? '⭐' : '<span style="opacity:0.3">⭐</span>';
      }

      const bestScoreText = stat ? stat.bestScore.toLocaleString() : '--';
      const bestTimeText = stat && stat.bestTime ? GameManager.formatTime(stat.bestTime) : '--:--';

      card.innerHTML = `
        <div class="level-card-top">
          <div class="level-card-title-group">
            <span class="level-number">LEVEL ${cfg.level.toString().padStart(2, '0')}</span>
            <span class="level-realm-name">${cfg.name}</span>
          </div>
          ${badgeHtml}
        </div>
        <div class="level-pattern-tag">
          <span class="pattern-pill">${cfg.patternIcon || '✨'} ${cfg.patternName || 'Enchanted Pattern'}</span>
        </div>
        <div class="level-info">
          <span class="level-grid-dim">${cfg.rows} × ${cfg.cols} Grid (${Math.min(cfg.rows, cfg.cols)} Cats)</span>
          <span class="level-difficulty">🐾 ${cfg.difficulty}</span>
        </div>
        <div class="level-stats">
          <div>
            <div>Score: ${bestScoreText}</div>
            <div>Time: ${bestTimeText}</div>
          </div>
          <div class="level-stars">${starsHtml}</div>
        </div>
      `;

      if (unlocked) {
        card.addEventListener('click', () => {
          AudioManager.playClick();
          GameManager.startLevel(cfg.level);
        });
      }

      container.appendChild(card);
    });
  };

  /**
   * Update Profile Screen content
   */
  const updateProfileScreen = () => {
    const profile = PlayerManager.getProfile();

    document.getElementById('profile-avatar-img').src = profile.avatar;
    document.getElementById('profile-username-display').textContent = profile.username;

    document.getElementById('stat-games-played').textContent = profile.gamesPlayed;
    document.getElementById('stat-games-won').textContent = profile.gamesWon;
    document.getElementById('stat-cats-found').textContent = profile.catsFound;
    document.getElementById('stat-best-score').textContent = profile.bestScore.toLocaleString();
    document.getElementById('stat-best-time').textContent = profile.bestTime ? GameManager.formatTime(profile.bestTime) : '--:--';
    document.getElementById('stat-highest-level').textContent = `0${profile.highestLevel}`;
    document.getElementById('stat-lives-saved').textContent = profile.livesSaved;

    // Render achievements
    const achContainer = document.getElementById('achievements-grid');
    if (achContainer) {
      achContainer.innerHTML = '';
      PlayerManager.ACHIEVEMENTS_DATA.forEach(ach => {
        const isUnlocked = profile.achievements && profile.achievements[ach.id];
        const item = document.createElement('div');
        item.className = `achievement-item ${isUnlocked ? 'unlocked' : 'locked'}`;
        item.innerHTML = `
          <div class="achievement-icon">${ach.icon}</div>
          <div class="achievement-text">
            <span class="achievement-name">${ach.name}</span>
            <span class="achievement-desc">${ach.desc}</span>
          </div>
        `;
        achContainer.appendChild(item);
      });
    }
  };

  /**
   * Render Avatar Picker in Modal
   */
  const renderAvatarPicker = () => {
    const container = document.getElementById('avatar-choices-grid');
    if (!container) return;

    container.innerHTML = '';
    const avatars = [
      'assets/cats/cat_wizard.svg',
      'assets/cats/cat_luna.svg',
      'assets/cats/cat_sprout.svg',
      'assets/cats/cat_solaris.svg',
      'assets/cats/cat_phantom.svg'
    ];

    const current = PlayerManager.getProfile().avatar;

    avatars.forEach(av => {
      const choice = document.createElement('div');
      choice.className = `avatar-choice ${av === current ? 'selected' : ''}`;
      choice.innerHTML = `<img src="${av}" alt="Avatar">`;
      choice.addEventListener('click', () => {
        PlayerManager.setAvatar(av);
        AudioManager.playClick();
        hideModal('modal-avatar-picker');
        updateProfileScreen();
        updatePlayerPill();
        showToast('Avatar updated!', 'success');
      });
      container.appendChild(choice);
    });
  };

  const updatePlayerPill = () => {
    const profile = PlayerManager.getProfile();
    const nameEl = document.getElementById('menu-player-name');
    const avatarEl = document.getElementById('menu-player-avatar');
    if (nameEl) nameEl.textContent = profile.username;
    if (avatarEl) avatarEl.src = profile.avatar;
  };

  const updateAudioToggleIcon = () => {
    const btn = document.getElementById('menu-audio-btn');
    if (btn) {
      const enabled = AudioManager.getSfxEnabled();
      btn.textContent = enabled ? '🔊' : '🔇';
    }
  };

  /**
   * Toast notification system
   */
  const showToast = (message, type = 'info') => {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(50px)';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  };

  return {
    init,
    showScreen,
    showModal,
    hideModal,
    runLoadingSequence,
    renderLevelSelect,
    updateProfileScreen,
    updatePlayerPill,
    showToast
  };
})();
