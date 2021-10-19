const division = require("../src/actions/division");

const assert = require("assert");

describe("division", function() {
  it("4 / 2 should be 2 ", function() {
    assert.equal(division(4, 2), 2);
  });
});
