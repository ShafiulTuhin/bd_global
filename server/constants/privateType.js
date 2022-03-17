const JWT_SCOPES = require("./jwt_scopes");
const CLIENT_ROUTES = require("./client_routes.json");
const TABLE_NAMES = require("./tables.json");

module.exports = {
  TABLE_NAMES,
  JWT_SCOPES,
  CLIENT_ROUTES,
  SECURITY_LEVELS: {
    EMAIL: 1,
    SMS: 2,
    OTP: 3,
    ID: 4,
  },
  ACCESS_LEVELS: {
    SUPER_ADMIN: 3,
    ADMIN: 2,
    BASIC: 1,
  },
  SECURITY_TYPES: {
    EMAIL: "EMAIL",
    SMS: "SMS",
    OTP: "OTP",
  },
};
