const express = require("express");

const packageJson = require("../../../package.json");

const router = express.Router();

router.get("/version", (request, response) =>
  response
    .status(200)
    .send({ version: (packageJson && packageJson.version) || "unknown" })
);

module.exports = router;
