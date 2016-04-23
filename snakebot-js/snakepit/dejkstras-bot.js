/**
 * Snake Bot script.
 */
var MapUtils = require('./../domain/mapUtils.js');
var log = null; // Injected logger

var Dejkstras = require('./helpers/dejkstras.js');
var Directions = require('./helpers/directions.js');

var lastDecision = null;

function update(mapState, myUserId) {

    var map = mapState.getMap();
    var direction = 'UP';  // <'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>
    var snakeBrainDump = {}; // Optional debug information about the snakes current state of mind.

    var dirs = Directions.directions();

    var myCoords = MapUtils.whereIsSnake(myUserId, map);
    snakeBrainDump.myCoords = myCoords;
    
    var myPoints =  map.getSnakeInfos().reduce(function(prev, curr) {
        return curr.getId() == myUserId ? curr.getPoints() : prev;
    }, 0);

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
        var mySnake = snakeInfo.getId() == myUserId;
        snakeInfo.getPositions().map(function(pos, index, arr) {
            var e = MapUtils.translatePosition(pos, map.getWidth());
            e.content = 0 == index ? 'snakehead' : (index == arr.length - 1 ? (mySnake ? 'mysnaketail' : 'snaketail') : 'snakebody');
            mapObjects.push(e);
        })
    });
    // console.log(mapObjects)

    // FOOD
    if (food.length) {
        var path = Dejkstras(myCoords, map.getWidth(), map.getHeight(), mapObjects, ['food'], ['obstacle', 'snakehead', 'snakebody', 'mysnaketail', 'snaketail']);

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

    // Aim for tail
    // Follow tail for 3 tick
    // Continue as before
    var tailPath = Dejkstras(myCoords, map.getWidth(), map.getHeight(), mapObjects, ['snaketail'], ['obstacle', 'snakebody', 'mysnaketail', 'snakehead']);
    // console.log(tailPath)
    if (false && tailPath != null) {
        var tailCoord = tailPath.pop();
        var snake = map.getSnakeInfos().filter(function(snakeInfo) {
            var coord = MapUtils.translatePosition(snakeInfo.getPositions().pop(), map.getWidth());
            return coord.x == tailCoord.x && coord.y == tailCoord.y;
        });
        if (snake.length === 1) {
            // We found the snake, lets figger out where it's gonna be when we reach it
            var snakeCoords = snake.map(function(snake) {
                var coord = MapUtils.translatePosition(snake.getPositions().pop(), map.getWidth());
                return { x: coord.x, y: coord.y };
            });
            var goal = snakeCoords.slice(-1);
            goal.content = 'goal';
            var goalPaths = Dejkstras(myCoords, map.getWidth(), map.getHeight(), mapObjects.concat(goal), ['goal'], ['obstacle', 'snakebody', 'mysnaketail', 'snaketail', 'snakehead'], tailPath.length);
            if(goalPaths != null) {
                console.log('Hunting tail')
                var newCord = goalPaths[0];
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
                    dirs.addScored(
                        Directions.scoredDirection(
                            path[0].direction,
                            10 / goalPaths[0].length,
                            Directions.names.TAIL
                        )
                    )
                }
            } else {
                // console.log('Cant reach tail')
            }
        }
    }


    // AVOID SNAKES, ESPECIALLY HEADS
    // Search for unpredictable snake heads, deepth 2
    var headPaths = Dejkstras(myCoords, map.getWidth(), map.getHeight(), mapObjects, ['snakehead'], ['obstacle', 'snakebody', 'mysnaketail', 'snaketail'], 2);
    if (headPaths == null) {
        dirs.getDirs().forEach(function(curr, i, arr) {
            if (dir.name != Directions.names.FOOD) {
                return;
            }
            // If score for food is higher then 3 / 2, we are all chasing the same food and we're close the the food. ABORT
            if (curr.score >= 3 / 2) {
                arr[i].score *= -1;
                // Clear all other going in this direction
                dirs.getDirs().forEach((other, i, arr) => {
                    if(other.name != Directions.names.FOOD && other.direction == curr.direction) {
                        if(other.point === 0) {
                            arr[i].point = -1;
                        } else {
                            arr[i].point *= -1;
                        }
                    }
                })
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
    var kamikaze = map.getSnakeInfos().every(function(snakeInfo) {
        if(snakeInfo.getId() == myUserId) {
            return true;
        }
        return myPoints > snakeInfo.getPoints() + 11 
    });
    var snakesAlive = map.getSnakeInfos().reduce((prev, curr) => {
        return curr.isAlive() ? prev + 1 : prev;
    }, 0);
    if(kamikaze && snakesAlive == 2 && lastDecision != null) {
        // Hit my self
        var kamDir = myCoords;
        switch (lastDecision.direction) {
            case 'UP':
                kamDir.y++;
                kamDir.direction = 'DOWN';
                break;
            case 'RIGHT':
                kamDir.x--;
                kamDir.direction = 'LEFT';
                break;
            case 'DOWN':
                kamDir.y--;
                kamDir.direction = 'UP';
                break;
            case 'LEFT':
                kamDir.x++;
                kamDir.direction = 'RIGHT';
                break;
        }
        dirs.addScored(
            Directions.scoredDirection(
                kamDir.direction,
                10,
                Directions.names.KAMIKAZE
            )
        )
    }

    // Decide
    var best = dirs.getBest();
    if (best == null) {
        // We don't have any path. STALL
        direction = null;
    } else {
        direction = dirs.getBest().direction;
    }
    lastDecision = best;

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
    lastDecision = null;
}

exports.bootStrap = bootStrap;
exports.update = update;
exports.gameEnded = gameEnded;