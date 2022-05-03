module.exports = (server) => {
  const {
    controllers: {
      address: { create },
    },
    helpers: {
      permissions: { isUser },
    },
  } = server.app;

  return {
    method: "POST",
    path: "/address",
    config: {
      pre: [
        {
          method: isUser,
          assign: "permission",
        },
      ],
      handler: create,
      auth: "jwt",
    },
  };
};
