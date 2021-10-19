const remainder = require("../src/actions/remainder");

var assert = require("assert");

describe("remainder", function() {
  it("2 % 4 should be 2", function() {
    assert.equal(remainder(2, 4), 2);
  });
});
