/**
 * Snake Bot script.
 */
var MapUtils = require('./../domain/mapUtils.js');
var log = null; // Injected logger

var Dejkstras = require('./helpers/dejkstras.js');
var Directions = require('./helpers/directions.js');

function update(mapState, myUserId) {

    var map = mapState.getMap();
    var direction = 'UP';  // <'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>
    var snakeBrainDump = {}; // Optional debug information about the snakes current state of mind.

    var dirs = Directions.directions();

    var myCoords = MapUtils.whereIsSnake(myUserId, map);
    snakeBrainDump.myCoords = myCoords;

    var food = MapUtils.findFood(myCoords, map);

    // Create array with all map objects for search algorithm
    var mapObjects = [];
    map.getFoodPositions().map(function(pos) {
        var e = MapUtils.translatePosition(pos, map.getWidth());
        e.content = 'food';
        mapObjects.push(e);
    });
    map.getObstaclePositions().map(function(pos) {
        var e = MapUtils.translatePosition(pos, map.getWidth());
        e.content = 'obstacle';
        mapObjects.push(e);
    });
    map.getSnakeInfos().map(function(snakeInfo) {
        snakeInfo.getPositions().map(function(pos, index, arr) {
            var e = MapUtils.translatePosition(pos, map.getWidth());
            e.content = 0 == index ? 'snakehead' : index = arr.length - 1 ? 'snaketail' : 'snakebody';
            mapObjects.push(e);
        })
    });

    // FOOD
    if (food.length) {
        var path = Dejkstras(myCoords, map.getWidth(), map.getHeight(), mapObjects, ['food'], ['obstacle', 'snakehead', 'snakebody', 'snaketail']);

        if (path != null) {
            var newCord = path[0];
            if (newCord.x < myCoords.x) {
                path[0].direction = 'LEFT';
            } else if (newCord.x > myCoords.x) {
                path[0].direction = 'RIGHT';
            } else if (newCord.y < myCoords.y) {
                path[0].direction = 'UP';
            } else if (newCord.y > myCoords.y) {
                path[0].direction = 'DOWN';
            }
            if (path[0].direction != 'undefined') {
                // ToDo: Instead of dividing 3, get the values for eating and growing
                dirs.addScored(
                    Directions.scoredDirection(
                        path[0].direction,
                        3 / path.length,
                        Directions.names.FOOD
                    )
                );
            }
        }
    }

    // RANDOM
    var randDirs = Directions.allowed.filter(function(dir) {
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
        // Map boundries
        if (newCord.x < 0 || newCord.x > map.getWidth() - 1 || newCord.y < 0 || newCord > map.getHeight() - 1) {
            return false;
        }
        var point = MapUtils.translateCoordinate(newCord, map.getWidth());
        var tile = MapUtils.getOccupiedMapTiles(map)[point];
        return Directions.resultInDeath.indexOf(tile ? tile.content : null) < 0;
    }, [])

    if (randDirs.length) {
        randDirs.forEach(function(randDir) {
            dirs.addScored(
                Directions.scoredDirection(
                    randDir,
                    0,
                    Directions.names.RANDOM
                )
            )
        })
    }

    // TAILS



    // AVOID SNAKES, ESPECIALLY HEADS
    // Search for unpredictable snake heads, deepth 2
    var headPaths = Dejkstras(myCoords, map.getWidth(), map.getHeight(), mapObjects, ['snakehead'], ['obstacle', 'snakebody', 'snaketail'], 2);
    if (headPaths == null) {
        dirs.getDirs().forEach(function(curr, i, arr) {
            if (dir.name != Directions.names.FOOD) {
                return;
            }
            // If score for food is higher then 3 / 2, we are all chasing the same food and we're close the the food. ABORT
            if (curr.score > 3 / 2) {
                arr[i].score *= -1;
            }
        });
        dirs.getDirs().forEach(function(curr, i, arr) {
            if (dir.name == Directions.names.RANDOM) {
                return;
            }
        });
    }

    // LOOK AHEAD, IS THIS A DEAD END

    // KAMIKAZE FOR THE WIN, ENOUGHT POINTS

    // Decide
    var best = dirs.getBest();
    if (best == null) {
        // We don't have any path. STALL
        direction = null;
    } else {
        direction = dirs.getBest().direction;
    }

    // DEBUG
    snakeBrainDump.dirs = dirs.getDirs();
    snakeBrainDump.decision = dirs.getBest();

    // 3. Then shake that snake!
    return {
        direction: direction,
        debugData: snakeBrainDump
    }
}

function bootStrap(logger) {
    log = logger;
}

function gameEnded() {
    // Implement as needed.
}

exports.bootStrap = bootStrap;
exports.update = update;
exports.gameEnded = gameEnded;