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
    },

    setupPaddle() {
        this.paddle.x = (this.canvas.width - this.paddle.w) / 2;
    },

    setupBall() {
        this.ball.x = this.paddle.x + this.paddle.w / 2;
        this.ball.y = this.paddle.y - this.ball.radius - 1;
    },

    createBricks() {},

    setupControls() {},

    //обновление канваса
    update() {},

    //отрисовка с нуля
    draw() {},

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
};

window.onload = () => {
    Arkanoid.init();
};