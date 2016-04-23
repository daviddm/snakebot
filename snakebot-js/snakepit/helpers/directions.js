var names = { FOOD: 'FOOD', TAIL: 'TAIL', RANDOM: 'RANDOM', KAMIKAZE: 'KAMIKAZE' };
var allowed = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
var resultInDeath = ['obstacle', 'snakehead', 'snakebody'];

var scoredDirection = function (dir, score, name) {
    return { direction: dir, score: score, name: name };
}

var directions = function () {
    var dirs = [];
    return {
        addScored: function (scored) {
            dirs.push(scored);
        },
        getBest: function () {
                console.log(dirs)
            return dirs.reduce(function (prev, curr, i, arr) {
                if (prev == null) { return curr; }
                if (curr.score >= prev.score) { return curr }
                return prev;
            }, null)
        },
        getDirs: function () {
            return dirs;
        }
    };
}

exports.scoredDirection = scoredDirection;
exports.directions = directions;
exports.names = names;
exports.allowed = allowed;
exports.resultInDeath = resultInDeath;