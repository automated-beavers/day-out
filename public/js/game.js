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

  var currentPlayer = new Sprite(game.spriteWidth, game.spriteHeight);
  var players = [currentPlayer];

  var initPlayers = function () {
    currentPlayer.frame = [0, 1];
    currentPlayer.startingX = 10;
    currentPlayer.startingY = 10;
    currentPlayer.x = currentPlayer.startingX * game.spriteWidth;
    currentPlayer.y = currentPlayer.startingY * game.spriteHeight;
    currentPlayer.image = new Surface(game.spriteWidth, game.spriteHeight);
    currentPlayer.image.draw(game.assets['images/beaver.png']);
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
