// Create background stars
function createBackgroundStars() {
    const container = document.getElementById('starsBg');
    for (let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        star.className = 'star-bg';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.width = Math.random() * 3 + 1 + 'px';
        star.style.height = star.style.width;
        star.style.animationDelay = Math.random() * 3 + 's';
        container.appendChild(star);
    }
}
createBackgroundStars();

// Initialize canvas and game variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let score = 0;
let highScore = 0;
let lives = 3;
let gameActive = false;
let stars = [];
let particles = [];
let difficulty = 1;
let isNewHighScore = false;

// Try to load the high score from localStorage
try {
    const savedHighScore = localStorage.getItem('starCatcherHighScore');
    if (savedHighScore) {
        highScore = parseInt(savedHighScore, 10);
        document.getElementById('highScore').textContent = 'High Score: ' + highScore;
    }
} catch (e) {
    console.log('localStorage not available:', e);
    // Continue without high score functionality
}

let basket = {
    x: canvas.width / 2 - 40,
    y: canvas.height - 60,
    width: 80,
    height: 50,
    speed: 8
};

// Mouse movement
canvas.addEventListener('mousemove', (e) => {
    if (!gameActive) return;
    const rect = canvas.getBoundingClientRect();
    basket.x = e.clientX - rect.left - basket.width / 2;
    basket.x = Math.max(0, Math.min(canvas.width - basket.width, basket.x));
});

// Keyboard controls
const keys = {};
document.addEventListener('keydown', (e) => keys[e.key] = true);
document.addEventListener('keyup', (e) => keys[e.key] = false);

function startGame() {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
    document.getElementById('newHighScore').style.display = 'none';
    score = 0;
    lives = 3;
    difficulty = 1;
    stars = [];
    particles = [];
    isNewHighScore = false;
    gameActive = true;
    basket.x = canvas.width / 2 - 40;
    updateScore();
    updateHighScore();
    updateLives();
    gameLoop();
}

function createStar() {
    stars.push({
        x: Math.random() * (canvas.width - 30),
        y: -30,
        size: 30,
        speed: (2 + Math.random() * 2) * difficulty,
        rotation: 0
    });
}

function createParticles(x, y) {
    for (let i = 0; i < 10; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 1,
            size: Math.random() * 3 + 2
        });
    }
}

function drawBasket() {
    const gradient = ctx.createLinearGradient(basket.x, basket.y, basket.x, basket.y + basket.height);
    gradient.addColorStop(0, '#8B4513');
    gradient.addColorStop(1, '#654321');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(basket.x, basket.y, basket.width, basket.height);
    
    ctx.fillStyle = '#D2691E';
    ctx.fillRect(basket.x + 5, basket.y + 5, basket.width - 10, basket.height - 10);
    
    ctx.strokeStyle = '#5C3317';
    ctx.lineWidth = 2;
    ctx.strokeRect(basket.x, basket.y, basket.width, basket.height);
}

function drawStar(x, y, size, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
    gradient.addColorStop(0, '#ffed4e');
    gradient.addColorStop(0.5, '#ffd700');
    gradient.addColorStop(1, '#ffaa00');
    
    ctx.fillStyle = gradient;
    ctx.strokeStyle = '#ffed4e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const outerX = Math.cos(angle) * size;
        const outerY = Math.sin(angle) * size;
        if (i === 0) ctx.moveTo(outerX, outerY);
        else ctx.lineTo(outerX, outerY);
        
        const innerAngle = angle + (2 * Math.PI) / 10;
        const innerX = Math.cos(innerAngle) * (size * 0.4);
        const innerY = Math.sin(innerAngle) * (size * 0.4);
        ctx.lineTo(innerX, innerY);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
}

function updateScore() {
    document.getElementById('score').textContent = 'Score: ' + score;
    
    // Check for new high score
    if (score > highScore) {
        highScore = score;
        updateHighScore();
        
        if (!isNewHighScore && score > 0) {
            showNewHighScore();
        }
    }
}

function updateHighScore() {
    document.getElementById('highScore').textContent = 'High Score: ' + highScore;
    
    // Save high score to localStorage
    try {
        localStorage.setItem('starCatcherHighScore', highScore);
    } catch (e) {
        console.log('localStorage not available:', e);
    }
}

function showNewHighScore() {
    isNewHighScore = true;
    const newHighScoreEl = document.getElementById('newHighScore');
    newHighScoreEl.style.display = 'block';
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        newHighScoreEl.style.display = 'none';
    }, 3000);
}

function updateLives() {
    const heartsContainer = document.getElementById('lives');
    heartsContainer.innerHTML = '';
    for (let i = 0; i < lives; i++) {
        const heart = document.createElement('span');
        heart.className = 'heart';
        heart.textContent = '♥';
        heartsContainer.appendChild(heart);
    }
}

function update() {
    if (!gameActive) return;

    // Keyboard movement
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        basket.x -= basket.speed;
    }
    if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        basket.x += basket.speed;
    }
    basket.x = Math.max(0, Math.min(canvas.width - basket.width, basket.x));

    // Update difficulty
    difficulty = 1 + (score / 200);

    // Update stars
    for (let i = stars.length - 1; i >= 0; i--) {
        stars[i].y += stars[i].speed;
        stars[i].rotation += 0.05;

        // Check collision with basket
        if (stars[i].y + stars[i].size > basket.y &&
            stars[i].y < basket.y + basket.height &&
            stars[i].x + stars[i].size > basket.x &&
            stars[i].x < basket.x + basket.width) {
            score += 10;
            updateScore();
            createParticles(stars[i].x + stars[i].size / 2, stars[i].y + stars[i].size / 2);
            stars.splice(i, 1);
        }
        // Remove stars that fell off screen
        else if (stars[i].y > canvas.height) {
            stars.splice(i, 1);
            lives--;
            updateLives();
            if (lives <= 0) {
                gameActive = false;
                endGame();
            }
        }
    }

    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].x += particles[i].vx;
        particles[i].y += particles[i].vy;
        particles[i].life -= 0.02;
        if (particles[i].life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw particles
    particles.forEach(p => {
        ctx.fillStyle = `rgba(255, 215, 0, ${p.life})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Draw stars
    stars.forEach(star => {
        drawStar(star.x + star.size / 2, star.y + star.size / 2, star.size / 2, star.rotation);
    });
    
    // Draw basket
    drawBasket();
}

function gameLoop() {
    update();
    draw();
    if (gameActive) {
        requestAnimationFrame(gameLoop);
    }
}

function endGame() {
    document.getElementById('finalScore').textContent = 'Your Score: ' + score;
    
    // Display high score info
    const finalHighScoreEl = document.getElementById('finalHighScore');
    if (isNewHighScore) {
        finalHighScoreEl.textContent = 'New High Score: ' + highScore + ' 🏆';
        finalHighScoreEl.style.color = '#ffd700';
    } else {
        finalHighScoreEl.textContent = 'High Score: ' + highScore;
        finalHighScoreEl.style.color = '#b8b8ff';
    }
    
    document.getElementById('gameOver').style.display = 'block';
}

function restartGame() {
    document.getElementById('gameOver').style.display = 'none';
    startGame();
}

function backToMenu() {
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('startScreen').style.display = 'block';
    gameActive = false;
}

// Create stars periodically
setInterval(() => {
    if (gameActive && Math.random() > 0.3) {
        createStar();
    }
}, 1000);