/**
 * HIDDEN CATS - Settings Controller
 * Handles audio levels, toggles, themes, fullscreen, and account preferences
 */

const SettingsManager = (() => {
  const init = () => {
    // SFX Toggle
    const sfxToggle = document.getElementById('setting-sfx');
    const sfxSlider = document.getElementById('setting-sfx-vol');
    if (sfxToggle) {
      sfxToggle.checked = AudioManager.getSfxEnabled();
      sfxToggle.addEventListener('change', (e) => {
        AudioManager.setSfxEnabled(e.target.checked);
      });
    }
    if (sfxSlider) {
      sfxSlider.value = AudioManager.getSfxVolume();
      sfxSlider.addEventListener('input', (e) => {
        AudioManager.setSfxVolume(e.target.value);
      });
    }

    // Music Toggle
    const musicToggle = document.getElementById('setting-music');
    const musicSlider = document.getElementById('setting-music-vol');
    if (musicToggle) {
      musicToggle.checked = AudioManager.getMusicEnabled();
      musicToggle.addEventListener('change', (e) => {
        AudioManager.setMusicEnabled(e.target.checked);
      });
    }
    if (musicSlider) {
      musicSlider.value = AudioManager.getMusicVolume();
      musicSlider.addEventListener('input', (e) => {
        AudioManager.setMusicVolume(e.target.value);
      });
    }

    // Animations Toggle
    const animToggle = document.getElementById('setting-animations');
    if (animToggle) {
      animToggle.checked = StorageManager.get('animations_enabled', true);
      animToggle.addEventListener('change', (e) => {
        StorageManager.set('animations_enabled', e.target.checked);
        document.body.classList.toggle('reduce-motion', !e.target.checked);
      });
    }

    // Fullscreen Toggle
    const fullscreenToggle = document.getElementById('setting-fullscreen');
    if (fullscreenToggle) {
      fullscreenToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
          if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => {});
          }
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
          }
        }
      });
    }

    // Effects Quality
    const qualitySelect = document.getElementById('setting-fx-quality');
    if (qualitySelect) {
      qualitySelect.value = StorageManager.get('fx_quality', 'high');
      qualitySelect.addEventListener('change', (e) => {
        StorageManager.set('fx_quality', e.target.value);
        if (window.ParticleFX) {
          ParticleFX.setQuality(e.target.value);
        }
      });
    }

    // Logout Button
    const logoutBtn = document.getElementById('btn-account-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        AuthManager.logout();
      });
    }
  };

  return { init };
})();
