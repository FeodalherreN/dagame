var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game-area',
{ preload: preload, create: create, update: update, render: render });

function preload() {
    game.load.tilemap('level1', 'assets/starstruck/level1.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tiles-1', 'assets/starstruck/tiles-1.png');
    game.load.spritesheet('dude', 'assets/starstruck/dude2.png', 32, 48);
    game.load.spritesheet('droid', 'assets/starstruck/droid.png', 32, 32);
    game.load.image('starSmall', 'assets/starstruck/star.png');
    game.load.image('starBig', 'assets/starstruck/star2.png');
    game.load.image('background', 'assets/starstruck/background2.png');
    game.load.image('bullet', 'assets/starstruck/bullets.png');

    //SOUNDS
    game.load.audio('blaster', 'assets/soundeffects/blaster.mp3');
    game.load.audio('enemy_hit', 'assets/soundeffects/enemy-hit.wav');
    game.load.audio('steps', 'assets/soundeffects/steps.wav');
    game.load.audio('wall_hit', 'assets/soundeffects/wall-hit.wav');
    game.load.audio('jump', 'assets/soundeffects/jump.wav');
}

var map;
var tileset;
var layer;
var player;
var bullet;
var bullets;
var bulletTime = 0;
var facing = 'left';
var facingLast = 'Left';
var jumpTimer = 0;
var cursors;
var jumpButton;
var fireButton;
var bg;

var blaster;
var enemy_hit;
var steps;
var wall_hit;
var jump;

function create() {

    game.physics.startSystem(Phaser.Physics.ARCADE);

    game.stage.backgroundColor = '#000000';

    bg = game.add.tileSprite(0, 0, document.body.clientWidth, document.body.clientHeight, 'background');
    bg.fixedToCamera = true;

    map = game.add.tilemap('level1');

    map.addTilesetImage('tiles-1');

    map.setCollisionByExclusion([ 13, 14, 15, 16, 46, 47, 48, 49, 50, 51 ]);

    layer = map.createLayer('Tile Layer 1');

    //  Un-comment this on to see the collision tiles
    layer.debug = true;

    layer.resizeWorld();

    game.physics.arcade.gravity.y = 200;

    player = game.add.sprite(32, 32, 'dude');
    game.physics.enable(player, Phaser.Physics.ARCADE);

    player.body.bounce.y = 0.2;
    player.body.collideWorldBounds = true;
    player.body.setSize(20, 32, 5, 16);

    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('turn', [4], 20, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);

    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(30, 'bullet');
    bullets.setAll('anchor.x', -2);
    bullets.setAll('anchor.y', -2);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);

    game.camera.follow(player);

    blaster = game.add.audio('blaster');
    enemy_hit = game.add.audio('enemy_hit');
    steps = game.add.audio('steps');
    wall_hit = game.add.audio('wall_hit');
    jump = game.add.audio('jump');

    cursors = game.input.keyboard.createCursorKeys();
    jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    fireButton = game.input.keyboard.addKey(Phaser.KeyCode.C);

}

function update() {

    game.physics.arcade.collide(player, layer);

    player.body.velocity.x = 0;

    if (cursors.left.isDown)
    {
        player.body.velocity.x = -150;
        if(player.body.onFloor()){
          steps.play('', 0, 0.1, false, false);
        }

        if (facing != 'left')
        {
            player.animations.play('left');
            facing = 'left';
            facingLast = facing;
        }
    }
    else if (cursors.right.isDown)
    {
        player.body.velocity.x = 150;
        if(player.body.onFloor()){
          steps.play('', 0, 0.1, false, false);
        }

        if (facing != 'right')
        {
            player.animations.play('right');
            facing = 'right';
            facingLast = facing;
        }
    }
    else
    {
        if (facing != 'idle')
        {
            player.animations.stop();

            if (facing == 'left')
            {
                player.frame = 0;
            }
            else
            {
                player.frame = 5;
            }
            facingLast = facing;
            facing = 'idle';
        }
    }

    if (jumpButton.isDown && player.body.onFloor() && game.time.now > jumpTimer)
    {
        jump.play('', 0, 0.1, false, false);
        player.body.velocity.y = -250;
        jumpTimer = game.time.now + 750;
    }
    if (fireButton.isDown)
    {
        fireBullet();
        blaster.play('', 0, 0.1, false, false);
    }
}

function render () {
     game.debug.text(game.time.physicsElapsed, 32, 32);
     game.debug.body(player);
     game.debug.bodyInfo(player, 16, 24);
}

function fireBullet () {
    //  To avoid them being allowed to fire too fast we set a time limit
    if (game.time.now > bulletTime)
    {
        //  Grab the first bullet we can from the pool
        bullet = bullets.getFirstExists(false);
        if (bullet)
        {
            //  And fire it
            bullet.reset(player.x, player.y + 8);
            if(facingLast == 'right'){
              bullet.body.velocity.x = +400;
            } else if(facingLast == 'left'){
              bullet.body.velocity.x = -400;
            }
            bulletTime = game.time.now + 200;
        }
    }
}

function resetBullet (bullet) {
    bullet.kill();
}
