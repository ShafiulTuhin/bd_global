"use strict";
const {Op} = require("sequelize")

function AffiliateController(server) {
  const {
    db,
    db: {
      Affiliate,
      Profile,
      User,
      sequelize,
      // Sequelize: { Op },
    },
    boom,
    helpers: { filters, paginator, validateAndFilterAssociation },
  } = server.app;

  return {
    /**
     * @function create
     * @param {Object} req
     * @param {Object} h
     * @returns
     */
    async create(req, h) {
      const {
        pre: {
          permission: {user, sudo },
        },
        payload: { invite_code },
      } = req;

      try {
        // if (!sudo) throw boom.forbidden();

        const userProfile = await Profile.findOne({
          where: {
            invite_code,
          },
        });

        if (!userProfile)
          throw boom.notFound(
            `User with invite code ${invite_code} does not exist`
          );

        let referrer = await User.findOne({
          where: { id: userProfile?.user_id },
          attributes: ["id", "email"],
        });
        referrer.addReferrer(user);
        return h.response({ status: true }).code(200);
      } catch (error) {
        console.error(error);
        throw boom.boomify(error);
      }
    },
    /**
     * @function generateLink
     * @param {Object} req
     * @param {Object} h
     * @returns
     */
    async generateLink(req, h) {
      let result = "";
      return h.response({ result }).code(200);
    },

    /**
     * @function remove
     * @param {Object} req
     * @returns
     */
    async remove(req) {
      const {
        pre: {
          permission: {user, sudo },
        },
      } = req;

      // only allow action if it admin
      if (!sudo) throw boom.forbidden();

      try {
        const { data } = req.payload;

        return await Affiliate.destroy({
          where: {
            [Op.or]: data,
          },
          force: true,
        });
      } catch (error) {
        console.error(error);
        throw boom.boomify(error);
      }
    },

    /**
     * @function find
     * @param {Object} req
     * @returns
     */
    async find(req) {
      const {
        query,
        pre: {
          permission: {user, sudo, fake },
        },
      } = req;

      try {
        const queryFilters = await filters({
            query,
            searchFields: ["email"],
            ...(!sudo && {
              extras: {
                user_id: user?.id,
              },
            }),
          }),
          options = {
            ...queryFilters,
            distinct: true,
          };

        if (query?.sudo && !sudo)
          throw boom.unauthorized(
            `You are not an administrator. Remove the sudo filter to access route as a regular user`
          );

        const { limit, offset } = queryFilters;
        let total_friends_count = 0;

        let queryset = fake
          ? await Affiliate.FAKE(limit)
          : await Affiliate.findAndCountAll(options);

        await Affiliate.findAll({ attributes: ["friends"] }).then((list) => {
          list.forEach((item) => {
            total_friends_count += item.friends?.length;
          });
        });

        return paginator({
          queryset: {
            ...queryset,
            total_affiliate_friends: total_friends_count,
          },
          limit,
          offset,
        });
      } catch (error) {
        // console.error(error);
        throw boom.boomify(error);
      }
    },

    /**
     * @function findByUserID
     * @param {Object} req
     * @returns
     */
    async findByUserID(req) {
      const {
        query,
        params: { user_id },
        pre: {
          permission: {user, fake, sudo },
        },
      } = req;

      try {
        let queryFilters = await filters({
            query,
            searchFields: ["user_id"],
            extras: {
              ...(sudo ? { user_id } : { user_id: user?.id }),
            },
          }),
          options = {
            ...queryFilters,
          };
        const { limit, offset } = queryFilters;

        let queryset = fake
          ? await Affiliate.FAKE(limit)
          : await Affiliate.findOne(options);

        let { rows } = queryset;
        let aggregate = {};
          
        await Promise.all(
          rows.map(async (row) => {
            try {
              let { user_id, friend_id, id } = fake ? row : row.toJSON();

              if (!aggregate[user_id]) {
                aggregate[user_id] = {
                  friends: [],
                  affiliates: [],
                };
              }
              aggregate[user_id]["affiliates"].push(id);
              await User.findByPk(user_id).then(async (data) => {
                aggregate[user_id]["user"] = fake ? User.FAKE() : data.toJSON();
              });

              await User.findByPk(friend_id).then((data) => {
                aggregate[user_id]["friends"].push(
                  fake ? User.FAKE() : data.toJSON()
                );
                aggregate[user_id]["total"] =
                  aggregate[user_id]["friends"].length;
              });

              return aggregate;
            } catch (err) {
              console.log(err);
            }
          })
        );

        queryset = {
          rows: Object.entries(aggregate).map(([key, value]) => ({
            id: key,
            ...value,
          })),
          count: Object.keys(aggregate).length,
        };

        return paginator({
          queryset,
          limit,
          offset,
        });
      } catch (error) {
        console.error(error);
        throw boom.boomify(error);
      }
    },

    /**
     * @function findByID
     * @param {Object} req
     * @returns
     */
    async findByID(req) {
      const {
        query,
        params: { id },
        pre: {
          permission: {user, fake, sudo },
        },
      } = req;

      try {
        let queryFilters = await filters({
            query,
            searchFields: ["email"],
            extras: {
              id,
              ...(!sudo && { user_id: user?.id }),
            },
          }),
          options = {
            ...queryFilters,
          },
          result = fake
            ? await Affiliate.FAKE()
            : await Affiliate.findOne(options);

        return result
          ? result
          : boom.notFound(`Affiliate with ID: ${id} not found!`);
      } catch (error) {
        console.error(error);
        throw boom.boomify(error);
      }
    },
  };
}

module.exports = AffiliateController;
