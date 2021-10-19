const express = require("express");

const division = require("../../actions/division");
const { isNumber } = require("../../common");

const router = express.Router();

router.post("/", (request, response) => {
  const left = request.body && request.body.left;
  const right = request.body && request.body.right;

  if (!isNumber(left)) {
    return response
      .status(400)
      .send({ error: 'invalid "left" value, must be a number' });
  }

  if (!isNumber(right)) {
    return response
      .status(400)
      .send({ error: 'invalid "right" value, must be a number' });
  }

  const result = division(left, right);

  return response.status(200).send({ type: "number", value: result });
});

module.exports = router;
