// Set some global variables for control of Player coordinates
var X_STEP = 101;
var Y_STEP = 83;
var Y_OFFSET = 52;


// Enemies our player must avoid
var Enemy = function() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
    this.x = -1 * X_STEP * (1 + Math.round(Math.random() * 2));
    this.y = 0;
    this.speed = 150 + Math.round(Math.random() * 50);
    
    // Stagger the start time of enemies
    this.delayDuration = Math.round(Math.random() * 120);
    this.delayCounter = 0;
    this.readyMove = 0;
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // Multiply any movement by the dt parameter, which
    // ensures the game runs at the same speed for all
    // computers.
    if(this.delayCounter < this.delayDuration) {
        this.delayCounter+=1;
    } else {
        this.readyMove = 1;
    }
    this.x += this.speed * dt * this.readyMove;
    if(this.x >= ctx.canvas.width) {
        this.reset();
    }
    if(this.slowing) {
        this.speed -= 2;
        if(this.speed <= 0) {
            this.speed = 0;
            this.slowing = false;
        }
    }
};

// If enemy has run off the board, set it back to start
// point and set its speed.
Enemy.prototype.reset = function() {
    this.x = -1 * X_STEP * (1 + Math.round(Math.random() * 2));
    if(gameActive) this.speed = 150 + Math.round(Math.random() * 50);
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// ...
var Player = function() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images.
    // Initially a blank image, we'll load a random
    // avatar whenever a new game starts.
    this.sprite = 'images/char-blank.png';
    
    this.row = 4;
    this.col = 2;
    this.x = this.col * X_STEP;
    this.y = this.row * Y_STEP + Y_OFFSET;
    this.lives = 3;
    this.score = 0;
    this.fading = false;
    this.dying = false;
    this.winning = false;
    this.hittable = true;
    this.maxCount = 40;
    this.counter = 0;
};

// Make changes to the player's x- and y-coordinates
Player.prototype.update = function() {
    this.x = this.col * X_STEP;
    this.y = this.row * Y_STEP + Y_OFFSET;
};

/*
 * Move player back to starting point if the player
 * has been hit by an enemy.
*/
Player.prototype.reset = function() {
    this.row = 4;
    this.col = 2;
    this.x = this.col * X_STEP;
    this.y = this.row * Y_STEP + Y_OFFSET;
};

/*
 * Render the player to the game screen
*/
Player.prototype.render = function() {
    if(this.fading) {
        ctx.globalAlpha = 0.5 * (Math.cos(2 * this.counter/this.maxCount * Math.PI) + 1);
        if(this.counter === this.maxCount/2) this.reset();
        if(this.counter === this.maxCount) {
            this.fading = false;
            this.hittable = true;
            this.counter = 0;
        }
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
        ctx.globalAlpha = 1.0;
        this.counter+=1
    } else if(this.dying) {
        ctx.globalAlpha = 0.5 * (Math.cos(2 * this.counter/this.maxCount * Math.PI) + 1);
        if(this.counter === this.maxCount/4) {
            this.dying = false;
        }
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
        ctx.globalAlpha = 1.0;
        this.counter+=1;
    } else {
        if(gameActive) {
            ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
        } else {
            ctx.globalAlpha = 0.25;
            ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
            ctx.globalAlpha = 1.0;
        }
    }
};

Player.prototype.handleInput = function(direction) {
    if(gameActive && !this.fading) {
        switch(direction) {
            case 'left':
                if(this.col > 0) this.col -= 1;
                break;
            case 'right':
                if(this.col < 4) this.col+=1;
                break;
            case 'up':
                if(this.row > 0) {
                    this.row -= 1;
                } else {
                    console.log("you win");
                    this.playerWins();
                }
                break;
            case 'down':
                if(this.row < 4) this.row+=1;
                break;
        }
        this.update();
    }
};

Player.prototype.playerMinus = function() {
    this.lives -= 1;
    this.counter = 0;
    if(this.lives > 0) {
        this.fading = true;
    } else {
        this.dying = true;
    }
    this.hittable = false;
    if(this.lives === 0) {
        gameActive = false;
        this.dying = true;
        $(".game-over").css("visibility", "visible");

        allEnemies.forEach(function(enemy) {
            enemy.slowing = true;
        });        
    }
};

Player.prototype.playerWins = function() {
    this.score+=1000;
    this.fading = true;
    this.winning = true;
    this.hittable = false;
};



// Instantiate Player and Enemy objects
var player = new Player();
var allEnemies = [];
for(var i = 0; i < 9; i+=1) {
    allEnemies.push(new Enemy());
    var n = i%3;
    allEnemies[i].y = Y_OFFSET + Y_STEP * n;
}


function startOver() {
    player = new Player();
    allEnemies = [];
    for(var i = 0; i < 9; i+=1) {
        allEnemies.push(new Enemy());
        var n = i%3;
        allEnemies[i].y = Y_OFFSET + Y_STEP * n;
    }
    $(".game-over").css("visibility", "hidden");
    gameActive = true;
    player.sprite = images[Math.floor(Math.random()*images.length)];    
}

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };
    player.handleInput(allowedKeys[e.keyCode]);
});