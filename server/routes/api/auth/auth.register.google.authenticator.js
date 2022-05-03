"use strict";

module.exports = (server) => {
  const Schema = require("../../../schema/auth.schema")(server);
  const { payload } = Schema?.registerGoogleAuthenticator();

  const {
    controllers: {
      auth: { registerGoogleAuthenticator },
    },
    helpers: {
      permissions: { isUser },
    },
  } = server.app;

  return {
    method: "POST",
    path: "/auth/register/google-authenticator",
    config: {
      pre: [
        [
          {
            method: isUser,
            assign: "permission",
          },
        ],
      ],
      validate: { payload },
      handler: registerGoogleAuthenticator,
      auth: "jwt",
    },
  };
};
// https://oauth2.googleapis.com/tokeninfo?id_token=XYZ123
