var Dejkstras = function(startCoord, mapWidth, mapHeight, mapObjects, include, exclude, maxDepth) {
    // Create grid
    if (!Array.isArray(exclude)) {
        exclude = [];
    }
    if (maxDepth == 'undefined' || isNaN(maxDepth)) {
        maxDepth = null;
    }

    var grid = Array.apply(null, Array(mapWidth))
        .map(function(x, i) {
            return Array.apply(null, Array(mapHeight))
                .map(function() { return -1 })
        });

    var orgCoord = JSON.parse(JSON.stringify(startCoord));

    // Add objects to grid
    mapObjects.forEach(function(e) {
        grid[e.x][e.y] = e.content;
    }, this);
    
    // console.log(grid)

    var walk = function(coord) {
        var coordList = [{ coord: orgCoord, path: [] }]; // List for coords to parse

        // if (foundGoal(coord)) {
        //     console.log('Found Goal')
        //     return coord;
        // }

        // var newCoords = availableDirections(coord);
        // console.log('new', newCoords)
        // if (newCoords.length <= 0) {
        //     return null;
        // }

        var found = false;
        // var path = null;
        // newCoords.forEach(function(newCoord) {
        //   path = walk(newCoord);
        //   if(path){
        //     found = true;
        //   }
        // });
        var currCoord = null;
        // console.log(grid)
        var paths = []
        
        while (coordList.length > 0 && (maxDepth == null && !found || maxDepth != null)) {
            // console.log(coordList.length > 0, maxDepth == null && !found, maxDepth != null)
            currCoord = coordList.shift();
            if (maxDepth != null && currCoord.path.length > maxDepth) {
                break;
            }
            if (isVisited(currCoord.coord)) {
                console.log()
                break;
            }

            // console.log('curr ',currCoord)

            if (foundGoal(currCoord.coord)) {
                // console.log('Found Goal')
                found = true;
                paths.push(currCoord.path);
                if(maxDepth == null) {
                    break;
                } else {
                    // markAsVisited(currCoord.coord, currCoord.path.length || 1);
                    continue;
                }
            } else {
                markAsVisited(currCoord.coord, currCoord.path.length || 1);
            }


            var newCoords = availableDirections(currCoord.coord);
            if (newCoords.length > 0) {
                // console.log('new', newCoords)
                newCoords.forEach(function(newCoord) {
                    if (markedForVisit(newCoord)) {
                        return;
                    }
                    // console.log('new',newCoord)
                    markForVisit(newCoord);
                    coordList.push({ coord: newCoord, path: currCoord.path.concat(newCoord) });
                });
            }
        }

        // console.log(currCoord.path)
        // console.log(grid)
        if (!found) {
            return null;
        }
        if(maxDepth == null) {
            return paths[0];
        }
        // console.log(paths)
        return paths;

    };

    var availableDirections = function(coord) {
        var dirs = [];
        // Left
        if (canWalk({ x: coord.x - 1, y: coord.y })) {
            dirs.push({ x: coord.x - 1, y: coord.y });
        }
        // Right 
        if (canWalk({ x: coord.x + 1, y: coord.y })) {
            dirs.push({ x: coord.x + 1, y: coord.y });
        }
        // Up 
        if (canWalk({ x: coord.x, y: coord.y - 1 })) {
            dirs.push({ x: coord.x, y: coord.y - 1 });
        }
        // Down 
        if (canWalk({ x: coord.x, y: coord.y + 1 })) {
            dirs.push({ x: coord.x, y: coord.y + 1 });
        }
        return dirs;
    };

    var canWalk = function(coord) {
        return Array.isArray(grid[coord.x]) &&
            (grid[coord.x][coord.y] === -1 ||
                (typeof grid[coord.x][coord.y] == 'string' && exclude.indexOf(grid[coord.x][coord.y]) < 0)
            )
    }

    var foundGoal = function(coord) {
        // console.log(Array.isArray(grid[coord.x]), include, grid[coord.x][coord.y], include.indexOf(grid[coord.x][coord.y]) >= 0)
        return Array.isArray(grid[coord.x]) && include.indexOf(grid[coord.x][coord.y]) >= 0;
    }

    var markAsVisited = function(coord, value) {
        grid[coord.x][coord.y] = value;
    }

    var markForVisit = function(coord) {
        if (isNaN(grid[coord.x][coord.y])) {
            // console.log('food',coord)
            return;
        }
        grid[coord.x][coord.y] = 0;
    }

    var isVisited = function(coord) {
        return grid[coord.x][coord.y] > 0;
    }
    
    var markedForVisit = function(coord) {
        return grid[coord.x][coord.y] >= 0;
    }

    return walk(startCoord);
    // console.log('out', ret)

}

module.exports = Dejkstras;