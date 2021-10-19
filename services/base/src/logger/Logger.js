const LogLevel = require("./LogLevel");

function formatError(error) {
  const json = {
    name: error.name
  };

  Object.getOwnPropertyNames(error).forEach(n => {
    json[n] = error[n];
  });

  return json;
}

function stringifyReplacer(key, value) {
  if (value instanceof Error) {
    return formatError(value);
  }

  return value;
}

function buildJsonString(level, messages) {
  const json = {
    timestamp: new Date(),
    level: level.name,
    messages
  };

  return JSON.stringify(json, stringifyReplacer);
}

function log(logger, logLevel, ...messages) {
  if (logger.logLevel.level < logLevel.level) {
    return this;
  }

  const str = buildJsonString(logLevel, messages);

  console.log(str);

  return this;
}

class Logger {
  constructor(level) {
    this.logLevel = level;
  }

  error(message, ...otherMessages) {
    return log(this, LogLevel.error, message, ...otherMessages);
  }

  warn(message, ...otherMessages) {
    return log(this, LogLevel.warn, message, ...otherMessages);
  }

  info(message, ...otherMessages) {
    return log(this, LogLevel.info, message, ...otherMessages);
  }

  debug(message, ...otherMessages) {
    return log(this, LogLevel.debug, message, ...otherMessages);
  }
}

module.exports = Logger;
