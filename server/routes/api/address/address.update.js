
module.exports = (server) => {
  const {
    controllers: {
      address: { update },
    },
    helpers: {
      permissions: { isUser },
    },
  } = server.app;

  return {
    method: "PUT",
    path: "/address",
    config: {
      pre: [
        {
          method: isUser,
          assign: "permission",
        },
      ],
      handler: update,
      auth: "jwt",
    },
  };
};
