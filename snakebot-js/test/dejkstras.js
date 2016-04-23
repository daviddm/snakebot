var Dejkstras = require('../snakepit/helpers/dejkstras.js');
var assert = require('chai').assert;
var expect = require('chai').expect;

describe('Dejkstras', function() {
    describe('Default values', function() {
        it('Return null when no food is found', function() {
            expect(Dejkstras({ x: 0, y: 0 }, 10, 10, [], ['food'])).to.be.null;
        });
        it('Return path in correect order', function() {
            var path = Dejkstras({ x: 0, y: 0 }, 10, 10, [{ x: 3, y: 0, content: 'food' }], ['food']);
            expect(path).to.deep.equal([{ x: 1, y: 0 },{ x: 2, y: 0 },{ x: 3, y: 0 }]);
        });
    });
    describe('Single Points', function() {
        it('Straight lines', function() {
            assert.equal(Dejkstras({ x: 0, y: 0 }, 10, 10, [{ x: 9, y: 0, content: 'food' }], ['food']).length, 9);
            assert.equal(Dejkstras({ x: 0, y: 0 }, 10, 10, [{ x: 0, y: 9, content: 'food' }], ['food']).length, 9);
        });
        it('Diagonal lines', function() {
            assert.equal(Dejkstras({ x: 0, y: 0 }, 10, 10, [{ x: 9, y: 9, content: 'food' }], ['food']).length, 18);
        });
    });
    describe('Double Points', function() {
        it('Straight lines', function() {
            assert.equal(Dejkstras({ x: 0, y: 0 }, 10, 10, [{ x: 9, y: 0, content: 'food' }, { x: 0, y: 5, content: 'food' }], ['food']).length, 5);
        });
        it('Diagonal lines', function() {
            assert.equal(Dejkstras({ x: 0, y: 0 }, 10, 10, [{ x: 9, y: 9, content: 'food' }, { x: 7, y: 3, content: 'food' }], ['food']).length, 10);
        });
    });
    describe('Obstacles', function() {
        it('1 obstacle', function() {
            assert.equal(Dejkstras({ x: 0, y: 0 }, 10, 10, [{ x: 0, y: 2, content: 'food' },{ x: 0, y: 1, content: 'obstacle' }], ['food'], ['obstacle']).length, 4);
            assert.equal(Dejkstras({ x: 0, y: 0 }, 10, 10, 
            [{ x: 2, y: 0, content: 'food' },
            { x: 1, y: 0, content: 'obstacle' },
            { x: 1, y: 1, content: 'obstacle' },
            { x: 1, y: 2, content: 'obstacle' },
            { x: 1, y: 3, content: 'obstacle' },
            { x: 1, y: 4, content: 'obstacle' },
            { x: 1, y: 5, content: 'obstacle' },
            { x: 1, y: 6, content: 'obstacle' },
            { x: 1, y: 7, content: 'obstacle' },
            { x: 1, y: 8, content: 'obstacle' }],
             ['food'], ['obstacle']).length, 20);
        });
        it('Diagonal lines', function() {
            // assert.equal(Dejkstras({ x: 0, y: 0 }, 10, 10, [{ x: 9, y: 9, content: 'food' }, { x: 7, y: 3, content: 'food' }], ['food']).length, 10);
        });
    });
    describe('Limit search depth', function() {
        it('2 depth', function() {
            expect(Dejkstras({ x: 0, y: 0 }, 10, 10, [{ x: 9, y: 9, content: 'food' }], ['food'], [], 3)).to.be.null;
        });
    });
    describe('Limit search depth and find', function() {
        it('2 depth', function() {
            expect(Dejkstras({ x: 0, y: 0 }, 10, 10, [{ x: 1, y: 0, content: 'food' }], ['food'], [], 3)).to.not.be.null;
            assert.equal(Dejkstras({ x: 0, y: 0 }, 10, 10, [{ x: 1, y: 0, content: 'food' }], ['food'], [], 2).length, 1);
        });
    });
    describe('Limit search depth and find 2 paths', function() {
        it('2 depth', function() {
            assert.equal(Dejkstras({ x: 0, y: 0 }, 10, 10, [{ x: 1, y: 0, content: 'food' },{ x: 0, y: 1, content: 'food' }], ['food'], [], 3).length, 2);
        });
    });
    describe('Limit search and override not wanted objects', function() {
        it('2 depth', function() {
            assert.equal(Dejkstras({ x: 0, y: 0 }, 10, 10, [{ x: 1, y: 0, content: 'obstacle' },{ x: 2, y: 0, content: 'food' }], ['food'], [], 3).length, 1);
        });
    });
});