var game = {
    ctx: undefined,
    sprites: {
        background: undefined,
        leftplat: undefined,
        rightplat: undefined,
        leftball: undefined,
        rightball: undefined,
        bricks: undefined,
    },
    bricks: [],
    running: true,
    init: function () {
        var canv = document.getElementById("brock");
        canv.width = cfg.dispSize['x'];
        canv.height = cfg.dispSize['y'];
        this.ctx = canv.getContext("2d");

        window.addEventListener('keydown', function (e) {
            if (e.keyCode == 38) {
                game.platforms.left.dy = -game.platforms.left.velocity;
            } else if (e.keyCode == 40) {
                game.platforms.left.dy = game.platforms.left.velocity;
            } else if (e.keyCode == 32) {
                game.platforms.left.releaseBall();
            }
        });
        window.addEventListener('keyup', function (e) {
            game.platforms.left.stop();
        });
    },
    load: function () {
        for (var key in this.sprites) {
            this.sprites[key] = new Image();
            this.sprites[key].src = "images/" + key + ".png";
        }
    },
    start: function () {
        this.init();
        this.load();
        this.create();
        this.run();
    },
    create: function () {
        // bricks
        for (let x = 0; x < cfg.bricksCnt.row; x++) {
            for (let y = 0; y < cfg.bricksCnt.col; y++) {
                this.bricks.push({
                    x: this.calcBrPos()[0] + x * cfg.bricksSpace.x,
                    y: this.calcBrPos()[1] + y * cfg.bricksSpace.y,
                    width: cfg.bricksSize.x,
                    height: cfg.bricksSize.y,
                    type: 'default',
                    isAlive: true,
                });
            }
        }
    },
    render: function () {
        this.ctx.clearRect(0, 0, cfg.dispSize['x'], cfg.dispSize['y']);

        // bg
        this.ctx.drawImage(this.sprites.background, 0, 0);

        // plats
        this.ctx.drawImage(this.sprites.leftplat, this.platforms.left.x, this.platforms.left.y, 25, 135);
        this.ctx.drawImage(this.sprites.rightplat, this.platforms.right.x, this.platforms.right.y, 25, 135);
        // balls
        this.ctx.drawImage(this.sprites.leftball, this.balls.width * this.balls.frame, 0, this.balls.width, this.balls.height, this.balls.left.x, this.balls.left.y, this.balls.width, this.balls.height);
        this.ctx.drawImage(this.sprites.rightball, this.balls.width * this.balls.frame, 0, this.balls.width, this.balls.height, this.balls.right.x, this.balls.right.y, this.balls.width, this.balls.height);


        // bricks
        this.bricks.forEach(function (element) {
            if (element.isAlive) {
                this.ctx.drawImage(this.sprites.bricks, element.x, element.y - Math.floor(this.sprites.bricks.height / 2));
            }
        }, this)
    },
    update: function () {

        if (this.balls.left.collide(this.platforms.left)) {
            this.balls.left.bumpPlatform(this.platforms.left);
        }
        if (this.balls.left.collide(this.platforms.right)) {
            this.balls.left.bumpPlatform(this.platforms.right);
        }


        if (this.platforms.left.dy) {
            this.platforms.left.move();
        }
        if (this.balls.left.dy || this.balls.left.dx) {
            this.balls.left.move();
        }

        // bricks
        this.bricks.forEach(function (element) {
            if (element.isAlive) {
                if (this.balls.left.collide(element)) {
                    this.balls.left.bumpBrick(element);
                }
            }
        }, this)


        this.balls.left.checkBounds();
    },
    run: function () {
        this.update();
        this.render();

        if (this.running) {
            window.requestAnimationFrame(function () {
                game.run();
            });
        }
    },
    calcBrPos: function () {
        var midCol = Math.floor(cfg.bricksCnt.col / 2);

        return [
            (cfg.dispSize['x'] / 2) - (cfg.bricksCnt.row * cfg.bricksSpace.x / 2) + ((cfg.bricksSpace.x - cfg.bricksSize.x) / 2),
            cfg.dispSize['y'] / 2 - (midCol * cfg.bricksSpace.y),
        ];
    },
    over: function (msg) {
        this.running = false;
        alert(msg);
        window.location.reload();
    }
};

game.balls = {
    width: 22,
    height: 22,
    frame: 0,
    left: {
        width: 22,
        height: 22,
        x: 35,
        y: (cfg.dispSize['y'] / 2 - Math.floor(135 / 2) - 22) + (cfg.dispSize['y'] / 2 - Math.floor(135 / 2)) / 2,
        dx: 0,
        dy: 0,
        velocity: 3,
        jump: function () {
            this.dy = -this.velocity;
            this.dx = +this.velocity;
        },
        move: function () {
            this.y += this.dy;
            this.x += this.dx;
        },
        collide: function (element) {
            var x = this.x + this.dx;
            var y = this.y + this.dy;

            if (x + this.width > element.x &&
                x < element.x + element.width &&
                y + this.height > element.y &&
                y < element.y + element.height) {
                return true;
            }

            return false;
        },
        bumpBrick: function (brick) {
            this.dx *= -1;
            brick.isAlive = false;
        },
        checkBounds: function () {
            var x = this.x + this.dx;
            var y = this.y + this.dy;

            if (x < 0) {
                game.over("Вы проиграли");
            } else if (x + 22 > cfg.dispSize.x) {
                game.over("Вы проиграли");
            } else if (y < 0) {
                this.y = 0;
                this.dy = this.velocity;
            } else if (y + 22 > cfg.dispSize.y ) {
                this.y = cfg.dispSize.y - 22;
                this.dy = -this.velocity;
            }
        },
        bumpPlatform: function (plat) {
            this.dx *= -1;
            this.dy = this.onTheLeftSide(plat) ? -this.velocity : this.velocity;
        },
        onTheLeftSide: function (plat) {
            return (this.y) < (plat.y + plat.height / 2);
        }
    },
    right: {
        width: 22,
        height: 22,
        x: cfg.dispSize['x'] - 25 - 10 - 22,
        y: (cfg.dispSize['y'] / 2 - Math.floor(135 / 2) - 22) + (cfg.dispSize['y'] / 2 - Math.floor(135 / 2)) / 2,
        dx: 0,
        dy: 0,
        collide: function (element) {
            var x = this.x + this.dx;
            var y = this.y + this.dy;

            if (x + this.width > element.x &&
                x < element.x + element.width &&
                y + this.height > element.y &&
                y < element.y + element.height) {
                return true;
            }

            return false;
        },
        bumpPlatform: function (plat) {
            this.dx *= -1;
        }
    }
};

game.platforms = {
    width: 25,
    height: 125,
    left: {
        width: 25,
        height: 125,
        x: game.balls.left.x - 25,
        y: cfg.dispSize['y'] / 2 - Math.floor(135 / 2),
        velocity: 6,
        dy: 0,
        ball: game.balls.left,
        releaseBall: function () {
            if (this.ball) {
                this.ball.jump();
                this.ball = false;
            }
        },
        move: function () {
            this.y += this.dy;

            if (this.ball) {
                this.ball.y += this.dy;
            }
        },
        stop: function () {
            this.dy = 0;

            if (this.ball) {
                this.ball.dy = 0;
            }
        }
    },
    right: {
        width: 25,
        height: 125,
        x: cfg.dispSize['x'] - 25 - 10,
        y: cfg.dispSize['y'] / 2 - Math.floor(135 / 2),
        velocity: 6,
        dy: 0,
        ball: game.balls.right,
    },
};


window.addEventListener("load", function () {
    game.start();
})