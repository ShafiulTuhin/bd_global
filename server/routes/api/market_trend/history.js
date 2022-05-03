"use strict";
const qs = require("qs");
const axios = require("axios");

module.exports = (server) => {
  const {
    helpers: { config },
    boom,
  } = server.app;
  return {
    method: "GET",
    path: "/market",
    config: {
      handler: async (req) => {
        try {
          
          const { query } = req;
          const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?${qs.stringify(
            query
          )}`;

          const coin_market_cap_api_key =
            config && config?.coin_market_cap_api_key;

          if (!coin_market_cap_api_key)
            return boom.badData(`API key not found!`);

          let option = {
            method: "GET",
            url,
            headers: {
              "X-CMC_PRO_API_KEY": coin_market_cap_api_key,
            },
          };

          return await axios(option).then(function(response) {
            return response.data;
          });
        } catch (err) {
          console.error(err)
          return boom.isBoom() ? err : boom.boomify(err);
        }
      },
    },
  };
};
