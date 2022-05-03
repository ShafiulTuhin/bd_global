"use strict";

module.exports = (server) => {
  const Schema = require("../../../schema/auth.schema")(server);
  const { payload } = Schema?.verifyGoogleAuthenticatorSecret();

  const {
    controllers: {
      auth: { verifyGoogleAuthenticatorSecret },
    },
  } = server.app;

  return {
    method: "POST",
    path: "/auth/verify/google-authenticator-secret",
    config: {
      validate: { payload },
      handler: verifyGoogleAuthenticatorSecret,
    },
  };
};
// https://oauth2.googleapis.com/tokeninfo?id_token=XYZ123
