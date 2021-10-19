const fs = require("fs");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const uuid = require("uuid");

function addLoggerToRequestMiddleware(logger) {
  return (request, response, next) => {
    request.context = request.context || {};
    request.context.logger = logger;

    return next();
  };
}

function requestIdMiddleware(request, response, next) {
  let requestId = request.header("X-Request-ID");
  if (!requestId) {
    requestId = uuid.v4();
    response.header("X-Request-ID", requestId);
  }

  request.context = request.context || {};
  request.context.requestId = requestId;

  return next();
}

function loggingMiddleware(request, response, next) {
  let requestId = request.context.requestId;

  request.context.logger.info("request", {
    method: request.method,
    url: request.url,
    requestId,
    body: request.body
  });

  let sentPayload = undefined;
  const originalSend = response.send;
  response.send = (...params) => {
    if (sentPayload === undefined) {
      sentPayload = params[0];
    }
    originalSend.apply(response, params);
  };

  response.on("finish", () => {
    request.context.logger.info("response", {
      method: request.method,
      url: request.url,
      requestId,
      status: response.statusCode,
      body: sentPayload
    });
  });

  return next();
}

function errorHandlerMiddleware(error, request, response, next) {
  let requestId = request.context.requestId;

  request.context.logger.error("error", "request", {
    method: request.method,
    url: request.url,
    requestId,
    error
  });

  if (request.headersSent) {
    return next(err);
  }

  return response
    .status(500)
    .send({ error: "An unknown server error occured" });
}

function defaultHandler(request, response) {
  return response.status(404).send({ error: "resource not found" });
}

function createRoutes(logger) {
  const router = express.Router();

  const routesPath = path.join(__dirname, "routes");
  const entries = fs.readdirSync(routesPath);

  for (entry of entries) {
    try {
      const modulePath = path.join(routesPath, entry);
      const module = require(modulePath);
      if (
        module instanceof express.Router ||
        Object.getPrototypeOf(module) == express.Router
      ) {
        router.use("/", module);
        logger.info("configuration", `added "routes/${entry}" Router to API`);
      } else {
        logger.info(
          "configuration",
          `did not add "routes/${entry}" to API, module is not a Router`
        );
      }
    } catch (err) {
      logger.error(
        "error",
        `failed to load module "routes/${entry}" on createRoutes()`,
        err
      );
    }
  }

  return router;
}

function createServer(port, hostname, logger) {
  const app = express();

  app.use(addLoggerToRequestMiddleware(logger));

  app.use(bodyParser.json());

  app.use(requestIdMiddleware);
  app.use(loggingMiddleware);

  app.use(createRoutes(logger));

  app.use(defaultHandler);

  app.use(errorHandlerMiddleware);

  app.listen(port, hostname, () => {
    logger.info(
      "configuration",
      `server started at "http://${hostname}:${port}"`
    );
  });

  return app;
}

module.exports = { createServer };
