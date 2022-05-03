"use strict";

module.exports = (server) => {
  const Schema = require("../../../schema/auth.schema")(server);
  const { payload } = Schema?.verifyGoogleAuthenticator();

  const {
    controllers: {
      auth: { verifyGoogleAuthenticator },
    },
  } = server.app;

  return {
    method: "POST",
    path: "/auth/verify/google-authenticator",
    config: {
      validate: { payload },
      handler: verifyGoogleAuthenticator,
    },
  };
};
// https://oauth2.googleapis.com/tokeninfo?id_token=XYZ123
