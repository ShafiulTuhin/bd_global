"use strict";

const Joi = require("joi");

module.exports = (server) => {
  const {
    controllers: {
      wallet: { getCustodialWalletAddress },
    },
  } = server.app;

  return {
    method: "GET",
    path: "/generate-custodial-wallet-addresses",
    handler: getCustodialWalletAddress,
  };
};
