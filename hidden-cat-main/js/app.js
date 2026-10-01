/**
 * HIDDEN CATS - Application Bootstrap
 * Initializes all sub-systems upon DOM load
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Sub-systems
  AudioManager.init();
  PlayerManager.load();
  UIManager.init();
  AuthManager.init();
  LeaderboardManager.init();
  SettingsManager.init();
  GameManager.init();

  // 2. Setup interactive mini tutorial on How to Play page
  setupTutorialMiniBoard();

  // 3. Routing on startup: Check if user already authenticated
  if (AuthManager.isAuthenticated()) {
    UIManager.showScreen('screen-menu');
    UIManager.updatePlayerPill();
  } else {
    UIManager.showScreen('screen-login');
  }
});

/**
 * Setup interactive mini-board in How To Play screen
 * Demonstrates 2x3 grid with 2 colors, 2 cats, row/col/diag constraints
 */
function setupTutorialMiniBoard() {
  const container = document.getElementById('demo-board-grid');
  if (!container) return;

  container.innerHTML = '';
  // 2x3 demo grid
  // Row 0: [Blue, Blue, Purple]
  // Row 1: [Purple, Purple, Blue]
  // Cats at (0, 0) [Blue] and (1, 1) [Purple] -> wait, (0,0) and (1,1) is diagonal!
  // Correct N-queens for 2x3: (0, 0) [Blue] and (1, 2) [Purple] -> dr=1, dc=2 (no diagonal clash!)
  const layout = [
    { r: 0, c: 0, color: '#2563eb', hasCat: true, name: 'Blue Realm' },
    { r: 0, c: 1, color: '#2563eb', hasCat: false, name: 'Blue Realm' },
    { r: 0, c: 2, color: '#7c3aed', hasCat: false, name: 'Purple Realm' },
    { r: 1, c: 0, color: '#7c3aed', hasCat: false, name: 'Purple Realm' },
    { r: 1, c: 1, color: '#2563eb', hasCat: false, name: 'Blue Realm' },
    { r: 1, c: 2, color: '#7c3aed', hasCat: true, name: 'Purple Realm' }
  ];

  layout.forEach(cell => {
    const div = document.createElement('div');
    div.className = `demo-cell ${cell.hasCat ? 'has-cat' : ''}`;
    div.style.backgroundColor = cell.color;
    div.innerHTML = cell.hasCat ? '🐱' : '<span>✦</span>';
    div.title = cell.hasCat ? `${cell.name} (Hidden Cat!)` : cell.name;
    container.appendChild(div);
  });
}
