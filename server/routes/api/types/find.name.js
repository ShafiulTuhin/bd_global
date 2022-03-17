"use strict";
const publicTypes = require("../../../constants/publicTypes");

module.exports = (server) => {
  const { boom } = server.app;

  return {
    method: "GET",
    path: "/type/{name}",
    config: {
      handler: (req) => {
        let name = req.params.name;
        let list = Object.keys(publicTypes).join(", ");
        return (
          publicTypes[String(name).toUpperCase()] ||
          boom.notFound(
            `No type with name: [ ${name} ] found in list [ ${list} ]`
          )
        );
      },
    },
  };
};
