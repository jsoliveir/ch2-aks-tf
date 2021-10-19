const multiplication = require("../src/actions/multiplication");

const assert = require("assert");

describe("multiplication", function() {
  it("2 * 2 should be 4 ", function() {
    assert.equal(multiplication(2, 2), 4);
  });
});
