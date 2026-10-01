/**
 * HIDDEN CATS - Leaderboard Controller
 * Handles global, weekly, and player score rankings
 */

const LeaderboardManager = (() => {
  // Pre-seeded high scores for the fantasy cat realm
  const GLOBAL_SCORES = [
    { rank: 1, username: 'WhiskerWizard', avatar: 'assets/cats/cat_wizard.svg', score: 14850, level: '06', time: '00:38' },
    { rank: 2, username: 'MidnightLuna',  avatar: 'assets/cats/cat_luna.svg',   score: 13200, level: '06', time: '00:44' },
    { rank: 3, username: 'SolarisClaw',   avatar: 'assets/cats/cat_solaris.svg',score: 11950, level: '05', time: '00:52' },
    { rank: 4, username: 'SproutPaw',     avatar: 'assets/cats/cat_sprout.svg', score: 10400, level: '05', time: '01:05' },
    { rank: 5, username: 'PhantomNebula', avatar: 'assets/cats/cat_phantom.svg',score: 9800,  level: '04', time: '01:12' },
    { rank: 6, username: 'ShadowHunter',  avatar: 'assets/cats/cat_wizard.svg', score: 8550,  level: '04', time: '01:25' }
  ];

  const WEEKLY_SCORES = [
    { rank: 1, username: 'MidnightLuna',  avatar: 'assets/cats/cat_luna.svg',   score: 7200,  level: '05', time: '00:48' },
    { rank: 2, username: 'WhiskerWizard', avatar: 'assets/cats/cat_wizard.svg', score: 6850,  level: '05', time: '00:55' },
    { rank: 3, username: 'SproutPaw',     avatar: 'assets/cats/cat_sprout.svg', score: 5900,  level: '04', time: '01:02' },
    { rank: 4, username: 'SolarisClaw',   avatar: 'assets/cats/cat_solaris.svg',score: 5100,  level: '04', time: '01:18' }
  ];

  let currentTab = 'global';

  const init = () => {
    const tabs = document.querySelectorAll('.tab-btn[data-tab]');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentTab = tab.dataset.tab;
        AudioManager.playClick();
        render();
      });
    });
  };

  const render = () => {
    const tbody = document.getElementById('leaderboard-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    const profile = PlayerManager.getProfile();

    let list = [];
    if (currentTab === 'global') {
      list = [...GLOBAL_SCORES];
    } else if (currentTab === 'weekly') {
      list = [...WEEKLY_SCORES];
    } else {
      // My Score Tab
      list = [];
      if (profile.bestScore > 0) {
        list.push({
          rank: 1,
          username: profile.username,
          avatar: profile.avatar,
          score: profile.bestScore,
          level: profile.highestLevel.toString().padStart(2, '0'),
          time: profile.bestTime ? GameManager.formatTime(profile.bestTime) : '--:--',
          isCurrentPlayer: true
        });
      }
    }

    // If global or weekly, inject current player into table if they have played
    if (currentTab !== 'my_score' && profile.bestScore > 0) {
      const playerEntry = {
        username: profile.username,
        avatar: profile.avatar,
        score: profile.bestScore,
        level: profile.highestLevel.toString().padStart(2, '0'),
        time: profile.bestTime ? GameManager.formatTime(profile.bestTime) : '--:--',
        isCurrentPlayer: true
      };

      // Insert and sort by score descending
      list.push(playerEntry);
      list.sort((a, b) => b.score - a.score);

      // Re-assign ranks
      list.forEach((item, idx) => {
        item.rank = idx + 1;
      });
    }

    if (list.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = `<td colspan="5" style="text-align: center; color: var(--text-muted); padding: 30px;">Play games to record your high score!</td>`;
      tbody.appendChild(row);
      return;
    }

    list.forEach(entry => {
      const tr = document.createElement('tr');
      tr.className = `leaderboard-row ${entry.isCurrentPlayer ? 'current-player' : ''}`;

      // Rank Medal Styling
      let rankDisplay = `#${entry.rank}`;
      let rankClass = '';
      if (entry.rank === 1) {
        rankDisplay = '🥇 1';
        rankClass = 'rank-1';
      } else if (entry.rank === 2) {
        rankDisplay = '🥈 2';
        rankClass = 'rank-2';
      } else if (entry.rank === 3) {
        rankDisplay = '🥉 3';
        rankClass = 'rank-3';
      }

      tr.innerHTML = `
        <td class="rank-cell ${rankClass}">${rankDisplay}</td>
        <td>
          <div class="user-cell">
            <img src="${entry.avatar}" class="user-avatar-mini" alt="${entry.username}">
            <span class="user-name-text">${entry.username} ${entry.isCurrentPlayer ? '🐾 (You)' : ''}</span>
          </div>
        </td>
        <td class="score-cell">${entry.score.toLocaleString()}</td>
        <td class="level-cell">Level ${entry.level}</td>
        <td class="time-cell">${entry.time}</td>
      `;

      tbody.appendChild(tr);
    });
  };

  return {
    init,
    render
  };
})();
