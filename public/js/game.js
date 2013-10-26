/* main game */

var initGame = function () {

  enchant();

  var game = new Game(640, 640);
  game.fps = 20;
  game.scale = 1;
  game.spriteSheetWidth = 256;
  game.spriteSheetHeight = 32;
  game.spriteWidth = 32;
  game.spriteHeight = 32;
  game.preload(['images/world.png', 'images/beaver.png']);

  var backgroundMap = new Map(game.spriteWidth, game.spriteHeight);
  var foregroundMap = new Map(game.spriteWidth, game.spriteHeight);

  // initialize world maps
  var initMaps = function () {
    backgroundMap.image = game.assets['images/world.png'];
    backgroundMap.loadData(backgroundData);
    foregroundMap.image = game.assets['images/beaver.png'];
    foregroundMap.loadData(foregroundData);
  }

  //var currentPlayer = new Sprite(game.spriteWidth, game.spriteHeight);
  var players = [];

  var Player = Class.create(Sprite, {
    initialize: function(x, y) {
      Sprite.call(this, game.spriteWidth, game.spriteHeight);
      this.offset = 0;
      this.direction = 0;
      this.walk = 0;
      this.frame = [0, 1];
      this.startingX = 10;
      this.startingY = 10;
      this.isMoving = false;
      this.x = this.startingX * game.spriteWidth;
      this.y = this.startingY * game.spriteHeight;
      this.image = new Surface(game.spriteSheetWidth, game.spriteSheetHeight);
      this.image.draw(game.assets['images/beaver.png']);
    },
    onenterframe: function () {
      this.move();
    },
    move: function () {
      this.frame = this.offset + this.direction * 2 + this.walk;
      console.log(this.direction);

      if (this.isMoving) {
        this.moveBy(this.xMove, this.yMove);

        if (!(game.frame % 2)) {
          this.walk++;
          this.walk %= 2;
        }

        if (this.xMove || this.yMove) {
          this.isMoving = false;
        }
      } else {
        this.xMove = 0;
        this.yMove = 0;

        if (game.input.up) {
          this.direction = 1;
          this.yMove = -4;
        } else if (game.input.down) {
          this.direction = 0;
          this.yMove = 4;
        } else if (game.input.right) {
          this.direction = 2;
          this.xMove = 4;
        } else if (game.input.left) {
          this.direction = 3;
          this.xMove = -4;
        }

        if (this.xMove || this.yMove) {
          this.isMoving = true;
          this.move();
        }
      }
    }
  });

  var currentPlayer = undefined;

  var initPlayers = function () {
    currentPlayer = new Player(10, 10);
    players.push(currentPlayer);
  };

  var initWorld = function () {
    var stage = new Group();
    stage.addChild(backgroundMap);
    stage.addChild(foregroundMap);
    for (var i = 0; i < players.length; i++) {
      stage.addChild(players[i]);
    }
    game.rootScene.parentNode = document.getElementById('game');
    game.rootScene.addChild(stage);
  }

  game.onload = function () {
    initMaps();
    initPlayers();
    initWorld();
  };

  game.start()
}
