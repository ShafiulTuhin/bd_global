"use strict";

const Joi = require("joi");

module.exports = (server) => {
  const {
    controllers: {
      wallet: { generateTronCustodialWallets },
    },
  } = server.app;

  return {
    method: "GET",
    path: "/generate-tron-custodial-wallet",
    handler: generateTronCustodialWallets,
  };
};
