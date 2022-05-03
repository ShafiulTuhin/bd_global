"use strict";
const publicTypes = require("../../../constants/publicTypes")
module.exports = (server) => {
  const { boom } = server.app;

  return {
    method: "GET",
    path: "/type",
    config: {   
      handler: (req) => {
        const { query } = req;
        let list = Object.keys(publicTypes).join(", ");
        let names = query?.name || query?.names || "";

        if (names && names?.length) {
          let obj = {};
          if (!Array.isArray(names)) names = names.split(",");
          names.forEach((name) => {
            name = String(name)
              ?.toUpperCase()
              ?.trim();
            obj[name] =
              publicTypes[name] ||
              boom.notFound(
                `No type with name: [ ${name} ] found in list [ ${list} ]`
              )?.output?.payload;
          });

          return obj;
        }

        return (
          publicTypes || boom.notFound(`No util found in list [ ${list} ]`)
        );
      },
    },
  };
};
