/**
 * HIDDEN CATS - Board Renderer & Interaction
 * Handles DOM grid layout, cell rendering, click triggers, animations, and hints
 */

const BoardManager = (() => {
  let currentPuzzle = null;
  let boardContainer = null;
  let onCellClickCallback = null;

  // Cat avatar choices for revealed sprites
  const CAT_SPRITES = [
    'assets/cats/cat_wizard.svg',
    'assets/cats/cat_luna.svg',
    'assets/cats/cat_sprout.svg',
    'assets/cats/cat_solaris.svg',
    'assets/cats/cat_phantom.svg'
  ];

  // Subtle mystical glyphs etched into cell backgrounds
  const GLYPHS = ['✦', '✧', '☽', '★', '❈', '⚜', '✵', 'ᚱ', 'ᚦ', 'ᛝ'];

  const init = (containerElement, onCellClick) => {
    boardContainer = containerElement;
    onCellClickCallback = onCellClick;
  };

  /**
   * Render the complete board
   */
  const render = (puzzle) => {
    currentPuzzle = puzzle;
    if (!boardContainer) return;

    boardContainer.className = `game-board pattern-${puzzle.pattern || 'organic'}`;
    boardContainer.innerHTML = '';
    const { rows, cols, gridColors, palette } = puzzle;

    // Set CSS grid template
    boardContainer.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
    boardContainer.style.gridTemplateRows = `repeat(${rows}, minmax(0, 1fr))`;

    // Dynamic sizing based on viewport to scale cleanly from 2x3 up to 8x10
    const maxArenaW = Math.min(window.innerWidth - 40, 620);
    const maxArenaH = Math.min(window.innerHeight * 0.56, 460);
    const sizeByW = Math.floor((maxArenaW - (cols + 1) * 6) / cols);
    const sizeByH = Math.floor((maxArenaH - (rows + 1) * 6) / rows);
    const targetSize = Math.max(32, Math.min(66, Math.min(sizeByW, sizeByH)));

    boardContainer.style.width = `${cols * targetSize + (cols - 1) * 6 + 28}px`;
    boardContainer.style.height = `${rows * targetSize + (rows - 1) * 6 + 28}px`;

    // Create cells
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const colorIdx = gridColors[r][c];
        const colorData = palette[colorIdx];

        const cell = document.createElement('div');
        cell.className = 'board-cell';
        cell.dataset.row = r;
        cell.dataset.col = c;
        cell.dataset.colorId = colorData.id;
        cell.dataset.colorIdx = colorIdx;

        // Apply region background color and base styling
        cell.style.backgroundColor = colorData.hex;
        cell.style.borderColor = colorData.border;
        cell.style.boxShadow = `inset 0 1px 2px rgba(255,255,255,0.25), 0 0 12px ${colorData.glow}`;

        // Visually merge borders with same-color neighbors for organic regions
        applyRegionBorders(cell, r, c, gridColors, rows, cols, colorIdx);

        // Subtle mystical symbol decoration inside cell
        const glyph = document.createElement('span');
        glyph.className = 'cell-symbol';
        glyph.textContent = GLYPHS[(r * cols + c) % GLYPHS.length];
        cell.appendChild(glyph);

        // Click handler
        cell.addEventListener('click', (e) => handleCellClick(r, c, cell));
        cell.addEventListener('touchstart', (e) => {
          // Prevent zoom/delay on touch
        }, { passive: true });

        boardContainer.appendChild(cell);
      }
    }
  };

  /**
   * Visually blend adjacent cells of the same color into irregular regions
   */
  const applyRegionBorders = (cell, r, c, gridColors, rows, cols, myColor) => {
    // Check 4 neighbors
    const topSame    = (r > 0 && gridColors[r - 1][c] === myColor);
    const bottomSame = (r < rows - 1 && gridColors[r + 1][c] === myColor);
    const leftSame   = (c > 0 && gridColors[r][c - 1] === myColor);
    const rightSame  = (c < cols - 1 && gridColors[r][c + 1] === myColor);

    // Merge border radius smoothly for connected regions
    const rTl = (!topSame && !leftSame) ? '12px' : '4px';
    const rTr = (!topSame && !rightSame) ? '12px' : '4px';
    const rBr = (!bottomSame && !rightSame) ? '12px' : '4px';
    const rBl = (!bottomSame && !leftSame) ? '12px' : '4px';

    cell.style.borderRadius = `${rTl} ${rTr} ${rBr} ${rBl}`;
  };

  const handleCellClick = (r, c, cellElement) => {
    if (!currentPuzzle || cellElement.classList.contains('revealed') || cellElement.classList.contains('missed')) {
      return;
    }
    if (onCellClickCallback) {
      onCellClickCallback(r, c, cellElement);
    }
  };

  /**
   * Trigger correct cat reveal animation and visuals on a cell
   */
  const revealCat = (cellElement, catIndex) => {
    cellElement.classList.add('revealed');
    cellElement.innerHTML = ''; // clear symbol

    const spriteImg = document.createElement('img');
    const spritePath = CAT_SPRITES[catIndex % CAT_SPRITES.length];
    spriteImg.src = spritePath;
    spriteImg.alt = 'Hidden Cat';
    spriteImg.className = 'revealed-cat-sprite';

    cellElement.appendChild(spriteImg);

    // Spawn canvas paw particles at cell center
    const rect = cellElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    if (window.ParticleFX) {
      ParticleFX.spawnPawBurst(centerX, centerY);
    }
  };

  /**
   * Trigger wrong cell shake, red flash, and missed indicator
   */
  const markWrong = (cellElement) => {
    cellElement.classList.add('missed', 'anim-shake', 'anim-red-flash');
    
    // Replace symbol with a faint mystical scratch/paw mark
    const mark = document.createElement('span');
    mark.className = 'missed-mark';
    mark.textContent = '✕';
    cellElement.appendChild(mark);

    setTimeout(() => {
      cellElement.classList.remove('anim-shake', 'anim-red-flash');
    }, 600);
  };

  /**
   * Highlight cells of a given color index for the hint system
   */
  const highlightColorRegion = (colorIdx) => {
    const cells = boardContainer.querySelectorAll(`.board-cell[data-color-idx="${colorIdx}"]`);
    cells.forEach(cell => {
      cell.classList.add('anim-hint-active');
      setTimeout(() => {
        cell.classList.remove('anim-hint-active');
      }, 3600);
    });
  };

  /**
   * Get all cells on board
   */
  const getCellElement = (r, c) => {
    return boardContainer ? boardContainer.querySelector(`.board-cell[data-row="${r}"][data-col="${c}"]`) : null;
  };

  return {
    init,
    render,
    revealCat,
    markWrong,
    highlightColorRegion,
    getCellElement
  };
})();
