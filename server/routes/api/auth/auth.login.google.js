"use strict";

module.exports = (server) => {
  const Schema = require("../../../schema/auth.schema")(server);
  const { payload } = Schema?.googleOAuth();

  const {
    controllers: {
      auth: { loginWithGoogle },
    },
  } = server.app;

  return {
    method: "POST",
    path: "/auth/login/google",
    config: {
      validate: { payload },
      handler: loginWithGoogle,
    },
  };
};
// https://oauth2.googleapis.com/tokeninfo?id_token=XYZ123
