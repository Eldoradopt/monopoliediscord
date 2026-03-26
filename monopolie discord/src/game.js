import { BOARD_TILES, TILE_TYPES } from './board_config.js';

export class Game {
  constructor() {
    this.players = []; // { id, name, avatar, balance, position, isJailed, isEliminated }
    this.currentPlayerIndex = 0;
    this.gameState = 'LOBBY'; // LOBBY, PLAYING, GAME_OVER
    this.logs = [];
    this.turnPhase = 'ROLL'; // ROLL, ACTION, END
    this.properties = {}; // { tileId: ownerId }
    this.lastRoll = [1, 1];
    this.moving = false;
  }

  addPlayer(id, name, avatar) {
    if (this.players.find(p => p.id === id)) return;
    this.players.push({
      id,
      name,
      avatar,
      balance: 1500,
      position: 0,
      isJailed: 0, // Number of turns remaining in jail
      isEliminated: false
    });
    this.log(`${name} joined the game.`);
  }

  startGame() {
    if (this.players.length < 2) return false;
    this.gameState = 'PLAYING';
    this.currentPlayerIndex = 0;
    this.log(`Game started! It's ${this.players[0].name}'s turn.`);
    return true;
  }

  log(msg) {
    this.logs.unshift({ msg, time: Date.now() });
    if (this.logs.length > 50) this.logs.pop();
  }

  getCurrentPlayer() {
    return this.players[this.currentPlayerIndex];
  }

  nextTurn() {
    let attempts = 0;
    do {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
      attempts++;
    } while (this.players[this.currentPlayerIndex].isEliminated && attempts < this.players.length);
    
    this.turnPhase = 'ROLL';
    const p = this.getCurrentPlayer();
    if (p.isJailed > 0) {
      p.isJailed--;
      this.log(`${p.name} is in jail (${p.isJailed} turns left).`);
      if (p.isJailed == 0) {
        this.log(`${p.name} was released from jail!`);
      } else {
         // Skip turn if still jailed
         // Actually, let's auto-skip or allow a "Pay to get out" action?
         // For simplification, let's auto-advance after 1 sec in UI logic or just move to next here
      }
    }
    
    this.log(`It's ${p.name}'s turn.`);
  }

  rollDice() {
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    this.lastRoll = [d1, d2];
    const total = d1 + d2;
    this.log(`${this.getCurrentPlayer().name} rolled :dice: ${d1} and ${d2} (${total})`);
    return total;
  }

  movePlayer(player, steps) {
    const oldPos = player.position;
    player.position = (player.position + steps) % BOARD_TILES.length;
    
    // Check for passing GO
    if (player.position < oldPos) {
      player.balance += 200;
      this.log(`${player.name} passed START and collected 200!`);
    }
    
    return BOARD_TILES[player.position];
  }

  handleTileEffect(tile) {
    const player = this.getCurrentPlayer();
    
    switch (tile.type) {
      case TILE_TYPES.GO:
        this.log(`${player.name} rested on START.`);
        break;
      
      case TILE_TYPES.PROPERTY:
        const ownerId = this.properties[tile.id];
        if (ownerId && ownerId !== player.id) {
          // Pay rent
          const owner = this.players.find(p => p.id === ownerId);
          const rent = tile.rent;
          this.transferMoney(player, owner, rent);
          this.log(`${player.name} paid ${rent} rent to ${owner.name}.`);
        } else if (!ownerId) {
          // Can buy
          return { type: 'BUY_PROMPT', tile };
        }
        break;

      case TILE_TYPES.TAX:
        player.balance -= tile.price;
        this.log(`${player.name} paid ${tile.price} in taxes.`);
        break;

      case TILE_TYPES.REWARD:
        player.balance += tile.price;
        this.log(`${player.name} found ${tile.price}!`);
        break;

      case TILE_TYPES.CHANCE:
        this.handleChance(player);
        break;

      case TILE_TYPES.GOTO_JAIL:
        player.position = 5; // Jail tile index
        player.isJailed = 2;
        this.log(`${player.name} was sent to JAIL!`);
        break;

      default:
        break;
    }
    
    this.checkBankruptcy(player);
    return { type: 'NONE' };
  }

  transferMoney(from, to, amount) {
    from.balance -= amount;
    to.balance += amount;
  }

  buyProperty(player, tileId) {
    const tile = BOARD_TILES.find(t => t.id === tileId);
    if (player.balance >= tile.price) {
      player.balance -= tile.price;
      this.properties[tileId] = player.id;
      this.log(`${player.name} bought ${tile.name} for ${tile.price}.`);
      return true;
    }
    return false;
  }

  handleChance(player) {
    const events = [
      { msg: 'Bank error in your favor! Collect 100.', effect: () => player.balance += 100 },
      { msg: 'Speeding fine! Pay 50.', effect: () => player.balance -= 50 },
      { msg: 'Advance to START!', effect: () => { player.position = 0; player.balance += 200; } },
      { msg: 'Go to Jail!', effect: () => { player.position = 5; player.isJailed = 2; } },
      { msg: 'You win the lottery! Collect 250.', effect: () => player.balance += 250 }
    ];
    const event = events[Math.floor(Math.random() * events.length)];
    this.log(`CHANCE: ${event.msg}`);
    event.effect();
  }

  checkBankruptcy(player) {
    if (player.balance < 0) {
      player.isEliminated = true;
      this.log(`BANKRUPTCY! ${player.name} has been eliminated.`);
      // Return properties to bank
      for (let tileId in this.properties) {
        if (this.properties[tileId] === player.id) {
          delete this.properties[tileId];
        }
      }
      
      const activePlayers = this.players.filter(p => !p.isEliminated);
      if (activePlayers.length === 1) {
        this.gameState = 'GAME_OVER';
        this.log(`${activePlayers[0].name} WINS THE GAME!`);
      }
    }
  }

  getState() {
    return {
      players: this.players,
      currentPlayerIndex: this.currentPlayerIndex,
      gameState: this.gameState,
      logs: this.logs,
      properties: this.properties,
      lastRoll: this.lastRoll,
      turnPhase: this.turnPhase
    };
  }

  setState(state) {
    Object.assign(this, state);
  }
}
