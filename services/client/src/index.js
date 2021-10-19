const { createConfigFromFile } = require("./config");
const { Logger, LogLevel } = require("./logger");
const clientRun = require("./client");

async function main() {
  const configFilePath = "./config.json";
  const config = await createConfigFromFile(configFilePath);

  const logger = new Logger(
    LogLevel.fromString(config.logLevel) || LogLevel.info
  );

  logger.info("configuration", `read configuration from "${configFilePath}"`);
  logger.info(
    "configuration",
    `log level was set to "${logger.logLevel.name}"`
  );

  return clientRun(config, logger);
}

main();
