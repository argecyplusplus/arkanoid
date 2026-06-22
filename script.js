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
        speed: 5
    },

    bricks: [],

    keys: {
        left: false,
        right: false
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
                    color: colors[r]
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

    //обновление канваса
    update() {
        const paddle = this.paddle;
        const canvas = this.canvas;

        if (this.keys.left && paddle.x > 0) {
            paddle.x = Math.max(0, paddle.x - 7);
        }
        if (this.keys.right && paddle.x + paddle.w < canvas.width) {
            paddle.x = Math.min(canvas.width - paddle.w, paddle.x + 7);
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

        ctx.fillStyle = '#4C0F1A';
        ctx.fillRect(this.paddle.x, this.paddle.y - this.paddle.h / 2, this.paddle.w, this.paddle.h);

        ctx.fillStyle = '#C4AA89';
        ctx.beginPath();
        ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        ctx.fill();
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