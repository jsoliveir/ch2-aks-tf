const { sleep, apiCall } = require("./common");

const unaryExpressions = ["number"];
const ignoreProperties = ["max", "min", "nestedProbability", "probability"];

function randomInteger(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

async function randomSleep({ min = 500, max = 5000 } = {}, logger) {
  const sleepMs = randomInteger(min, max);
  logger.info("client", `sleeping for ${sleepMs} ms`);
  await sleep(sleepMs);
}

function randomExpressionType(expressionsConfig, depth = 0) {
  expressionsConfig = expressionsConfig || {};

  const expressions = Object.keys(expressionsConfig)
    .filter(k => !ignoreProperties.find(p => p === k))
    .sort();

  if (
    expressions.length === 0 ||
    expressionsConfig.nestedProbability.length <= depth ||
    expressionsConfig.nestedProbability[depth] < Math.random()
  ) {
    return "number";
  }

  const probabilitySum = expressions.reduce(
    (a, c) => (expressionsConfig[c].probability || 0) + a,
    0
  );
  const random = randomInteger(0, probabilitySum);
  let current = 0;

  return (
    expressions.find(e => {
      current += expressionsConfig[e].probability || 0;
      return current > random;
    }) || expressions[expressions.length - 1]
  );
}

function isExpressionUnary(expressionType) {
  return unaryExpressions.find(t => t === expressionType);
}

function randomExpression(expressionsConfig, depth = 0, current) {
  const expressionType = randomExpressionType(expressionsConfig, depth);

  if (expressionType === "number") {
    return {
      type: expressionType,
      value: randomInteger(current.min, current.max)
    };
  }

  if (isExpressionUnary(expressionType)) {
    return {
      type: expressionType,
      value: randomExpression(
        expressionsConfig,
        depth + 1,
        expressionsConfig[expressionType]
      )
    };
  }

  return {
    type: expressionType,
    left: randomExpression(
      expressionsConfig,
      depth + 1,
      expressionsConfig[expressionType]
    ),
    right: randomExpression(
      expressionsConfig,
      depth + 1,
      expressionsConfig[expressionType]
    )
  };
}

async function calculateRandomExpression(
  hostname,
  expressionsConfig,
  auth,
  logger
) {
  const expression = randomExpression(expressionsConfig, 0, expressionsConfig);
  logger.info("client", "calculating", expression);

  const headers = {};
  if (auth) {
    headers["Authentication"] = auth;
  }

  const result = await apiCall(hostname, expression, { headers });
  logger.info("client", "result", result);
}

async function run(config, logger) {
  try {
    const auth = (config && config.auth) || "";
    logger.info("client", "starting");

    while (true) {
      await randomSleep(config && config.mainLoopSleep, logger);

      await calculateRandomExpression(
        (config && config.calculatorHostname) || "unknown",
        config && config.expressions,
        auth,
        logger
      );
    }
  } catch (ex) {
    logger.error("client", "an error occured", ex);
    process.exit(1);
  }
}

module.exports = run;
