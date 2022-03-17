module.exports = (server) => {
  const {
    controllers: {
      address: { remove },
    },
    helpers: {
      permissions: { isUser },
    },
  } = server.app;

  return {
    method: "DELETE",
    path: "/address",
    config: {
      pre: [
        {
          method: isUser,
          assign: "permission",
        },
      ],
      handler: remove,
      auth: "jwt",
    },
  };
};
