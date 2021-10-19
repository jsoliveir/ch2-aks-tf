class LogLevel {
  static error = new LogLevel("error", 1);
  static warn = new LogLevel("warn", 2);
  static info = new LogLevel("info", 3);
  static debug = new LogLevel("debug", 4);

  static fromString(str) {
    const cleanedStr = (str || "").trim().toLowerCase();

    const logger = LogLevel[cleanedStr];

    if (logger instanceof LogLevel) {
      return logger;
    }

    return null;
  }

  constructor(name, level) {
    this.name = name;
    this.level = level;
  }

  toString() {
    return this.name;
  }
}

Object.freeze(LogLevel);

module.exports = LogLevel;
