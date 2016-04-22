/**
 * Snake Bot script.
 */
var MapUtils = require('./../domain/mapUtils.js');
var log = null; // Injected logger

var Directions = require('./helpers/directions.js');

function update(mapState, myUserId){

  var map = mapState.getMap();
  var direction = 'UP';  // <'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>
  var snakeBrainDump = {}; // Optional debug information about the snakes current state of mind.

  var dirs = Directions.directions();

  var myCoords = MapUtils.whereIsSnake(myUserId, map);
  snakeBrainDump.myCoords = myCoords;


  var food = MapUtils.findFood(myCoords, map);

  // FOOD
  if(food.length){
    var path = MapUtils.findPathAS(myCoords, food.pop(), map.getWidth(), map.getHeight(), function (coord, goalCoord) {
      var tile = MapUtils.getAt(coord, map);
      // ToDo: Change 1000 to a value representing the map size
      // ToDo: Change to dijkstras from manhattan, if obstacle is in the way in a straight line it will fail
      return MapUtils.getManhattanDistance(coord, goalCoord) + (tile && (Directions.resultInDeath.indexOf(tile.content)) ? 1000 : 0);
    });

    // ToDo: Instead of dividing 3, get the values for eating and growing
    dirs.addScored(
      Directions.scoredDirection(
        path[0].direction,
        3 / path.length,
        Directions.names.FOOD
      )
    )
  }

  // TAIL

  // RANDOM
  var randDirs = Directions.allowed.filter(function (dir) {
    var newCord = MapUtils.whereIsSnake(myUserId, map);
    switch (dir) {
      case 'UP':
        newCord.y--;
        break;
      case 'RIGHT':
        newCord.x++;
        break;
      case 'DOWN':
        newCord.y++;
        break;
      case 'LEFT':
        newCord.x--;
        break;
      default:
        return false;
    }
    // ToDo: Check map boundries
    if (newCord.x < 0 || newCord.x > map.getWidth() || newCord.y < 0 || newCord > map.getHeight()) {
      return false;
    }
    var point = MapUtils.translateCoordinate(newCord, map.getWidth());
    var tile = MapUtils.getOccupiedMapTiles(map)[point];
    return Directions.resultInDeath.indexOf(tile ? tile.content : null) < 0;
  }, [])

// log(randDirs)
  if (randDirs.length) {
    dirs.addScored(
      Directions.scoredDirection(
        randDirs[Math.floor( Math.random() * randDirs.length )],
        0,
        Directions.names.RANDOM
      )
    )
  }


  // AVOID SNAKES, ESPECIALLY HEADS
  // change score on suggestions so far

  // LOOK AHEAD, IS THIS A DEAD END

  // KAMIKAZE FOR THE WIN, ENOUGHT POINTS

  // Decide
  direction = dirs.getBest().direction;

  // DEBUG
  snakeBrainDump.dirs = dirs.getDirs();
  snakeBrainDump.decision = dirs.getBest();

  // 3. Then shake that snake!
  return {
    direction: direction,
    debugData: snakeBrainDump
  }
}

function bootStrap(logger){
  log = logger;
}

function gameEnded(){
  // Implement as needed.
}

exports.bootStrap = bootStrap;
exports.update    = update;
exports.gameEnded = gameEnded;