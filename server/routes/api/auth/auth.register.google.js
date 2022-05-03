"use strict";

module.exports = (server) => {
  const Schema = require("../../../schema/auth.schema")(server);
  const { payload } = Schema?.googleOAuth();

  const {
    controllers: {
      auth: { registerWithGoogle },
    },
  } = server.app;

  return {
    method: "POST",
    path: "/auth/register/google",
    config: {
      validate: { payload },
      handler: registerWithGoogle,
    },
  };
};
// https://oauth2.googleapis.com/tokeninfo?id_token=XYZ123
