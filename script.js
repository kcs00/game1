// 게임 캔버스 및 컨텍스트 설정
const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');

// 게임 변수 초기화
let snake = [];
let food = {};
let direction = '';
let nextDirection = '';
let gameInterval;
let gameSpeed = 100; // 밀리초 단위 (낮을수록 빠름)
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameRunning = false;
let gridSize = 20; // 그리드 크기
let gridWidth = canvas.width / gridSize;
let gridHeight = canvas.height / gridSize;

// DOM 요소
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const startButton = document.getElementById('start-btn');
const resetButton = document.getElementById('reset-btn');

// 게임 초기화 함수
function initGame() {
    // 뱀 초기화 (중앙에 위치)
    snake = [
        { x: Math.floor(gridWidth / 2), y: Math.floor(gridHeight / 2) }
    ];
    
    // 방향 초기화
    direction = '';
    nextDirection = '';
    
    // 점수 초기화
    score = 0;
    scoreElement.textContent = score;
    highScoreElement.textContent = highScore;
    
    // 음식 생성
    createFood();
    
    // 게임 상태 업데이트
    gameRunning = false;
    
    // 버튼 상태 업데이트
    startButton.disabled = false;
    resetButton.disabled = true;
    
    // 게임 보드 그리기
    drawGame();
}

// 음식 생성 함수
function createFood() {
    // 랜덤 위치에 음식 생성 (뱀과 겹치지 않게)
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * gridWidth),
            y: Math.floor(Math.random() * gridHeight)
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    
    food = newFood;
}

// 게임 그리기 함수
function drawGame() {
    // 캔버스 지우기
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 뱀 그리기
    snake.forEach((segment, index) => {
        // 머리는 다른 색상으로 표시
        if (index === 0) {
            ctx.fillStyle = '#4CAF50'; // 머리 색상
        } else {
            ctx.fillStyle = '#8BC34A'; // 몸통 색상
        }
        
        ctx.fillRect(
            segment.x * gridSize,
            segment.y * gridSize,
            gridSize - 1,
            gridSize - 1
        );
    });
    
    // 음식 그리기
    ctx.fillStyle = '#FF5722'; // 음식 색상
    ctx.fillRect(
        food.x * gridSize,
        food.y * gridSize,
        gridSize - 1,
        gridSize - 1
    );
}

// 게임 업데이트 함수
function updateGame() {
    // 다음 방향으로 업데이트
    if (nextDirection) {
        direction = nextDirection;
    }
    
    // 방향이 없으면 움직이지 않음
    if (!direction) return;
    
    // 뱀 머리의 현재 위치
    const head = { ...snake[0] };
    
    // 방향에 따라 머리 위치 업데이트
    switch (direction) {
        case 'up':
            head.y -= 1;
            break;
        case 'down':
            head.y += 1;
            break;
        case 'left':
            head.x -= 1;
            break;
        case 'right':
            head.x += 1;
            break;
    }
    
    // 벽과 충돌 확인
    if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
        gameOver();
        return;
    }
    
    // 자기 자신과 충돌 확인
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }
    
    // 새로운 머리 추가
    snake.unshift(head);
    
    // 음식을 먹었는지 확인
    if (head.x === food.x && head.y === food.y) {
        // 점수 증가
        score += 10;
        scoreElement.textContent = score;
        
        // 최고 점수 업데이트
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
        
        // 새로운 음식 생성
        createFood();
        
        // 게임 속도 증가 (최소 속도 제한)
        if (gameSpeed > 50) {
            gameSpeed -= 2;
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, gameSpeed);
        }
    } else {
        // 음식을 먹지 않았으면 꼬리 제거
        snake.pop();
    }
    
    // 게임 그리기
    drawGame();
}

// 게임 루프 함수
function gameLoop() {
    updateGame();
}

// 게임 시작 함수
function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        direction = 'right'; // 기본 방향 설정
        nextDirection = 'right';
        startButton.disabled = true;
        resetButton.disabled = false;
        gameInterval = setInterval(gameLoop, gameSpeed);
    }
}

// 게임 오버 함수
function gameOver() {
    clearInterval(gameInterval);
    gameRunning = false;
    startButton.disabled = false;
    resetButton.disabled = false;
    alert(`게임 오버! 점수: ${score}`);
}

// 키보드 이벤트 리스너
document.addEventListener('keydown', (event) => {
    if (!gameRunning) return;
    
    // 현재 방향의 반대 방향으로는 이동할 수 없음
    switch (event.key) {
        case 'ArrowUp':
            if (direction !== 'down') nextDirection = 'up';
            break;
        case 'ArrowDown':
            if (direction !== 'up') nextDirection = 'down';
            break;
        case 'ArrowLeft':
            if (direction !== 'right') nextDirection = 'left';
            break;
        case 'ArrowRight':
            if (direction !== 'left') nextDirection = 'right';
            break;
    }
});

// 버튼 이벤트 리스너
startButton.addEventListener('click', startGame);
resetButton.addEventListener('click', initGame);

// 모바일 터치 컨트롤 추가
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    e.preventDefault();
});

canvas.addEventListener('touchmove', (e) => {
    if (!gameRunning) return;
    e.preventDefault();
    
    const touchEndX = e.touches[0].clientX;
    const touchEndY = e.touches[0].clientY;
    
    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;
    
    // 가장 큰 움직임 방향으로 이동
    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0 && direction !== 'left') {
            nextDirection = 'right';
        } else if (dx < 0 && direction !== 'right') {
            nextDirection = 'left';
        }
    } else {
        if (dy > 0 && direction !== 'up') {
            nextDirection = 'down';
        } else if (dy < 0 && direction !== 'down') {
            nextDirection = 'up';
        }
    }
    
    touchStartX = touchEndX;
    touchStartY = touchEndY;
});

// 게임 초기화
window.onload = initGame;