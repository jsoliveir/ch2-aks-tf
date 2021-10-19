const subtraction = require("../src/actions/subtraction");

var assert = require("assert");
describe("subtraction", function() {
  it("1 - 1 should be 0 ", function() {
    assert.equal(subtraction(1, 1), 0);
  });
});
