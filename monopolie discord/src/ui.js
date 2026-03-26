import { BOARD_TILES, TILE_TYPES } from './board_config.js';

export class GameUI {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = 800; // Reference width
    this.height = 800;
    this.tileSize = 0; // Calculated
    this.tilesCount = 5; // Sides have 5 tiles including corners
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    
    this.animations = [];
    this._setupResize();
  }

  _setupResize() {
    const resize = () => {
      const parent = this.canvas.parentElement;
      const size = Math.min(parent.clientWidth, parent.clientHeight) - 20;
      this.canvas.style.width = `${size}px`;
      this.canvas.style.height = `${size}px`;
    };
    window.addEventListener('resize', resize);
    resize();
  }

  drawBoard(gameState) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    
    // Draw background
    ctx.fillStyle = '#1e1f22';
    ctx.fillRect(0, 0, this.width, this.height);
    
    // Draw tiles
    const sideCount = 5; // Tiles per side (0, 1, 2, 3, 4, 5...)
    const size = this.width / (sideCount + 1);
    this.tileSize = size;
    
    BOARD_TILES.forEach((tile, index) => {
      const pos = this.getTilePosition(index);
      this.drawTile(tile, pos.x, pos.y, size, gameState);
    });

    // Draw players
    gameState.players.forEach((player, index) => {
      if (player.isEliminated) return;
      const pos = this.getTilePosition(player.position);
      this.drawPlayer(player, pos.x, pos.y, size, index, gameState.players.length);
    });

    // Request animation frame?
    // requestAnimationFrame(() => this.drawBoard(gameState));
  }

  getTilePosition(index) {
    const s = 5; // Tiles per side excluding corner overlap calculation
    const size = this.width / (s + 1);
    
    if (index >= 0 && index <= 5) {
      // Top row (0 to 5)
      return { x: index * size, y: 0 };
    } else if (index > 5 && index <= 10) {
      // Right col (6 to 10)
      return { x: 5 * size, y: (index - 5) * size };
    } else if (index > 10 && index <= 15) {
      // Bottom row (11 to 15)
      return { x: (15 - index) * size, y: 5 * size };
    } else {
      // Left col (16 to 19)
      return { x: 0, y: (20 - index) * size };
    }
  }

  drawTile(tile, x, y, size, state) {
    const ctx = this.ctx;
    
    // Shadow
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    
    // Background
    ctx.fillStyle = '#2b2d31';
    ctx.strokeStyle = '#4f545c';
    ctx.lineWidth = 1;
    ctx.fillRect(x, y, size, size);
    ctx.strokeRect(x, y, size, size);
    ctx.shadowBlur = 0;

    // Position-aware color bar
    if (tile.type === TILE_TYPES.PROPERTY) {
      ctx.fillStyle = tile.color;
      const barThickness = size * 0.25;
      
      // Determine orientation based on ID
      if (tile.id > 0 && tile.id < 5) { // TOP side
        ctx.fillRect(x, y + size - barThickness, size, barThickness);
      } else if (tile.id > 5 && tile.id < 10) { // RIGHT side
        ctx.fillRect(x, y, barThickness, size);
      } else if (tile.id > 10 && tile.id < 15) { // BOTTOM side
        ctx.fillRect(x, y, size, barThickness);
      } else if (tile.id > 15 && tile.id < 20) { // LEFT side
        ctx.fillRect(x + size - barThickness, y, barThickness, size);
      } else {
        ctx.fillRect(x, y, size, barThickness * 0.5); // Default
      }
      
      // Ownership
      const ownerId = state.properties[tile.id];
      if (ownerId) {
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#57f287';
        ctx.strokeRect(x + 2, y + 2, size - 4, size - 4);
      }
    }

    // Name
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${size * 0.15}px sans-serif`;
    ctx.textAlign = 'center';
    
    if (tile.type === TILE_TYPES.GO || tile.type === TILE_TYPES.JAIL || tile.type === TILE_TYPES.FREE_PARKING || tile.type === TILE_TYPES.GOTO_JAIL) {
        ctx.font = `bold ${size * 0.2}px sans-serif`;
        ctx.fillText(tile.name, x + size / 2, y + size / 2 + 5);
    } else {
        ctx.fillText(tile.name, x + size / 2, y + size * 0.6);
        if (tile.price) {
            ctx.fillStyle = '#57f287';
            ctx.fillText(`$${tile.price}`, x + size / 2, y + size * 0.85);
        }
    }
  }

  drawPlayer(player, x, y, size, index, totalPlayers) {
    const ctx = this.ctx;
    const playerSize = size * 0.3;
    
    // Calculate offset based on index to show multiple players on same tile
    const offset = index * (size * 0.1);
    const px = x + size / 2 + (index - totalPlayers / 2) * playerSize / 2;
    const py = y + size / 2 + (index - totalPlayers / 2) * playerSize / 2;

    // Outer circle
    ctx.beginPath();
    ctx.arc(px, py, playerSize / 2 + 2, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Inner circle (avatar background or color)
    ctx.beginPath();
    ctx.arc(px, py, playerSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${index * 60}, 70%, 50%)`;
    ctx.fill();
    
    // Initial letter
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${playerSize * 0.6}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(player.name[0], px, py);
  }

  updateHUD(state) {
    const list = document.getElementById('players-list');
    list.innerHTML = '';
    
    state.players.forEach((player, index) => {
        const active = index === state.currentPlayerIndex;
        const div = document.createElement('div');
        div.className = `player-card ${active ? 'active' : ''} ${player.isEliminated ? 'eliminated' : ''}`;
        
        div.innerHTML = `
            <div class="mini-avatar" style="background: hsl(${index * 60}, 70%, 50%)"></div>
            <div class="player-info">
                <div class="player-name">${player.name} ${player.isJailed ? '⛓️' : ''}</div>
                <div class="player-balance">$${player.balance}</div>
            </div>
        `;
        list.appendChild(div);
    });

    const logs = document.getElementById('game-logs');
    logs.innerHTML = '';
    state.logs.forEach(log => {
        const div = document.createElement('div');
        div.className = 'log-entry';
        div.innerHTML = log.msg;
        logs.appendChild(div);
    });

    const rollBtn = document.getElementById('roll-btn');
    rollBtn.disabled = state.gameState !== 'PLAYING' || !this.isMyTurn(state);
  }

  // To be overridden in main.js
  isMyTurn(state) { return true; }

  showPropertyModal(tile, player, onBuy, onSkip) {
    const modal = document.getElementById('modal-container');
    modal.classList.remove('hidden');
    
    modal.innerHTML = `
        <div class="modal">
            <h2 style="color: white; margin-bottom: 20px;">Land On Property</h2>
            <div class="property-card" style="border-top-color: ${tile.color}">
                <div class="property-name">${tile.name}</div>
                <div class="property-price">Purchase Price: $${tile.price}</div>
                <div class="rent-info">
                    Base Rent: $${tile.rent}<br>
                    With Monopoly: $${tile.rent * 2}<br><br>
                    Your Balance: $${player.balance}
                </div>
            </div>
            <div class="modal-actions">
                <button id="buy-confirm" class="btn" ${player.balance < tile.price ? 'disabled' : ''}>BUY</button>
                <button id="buy-skip" class="btn" style="background: #4f545c">STAY</button>
            </div>
        </div>
    `;

    document.getElementById('buy-confirm').onclick = () => {
        onBuy();
        modal.classList.add('hidden');
    };
    document.getElementById('buy-skip').onclick = () => {
        onSkip();
        modal.classList.add('hidden');
    };
  }
}
