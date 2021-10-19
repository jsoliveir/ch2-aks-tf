const addition = require("../src/actions/addition");

const assert = require("assert");

describe("addition", function() {
  it("2 + 2 should be 4 ", function() {
    assert.equal(addition(2, 2), 4);
  });
});
