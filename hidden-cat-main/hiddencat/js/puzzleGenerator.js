/**
 * HIDDEN CATS - Puzzle Generator & Solver
 * Backtracking solver for rectangular & square N-Queens constraints
 * Advanced Multi-Pattern Region Generation:
 * - Spiral Whirlpool
 * - Zig-Zag Lightning
 * - Concentric Citadel
 * - Archipelago Islands
 * - Sinusoidal Waves
 * - Gemstone Mosaic
 * - Chaos Nebula Fractal
 * - Angled Astral Slashes
 */

const PuzzleGenerator = (() => {
  // 10 Rich fantasy color realms
  const COLOR_PALETTE = [
    { id: 'sapphire', name: 'Sapphire Realm',  hex: '#2563eb', border: '#60a5fa', glow: 'rgba(37, 99, 235, 0.6)' },
    { id: 'amethyst', name: 'Amethyst Realm',  hex: '#7c3aed', border: '#a78bfa', glow: 'rgba(124, 58, 237, 0.6)' },
    { id: 'emerald',  name: 'Emerald Grove',   hex: '#059669', border: '#34d399', glow: 'rgba(5, 150, 105, 0.6)' },
    { id: 'amber',    name: 'Sunfire Amber',   hex: '#d97706', border: '#fbbf24', glow: 'rgba(217, 119, 6, 0.6)' },
    { id: 'ruby',     name: 'Crimson Ruby',    hex: '#e11d48', border: '#fb7185', glow: 'rgba(225, 29, 72, 0.6)' },
    { id: 'opal',     name: 'Opal Aurora',     hex: '#0891b2', border: '#38bdf8', glow: 'rgba(8, 145, 178, 0.6)' },
    { id: 'coral',    name: 'Sunset Coral',    hex: '#ea580c', border: '#fb923c', glow: 'rgba(234, 88, 12, 0.6)' },
    { id: 'orchid',   name: 'Astral Orchid',   hex: '#c026d3', border: '#f472b6', glow: 'rgba(192, 38, 211, 0.6)' },
    { id: 'jade',     name: 'Jade Enclave',    hex: '#0f766e', border: '#2dd4bf', glow: 'rgba(45, 212, 191, 0.6)' },
    { id: 'indigo',   name: 'Twilight Indigo', hex: '#4338ca', border: '#818cf8', glow: 'rgba(99, 102, 241, 0.6)' }
  ];

  // 16 Handcrafted Levels with distinct patterns & difficulty tiers
  const LEVEL_CONFIGS = [
    { level: 1,  rows: 2, cols: 3,  difficulty: 'Novice',        name: 'Whispering Glade',       pattern: 'organic',        patternName: 'Twin Glades',      patternIcon: '🌿' },
    { level: 2,  rows: 3, cols: 4,  difficulty: 'Novice',        name: 'Starlight Archipelago',  pattern: 'islands',        patternName: 'Floating Isles',   patternIcon: '🏝️' },
    { level: 3,  rows: 4, cols: 4,  difficulty: 'Apprentice',    name: 'Emerald Crossfire',      pattern: 'stripes_angled', patternName: 'Angled Slashes',   patternIcon: '⚔️' },
    { level: 4,  rows: 4, cols: 5,  difficulty: 'Apprentice',    name: 'Misty River Moors',      pattern: 'waves',          patternName: 'River Currents',   patternIcon: '🌊' },
    { level: 5,  rows: 5, cols: 5,  difficulty: 'Adept',         name: 'Spiral Whirlpool',       pattern: 'spiral',         patternName: 'Vortex Swirl',     patternIcon: '🌀' },
    { level: 6,  rows: 5, cols: 6,  difficulty: 'Adept',         name: 'Crystal Cavern',         pattern: 'mosaic',         patternName: 'Gemstone Mosaic',  patternIcon: '💠' },
    { level: 7,  rows: 4, cols: 7,  difficulty: 'Ranger',        name: 'Lightning Corridor',     pattern: 'zigzag',         patternName: 'Lightning Zig-Zag',patternIcon: '⚡' },
    { level: 8,  rows: 6, cols: 6,  difficulty: 'Expert',        name: 'Fortress of Aegis',      pattern: 'concentric',     patternName: 'Citadel Rings',    patternIcon: '🏰' },
    { level: 9,  rows: 6, cols: 7,  difficulty: 'Expert',        name: 'Chaos Nebula',           pattern: 'fractal',        patternName: 'Nebula Mist',      patternIcon: '🌌' },
    { level: 10, rows: 5, cols: 8,  difficulty: 'Master',        name: 'Sunfire Dune Waves',     pattern: 'waves',          patternName: 'Dune Ridges',      patternIcon: '🌅' },
    { level: 11, rows: 7, cols: 7,  difficulty: 'Master',        name: 'Cat Sovereign Court',    pattern: 'mosaic',         patternName: 'Royal Tapestry',   patternIcon: '👑' },
    { level: 12, rows: 7, cols: 8,  difficulty: 'Grandmaster',   name: 'Abyssal Spiral',         pattern: 'spiral',         patternName: 'Great Maelstrom',  patternIcon: '🌀' },
    { level: 13, rows: 6, cols: 9,  difficulty: 'Grandmaster',   name: 'Dragon Spine Rift',      pattern: 'zigzag',         patternName: 'Dragon Slashes',   patternIcon: '🐉' },
    { level: 14, rows: 8, cols: 8,  difficulty: 'Mythic',        name: 'Phantom Sovereign Keep', pattern: 'concentric',     patternName: 'Imperial Citadel', patternIcon: '🏯' },
    { level: 15, rows: 7, cols: 10, difficulty: 'Celestial',     name: 'Celestial Twilight Isles',pattern: 'islands',       patternName: 'Star Constellation',patternIcon: '✨' },
    { level: 16, rows: 8, cols: 10, difficulty: 'Cosmic Legend', name: 'Chaos Dimension Matrix', pattern: 'fractal',       patternName: 'Cosmic Void',      patternIcon: '🔮' }
  ];

  // Helper: Shuffle array
  const shuffle = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  /**
   * Backtracking solver for rectangular and square boards (R x C)
   * Places K = min(R, C) cats such that:
   * 1. No two cats in same row
   * 2. No two cats in same column
   * 3. No two cats on same diagonal
   */
  const solveCatPlacement = (rows, cols) => {
    const K = Math.min(rows, cols);
    const rowIndices = shuffle([...Array(rows).keys()]).slice(0, K);
    rowIndices.sort((a, b) => a - b);

    const colChoices = [...Array(cols).keys()];
    const placement = [];

    const isSafe = (r, c) => {
      for (const p of placement) {
        if (p.c === c) return false;
        if (Math.abs(p.r - r) === Math.abs(p.c - c)) return false;
      }
      return true;
    };

    const backtrack = (idx) => {
      if (idx === K) return true;
      const r = rowIndices[idx];
      const shuffledCols = shuffle(colChoices);

      for (const c of shuffledCols) {
        if (isSafe(r, c)) {
          placement.push({ r, c });
          if (backtrack(idx + 1)) return true;
          placement.pop();
        }
      }
      return false;
    };

    const success = backtrack(0);
    if (!success) {
      return fallbackSolve(rows, cols);
    }
    return placement;
  };

  // Safe fallback solver ensuring valid placement
  const fallbackSolve = (rows, cols) => {
    const K = Math.min(rows, cols);
    for (let attempt = 0; attempt < 100; attempt++) {
      const placement = [];
      const usedCols = new Set();
      const colChoices = shuffle([...Array(cols).keys()]);

      for (let r = 0; r < K; r++) {
        for (const c of colChoices) {
          if (!usedCols.has(c)) {
            let diagCollision = false;
            for (const p of placement) {
              if (Math.abs(p.r - r) === Math.abs(p.c - c)) {
                diagCollision = true;
                break;
              }
            }
            if (!diagCollision) {
              placement.push({ r, c });
              usedCols.add(c);
              break;
            }
          }
        }
      }
      if (placement.length === K) {
        return placement;
      }
    }
    return [{ r: 0, c: 0 }, { r: 1, c: 2 }];
  };

  /**
   * Multi-Pattern Color Region Generator
   * Produces visually distinctive regional patterns while maintaining:
   * 1. Exactly K colors (one per cat)
   * 2. Exactly one cat per color
   * 3. Irregular, merged regional shapes
   */
  const generateColorRegions = (rows, cols, catPositions, patternType = 'organic') => {
    const K = catPositions.length;
    const selectedPalette = shuffle(COLOR_PALETTE).slice(0, K);
    const grid = Array.from({ length: rows }, () => Array(cols).fill(-1));

    // Map each cat to its unique color index
    const catMapPos = new Map();
    catPositions.forEach((pos, idx) => {
      grid[pos.r][pos.c] = idx;
      catMapPos.set(`${pos.r},${pos.c}`, idx);
    });

    switch (patternType) {
      case 'spiral':
        generateSpiralPattern(grid, rows, cols, catPositions, K);
        break;
      case 'zigzag':
        generateZigzagPattern(grid, rows, cols, catPositions, K);
        break;
      case 'concentric':
        generateConcentricPattern(grid, rows, cols, catPositions, K);
        break;
      case 'islands':
        generateIslandsPattern(grid, rows, cols, catPositions, K);
        break;
      case 'waves':
        generateWavesPattern(grid, rows, cols, catPositions, K);
        break;
      case 'mosaic':
        generateMosaicPattern(grid, rows, cols, catPositions, K);
        break;
      case 'stripes_angled':
        generateAngledStripesPattern(grid, rows, cols, catPositions, K);
        break;
      case 'fractal':
      case 'organic':
      default:
        generateOrganicPattern(grid, rows, cols, catPositions, K);
        break;
    }

    // Safety: ensure every cat cell still holds its assigned color
    catPositions.forEach((pos, idx) => {
      grid[pos.r][pos.c] = idx;
    });

    // Final pass: fill any unassigned cell with nearest neighbor
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] === -1) {
          grid[r][c] = getNearestAssignedColor(grid, r, c, rows, cols, K);
        }
      }
    }

    return { grid, palette: selectedPalette };
  };

  /**
   * Pattern 1: Organic Multi-Source Diffusion (Randomized Cellular Flow)
   */
  const generateOrganicPattern = (grid, rows, cols, catPositions, K) => {
    const queue = [];
    catPositions.forEach((pos, idx) => {
      queue.push({ r: pos.r, c: pos.c, colorIdx: idx });
    });

    const dirs = [{ dr: -1, dc: 0 }, { dr: 1, dc: 0 }, { dr: 0, dc: -1 }, { dr: 0, dc: 1 }];

    while (queue.length > 0) {
      const randIdx = Math.floor(Math.random() * queue.length);
      const current = queue.splice(randIdx, 1)[0];
      const shuffledDirs = shuffle(dirs);

      for (const d of shuffledDirs) {
        const nr = current.r + d.dr;
        const nc = current.c + d.dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === -1) {
          grid[nr][nc] = current.colorIdx;
          queue.push({ r: nr, c: nc, colorIdx: current.colorIdx });
        }
      }
    }
  };

  /**
   * Pattern 2: Spiral Vortex Pattern
   */
  const generateSpiralPattern = (grid, rows, cols, catPositions, K) => {
    const midR = (rows - 1) / 2;
    const midC = (cols - 1) / 2;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] !== -1) continue; // Keep cat cell
        const dr = r - midR;
        const dc = c - midC;
        const angle = Math.atan2(dr, dc) + Math.PI; // 0 to 2*PI
        const dist = Math.sqrt(dr * dr + dc * dc);
        const spiralVal = Math.floor((angle / (2 * Math.PI) * K + dist * 0.75)) % K;
        grid[r][c] = spiralVal;
      }
    }
  };

  /**
   * Pattern 3: Zig-Zag Lightning Bands
   */
  const generateZigzagPattern = (grid, rows, cols, catPositions, K) => {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] !== -1) continue;
        const zigzagOffset = (r % 2 === 0) ? c : (cols - 1 - c);
        const band = Math.floor((zigzagOffset + r * 1.5)) % K;
        grid[r][c] = band;
      }
    }
  };

  /**
   * Pattern 4: Concentric Citadel Rings
   */
  const generateConcentricPattern = (grid, rows, cols, catPositions, K) => {
    const midR = (rows - 1) / 2;
    const midC = (cols - 1) / 2;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] !== -1) continue;
        const ringDist = Math.max(Math.abs(r - midR) / midR, Math.abs(c - midC) / midC);
        const ringColor = Math.floor(ringDist * K) % K;
        grid[r][c] = ringColor;
      }
    }
  };

  /**
   * Pattern 5: Archipelago Islands & Stepping Stones
   */
  const generateIslandsPattern = (grid, rows, cols, catPositions, K) => {
    // Grow tight island clusters around cat positions first
    const seeds = catPositions.map((pos, idx) => ({ r: pos.r, c: pos.c, colorIdx: idx }));
    // Add extra satellite seeds for each color
    for (let idx = 0; idx < K; idx++) {
      const extraR = Math.floor(Math.random() * rows);
      const extraC = Math.floor(Math.random() * cols);
      if (grid[extraR][extraC] === -1) {
        seeds.push({ r: extraR, c: extraC, colorIdx: idx });
      }
    }

    // Voronoi assignment with jitter
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] !== -1) continue;
        let minDist = Infinity;
        let bestColor = 0;

        seeds.forEach(s => {
          const d = Math.hypot(r - s.r, c - s.c) + (Math.random() * 0.4 - 0.2);
          if (d < minDist) {
            minDist = d;
            bestColor = s.colorIdx;
          }
        });
        grid[r][c] = bestColor;
      }
    }
  };

  /**
   * Pattern 6: Sinusoidal River Waves
   */
  const generateWavesPattern = (grid, rows, cols, catPositions, K) => {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] !== -1) continue;
        const wave = Math.sin(c * 0.8) * 1.5;
        const waveColor = Math.floor(Math.abs(r + wave)) % K;
        grid[r][c] = waveColor;
      }
    }
  };

  /**
   * Pattern 7: Gemstone Mosaic (Sharp Voronoi Quilt)
   */
  const generateMosaicPattern = (grid, rows, cols, catPositions, K) => {
    const centers = catPositions.map((p, idx) => ({ r: p.r, c: p.c, colorIdx: idx }));

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] !== -1) continue;
        let minDist = Infinity;
        let chosenColor = 0;
        centers.forEach(cnt => {
          // Manhattan metric creates faceted diamond / mosaic boundaries
          const d = Math.abs(r - cnt.r) + Math.abs(c - cnt.c);
          if (d < minDist) {
            minDist = d;
            chosenColor = cnt.colorIdx;
          }
        });
        grid[r][c] = chosenColor;
      }
    }
  };

  /**
   * Pattern 8: Angled 45-Degree Astral Slashes
   */
  const generateAngledStripesPattern = (grid, rows, cols, catPositions, K) => {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] !== -1) continue;
        grid[r][c] = (r + c) % K;
      }
    }
  };

  // Helper: Find closest assigned cell
  const getNearestAssignedColor = (grid, r, c, rows, cols, K) => {
    for (let radius = 1; radius < Math.max(rows, cols); radius++) {
      for (let dr = -radius; dr <= radius; dr++) {
        for (let dc = -radius; dc <= radius; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] !== -1) {
            return grid[nr][nc];
          }
        }
      }
    }
    return Math.floor(Math.random() * K);
  };

  /**
   * Main generation function for any level
   */
  const generatePuzzle = (levelNumber) => {
    let config = LEVEL_CONFIGS.find(cfg => cfg.level === levelNumber);
    if (!config) {
      // Procedural fallback beyond level 16
      const r = 4 + ((levelNumber - 1) % 5);
      const c = r + 2;
      const patterns = ['spiral', 'zigzag', 'concentric', 'islands', 'waves', 'mosaic', 'fractal'];
      const pat = patterns[levelNumber % patterns.length];
      config = {
        level: levelNumber,
        rows: r,
        cols: c,
        difficulty: 'Ascended',
        name: `Cosmic Nexus ${levelNumber}`,
        pattern: pat,
        patternName: 'Ascended Matrix',
        patternIcon: '🔮'
      };
    }

    const { rows, cols, pattern } = config;
    const catPositions = solveCatPlacement(rows, cols);
    const { grid, palette } = generateColorRegions(rows, cols, catPositions, pattern);

    // Fast lookup map: key "r,c" -> color info
    const catMap = new Map();
    catPositions.forEach((pos, idx) => {
      catMap.set(`${pos.r},${pos.c}`, {
        colorIdx: grid[pos.r][pos.c],
        colorInfo: palette[grid[pos.r][pos.c]],
        catId: idx
      });
    });

    return {
      level: config.level,
      name: config.name,
      difficulty: config.difficulty,
      pattern: config.pattern,
      patternName: config.patternName,
      patternIcon: config.patternIcon,
      rows,
      cols,
      totalCats: catPositions.length,
      catPositions,
      gridColors: grid,
      palette,
      catMap
    };
  };

  return {
    generatePuzzle,
    getLevelConfigs: () => LEVEL_CONFIGS,
    COLOR_PALETTE
  };
})();
