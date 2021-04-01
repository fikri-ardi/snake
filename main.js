let nameInput = document.getElementById('player-name');
let playBtn = document.getElementById('play-btn');
let instructions = document.getElementById('instructions');
let gameBoard = document.getElementById('game-board');
let rewindBtn = document.getElementById('rewind-btn');
let rewindRange = document.getElementById('rewind-range');
let cancelBtn = document.getElementById('cancel-btn');
let canvas = document.getElementById('canvas');
let score = document.getElementById('score');
let timer = document.getElementById('timer');
let ctx = canvas.getContext('2d');

let blockQuantity = {
    x: 48,
    y: 30
}

let blockSize = {
    x: canvas.width / blockQuantity.x,
    y: canvas.height / blockQuantity.y
}

let snakes = [];
let foods = [];
let snakePositions = [];
let snakeDx = 1;
let snakeDy = 0;
let timestamp = 0;
let snakeDirection = 'right';
let secondPassed = 0;
let snakeSpeed = 250;
let gameStatus = 'playing';

playBtn.addEventListener('click', () => {
    if (nameInput != '') {
        instructions.style.display = 'none'
        gameBoard.style.display = 'block';
        init()
        start()
    }
})

nameInput.addEventListener('input', event => event.target.value == '' ? playBtn.setAttribute('disabled', true) : playBtn.removeAttribute('disabled'))

rewindBtn.addEventListener('click', rewind)

rewindRange.addEventListener('input', event => {
    let inputRangeValue = event.target.value
    snakes = snakePositions[inputRangeValue] ?? snakes;
})

cancelBtn.addEventListener('click', () => {
    rewindRange.classList.remove('active')
    cancelBtn.classList.remove('active')
    gameStatus = 'playing'
    snakes = snakeTmp
})

window.onkeyup = event => {
    if ((event.key === 'ArrowUp' || event.key === 'w') && snakeDirection !== 'down') {
        snakeDx = 0
        snakeDy = -1
        snakeDirection = 'up'
        update(timestamp)
    } else if ((event.key === 'ArrowDown' || event.key === 's') && snakeDirection !== 'up') {
        snakeDx = 0
        snakeDy = 1
        snakeDirection = 'down'
        update(timestamp)
    } else if ((event.key === 'ArrowLeft' || event.key === 'a') && snakeDirection !== 'right') {
        snakeDx = -1
        snakeDy = 0
        snakeDirection = 'left'
        update(timestamp)
    } else if ((event.key === 'ArrowRight' || event.key === 'd') && snakeDirection !== 'left') {
        snakeDx = 1
        snakeDy = 0
        snakeDirection = 'right'
        update(timestamp)
    }
}

function rewind() {
    if (gameStatus == 'playing') {
        gameStatus = 'paused'
        rewindRange.classList.add('active');
        cancelBtn.classList.add('active');
        rewindRange.value = 5;
    } else if (gameStatus == 'paused') {
        gameStatus = 'playing'
        snakeTmp = snakes;
        rewindRange.classList.remove('active');
        cancelBtn.classList.remove('active');
    }
}

function init() {
    // membuat variable snakes yang menampung tubuh ular
    for (let i = 0; i < 6; i++) snakes.push({
        x: blockQuantity.x / 2 - i,
        y: blockQuantity.y / 2
    })

    for (let i = 0; i < 3; i++) generateFood()

    setInterval(() => {
        if (foods.length < 5) generateFood()
    }, 3000)

    setInterval(() => {
        if (gameStatus == 'playing') {
            saveSnake()
        }
    }, 1000)

}

function saveSnake() {
    if (snakePositions.length > 5) snakePositions.shift()
    let newSnake = snakes.slice();
    snakePositions.push(newSnake)
}

function start() {
    requestAnimationFrame(() => {
        secondPassed = 0;
        render(0);
    })
}

function render(time) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw()
    if (time - secondPassed > snakeSpeed && gameStatus == 'playing') {
        secondPassed = time
        update(time)
    }
    requestAnimationFrame(time => render(time))
}

function generateFood() {
    let food = {
        x: Math.floor(Math.random() * blockQuantity.x),
        y: Math.floor(Math.random() * blockQuantity.y),
    }
    if (snakes.every(snake => snake.x == food.x && snake.y == food.y)) return generateFood()
    foods.push(food);
}

function draw() {
    // gambar papan main
    for (let coll = 0; coll < blockQuantity.x; coll++) {
        for (let row = 0; row < blockQuantity.y; row++) {
            let background = (coll % 2 == 0 && row % 2 == 1) || (coll % 2 == 1 && row % 2 == 0) ? '#0f223d' : '#183257'
            ctx.fillStyle = background;
            ctx.fillRect(coll * blockSize.x, row * blockSize.y, blockQuantity.x, blockQuantity.y);
        }
    }

    // gambar ular
    snakes.forEach((snake) => {
        ctx.beginPath()
        ctx.fillStyle = '#ffe600';
        ctx.strokeStyle = '#ffd000';
        ctx.rect(snake.x * blockSize.x, snake.y * blockSize.y, blockSize.x, blockSize.y)
        ctx.fill()
        ctx.stroke()
        ctx.closePath()
    })

    // gambar makanan
    foods.forEach((food) => {
        ctx.beginPath()
        ctx.fillStyle = '#ffffff90';
        ctx.fillRect(food.x * blockSize.x, food.y * blockSize.y, blockSize.x, blockSize.y)
    })
}

function update(time) {
    // membuat kepala ular
    let newHead = {
        x: snakes[0].x + snakeDx,
        y: snakes[0].y + snakeDy
    }
    snakes.unshift(newHead)

    timestamp = time

    let foodEatenIndex = null;
    foods.forEach((food, index) => {
        if (food.x == newHead.x && food.y == newHead.y) foodEatenIndex = index
    })

    foodEatenIndex !== null ? foods.splice(foodEatenIndex, 1) : snakes.pop()

    if (newHead.x < 0 || newHead.y < 0 || newHead.x >= blockQuantity.x || newHead.y >= blockQuantity.y) gameOver()

    snakes.forEach((snake, index) => {
        if (index > 0) {
            if (newHead.x == snake.x && newHead.y == snake.y) gameOver()
        }
    })

    score.innerText = snakes.length;

    let second = Math.floor(time / 1000) % 60;
    let minutes = Math.floor(time / 1000 / 60) % 60;
    let hour = Math.floor(time / 1000 / 60 / 60) % 24;

    timer.innerText = `${hour < 10 ? '0' : ''}${hour}:${minutes < 10 ? '0' : ''}${minutes}:${second < 10 ? '0' : ''}${second}`;
}

function gameOver() {
    gameStatus = 'end';
    let highScore = localStorage.getItem('highScore') ?? 0;
    if (snakes.length > highScore) {
        localStorage.setItem('highScore', snakes.length)
    }
    highScore = localStorage.getItem('highScore');
    alert(`Your high score is ${highScore}`)
}