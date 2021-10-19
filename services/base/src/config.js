const fs = require("fs");

async function readableToString(stream) {
  const chunks = [];

  for await (const chunk of stream) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return "";
  }

  if (typeof chunks[0] === "string") {
    return chunks.join();
  }

  return Buffer.concat(chunks).toString();
}

async function createConfigFromStream(stream) {
  const str = await readableToString(stream);
  const json = JSON.parse(str);

  return {
    ...json,
    logLevel: (json && json.logLevel) || "info",
    api: {
      hostname: (json && json.api && json.api.hostname) || "localhost",
      port: (json && json.api && json.api.port) || 3000
    }
  };
}

async function createConfigFromFile(filePath) {
  const stream = fs.createReadStream(filePath);
  return createConfigFromStream(stream);
}

module.exports = {
  createConfigFromStream,
  createConfigFromFile
};
