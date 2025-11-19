// Airplane Cargo Tetris Game
// main.js

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const restartBtn = document.getElementById('restart-btn');

// Game constants
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 32;
const GAME_TIME = 60; // seconds

// Tetris-like shapes (cargo packages)
const SHAPES = [
    [[1,1,1,1]], // I
    [[1,1],[1,1]], // O
    [[0,1,0],[1,1,1]], // T
    [[1,1,0],[0,1,1]], // S
    [[0,1,1],[1,1,0]], // Z
    [[1,0,0],[1,1,1]], // J
    [[0,0,1],[1,1,1]], // L
];
const COLORS = [
    '#f44336','#ffeb3b','#4caf50','#2196f3','#ff9800','#9c27b0','#00bcd4'
];

let board, current, next, score, timer, interval, running;

function resetGame() {
    board = Array.from({length: ROWS}, () => Array(COLS).fill(0));
    score = 0;
    timer = GAME_TIME;
    running = false;
    current = randomPiece();
    next = randomPiece();
    updateScore();
    updateTimer();
    draw();
}

function randomPiece() {
    const idx = Math.floor(Math.random() * SHAPES.length);
    return {
        shape: SHAPES[idx],
        color: COLORS[idx],
        x: Math.floor(COLS/2) - 1,
        y: 0
    };
}

function drawAircraftBackground() {
    // Draw fuselage
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = '#b0bec5';
    ctx.strokeStyle = '#78909c';
    // Fuselage (rectangle with rounded ends)
    ctx.beginPath();
    ctx.moveTo(2*BLOCK_SIZE, 0.5*BLOCK_SIZE);
    ctx.lineTo(8*BLOCK_SIZE, 0.5*BLOCK_SIZE);
    ctx.quadraticCurveTo(10*BLOCK_SIZE, 10*BLOCK_SIZE, 8*BLOCK_SIZE, 19.5*BLOCK_SIZE);
    ctx.lineTo(2*BLOCK_SIZE, 19.5*BLOCK_SIZE);
    ctx.quadraticCurveTo(0, 10*BLOCK_SIZE, 2*BLOCK_SIZE, 0.5*BLOCK_SIZE);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Cockpit (front)
    ctx.beginPath();
    ctx.ellipse(5*BLOCK_SIZE, 0.5*BLOCK_SIZE, 2*BLOCK_SIZE, 0.7*BLOCK_SIZE, 0, 0, Math.PI*2);
    ctx.fillStyle = '#90caf9';
    ctx.fill();
    ctx.stroke();
    // Tail (back)
    ctx.beginPath();
    ctx.moveTo(4.5*BLOCK_SIZE, 19.5*BLOCK_SIZE);
    ctx.lineTo(5.5*BLOCK_SIZE, 19.5*BLOCK_SIZE);
    ctx.lineTo(5*BLOCK_SIZE, 21*BLOCK_SIZE);
    ctx.closePath();
    ctx.fillStyle = '#78909c';
    ctx.fill();
    ctx.stroke();
    // Wings
    ctx.beginPath();
    ctx.moveTo(2*BLOCK_SIZE, 6*BLOCK_SIZE);
    ctx.lineTo(-2*BLOCK_SIZE, 10*BLOCK_SIZE);
    ctx.lineTo(2*BLOCK_SIZE, 14*BLOCK_SIZE);
    ctx.closePath();
    ctx.fillStyle = '#b0bec5';
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(8*BLOCK_SIZE, 6*BLOCK_SIZE);
    ctx.lineTo(12*BLOCK_SIZE, 10*BLOCK_SIZE);
    ctx.lineTo(8*BLOCK_SIZE, 14*BLOCK_SIZE);
    ctx.closePath();
    ctx.fillStyle = '#b0bec5';
    ctx.fill();
    ctx.stroke();
    ctx.restore();
}

function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    drawAircraftBackground();
    // Draw board
    for(let r=0;r<ROWS;r++){
        for(let c=0;c<COLS;c++){
            if(board[r][c]){
                ctx.fillStyle = board[r][c];
                ctx.fillRect(c*BLOCK_SIZE, r*BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                ctx.strokeStyle = '#fff';
                ctx.strokeRect(c*BLOCK_SIZE, r*BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
    // Draw current piece
    if(current){
        for(let r=0;r<current.shape.length;r++){
            for(let c=0;c<current.shape[r].length;c++){
                if(current.shape[r][c]){
                    ctx.fillStyle = current.color;
                    ctx.fillRect((current.x+c)*BLOCK_SIZE, (current.y+r)*BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                    ctx.strokeStyle = '#fff';
                    ctx.strokeRect((current.x+c)*BLOCK_SIZE, (current.y+r)*BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                }
            }
        }
    }
}

function updateScore() {
    scoreEl.textContent = `Score: ${score}`;
}
function updateTimer() {
    timerEl.textContent = `Time: ${timer}`;
}

function canMove(shape, x, y) {
    for(let r=0;r<shape.length;r++){
        for(let c=0;c<shape[r].length;c++){
            if(shape[r][c]){
                let newX = x+c, newY = y+r;
                if(newX<0||newX>=COLS||newY>=ROWS) return false;
                if(newY>=0 && board[newY][newX]) return false;
            }
        }
    }
    return true;
}

function mergePiece() {
    for(let r=0;r<current.shape.length;r++){
        for(let c=0;c<current.shape[r].length;c++){
            if(current.shape[r][c]){
                board[current.y+r][current.x+c] = current.color;
            }
        }
    }
}

function clearRows() {
    let cleared = 0;
    for(let r=ROWS-1;r>=0;r--){
        if(board[r].every(cell=>cell)){
            board.splice(r,1);
            board.unshift(Array(COLS).fill(0));
            cleared++;
            r++;
        }
    }
    if(cleared) score += cleared*100;
}

function dropPiece() {
    if(canMove(current.shape, current.x, current.y+1)){
        current.y++;
    } else {
        mergePiece();
        clearRows();
        score += 10;
        current = next;
        next = randomPiece();
        if(!canMove(current.shape, current.x, current.y)){
            running = false;
            clearInterval(interval);
            alert('Game Over!');
        }
    }
    updateScore();
    draw();
}

function gameLoop() {
    if(!running) return;
    dropPiece();
}

function startGame() {
    if(running) return;
    running = true;
    interval = setInterval(()=>{
        if(timer>0){
            timer--;
            updateTimer();
            gameLoop();
        } else {
            running = false;
            clearInterval(interval);
            alert('Time up! Final Score: '+score);
        }
    }, 1000);
}

function pauseGame() {
    running = false;
    clearInterval(interval);
}

function restartGame() {
    resetGame();
    startGame();
}

// Controls
startBtn.onclick = startGame;
pauseBtn.onclick = pauseGame;
restartBtn.onclick = restartGame;
document.addEventListener('keydown', e => {
    if(!running) return;
    if(e.key==='ArrowLeft' && canMove(current.shape, current.x-1, current.y)){
        current.x--;
    } else if(e.key==='ArrowRight' && canMove(current.shape, current.x+1, current.y)){
        current.x++;
    } else if(e.key==='ArrowDown' && canMove(current.shape, current.x, current.y+1)){
        current.y++;
    } else if(e.key==='ArrowUp'){
        // Rotate
        const rotated = current.shape[0].map((_,i)=>current.shape.map(row=>row[i]).reverse());
        if(canMove(rotated, current.x, current.y)){
            current.shape = rotated;
        }
    } else if(e.key===' '){
        // Hard drop
        while(canMove(current.shape, current.x, current.y+1)){
            current.y++;
        }
        dropPiece();
    }
    draw();
});

resetGame();
