import { DiscordSDK } from "@discord/embedded-app-sdk";
import { Game } from './game.js';
import { GameUI } from './ui.js';

let discordSdk;

if (typeof window !== 'undefined') {
  discordSdk = new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID || "1234567890");
}

const game = new Game();
const ui = new GameUI(document.getElementById('game-canvas'));

// Override UI methods
ui.isMyTurn = (state) => {
    // In local testing, it's always my turn if game is playing
    if (!discordSdk) return true;
    
    // In real discord, compare current player ID with my user ID
    if (state.players.length === 0) return false;
    const currentPlayer = state.players[state.currentPlayerIndex];
    return currentPlayer.id === (discordSdk.userId || 'local-host');
};

async function setupDiscord() {
    if (!discordSdk) return setupLocal();
    
    try {
        await discordSdk.ready();
        
        // Authorize
        const { code } = await discordSdk.commands.authorize({
            client_id: import.meta.env.VITE_DISCORD_CLIENT_ID,
            response_type: "code",
            state: "",
            prompt: "none",
            scope: ["identify", "guilds"],
        });

        // Normally we'd send this to our backend to get an access token
        // For a frontend-only prototype, we'll use a placeholder or skip sensitive features
        
        const auth = await discordSdk.commands.authenticate({
            client_id: import.meta.env.VITE_DISCORD_CLIENT_ID,
            code,
        });

        // Initialize user
        game.addPlayer(auth.user.id, auth.user.username, auth.user.avatar);
        
        // Listen for other players would normally use webhooks/websockets
        // For Discord Activities, we often use Discord's Instance State (if available/enabled)
        // or a simple polling/sync mechanism.
        
        renderLobby();
        
    } catch (e) {
        console.warn("Discord SDK failed to initialize:", e);
        setupLocal();
    }
}

function setupLocal() {
    console.log("Running in local mode");
    game.addPlayer('p1', 'Player 1', null);
    game.addPlayer('p2', 'Player 2', null);
    renderLobby();
}

function renderLobby() {
    const list = document.getElementById('lobby-players');
    list.innerHTML = '';
    
    game.players.forEach(p => {
        const div = document.createElement('div');
        div.className = 'lobby-player';
        div.innerHTML = `
            <div class="lobby-avatar" style="background: hsl(${game.players.indexOf(p) * 60}, 70%, 50%); border: 3px solid ${p.id === 'p1' ? '#5865f2' : 'white'}"></div>
            <span>${p.name}</span>
        `;
        list.appendChild(div);
    });

    const startBtn = document.getElementById('start-game-btn');
    startBtn.disabled = game.players.length < 2;
    startBtn.innerText = game.players.length < 2 ? 'WAITING FOR PLAYERS...' : 'START GAME';
    
    // Add a local "Join" simulated button if in local mode
    if (!discordSdk && !document.getElementById('sim-join')) {
        const simJoin = document.createElement('button');
        simJoin.id = 'sim-join';
        simJoin.className = 'btn';
        simJoin.innerText = 'SIMULATE NEW PLAYER';
        simJoin.style.marginTop = '10px';
        simJoin.onclick = () => {
            const id = 'p' + (game.players.length + 1);
            game.addPlayer(id, 'Player ' + (game.players.length + 1), null);
            renderLobby();
        };
        document.querySelector('.lobby-content').appendChild(simJoin);
    }
}

document.getElementById('start-game-btn').onclick = () => {
    if (game.startGame()) {
        document.getElementById('lobby').classList.add('hidden');
        document.getElementById('game-container').classList.remove('hidden');
        updateUI();
    }
};

document.getElementById('roll-btn').onclick = async () => {
    if (game.gameState !== 'PLAYING') return;
    
    const currentPlayer = game.getCurrentPlayer();
    
    // Show dice animation
    document.getElementById('dice-view').classList.remove('hidden');
    document.getElementById('roll-btn').disabled = true;
    
    // Roll
    const total = game.rollDice();
    
    // Simple dice visual
    document.getElementById('die-1').innerText = game.lastRoll[0];
    document.getElementById('die-2').innerText = game.lastRoll[1];
    
    // Wait a bit
    await new Promise(r => setTimeout(r, 1000));
    document.getElementById('dice-view').classList.add('hidden');
    
    // Move
    const tile = game.movePlayer(currentPlayer, total);
    updateUI();
    
    // Effect
    const effect = game.handleTileEffect(tile);
    
    if (effect.type === 'BUY_PROMPT') {
        ui.showPropertyModal(effect.tile, currentPlayer, 
            () => {
                game.buyProperty(currentPlayer, effect.tile.id);
                game.nextTurn();
                updateUI();
            },
            () => {
                game.nextTurn();
                updateUI();
            }
        );
    } else {
        await new Promise(r => setTimeout(r, 500));
        game.nextTurn();
        updateUI();
    }
};

function updateUI() {
    ui.drawBoard(game.getState());
    ui.updateHUD(game.getState());
}

// Initial draw loop
function animate() {
    if (game.gameState === 'PLAYING') {
        ui.drawBoard(game.getState());
    }
    requestAnimationFrame(animate);
}

setupDiscord();
animate();
