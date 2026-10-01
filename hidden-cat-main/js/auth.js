/**
 * HIDDEN CATS - Authentication Controller
 * Password-less username login, social OAuth simulation, and guest mode
 */

const AuthManager = (() => {
  const init = () => {
    const loginForm = document.getElementById('form-login');
    const guestBtn = document.getElementById('btn-guest-login');
    const socialBtns = document.querySelectorAll('.btn-social');
    const quickContinueBtn = document.getElementById('btn-quick-continue');

    // Populate saved username if available
    populateLoginScreen();

    // Quick Continue button for returning player
    if (quickContinueBtn) {
      quickContinueBtn.addEventListener('click', () => {
        const profile = PlayerManager.getProfile();
        if (profile && profile.username) {
          loginWithUsername(profile.username);
        }
      });
    }

    // Standard Username Login Form Submit
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const usernameInput = document.getElementById('input-username');
        const username = usernameInput ? usernameInput.value.trim() : '';

        if (!username) {
          UIManager.showToast('Please enter a username to enter the Cat Kingdom!', 'error');
          usernameInput?.focus();
          return;
        }

        loginWithUsername(username);
      });
    }

    // Play as Guest Button
    if (guestBtn) {
      guestBtn.addEventListener('click', () => {
        const guestNames = ['MysticStray', 'ShadowProwler', 'WhiskerKnight', 'LunaWalker', 'StarlightClaw', 'PhantomPuff'];
        const randomName = guestNames[Math.floor(Math.random() * guestNames.length)];
        const usernameInput = document.getElementById('input-username');
        if (usernameInput) usernameInput.value = randomName;
        loginWithUsername(randomName);
      });
    }

    // Social OAuth Buttons
    socialBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const provider = btn.dataset.provider || 'Social';
        AudioManager.playClick();

        const socialPrefix = provider === 'google' ? 'GoogleCat' : provider === 'facebook' ? 'FBCat' : 'XHunter';
        const randomNum = Math.floor(100 + Math.random() * 900);
        const generatedUser = `${socialPrefix}_${randomNum}`;

        const usernameInput = document.getElementById('input-username');
        if (usernameInput) usernameInput.value = generatedUser;

        UIManager.showToast(`Connected via ${provider.toUpperCase()}! Welcome, ${generatedUser}`, 'success');
        setTimeout(() => {
          loginWithUsername(generatedUser);
        }, 500);
      });
    });
  };

  const populateLoginScreen = () => {
    const profile = PlayerManager.getProfile();
    const usernameInput = document.getElementById('input-username');
    const welcomeBanner = document.getElementById('welcome-back-banner');
    const welcomeName = document.getElementById('welcome-back-name');
    const welcomeAvatar = document.getElementById('welcome-back-avatar');

    if (profile && profile.username) {
      if (usernameInput && !usernameInput.value) {
        usernameInput.value = profile.username;
      }
      if (welcomeBanner && welcomeName && welcomeAvatar) {
        welcomeName.textContent = profile.username;
        welcomeAvatar.src = profile.avatar || 'assets/cats/cat_wizard.svg';
        welcomeBanner.classList.add('show');
      }
    }
  };

  const loginWithUsername = (username) => {
    AudioManager.playClick();

    // Save to player profile
    PlayerManager.load();
    PlayerManager.setUsername(username);
    StorageManager.set('is_authenticated', true);

    // Show animated loading screen before landing on Main Menu
    UIManager.runLoadingSequence(() => {
      UIManager.showScreen('screen-menu');
      UIManager.updatePlayerPill();
      UIManager.showToast(`✨ Welcome to Hidden Cats, ${username}!`, 'success');
    });
  };

  const logout = () => {
    StorageManager.set('is_authenticated', false);
    AudioManager.playClick();
    populateLoginScreen();
    UIManager.showScreen('screen-login');
    UIManager.showToast('You have returned to the mortal world. See you soon!', 'warning');
  };

  const isAuthenticated = () => {
    return StorageManager.get('is_authenticated', false);
  };

  return {
    init,
    loginWithUsername,
    logout,
    isAuthenticated,
    populateLoginScreen
  };
})();
