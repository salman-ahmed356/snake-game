const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

const backgroundImage = new Image();
backgroundImage.src = 'background.jpg';

const snakeHeadImage = new Image();
snakeHeadImage.src = 'snakeHead.png';

const snakeBodyImage = new Image();
snakeBodyImage.src = 'snakeBody.png';

const fruitImage = new Image();
fruitImage.src = 'fruit.png';

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const blockSize = 20;
let snake = [];
let direction = {x: 1, y: 0};
let fruits = [];
let score = 0;
let gameOver = false;
let gamePaused = false;
let speed = 80;

let lastMoveTime = 0;

function init() {
    snake = [
        {x: Math.floor(canvas.width / 2 / blockSize) * blockSize, y: Math.floor(canvas.height / 2 / blockSize) * blockSize},
        {x: Math.floor(canvas.width / 2 / blockSize) * blockSize - blockSize, y: Math.floor(canvas.height / 2 / blockSize) * blockSize},
        {x: Math.floor(canvas.width / 2 / blockSize) * blockSize - 2 * blockSize, y: Math.floor(canvas.height / 2 / blockSize) * blockSize},
    ];
    direction = {x: 1, y: 0};
    score = 0;
    gameOver = false;
    gamePaused = false;
    spawnFruits();
}

function drawSnake() {
    snake.forEach((segment, index) => {
        if (index === 0) {
            context.drawImage(snakeHeadImage, segment.x, segment.y, blockSize, blockSize);
        } else {
            context.drawImage(snakeBodyImage, segment.x, segment.y, blockSize, blockSize);
        }
    });
}

function moveSnake() {
    const head = {x: snake[0].x + direction.x * blockSize, y: snake[0].y + direction.y * blockSize};

    if (head.x < 0 || head.y < 0 || head.x >= canvas.width || head.y >= canvas.height || checkCollisionWithSnake(head)) {
        gameOver = true;
        return;
    }

    snake.unshift(head);

    for (let i = 0; i < fruits.length; i++) {
        if (head.x === fruits[i].x && head.y === fruits[i].y) {
            score += 1;
            fruits.splice(i, 1);
            spawnFruit();
            return;
        }
    }

    snake.pop();
}

function drawFruits() {
    const fruitSize = blockSize * 1.5;
    fruits.forEach(fruit => {
        context.drawImage(fruitImage, fruit.x, fruit.y, fruitSize, fruitSize);
    });
}

function spawnFruit() {
    let fruit = {
        x: Math.floor(Math.random() * (canvas.width / blockSize)) * blockSize,
        y: Math.floor(Math.random() * (canvas.height / blockSize)) * blockSize
    };

    if (checkCollisionWithSnake(fruit)) {
        spawnFruit();
    } else {
        fruits.push(fruit);
    }
}

function spawnFruits() {
    fruits = [];
    for (let i = 0; i < 3; i++) {
        spawnFruit();
    }
}

function checkCollisionWithSnake(position) {
    return snake.some(segment => segment.x === position.x && segment.y === position.y);
}

window.addEventListener('keydown', (event) => {
    if (!gamePaused && !gameOver) {
        switch (event.code) {
            case 'ArrowUp':
                if (direction.y === 0) direction = {x: 0, y: -1};
                break;
            case 'ArrowDown':
                if (direction.y === 0) direction = {x: 0, y: 1};
                break;
            case 'ArrowLeft':
                if (direction.x === 0) direction = {x: -1, y: 0};
                break;
            case 'ArrowRight':
                if (direction.x === 0) direction = {x: 1, y: 0};
                break;
        }
    }

    if (event.code === 'KeyP') {
        gamePaused = !gamePaused;
    }

    if (event.code === 'KeyR' && gamePaused) {
        gamePaused = false; 
    }

    if (event.code === 'KeyR' && gameOver) {
        init(); 
    }
});

function displayScore() {
    context.fillStyle = 'white';
    context.font = '20px Arial';
    context.fillText("Score: " + score, 20, 30);
}

function displayGameOver() {
    context.fillStyle = 'red';
    context.font = '40px Arial';
    context.fillText('Game Over!', canvas.width / 2 - 100, canvas.height / 2);
    context.font = '20px Arial';
    context.fillText('Press R to Restart', canvas.width / 2 - 80, canvas.height / 2 + 40);
}

function displayPauseResumeInstructions() {
    context.fillStyle = 'white';
    context.font = '16px Arial';
    context.fillText('Press P to Pause, R to Resume', canvas.width - 230, 30);
}

function drawBorder() {
    context.strokeStyle = 'white';
    context.lineWidth = 5;
    context.strokeRect(0, 0, canvas.width, canvas.height);
}

function gameLoop(timestamp) {
    if (!lastMoveTime || timestamp - lastMoveTime >= speed) {
        if (!gamePaused && !gameOver) {
            moveSnake();
        }
        lastMoveTime = timestamp;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    if (!gamePaused && !gameOver) {
        drawSnake();
        drawFruits();
        drawBorder();
        displayScore();
    } else if (gameOver) {
        displayGameOver();
    }

    if (gamePaused) {
        context.fillStyle = 'yellow';
        context.font = '40px Arial';
        context.fillText('Game Paused', canvas.width / 2 - 120, canvas.height / 2);
    }

    displayPauseResumeInstructions();
    requestAnimationFrame(gameLoop);
}



Promise.all([
    new Promise(resolve => backgroundImage.onload = resolve),
    new Promise(resolve => snakeHeadImage.onload = resolve),
    new Promise(resolve => snakeBodyImage.onload = resolve),
    new Promise(resolve => fruitImage.onload = resolve)
]).then(() => {
    init();
    requestAnimationFrame(gameLoop);
});
