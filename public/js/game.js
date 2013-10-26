/* main game */

App.game = {};
App.game.init = function () {
  console.log('game loaded');

  enchant();

  var game = new Game(1920, 1280);
  game.fps = 20;
  game.scale = 1;
  game.spriteSheetWidth = 512;
  game.spriteSheetHeight = 64;
  game.spriteWidth = 64;
  game.spriteHeight = 64;
  game.preload(['images/world.png', 'images/beaver.png']);

  var backgroundMap = new Map(game.spriteWidth, game.spriteHeight);
  var foregroundMap = new Map(game.spriteWidth, game.spriteHeight);

  // initialize world maps
  var initMaps = function () {
    backgroundMap.image = game.assets['images/world.png'];
    backgroundMap.loadData(backgroundData);
    foregroundMap.image = game.assets['images/beaver.png'];
    foregroundMap.loadData(foregroundData);

    // 1 - collision, 0 - ok to pass
    var
      collisionData = [],
      collision = undefined;

    for (var i = 0; i < foregroundData.length; i++) {
      collisionData.push([]);
      for (var j = 0; j < foregroundData[0].length; j++) {
        collision = foregroundData[i][j] > 0 ? 1 : 0;
        collisionData[i][j] = collision;
      }
    }
    backgroundMap.collisionData = collisionData;
  }

  //var currentPlayer = new Sprite(game.spriteWidth, game.spriteHeight);
  var players = [];

  var Player = Class.create(Sprite, {
    initialize: function(startingX, startingY) {
      Sprite.call(this, game.spriteWidth, game.spriteHeight);
      this.offset = 0;
      this.direction = 0;
      this.walk = 0;
      this.frame = [0, 1];
      this.startingX = startingX;
      this.startingY = startingY;
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

      if (this.isMoving) {
        this.moveBy(this.xMove, this.yMove);

        if (!(game.frame % 2)) {
          this.walk++;
          this.walk %= 2;
        }

        if ((this.xMove && (this.x % game.spriteWidth == 0)) ||
            (this.yMove && (this.y % game.spriteHeight == 0))) {
          this.isMoving = false;
        }
      } else {
        this.xMove = 0;
        this.yMove = 0;

        if (game.input.up) {
          this.direction = 1;
          this.yMove = -8;
        } else if (game.input.down) {
          this.direction = 0;
          this.yMove = 8;
        } else if (game.input.right) {
          this.direction = 2;
          this.xMove = 8;
        } else if (game.input.left) {
          this.direction = 3;
          this.xMove = -8;
        }

        if (this.xMove || this.yMove) {
          // future step
          var x = this.x + (this.xMove ? (this.xMove / Math.abs(this.xMove)) * game.spriteWidth : 0);
          var y = this.y + (this.yMove ? (this.yMove / Math.abs(this.yMove)) * game.spriteHeight : 0);

          if (x >= 0 && x < backgroundMap.width &&
              y >= 0 && y < backgroundMap.height &&
              !backgroundMap.hitTest(x, y)) {
            this.isMoving = true;
            this.move();
          }
        }
      }
    }
  });

  var currentPlayer = undefined;

  var initPlayers = function () {
    currentPlayer = new Player(4, 18);
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

  game.start();
};
