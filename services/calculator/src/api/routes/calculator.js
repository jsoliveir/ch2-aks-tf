const express = require("express");
const asyncWrap = require("express-async-wrap");

const { apiCall } = require("../../common");

const router = express.Router();

const expressionMap = {
  addition: {
    isValid: isValidBinaryExpression,
    solve: async (expression, options) => {
      return solveBinaryExpression("addition", expression, options);
    }
  },
  division: {
    isValid: isValidBinaryExpression,
    solve: async (expression, options) => {
      return solveBinaryExpression("division", expression, options);
    }
  },
  multiplication: {
    isValid: isValidBinaryExpression,
    solve: async (expression, options) => {
      return solveBinaryExpression("multiplication", expression, options);
    }
  },
  number: {
    isValid: isValidUnaryExpression,
    solve: async (expression, options) => {
      return solveExpression(expression.value, options);
    }
  },
  remainder: {
    isValid: isValidBinaryExpression,
    solve: async (expression, options) => {
      return solveBinaryExpression("remainder", expression, options);
    }
  },
  subtraction: {
    isValid: isValidBinaryExpression,
    solve: async (expression, options) => {
      return solveBinaryExpression("subtraction", expression, options);
    }
  }
};

const expressionTypes = Object.keys(expressionMap);

function isNumber(expression) {
  return typeof expression === "number";
}

function isValidExpressionType(type) {
  return !!(typeof type === "string" && expressionTypes.find(e => e === type));
}

function isValidUnaryExpression(expression) {
  return isValidExpression(expression.value);
}

function isValidBinaryExpression(expression) {
  return (
    isValidExpression(expression.left) && isValidExpression(expression.right)
  );
}

function isValidExpression(expression) {
  if (isNumber(expression)) {
    return true;
  }

  const type = expression && expression.type;

  if (!isValidExpressionType(type)) {
    return false;
  }

  return expressionMap[type].isValid(expression);
}

async function solveUnaryExpression(serviceName, expression, options) {
  const value = await solveExpression(expression.value, options);

  const response = await apiCall(
    serviceName,
    { type: serviceName, value },
    options
  );

  return response.value;
}

async function solveBinaryExpression(serviceName, expression, options) {
  const left = await solveExpression(expression.left, options);
  const right = await solveExpression(expression.right, options);

  const response = await apiCall(
    serviceName,
    {
      type: serviceName,
      left,
      right
    },
    options
  );

  return response.value;
}

async function solveExpression(expression, options) {
  if (isNumber(expression)) {
    return expression;
  }

  return expressionMap[expression.type].solve(expression, options);
}

router.post(
  "/",
  asyncWrap(async (request, response) => {
    const auth = request.header("Authentication");
    if (!auth || !auth.startsWith("Bearer ")) {
      return response
        .status(401)
        .send({ error: 'invalid "Authentication" header' });
    }
    request.context.logger.info("calculator", "client is authenticated", {
      requestId: request.context.requestId,
      client: auth
    });

    const expression = request.body;

    if (!isValidExpression(expression)) {
      return response.status(400).send({ error: "invalid expression" });
    }

    const result = await solveExpression(expression, {
      requestId: request.context.requestId
    });

    return response.status(200).send({ type: "number", value: result });
  })
);

module.exports = router;
