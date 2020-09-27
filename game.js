// TODO создать еще один тип брика (прототипы)
// TODO создать мапу расположения бриков для каждого уровня
// TODO исправить баг с застреванием шарика

const cnv = document.getElementById("brock");
const ctx = cnv.getContext("2d");


const PADDLE_WIDTH = 25;
const PADDLE_HEIGHT = 135;
const BALL_RADIUS = 8;
const SCORE_UNIT = 10;
const MAX_LEVEL = 3;
let upArrow = false;
let downArrow = false;
let isBallOnPaddle = true;
let LIFE = 8;
let SCORE = 0;
let LEVEL = 1;
let GAME_OVER = false;
let bricks = [];

const border = {
    color: "#654321",
    size: 5,
    length: cnv.height / 3,
};
const paddle = {
    x: border.size * 2,
    y: cnv.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 5,
};
const ball = {
    x: paddle.x + paddle.width + BALL_RADIUS,
    y: cnv.height / 2,
    radius: BALL_RADIUS,
    speed: 4,
    dx: 3,
    dy: 3 * (Math.random() * 2 - 1),
};
const brick = {
    row: 5,
    col: 1,
    width: 20,
    height: 55,
    offsetLeft: 20,
    offsetTop: 20,
    marginLeft: 0,
    marginTop: 0,
    fillColor: "gray",
    strokeColor: "#eee",
    setStartPos: function () {
        let halfWidth = (this.col * (this.width + this.offsetLeft) + this.offsetLeft) / 2;
        let halfHeight = (this.row * (this.height + this.offsetTop) + this.offsetTop) / 2;

        this.marginLeft = (cnv.width / 2) - halfWidth;
        this.marginTop = (cnv.height / 2) - halfHeight;
    },
};


createBricks();
loop();

function loop() {
    // clear
    ctx.drawImage(BG_IMG, 0, 0);

    draw();
    update();

    if (!GAME_OVER) {
        requestAnimationFrame(loop);
    }
}

function draw() {
    drawBorders();
    drawPaddle();
    drawBall();
    drawBricks();

    showGameStats(SCORE, 35, 25, SCORE_IMG, 5, 5);
    showGameStats(LIFE, cnv.width - 25, 25, LIFE_IMG, cnv.width - 55, 5);
    showGameStats(LEVEL, cnv.width / 2, 25, LEVEL_IMG, cnv.width / 2 - 30, 5);
}

function update() {
    movePaddle();
    moveBall();
    ballWallCollission();
    ballPaddleCollission();
    ballBrickCollission();
    gameOver();
    levelUp();
}

function drawBorders() {
    ctx.fillStyle = border.color;

    ctx.fillRect(border.size, 0, cnv.width - (border.size * 2), border.size);
    ctx.fillRect(border.size, cnv.height - border.size, cnv.width - (border.size * 2), border.size);

    // left
    ctx.fillRect(0, 0, border.size, border.length);
    ctx.fillRect(0, cnv.height - border.length, border.size, cnv.height);

    // right
    ctx.fillRect(cnv.width - border.size, 0, border.size, border.length);
    ctx.fillRect(cnv.width - border.size, cnv.height - border.length, border.size, cnv.height);
}

function drawPaddle() {
    ctx.lineWidth = 3;

    ctx.strokeStyle = "#eee";
    ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);

    ctx.fillStyle = "red";
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
    ctx.beginPath();

    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.strokeStyle = "#eee";
    ctx.stroke();

    ctx.fillStyle = "red";
    ctx.fill();

    ctx.closePath();
}

function drawBricks() {
    for (let r = 0; r < brick.row; r++) {
        for (let c = 0; c < brick.col; c++) {
            if (bricks[r][c].status) {
                ctx.fillStyle = brick.fillColor;
                ctx.fillRect(bricks[r][c].x, bricks[r][c].y, brick.width, brick.height);

                ctx.strokeStyle = brick.strokeColor;
                ctx.strokeRect(bricks[r][c].x, bricks[r][c].y, brick.width, brick.height);
            }
        }
    }
}

function movePaddle() {
    if (upArrow && paddle.y > border.size * 2) {
        paddle.y -= paddle.dy;
    } else if (downArrow && paddle.y + paddle.height < cnv.height - border.size * 2) {
        paddle.y += paddle.dy;
    }
}

function moveBall() {

    if (!isBallOnPaddle) {
        ball.x += ball.dx;
        ball.y += ball.dy;
    } else if (isBallOnPaddle) {
        if (upArrow && paddle.y > border.size * 2)
            ball.y -= paddle.dy;
        else if (downArrow && paddle.y + paddle.height < cnv.height - border.size * 2)
            ball.y += paddle.dy;
    }
}

function ballWallCollission() {
    // up and down
    if (ball.y - ball.radius < border.size || ball.y + ball.radius > cnv.height - border.size) {
        WALL_HIT.play();
        ball.dy = -ball.dy;
    }

    // right side
    if (ball.x + ball.radius > cnv.width - border.size) {
        WALL_HIT.play();
        ball.dx = -ball.dx;
    }

    // left side
    if (ball.x - ball.radius < border.size &&
        (ball.y - ball.radius < border.length
            || ball.y + ball.radius > cnv.height - border.length)) {
        WALL_HIT.play();
        ball.dx = -ball.dx;
    } else if (ball.x - ball.radius < 0) {
        LIFE_LOST.play();
        LIFE--;
        resetBall();
    }


    // --right wall (for multiplayer)
    // if (ball.x - ball.radius < 0 || ball.x + ball.radius > cnv.width) {
    //     LIFE--;
    //     resetBall();
    // }
}

function ballPaddleCollission() {
    if (ball.y < paddle.y + paddle.height && ball.y > paddle.y
        && ball.x < paddle.x + paddle.width && ball.x > paddle.x) {

        PADDLE_HIT.play();

        let collidePoint = ball.y - (paddle.y + paddle.height / 2);

        collidePoint = collidePoint / (paddle.height / 2);

        let angle = collidePoint * Math.PI / 3;

        ball.dx = ball.speed * Math.cos(angle);
        ball.dy = ball.speed * Math.sin(angle);
    }
}

function ballBrickCollission() {
    for (let r = 0; r < brick.row; r++) {
        for (let c = 0; c < brick.col; c++) {
            let b = bricks[r][c];
            b.hit();
        }
    }
}

function gameOver() {
    if (LIFE <= 0) {
        showYouLose();
        GAME_OVER = true;
    }
}

function levelUp() {
    let isLevelDone = true;
    for (let r = 0; r < brick.row; r++) {
        for (let c = 0; c < brick.col; c++) {
            isLevelDone = isLevelDone && !bricks[r][c].status;
        }
    }

    if (isLevelDone) {
        WIN.play();

        if (LEVEL >= MAX_LEVEL) {
            showYouWin();
            GAME_OVER = true;
            return;
        }

        brick.col++;
        createBricks();
        ball.speed += 0.5;
        resetBall();
        LEVEL++;
    }
}

function resetBall() {
    isBallOnPaddle = true;

    ball.x = paddle.x + paddle.width + BALL_RADIUS;
    ball.y = paddle.y + paddle.height / 2;

    ball.dy = 3 * (Math.random() * 2 - 1);
    ball.dx = 3;
}

function createBricks() {
    brick.setStartPos();

    for (let r = 0; r < brick.row; r++) {
        bricks[r] = [];

        for (let c = 0; c < brick.col; c++) {
            bricks[r][c] = {
                x: c * (brick.width + brick.offsetLeft) + brick.offsetLeft + brick.marginLeft,
                y: r * (brick.height + brick.offsetTop) + brick.offsetTop + brick.marginTop,
                status: true,
                health: 3,
                hit: function () {
                    if (this.status) {
                        if (ball.x + ball.radius > this.x && ball.x - ball.radius < this.x + brick.width
                            && ball.y + ball.radius > this.y && ball.y - ball.radius < this.y + brick.height
                        ) {
                            BRICK_HIT.play();
                            ball.dx = -ball.dx;
                            this.health--;

                            if (this.health <= 0) {
                                this.status = false;
                                SCORE += SCORE_UNIT;
                            }
                        }

                    }
                }
            }
        }
    }
}

function showGameStats(text, textX, textY, img, imgX, imgY) {
    ctx.fillStyle = "#eee";
    ctx.font = "25px Germania One";
    ctx.fillText(text, textX, textY);

    ctx.drawImage(img, imgX, imgY, 25, 25);
}

function audioManager() {
    // CHANGE IMAGE SOUND_ON/OFF
    let imgSrc = soundElement.getAttribute("src");
    let SOUND_IMG = imgSrc == "images/SOUND_ON.png" ? "images/SOUND_OFF.png" : "images/SOUND_ON.png";

    soundElement.setAttribute("src", SOUND_IMG);

    // MUTE AND UNMUTE SOUNDS
    WALL_HIT.muted = WALL_HIT.muted ? false : true;
    PADDLE_HIT.muted = PADDLE_HIT.muted ? false : true;
    BRICK_HIT.muted = BRICK_HIT.muted ? false : true;
    WIN.muted = WIN.muted ? false : true;
    LIFE_LOST.muted = LIFE_LOST.muted ? false : true;
}

function showYouWin() {
    gameover.style.display = "block";
    youwon.style.display = "block";
}

function showYouLose() {
    gameover.style.display = "block";
    youlose.style.display = "block";
}


document.addEventListener("keydown", function (e) {
    if (e.keyCode == 38) {
        upArrow = true;
    } else if (e.keyCode == 40) {
        downArrow = true;
    }

    if (e.keyCode == 32) {
        isBallOnPaddle = false;
    }
});
document.addEventListener("keyup", function (e) {
    if (e.keyCode == 38) {
        upArrow = false;
    } else if (e.keyCode == 40) {
        downArrow = false;
    }
});

const soundElement = document.getElementById("sound");
soundElement.addEventListener("click", audioManager);

// SHOW GAME OVER MESSAGE
/* SELECT ELEMENTS */
const gameover = document.getElementById("gameover");
const youwin = document.getElementById("youwin");
const youlose = document.getElementById("youlose");
const restart = document.getElementById("restart");
// CLICK ON PLAY AGAIN BUTTON
restart.addEventListener("click", function () {
    location.reload(); // reload the page
})


// var game = {
//     ctx: undefined,
//     sprites: {
//         background: undefined,
//         leftplat: undefined,
//         rightplat: undefined,
//         leftball: undefined,
//         rightball: undefined,
//         bricks: undefined,
//     },
//     bricks: [],
//     running: true,
//     init: function () {
//         var canv = document.getElementById("brock");
//         canv.width = cfg.dispSize['x'];
//         canv.height = cfg.dispSize['y'];
//         this.ctx = canv.getContext("2d");
//
//         window.addEventListener('keydown', function (e) {
//             if (e.keyCode == 38) {
//                 game.platforms.left.dy = -game.platforms.left.velocity;
//             } else if (e.keyCode == 40) {
//                 game.platforms.left.dy = game.platforms.left.velocity;
//             } else if (e.keyCode == 32) {
//                 game.platforms.left.releaseBall();
//             }
//         });
//         window.addEventListener('keyup', function (e) {
//             game.platforms.left.stop();
//         });
//     },
//     load: function () {
//         for (var key in this.sprites) {
//             this.sprites[key] = new Image();
//             this.sprites[key].src = "images/" + key + ".png";
//         }
//     },
//     start: function () {
//         this.init();
//         this.load();
//         this.create();
//         this.run();
//     },
//     create: function () {
//         // bricks
//         for (let x = 0; x < cfg.bricksCnt.row; x++) {
//             for (let y = 0; y < cfg.bricksCnt.col; y++) {
//                 this.bricks.push({
//                     x: this.calcBrPos()[0] + x * cfg.bricksSpace.x,
//                     y: this.calcBrPos()[1] + y * cfg.bricksSpace.y,
//                     width: cfg.bricksSize.x,
//                     height: cfg.bricksSize.y,
//                     type: 'default',
//                     isAlive: true,
//                 });
//             }
//         }
//     },
//     render: function () {
//         this.ctx.clearRect(0, 0, cfg.dispSize['x'], cfg.dispSize['y']);
//
//         // bg
//         this.ctx.drawImage(this.sprites.background, 0, 0);
//
//         // plats
//         this.ctx.drawImage(this.sprites.leftplat, this.platforms.left.x, this.platforms.left.y, 25, 135);
//         this.ctx.drawImage(this.sprites.rightplat, this.platforms.right.x, this.platforms.right.y, 25, 135);
//         // balls
//         this.ctx.drawImage(this.sprites.leftball, this.balls.width * this.balls.frame, 0, this.balls.width, this.balls.height, this.balls.left.x, this.balls.left.y, this.balls.width, this.balls.height);
//         this.ctx.drawImage(this.sprites.rightball, this.balls.width * this.balls.frame, 0, this.balls.width, this.balls.height, this.balls.right.x, this.balls.right.y, this.balls.width, this.balls.height);
//
//
//         // bricks
//         this.bricks.forEach(function (element) {
//             if (element.isAlive) {
//                 this.ctx.drawImage(this.sprites.bricks, element.x, element.y - Math.floor(this.sprites.bricks.height / 2));
//             }
//         }, this)
//     },
//     update: function () {
//
//         if (this.balls.left.collide(this.platforms.left)) {
//             this.balls.left.bumpPlatform(this.platforms.left);
//         }
//         if (this.balls.left.collide(this.platforms.right)) {
//             this.balls.left.bumpPlatform(this.platforms.right);
//         }
//
//
//         if (this.platforms.left.dy) {
//             this.platforms.left.move();
//         }
//         if (this.balls.left.dy || this.balls.left.dx) {
//             this.balls.left.move();
//         }
//
//         // bricks
//         this.bricks.forEach(function (element) {
//             if (element.isAlive) {
//                 if (this.balls.left.collide(element)) {
//                     this.balls.left.bumpBrick(element);
//                 }
//             }
//         }, this)
//
//
//         this.balls.left.checkBounds();
//     },
//     run: function () {
//         this.update();
//         this.render();
//
//         if (this.running) {
//             window.requestAnimationFrame(function () {
//                 game.run();
//             });
//         }
//     },
//     calcBrPos: function () {
//         var midCol = Math.floor(cfg.bricksCnt.col / 2);
//
//         return [
//             (cfg.dispSize['x'] / 2) - (cfg.bricksCnt.row * cfg.bricksSpace.x / 2) + ((cfg.bricksSpace.x - cfg.bricksSize.x) / 2),
//             cfg.dispSize['y'] / 2 - (midCol * cfg.bricksSpace.y),
//         ];
//     },
//     over: function (msg) {
//         this.running = false;
//         alert(msg);
//         window.location.reload();
//     }
// };
//
// game.balls = {
//     width: 22,
//     height: 22,
//     frame: 0,
//     left: {
//         width: 22,
//         height: 22,
//         x: 35,
//         y: (cfg.dispSize['y'] / 2 - Math.floor(135 / 2) - 22) + (cfg.dispSize['y'] / 2 - Math.floor(135 / 2)) / 2,
//         dx: 0,
//         dy: 0,
//         velocity: 3,
//         jump: function () {
//             this.dy = -this.velocity;
//             this.dx = +this.velocity;
//         },
//         move: function () {
//             this.y += this.dy;
//             this.x += this.dx;
//         },
//         collide: function (element) {
//             var x = this.x + this.dx;
//             var y = this.y + this.dy;
//
//             if (x + this.width > element.x &&
//                 x < element.x + element.width &&
//                 y + this.height > element.y &&
//                 y < element.y + element.height) {
//                 return true;
//             }
//
//             return false;
//         },
//         bumpBrick: function (brick) {
//             this.dx *= -1;
//             brick.isAlive = false;
//         },
//         checkBounds: function () {
//             var x = this.x + this.dx;
//             var y = this.y + this.dy;
//
//             if (x < 0) {
//                 game.over("Вы проиграли");
//             } else if (x + 22 > cfg.dispSize.x) {
//                 game.over("Вы проиграли");
//             } else if (y < 0) {
//                 this.y = 0;
//                 this.dy = this.velocity;
//             } else if (y + 22 > cfg.dispSize.y ) {
//                 this.y = cfg.dispSize.y - 22;
//                 this.dy = -this.velocity;
//             }
//         },
//         bumpPlatform: function (plat) {
//             this.dx *= -1;
//             this.dy = this.onTheLeftSide(plat) ? -this.velocity : this.velocity;
//         },
//         onTheLeftSide: function (plat) {
//             return (this.y) < (plat.y + plat.height / 2);
//         }
//     },
//     right: {
//         width: 22,
//         height: 22,
//         x: cfg.dispSize['x'] - 25 - 10 - 22,
//         y: (cfg.dispSize['y'] / 2 - Math.floor(135 / 2) - 22) + (cfg.dispSize['y'] / 2 - Math.floor(135 / 2)) / 2,
//         dx: 0,
//         dy: 0,
//         collide: function (element) {
//             var x = this.x + this.dx;
//             var y = this.y + this.dy;
//
//             if (x + this.width > element.x &&
//                 x < element.x + element.width &&
//                 y + this.height > element.y &&
//                 y < element.y + element.height) {
//                 return true;
//             }
//
//             return false;
//         },
//         bumpPlatform: function (plat) {
//             this.dx *= -1;
//         }
//     }
// };
//
// game.platforms = {
//     width: 25,
//     height: 125,
//     left: {
//         width: 25,
//         height: 125,
//         x: game.balls.left.x - 25,
//         y: cfg.dispSize['y'] / 2 - Math.floor(135 / 2),
//         velocity: 6,
//         dy: 0,
//         ball: game.balls.left,
//         releaseBall: function () {
//             if (this.ball) {
//                 this.ball.jump();
//                 this.ball = false;
//             }
//         },
//         move: function () {
//             this.y += this.dy;
//
//             if (this.ball) {
//                 this.ball.y += this.dy;
//             }
//         },
//         stop: function () {
//             this.dy = 0;
//
//             if (this.ball) {
//                 this.ball.dy = 0;
//             }
//         }
//     },
//     right: {
//         width: 25,
//         height: 125,
//         x: cfg.dispSize['x'] - 25 - 10,
//         y: cfg.dispSize['y'] / 2 - Math.floor(135 / 2),
//         velocity: 6,
//         dy: 0,
//         ball: game.balls.right,
//     },
// };
//
//
// window.addEventListener("load", function () {
//     game.start();
// })