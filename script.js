const Arkanoid = {

    canvas: null,
    ctx: null,
    livesDisplay: null,

    lives: 3,
    score: 0,
    gameActive: false,
    gameOver: false,
    gameWin: false,

    paddle: {
        x: 0,
        y: 460,
        w: 120,
        h: 16
    },

    ball: {
        x: 0,
        y: 0,
        radius: 9,
        dx: 0,
        dy: 0,
        speed: 3,
        isMagnetic: false
    },

    balls: [],

    bricks: [],

    keys: {
        left: false,
        right: false
    },

    bonuses: [],

    bonusTypes: {
        'expand': {
            name: 'Увеличение платформы',
            color: '#FFD700'
        },
        'divide': {
            name: 'Тройка шаров',
            color: '#FF6BFF'
        }
    },

    highScore: 0,
    highScoreDisplay: null,


    init(){
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.livesDisplay = document.getElementById('livesDisplay');
        this.scoreDisplay = document.getElementById('scoreDisplay');
        this.highScoreDisplay = document.getElementById('highScoreDisplay');

        this.loadHighScore();
        this.updateHighScoreDisplay();

        this.setupPaddle();
        this.setupBalls();
        this.createBricks();
        this.setupControls();

        this.gameLoop();
        this.updateLivesDisplay();
        this.updateScoreDisplay();
    },

    updateScoreDisplay (){
        this.scoreDisplay.textContent = String(this.score).padStart(5, '0');
    },

    setupPaddle() {
        this.paddle.x = (this.canvas.width - this.paddle.w) / 2;
    },

    setupBalls() {
        this.balls = [{
            x: this.paddle.x + this.paddle.w / 2,
            y: this.paddle.y - this.paddle.h / 2 - 9,
            radius: 9,
            dx: 0,
            dy: 0,
            speed: 3,
            isMagnetic: false
        }];
    },

    updateLivesDisplay() {
        let hearts = '';
        for (let i = 0; i < this.lives; i++) {
            hearts += '❤️';
        }
        this.livesDisplay.textContent = hearts;
    },

    createBricks() {

        const rows = 6;
        const columns = 11;

        const w = 65;
        const h = 20;
        const gap = 6;

        const offsetX = 15;
        const offsetY = 50;

        const colors = ['#B0B0B5', '#710000', '#002EC2', '#D19834', '#D437CD', '#AAFF4C'];

        this.bricks = []

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < columns; c++) {
                const isStrong = (r === 0);
                this.bricks.push({
                    x: offsetX + c * (w + gap),
                    y: offsetY + r * (h + gap),
                    w: w,
                    h: h,
                    alive: true,
                    color: isStrong ? '#B0B0B5' : colors[r],
                    originalColor: isStrong ? '#B0B0B5' : colors[r],
                    hasBonus: !isStrong && Math.random() < 0.15, // у серых нет бонусов
                    isStrong: isStrong,
                    hits: 0,
                    maxHits: isStrong ? 2 : 1
                });
            }
        }




    },

    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A' || e.key === 'ф' || e.key === 'Ф') {
                this.keys.left = true;
                e.preventDefault();
            }
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D' || e.key === 'в' || e.key === 'В') {
                this.keys.right = true;
                e.preventDefault();
            }
            if (e.key === ' ' || e.key === 'Space') {
                e.preventDefault();
                this.startGame();
            }
        });
    
        document.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A'|| e.key === 'ф' || e.key === 'Ф') {
                this.keys.left = false;
                e.preventDefault();
            }
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D'|| e.key === 'в' || e.key === 'В') {
                this.keys.right = false;
                e.preventDefault();
            }
        });
        
    },

    spawnBonus(x, y){
        const types = Object.keys(this.bonusTypes); 
        const type = types[Math.floor(Math.random() * types.length)];
        const bonusConfig = this.bonusTypes[type];
    
        this.bonuses.push({
            x: x - 10,
            y: y,
            w: 20,
            h: 16,
            type: type,
            speed: 1,
            color: bonusConfig.color
        });
    },

    //обновление канваса
    update() {
        const paddle = this.paddle;
        const canvas = this.canvas;

        //движение платформы
        if (this.keys.left && paddle.x > 0) {
            paddle.x = Math.max(0, paddle.x - 7);
        }
        if (this.keys.right && paddle.x + paddle.w < canvas.width) {
            paddle.x = Math.min(canvas.width - paddle.w, paddle.x + 7);
        }
    
        if (!this.gameActive) return;
    
        for (let b = 0; b < this.balls.length; b++) {
            const ball = this.balls[b];
    
            //движения мяча
            ball.x += ball.dx;
            ball.y += ball.dy;
    
            //отскок - от стен
            if (ball.x - ball.radius < 0) {
                ball.x = ball.radius;
                ball.dx = -ball.dx;
            } else if (ball.x + ball.radius > canvas.width) {
                ball.x = canvas.width - ball.radius;
                ball.dx = -ball.dx;
            }
        
            if (ball.y - ball.radius < 0) {
                ball.y = ball.radius;
                ball.dy = -ball.dy;
            }
    
            //отскок - от платформы
            const paddleTop = paddle.y - paddle.h / 2;
            const paddleBottom = paddle.y + paddle.h / 2;
            const paddleLeft = paddle.x;
            const paddleRight = paddle.x + paddle.w;
    
            if (ball.dy > 0 &&
                ball.y + ball.radius >= paddleTop &&
                ball.y + ball.radius <= paddleBottom + 6 &&
                ball.x >= paddleLeft - ball.radius &&
                ball.x <= paddleRight + ball.radius) {
    
                const hitPos = (ball.x - paddle.x) / paddle.w;
                const angle = (hitPos - 0.5) * 1.2;
                const speed = ball.speed;
    
                ball.dx = Math.sin(angle) * speed;
                ball.dy = -Math.cos(angle) * speed;
    
                if (Math.abs(ball.dy) < speed * 0.25) {
                    ball.dy = -speed * 0.45;
                }
                if (Math.abs(ball.dx) < 0.8) {
                    ball.dx = ball.dx > 0 ? 1.2 : -1.2;
                }
    
                ball.y = paddleTop - ball.radius - 0.5;
            }
    
            //удар по блокам
            for (let i = 0; i < this.bricks.length; i++) {
                const brick = this.bricks[i];
                if (!brick.alive) continue;

                const closestX = Math.max(brick.x, Math.min(ball.x, brick.x + brick.w));
                const closestY = Math.max(brick.y, Math.min(ball.y, brick.y + brick.h));
                const distX = ball.x - closestX;
                const distY = ball.y - closestY;
                const dist = Math.sqrt(distX * distX + distY * distY);

                //с учетом прочности блока
                if (dist < ball.radius) {
                    if (brick.isStrong) {
                        brick.hits++;
                        const brightness = 1 - (brick.hits / brick.maxHits) * 0.6;
                        const gray = Math.floor(176 * brightness);
                        brick.color = `rgb(${gray}, ${gray}, ${gray})`;
                        
                        if (brick.hits >= brick.maxHits) {
                            brick.alive = false;
                            this.score++;
                            this.updateScoreDisplay();
                        }
                    } else {
                        brick.alive = false;
                        this.score++;
                        this.updateScoreDisplay();

                        if (brick.hasBonus) {
                            this.spawnBonus(brick.x + brick.w / 2, brick.y);
                        }
                    }
            
                    //направление
                    const directionX = ball.radius - Math.abs(distX);
                    const directionY = ball.radius - Math.abs(distY);
            
                    if (directionX < directionY) {
                        ball.dx = -ball.dx;
                    } else {
                        ball.dy = -ball.dy;  
                    }
            
                    if (distX !== 0 || distY !== 0) {
                        const normX = distX / dist;
                        const normY = distY / dist;
                        ball.x = closestX + normX * (ball.radius + 0.5);
                        ball.y = closestY + normY * (ball.radius + 0.5);
                    }
            
                    //победа?
                    const allDead = this.bricks.every(b => !b.alive);
                    if (allDead) {
                        this.gameActive = false;
                        this.gameWin = true;
                        this.saveHighScore();
                    }
                    break;
                }
            }
        }
    
        //бонусы
        for (let i = this.bonuses.length - 1; i >= 0; i--) {
            const bonus = this.bonuses[i];
            bonus.y += bonus.speed;
    
            const paddleTop = paddle.y - paddle.h / 2;
            const paddleBottom = paddle.y + paddle.h / 2;
            const paddleLeft = paddle.x;
            const paddleRight = paddle.x + paddle.w;
    
            if (bonus.y + bonus.h >= paddleTop &&
                bonus.y <= paddleBottom &&
                bonus.x + bonus.w >= paddleLeft &&
                bonus.x <= paddleRight) {
    
                this.applyBonus(bonus.type);
    
                this.bonuses.splice(i, 1);
                continue;
            }
    
            if (bonus.y > canvas.height) {
                this.bonuses.splice(i, 1);
            }
        }



    

        //луз
        for (let i = this.balls.length - 1; i >= 0; i--) {
            const ball = this.balls[i];
            if (ball.y + ball.radius > canvas.height) {
                this.balls.splice(i, 1);
            }
        }
    
        if (this.balls.length === 0) {
            this.lives--;
            this.updateLivesDisplay();
    
            if (this.lives <= 0) {
                this.gameActive = false;
                this.gameOver = true;
                this.saveHighScore();
                return;
            }
    
            this.gameActive = false;
            this.setupPaddle();
            this.setupBalls();
            return;
        }
    },

    //отрисовка
    draw() {
        const ctx = this.ctx;
        const canvas = this.canvas;
    
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#0D0D1A';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    
        for (const brick of this.bricks) {
            if (!brick.alive) continue;
            ctx.fillStyle = brick.color;
            ctx.fillRect(brick.x, brick.y, brick.w, brick.h);
        }
    
        for (const bonus of this.bonuses) {
            ctx.fillStyle = bonus.color;
            ctx.fillRect(bonus.x, bonus.y, bonus.w, bonus.h);
        }
    
        ctx.fillStyle = '#4C0F1A';
        ctx.fillRect(this.paddle.x, this.paddle.y - this.paddle.h / 2, this.paddle.w, this.paddle.h);

        for (const ball of this.balls) {
            ctx.fillStyle = ball.isMagnetic && ball.dx === 0 && ball.dy === 0 ? '#44D4FF' : '#C4AA89';
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.fill();
    
            if (ball.isMagnetic && ball.dx === 0 && ball.dy === 0) {
                ctx.strokeStyle = '#44D4FF';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(ball.x, ball.y, ball.radius + 4, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
    
        //Финальноее сообщение
        if (this.gameOver) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = 'white';
            ctx.font = 'bold 60px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20);
            
            ctx.fillStyle = 'white';
            ctx.font = '20px Arial';
            ctx.fillText('Press ENTER to restart', canvas.width / 2, canvas.height / 2 + 50);
        }

        if (this.gameWin) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = 'white';
            ctx.font = 'bold 60px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('YOU WON', canvas.width / 2, canvas.height / 2 - 20);
            
            ctx.fillStyle = 'white';
            ctx.font = '20px Arial';
            ctx.fillText('Press ENTER to restart', canvas.width / 2, canvas.height / 2 + 50);
        }
    
    },

    startGame(){
        if (this.gameOver || this.gameWin) {
            this.resetGame();
            setTimeout(() => this.startGame(), 50);
            return;
        }
    
        if (this.gameActive) return;
 
        this.gameActive = true;
        for (const ball of this.balls) {
            if (ball.isMagnetic && ball.dx === 0 && ball.dy === 0) {
                const angle = -Math.PI / 2 + (Math.random() * 0.6 - 0.3);
                ball.dx = Math.cos(angle) * ball.speed;
                ball.dy = Math.sin(angle) * ball.speed;
            } else if (ball.dx === 0 && ball.dy === 0) {
                const angle = -Math.PI / 2 + (Math.random() * 0.6 - 0.3);
                ball.dx = Math.cos(angle) * ball.speed;
                ball.dy = Math.sin(angle) * ball.speed;
            }
        }
    },

    resetGame() {
        this.lives = 3;
        this.score = 0;
        this.gameActive = false;
        this.gameOver = false;
        this.gameWin = false;
        this.bonuses = [];
        this.createBricks();
        this.setupPaddle();
        this.setupBalls();
        this.updateLivesDisplay();
        this.updateScoreDisplay();
    },

    loadHighScore() {
        const saved = localStorage.getItem('arkanoid_highScore');
        this.highScore = saved ? parseInt(saved, 10) : 0;
    },
    
    saveHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('arkanoid_highScore', String(this.highScore));
            this.updateHighScoreDisplay();
        }
    },
    
    updateHighScoreDisplay() {
        if (this.highScoreDisplay) {
            this.highScoreDisplay.textContent = String(this.highScore).padStart(5, '0');
        }
    },

    applyBonus(bonusType) {
        switch (bonusType) {
            case 'expand':
                this.applyExpand();
                break;
            case 'divide':
                this.applyDivide();
                break;
            default:
                console.log('Error, bonus type - ', bonusType);
        }
    },

    applyExpand() {
        this.paddle.w = Math.min(this.paddle.w * 1.5, 200);
        setTimeout(() => {
            this.paddle.w = 120;  
        }, 10000);
    },

    applyDivide() {
        const currentBall = this.balls[0];
        if (currentBall) {
            this.balls = [];
            const angles = [-0.5, 0, 0.5];
            const speed = currentBall.speed || 3;
            for (const angleOffset of angles) {
                const angle = -Math.PI / 2 + angleOffset * 0.8;
                this.balls.push({
                    x: this.paddle.x + this.paddle.w / 2,
                    y: this.paddle.y - this.paddle.h / 2 - 9,
                    radius: 9,
                    dx: Math.cos(angle) * speed,
                    dy: Math.sin(angle) * speed,
                    speed: speed,
                    isMagnetic: false
                });
            }
            this.gameActive = true;
        }
    },

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
};

window.onload = () => {
    Arkanoid.init();
};