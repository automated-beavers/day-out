App.game.init = function () {
  enchant();

  var game = new Game(1280, 768);
  game.fps = 20;
  game.scale = 1;
  game.spriteSheetWidth = 2048;
  game.spriteSheetHeight = 64;
  game.spriteWidth = 64;
  game.spriteHeight = 64;
  game.preload(['images/world.png', 'images/beaver.png']);
  game.initialPlayerCoordinates = {
    'yellow' : [2, 10],
    'red'    : [6, 10],
    'green'  : [13, 10],
    'blue'   : [17, 10]
  };
  game.players = [];// holds all the logged in players
  game.currentPlayer = App.currentPlayer();

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
      collision = undefined,
      item = undefined,
      passableItems = [10, 21, 22, 23, 24, 25, 26];

    for (var i = 0; i < foregroundData.length; i++) {
      collisionData.push([]);
      for (var j = 0; j < foregroundData[0].length; j++) {
        item = foregroundData[i][j]
        collision = (item > 0 && passableItems.indexOf(item) < 0) ? 1 : 0;
        collisionData[i][j] = collision;
      }
    }
    backgroundMap.collisionData = collisionData;
  }


  var Player = Class.create(Sprite, {
    initialize: function(startingX, startingY) {
      Sprite.call(this, game.spriteWidth, game.spriteHeight);
      this.offset = 0;
      this.direction = 0;
      this.color = undefined;
      this.walk = 0;
      this.frame = this.offset;
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
        socket.emit('positionCreate', {x: this.x, y: this.y, roomId: App.roomId});

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

  var EnemyPlayer = Class.create(Player, {
    initialize: function(startingX, startingY) {
      Player.call(this, startingX, startingY);
    },
    move: function () {
      this.frame = this.offset + this.direction * 2 + this.walk;

      if (this.isMoving) {
        //console.log('moving by ...');
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
    var color = undefined;
    var player = undefined;

    var choosePlayer = function (color) {
      if (color === game.currentPlayer.color) {
        return new Player(game.initialPlayerCoordinates[color][0],
                          game.initialPlayerCoordinates[color][1]);
      } else  {
        return new EnemyPlayer(game.initialPlayerCoordinates[color][0],
                               game.initialPlayerCoordinates[color][1]);
      }
    }

    for (var i = 0; i < App.players.length; i++) {
      color = App.players[i].color;

      if (color == 'yellow') {
        player = choosePlayer(color);
        player.offset = 0;
        player.color = color;
      } else if (color == 'red') {
        player = choosePlayer(color);
        player.offset = 8;
        player.color = color;
      } else if (color == 'green') {
        player = choosePlayer(color);
        player.offset = 16;
        player.color = color;
      } else if (color == 'blue') {
        player = choosePlayer(color);
        player.offset = 24;
        player.color = color;
      }
      game.players.push(player);
    }
  };

  // refresh each enemy player position
  var updateEnemyPlayers = function (enemies) {

    var figureOutDirection = function () {

    };

    var findEnemy = function (player, others) {
      var found = false;
      for (var i = 0; i < others.length; i++) {
        if (player.color === others[i].color) {
          found = others[i];
        }
      }
      return found;
    };

    for (var i = 0; i < game.players.length; i++) {
      if (game.players[i].color !== game.currentPlayer.color) {
        //console.log(game.players[i].color);
        var enemy = findEnemy(game.players[i], enemies);
        if (enemy) {
          //console.log('updating enemy');
          //console.log(enemy);
          var
            player = game.players[i],
            oldX = game.players[i].x,
            oldY = game.players[i].y,
            newX = enemy.x,
            newY = enemy.y;

          player.xMove = 0;
          player.yMove = 0;

          if (newX > oldX) {
            player.direction = 2;
            player.xMove = 8;
          } else if (newX < oldX) {
            player.direction = 3;
            player.xMove = -8;
          } else if (newY > oldY) {
            player.direction = 0;
            player.yMove = 8;
          } else if (newY < oldY) {
            player.direction = 1;
            player.yMove = -8;
          }
          // player.move();
          /* game.players[i].x = newX;
          game.players[i].y = newY; */
        }
      }
    }
  };

  var initWorld = function () {
    var stage = new Group();
    stage.addChild(backgroundMap);
    stage.addChild(foregroundMap);
    for (var i = 0; i < game.players.length; i++) {
      stage.addChild(game.players[i]);
    }
    game.rootScene.parentNode = document.getElementById('game');
    game.rootScene.addChild(stage);
  }

  game.onload = function () {
    initMaps();
    initPlayers();
    initWorld();

    socket.on('positionUpdate', function (data) {
      updateEnemyPlayers(data.players);
      /* var dummyPlayers = [{
        color: 'red', x: game.initialPlayerCoordinates['red'][0] * 64 - 64,
        y: game.initialPlayerCoordinates['red'][0] * 64}] */

      // updateEnemyPlayers(dummyPlayers);
    });
  };

  game.start();
};
