/* global suite, test */


var assert = require('assert');
var myExtension = require('../extension');

// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", function () {

    // Simple vanilla test
    test("Vanilla test 1", function (done) {
        myExtension.makeWolframQuery("1+1")
            .then(result => {
                assert.equal(result, "2");
                done();
            })
            .catch((err) => {
                assert.fail(err);
                done(err);
            });
    });

    // Test sending result that return no answer
    test("Test empty String input", function (done) {
        myExtension.makeWolframQuery(" ")
            .then(result => {
                assert.fail(result);
                done();
            })
            .catch((err) => {
                assert.equal(err, "Didn't find any result");
                done();
            });
    });
});