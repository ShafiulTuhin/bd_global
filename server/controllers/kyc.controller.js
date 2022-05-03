"use strict";
const uploadController = require("./upload.controller");
const { Op } = require("sequelize");
function KycController(server) {
  const { __update, __destroy } = require("./utils")(server);
  const {
    db: { Kyc, sequelize, User },
    boom,
    consts: { KYC_TYPES, KYC_STATUSES },
    helpers: { filters, paginator },
    io
  } = server.app;
  return {
    // CREATE ---------------------------------------------------------

    /**
     * @function create
     * @param {Object} req
     * @returns
     */
    async create(req) {
      const {
        pre: {
          permission: { user },
        },
        payload: { type, uploads },
      } = req;
      try {
        let fields = ["status", "type", "uploads"];

        if (!type || !Object.keys(KYC_TYPES)?.includes(type))
          throw boom.badRequest(
            `Missing or invalid kyc type in request. Allowed types : [${Object.keys(
              KYC_TYPES
            ).join(", ")}]`
          );

        let [instance, isCreated] = await Kyc.findOrCreate({
          defaults: {
            type,
            status: KYC_STATUSES?.PENDING,
            user_id: user?.id,
            uploads,
          },
          where: {
            user_id: user?.id,
            type,
          },
        });
        if (uploads) instance.update({ uploads });
        instance.update({ status: KYC_STATUSES?.PENDING });
        instance.update({ type });

        let adUser = await instance.getUser();
        // console.log(adUser)
        await adUser.emitKyc({ io });

        return await instance.save({ fields });
      } catch (error) {
        console.error(error);
        return boom.internal(error.message, error);
      }
    },
    // REMOVE ---------------------------------------------------------

    /**
     * @function remove - remove a single record
     * @param {Object} req
     * @returns
     */
    async remove(req) {
      const {
        payload: { ids = [], force = false },
        pre: {
          permission: { user },
        },
      } = req;

      try {
        await sequelize.transaction(
          async (t) =>
            await Promise.all(
              ids.map(async (id) => {
                let where = { id, user_id: user?.id };
                return {
                  status: Boolean(await __destroy("Order", where, force)),
                  id,
                };
              })
            )
        );
      } catch (error) {
        console.error(error);
        return boom.boomify(error);
      }
    },

    // FIND ---------------------------------------------------------

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
          permission: { user, sudo, fake },
        },
      } = req;
      try {
        const queryFilters = await filters({
          query,
          searchFields: ["user_id", "status"],
          extras: {
            id,
            ...(!sudo && { user_id: user?.id }),
          },
        });

        const options = {
          ...queryFilters,
          // include: { model: Upload, as: "upload" },
        };

        let result = fake ? await Kyc.FAKE() : await Kyc.findOne(options);
        return result
          ? result
          : boom.notFound(
              `Kyc with ID; ${id} with constraints: [${Object.entries(
                query
              ).join(",")}] not found!`
            );
      } catch (error) {
        console.error(error);
        return boom.internal(error.message, error);
      }
    },

    /**
     * @function find
     * @param {Object} req
     * @returns
     */
    async find(req) {

      // setInterval(()=>{
      //     console.log("setInterval  ")
      //     io.emit("notification::kyc", "notification::kyc find endpoint ");
      //   }, 1000);

      const {
        query,
        pre: {
          permission: { user, fake, sudo },
        },
      } = req;

      try {
        const queryFilters = await filters({
          query,
          searchFields: ["user_id", "status"],
          extras: {
            ...(!sudo
              ? { id: user?.id }
              : {
                  access_level: {
                    [Op.lt]: user?.access_level,
                  },
                }),
          },
        });

        const options = {
          order: [["createdAt", "DESC"]],
          ...queryFilters,
          // logging: console.log,
        };

        const { limit, offset } = queryFilters;

        let queryset = fake
          ? await Kyc.FAKE(limit)
          : sudo
          ? await User.findAndCountAll(options).then(
              async ({ rows, ...others }) => ({
                ...others,
                rows: await Promise.all(
                  rows.map(async (_user) => {
                    return {
                      user: _user,
                      kyc: await _user.getKyc({ hook: false }),
                    };
                  })
                ),
              })
            )
          : user.getKyc();

        /* if (sudo) {
          let { rows } = queryset;
          let aggregate = {};
          await Promise.all(
            rows.map(async (row) => {
              try {
                // Get fields from rows
                let { user, user_id, type, ...others } = fake
                  ? row
                  : row.dataValues;
                // create if not exist
                if (!aggregate[user_id]) aggregate[user_id] = { kyc: {}, user };

                aggregate[user_id]["kyc"][type?.toLowerCase()] = others;
                aggregate[user_id]["total"] = Object.keys(
                  aggregate[user_id]["kyc"]
                ).length;

                return aggregate;
              } catch (err) {
                console.log(err);
              }
            })
          );

          queryset = {
            rows: Object.entries(aggregate).map(([key, value]) => ({
              user_id: key,
              ...value,
            })),
            count: Object.keys(aggregate).length,
          };
        } */

        return sudo
          ? paginator({
              queryset,
              limit,
              offset,
            })
          : queryset;
      } catch (error) {
        console.error(error);
        return boom.isBoom(error) ? error : boom.boomify(error);
      }
    },

    // UPDATE ---------------------------------------------------------

    async updateByUserAndType(req) {
      const {
        pre: {
          permission: { user, sudo },
        },
        payload,
        params: { user_id, type },
      } = req;
      try {
        let result,
          fields = sudo ? ["status"] : ["uploads"];

        if (!sudo)
          throw boom.unauthorized(`User is not authorized to use this route`);
        const options = {
          where: {
            user_id,
            type,
          },
          fields,
        };

        result = await Kyc.update(payload, options).then(
          ([affectedRow]) => affectedRow
        );
        return { status: Boolean(result), user_id, type };
      } catch (err) {
        return boom.isBoom(err) ? err : boom.boomify(err);
      }
    },
    /**
     * @function update
     * @param {Object} req
     * @returns
     */
    async update(req) {
      const {
        payload,
        pre: {
          permission: { user, sudo },
        },
      } = req;
      try {
        let fields = sudo ? ["status"] : ["uploads"],
          result;

        if (sudo) {
          let { ids = [], ...others } = payload;
          if (!ids?.length) return boom.badData(`<ids::array> cannot be empty`);

          result = await sequelize.transaction(async (t) => {
            return await Promise.all(
              ids.map(async (id) => ({
                id,
                ...(await __update("Kyc", others, {
                  where: { id },
                  returning: true,
                  transaction: t,
                  fields,
                })),
              }))
            );
          });
        } else {
          let { id, ...others } = payload;
          if (!id) return boom.badData(`<id::uuid> cannot be empty`);
          result = {
            id,
            ...(await __update("Kyc", others, {
              returning: true,
              where: { user_id: user?.id, id },
              fields,
            })),
          };
        }
        return result;
      } catch (error) {
        console.error(error);
        return boom.boomify(error);
      }
    },

    /**
     * @function updateByID
     * @param {Object} req
     * @returns
     */
    async updateByID(req) {
      const {
        payload,
        params: { id },
        pre: {
          permission: { user, fake, sudo },
        },
      } = req;

      try {
        let where = { id, ...(!sudo && { user_id: user?.id }) },
          fields = sudo ? ["status"] : ["uploads"],
          options = { where, fields };

        let result = fake
          ? Kyc.FAKE()
          : await Kyc.update(payload, options).then(([count]) => count);

        return {
          status: Boolean(result),
          result,
        };
      } catch (error) {
        console.error(error);
        throw boom.boomify(error);
      }
    },
  };
}

module.exports = KycController;
