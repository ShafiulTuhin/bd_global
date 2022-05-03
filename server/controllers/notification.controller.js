"use strict";
const Tatum = require("@tatumio/tatum")
const boom = require("@hapi/boom");
const { Op } = require("sequelize");


module.exports = function NotificationController(server) {
  const {
    db: {
      User,
      Profile,
      Kyc,
      Wallet,
      sequelize,
      Notification
    },
    boom,
    config: { base_url },
    consts: { KYC_STATUSES, KYC_TYPES },
    helpers: { filters, paginator },
    io
  } = server.app;

  return {
    async find(req) {
      const {
        query,
        pre: {
          permission: { user, fake, sudo },
        },
      } = req;
      try {

        let pending = query.pending
        delete query.pending
        
        
        const queryFilters = await filters({
          query,
          searchFields: ["user_id"],
          extras:{
            room: {
              [Op.substring]: user.id,
            },
            ...(pending?{
              read: [],
            }:{})
          }
        });

        const options = {
          ...queryFilters
        };

        const { limit, offset } = queryFilters;

        let queryset = fake
          ? await Notification.FAKE(limit)
          : await Notification.findAndCountAll(options);

        return paginator({
          queryset,
          limit,
          offset,
        });
      } catch (error) {
        console.error(error);
        return boom.internal(error.message, error);
      }
    },
    async clearAll(req) {
      const {
        pre: {
          permission: { user, sudo },
        },
      } = req;
      
      try {
        return await Notification.update(
          {
            read:[user.id]
          },
          {
            where:{
              room: {
                [Op.substring]: user.id,
              },
              read: {
                [Op.not]: {
                  [Op.contains]: user.id,
                },
              },
            }
          }
        )

        
      } catch (error) {
        console.error(error);
        return boom.boomify(error);
      }
    },
  };
};
