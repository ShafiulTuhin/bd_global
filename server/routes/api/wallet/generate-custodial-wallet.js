"use strict";

const Joi = require("joi");

module.exports = (server) => {
  const {
    controllers: {
      wallet: { generateCustodialWallets },
    },
  } = server.app;

  return {
    method: "GET",
    path: "/generate-custodial-wallet",
    handler: generateCustodialWallets,
  };
};
