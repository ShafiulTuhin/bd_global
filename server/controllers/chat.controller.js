"use strict";

const boom = require("@hapi/boom");
const { filterFields } = require("../services/model");

const ChatHistoryController = (server) => {
  const {
    db,
    db: { ChatHistory },
    helpers: { filters, paginator },
  } = server.app;

  return {
    // CREATE ------------------------------------------------------------

    /**
     * @function create - Creates a single chat history
     * @param {Object} req
     * @returns
     */
    async create(req) {
      const { payload } = req;

      try {
        const chathistory = await ChatHistory.create(
          {
            ...payload,
            browser: req.headers["user-agent"],
            started_at: new Date(Date.now()),
            ended_at: new Date(Date.now()),
          },
          {
            fields: [
              "country",
              "visitor_email",
              "started_at",
              "ended_at",
              "browser",
            ],
          }
        );
        return filterFields({
          object: chathistory.dataValues,
          include: [
            "country",
            "visitor_email",
            "browser",
            "started_at",
            "ended_at",
            "type",
            "created_at",
            "updated_at",
          ],
        });
      } catch (error) {
        console.error(error);
        throw boom.boomify(error);
      }
    },

    //   RETRIEVE ------------------------------------------------------

    /**
     * @function retrieve - Retrieves a single chat history collection
     * @param {Object} req
     * @returns
     */
    async findByID(req) {
      const {
        params: { id },
        permission: {user, fake = false, sudo },
      } = req;

      try {
        if (fake) return await ChatHistory.FAKE();

        const chathistory = await ChatHistory.findOne({
          where: {
            id,
          },
          attributes: { exclude: ["deleted_at"] },
        });

        if (!chathistory) {
          throw boom.notFound();
        }
        return chathistory;
      } catch (error) {
        console.error(error);
        throw boom.boomify(error);
      }
    },

    /**
     * @function find - Retrieves multiple chat history collection
     * @param {Object} req
     * @returns
     */
    async find(req) {
      try {
        const {
          query,
          pre: {
            permission: {user, fake },
          },
        } = req;

        const queryFilters = await filters({
          query,
          searchFields: ["browser"],
        });

        const options = {
          ...queryFilters,
        };
        const { limit, offset } = queryFilters;
        let queryset = fake
          ? await ChatHistory.FAKE(limit)
          : await ChatHistory.findAndCountAll(options);

        return paginator({
          queryset,
          limit,
          offset,
        });
      } catch (error) {
        console.error(error);
        return boom.boomify(error);
      }
    },

    // UPDATE ----------------------------------------------------------

    // REMOVE ----------------------------------------------------------
    async removeByID(req) {
      const {
        params: { id },
      } = req;

      try {
        const result = await ChatHistory.destroy({
          where: {
            id,
          },
        });

        if (!result) throw boom.notFound();

        return null;
      } catch (error) {
        console.error(error);
        throw boom.boomify(error);
      }
    },
  };
};

module.exports = ChatHistoryController;
