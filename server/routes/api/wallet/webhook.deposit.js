"use strict";

module.exports = (server) => {
  
  const {
    controllers: {
      wallet: { depositWebhook },
    }
  } = server.app;

  
  return {
    method: "POST",
    path: "/kswh/{token}",
    config: {
      handler: depositWebhook
    },
  };
};
