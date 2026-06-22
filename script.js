const Arkanoid = {

    canvas: null,
    ctx: null,
    livesDisplay: null,

    lives: 2,
    score: 0,
    gameActive: false,

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
        speed: 3
    },

    bricks: [],

    keys: {
        left: false,
        right: false
    },

    bonuses: [],

    bonusTypes: {
        '1': {
            name: 'Расширение платформы',
            color: '#FFD700',
        },
        '2': {
            name: 'Растроение мяча',
            color: '#FF6BFF',
        }
    },


    init(){
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.livesDisplay = document.getElementById('livesDisplay');

        this.setupPaddle();
        this.setupBall();
        this.createBricks();
        this.setupControls();

        this.gameLoop();
        this.updateLivesDisplay();
    },

    setupPaddle() {
        this.paddle.x = (this.canvas.width - this.paddle.w) / 2;
    },

    setupBall() {
        this.ball.x = this.paddle.x + this.paddle.w / 2;
        this.ball.y = this.paddle.y - this.paddle.h / 2 - this.ball.radius;
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
                this.bricks.push({
                    x: offsetX + c * (w + gap),
                    y: offsetY + r * (h + gap),
                    w: w,
                    h: h,
                    alive: true,
                    color: colors[r],
                    hasBonus: Math.random() < 0.15 //15% шанс дропа бонуса
                })
            }
        }




    },

    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                this.keys.left = true;
                e.preventDefault();
            }
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                this.keys.right = true;
                e.preventDefault();
            }
            if (e.key === ' ' || e.key === 'Space') {
                e.preventDefault();
                this.startGame();
            }
        });
    
        document.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                this.keys.left = false;
                e.preventDefault();
            }
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
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
            speed: 2,
            color: bonusConfig.color
        });
    },

    //обновление канваса
    update() {
        const paddle = this.paddle;
        const canvas = this.canvas;
        const ball = this.ball;

        //движение платформы
        if (this.keys.left && paddle.x > 0) {
            paddle.x = Math.max(0, paddle.x - 7);
        }
        if (this.keys.right && paddle.x + paddle.w < canvas.width) {
            paddle.x = Math.min(canvas.width - paddle.w, paddle.x + 7);
        }

        if (!this.gameActive) return;
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
            const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);

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

            if (dist < ball.radius) {
                brick.alive = false; 
                this.score++; 

                if (brick.hasBonus) {
                    this.spawnBonus(brick.x + brick.w / 2, brick.y);
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
                    alert('Вы выиграли');
                }
                break;
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

                switch (bonus.type) {
                    case '1':
                        console.log('бон 1');
                        break;
                    case '2':
                        console.log('бон 2');
                        break;
                    default:
                        console.log('Error');
                }

                this.bonuses.splice(i, 1);
                continue;
            }

            if (bonus.y > canvas.height) {
                this.bonuses.splice(i, 1);
            }
        }


        //луз
        if (ball.y + ball.radius > canvas.height) {
            this.lives--;
            this.updateLivesDisplay();
    
            if (this.lives <= 0) {
                this.gameActive = false;
                alert('Вы проиграли');
                return;
            }
    
            this.gameActive = false;
            this.setupPaddle();
            this.setupBall();
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

        ctx.fillStyle = '#C4AA89';
        ctx.beginPath();
        ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        ctx.fill();
    },

    startGame(){
        if (this.gameActive) return;
 
        this.gameActive = true;
        const angle = -Math.PI / 2 + (Math.random() * 0.6 - 0.3);
        const speed = this.ball.speed;
        this.ball.dx = Math.cos(angle) * speed;
        this.ball.dy = Math.sin(angle) * speed;

        if (Math.abs(this.ball.dx) < 1.2) {
            this.ball.dx = this.ball.dx > 0 ? 1.8 : -1.8;
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