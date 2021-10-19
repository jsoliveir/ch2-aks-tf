const axios = require("axios").default;

function isNumber(value) {
  return typeof value === "number";
}

function isInteger(value) {
  return isNumber(value) && Number.isInteger(value);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function apiCall(
  host,
  payload,
  { requestId, protocol = "http", path = "", headers: otherHeaders } = {}
) {
  const headers = { ...otherHeaders };

  if (requestId) {
    headers["X-Request-ID"] = requestId;
  }

  const response = await axios.post(`${protocol}://${host}/${path}`, payload, {
    headers
  });

  return response.data;
}

module.exports = {
  isNumber,
  isInteger,
  sleep,
  apiCall
};
