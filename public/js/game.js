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

  var
    // inanimate elements map
    backgroundMap = new Map(game.spriteWidth, game.spriteHeight),
    // obstacles map
    foregroundMap = new Map(game.spriteWidth, game.spriteHeight);

  // initialize world maps
  var initMaps = function () {
    backgroundMap.image = game.assets['images/world.png'];
    backgroundMap.loadData(backgroundData);
    foregroundMap.image = game.assets['images/world.png'];
    foregroundMap.loadData(foregroundData);

    // 1 - collision, 0 - ok to pass
    var
      collisionData = [],
      finishData = [],
      collision = undefined,
      item = undefined,
      passableItems = [10, 21, 22, 23, 24, 25, 26],
      finishArea = [21, 22, 23, 24, 25, 26];

    for (var i = 0; i < foregroundData.length; i++) {
      collisionData.push([]);
      finishData.push([]);
      for (var j = 0; j < foregroundData[0].length; j++) {
        item = foregroundData[i][j]
        collision = (item > 0 && passableItems.indexOf(item) < 0) ? 1 : 0;
        collisionData[i][j] = collision;
        finishData[i][j] = finishArea.indexOf(item) >= 0 ? 1 : 0;
      }
    }
    backgroundMap.collisionData = collisionData;
    foregroundMap.collisionData = finishData;
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
    move: function (targetX, targetY) {
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

        if (game.input.up ||
            (targetY && targetY < this.y &&
            (targetX > this.x - game.spriteWidth) &&
            (targetX < this.x + game.spriteWidth))) {
          this.direction = 1;
          this.yMove = -8;
        } else if (game.input.down ||
                   (targetY && targetY > this.y &&
                   (targetX > this.x - game.spriteWidth) &&
                   (targetX < this.x + game.spriteWidth))) {
          this.direction = 0;
          this.yMove = 8;
        } else if (game.input.right ||
                   (targetX && targetX > this.x &&
                   (targetY < this.y + game.spriteWidth) &&
                   (targetY > this.y - game.spriteWidth))) {
          this.direction = 2;
          this.xMove = 8;
        } else if (game.input.left ||
                  (targetX && targetX < this.x &&
                  (targetY < this.y + game.spriteWidth) &&
                  (targetY > this.y - game.spriteWidth))) {
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

            if (foregroundMap.hitTest(x, y)) {
              socket.emit('finished', {roomId: App.roomId});
            }
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
        currentPlayer = new Player(game.initialPlayerCoordinates[color][0],
                          game.initialPlayerCoordinates[color][1]);
        return currentPlayer;
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

    var figureOutDirection = function (player, enemy) {
      var
        oldX = player.x,
        oldY = player.y,
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
        var enemy = findEnemy(game.players[i], enemies);
        if (enemy) {
          figureOutDirection(game.players[i], enemy);
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

    game.rootScene.addChild(stage);
  }

  game.focusOnCurrentPlayer = function () {
    /* if (currentPlayer) {
      var
        x = Math.min((game.width - game.spriteWidth) / 2 - currentPlayer.x, 0),
        y = Math.min((game.height - game.spriteHeight) / 2 - currentPlayer.y, 0);
      x = Math.max(game.width, x + backgroundMap.width) - backgroundMap.width;
      y = Math.max(game.width, y + backgroundMap.height) - backgroundMap.height;

      game.rootScene.firstChild.x = x;
      game.rootScene.firstChild.y = y;
    } */
  };

  game.onload = function () {
    initMaps();
    initPlayers();
    initWorld();

    socket.on('positionUpdate', function (data) {
      updateEnemyPlayers(data.players);
    });

    game.rootScene.on('enterframe', function (evnt) {
      game.focusOnCurrentPlayer();
    });

    game.rootScene.on('touchstart', function (evnt) {
      if (currentPlayer) {
        currentPlayer.move(evnt.x, evnt.y);
      }
    });
  };

  game.start();
};
