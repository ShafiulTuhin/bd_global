"use strict";

const AdvertController = (server) => {
  const { __destroy } = require("./utils")(server);
  const {
    db,
    db: { Advert, sequelize },
    boom,
    consts: { KYC_STATUSES, KYC_TYPES },
    helpers: { filters, paginator },
  } = server.app;

  return {
    /**
     * @function create - Creates a single advert
     * @param {Object} req
     * @returns
     */
    async create(req) {
      const {
        payload,
        pre: {
          permission: { user, fake },
        },
      } = req;
      try {
        let result;

        if (fake) {
          result = await Advert.FAKE();
        } else {
          // Check if user's KYC has been approved first
          let approvedKyc = await user.getKyc({
            where: {
              type: KYC_TYPES?.ID,
              status: KYC_STATUSES?.ACCEPTED,
            },
          });

          if (!approvedKyc)
            return boom.methodNotAllowed(
              `Please complete your KYC in order to proceed`
            );

          // check if advert is a buy advert
          // verify that seller has sufficient balance
          if (payload.type === "sell") {
            let [sellersWallet, ...others] = await user.getWallets({
              where: {
                currency: String(payload.crypto).toUpperCase(),
              },
            });

            // check if wallet exists
            if (!sellersWallet)
              return boom.badRequest("wallet is not available.");

            const status = await sellersWallet.hasSufficientAmount({
              amountToSend: payload.total_qty,
            });
            if (!status) {
              return boom.badRequest(
                "insufficient balance. NB Transaction Charges are included"
              );
            }
          }

          result = await user.createAdvert(payload);
        }

        return result;
      } catch (err) {
        console.error(err);
        return boom.isBoom(err) ? err : boom.boomify(err);
      }
    },

    // REMOVE ---------------------------------------
    async removeByID(req) {
      let {
        params: { id },
        payload: { force = false },
        pre: {
          permission: { user, sudo },
        },
      } = req;

      try {
        force = user?.superAdmin ? force : false;
        // find ad
        let ad = await Advert.findByPk(id);
        if (!ad) return boom.notFound(`Advert with ID ${id} not found!`);
        // Ensure that the ad has no order
        let orders = await ad?.countOrders();
        if (orders)
          return boom.methodNotAllowed(
            `Cannot complete request, because the advert with ID ${id} already has an order!`
          );
        let result = await __destroy("Advert", { id }, force);
        return { id, status: Boolean(result) };
      } catch (error) {
        console.error(error);
        return boom.boomify(error);
      }
    },

    /**
     *
     * @param {Object} req
     * @returns
     */
    async remove(req) {
      let {
        payload,
        pre: {
          permission: { user, sudo },
        },
      } = req;

      try {
        let result,
          where,
          { ids = [], id = null, force } = payload;
        force = user?.isSuperAdmin ? force : false;

        if (sudo) {
          if (!ids.length)
            return boom.methodNotAllowed(`Missing <ids::array> in payload`);

          return {
            result: await sequelize.transaction(
              async (t) =>
                await Promise.all(
                  ids.map(async (id) => ({
                    id,
                    status: Boolean(
                      await Advert.destroy({
                        where: { id },
                        transaction: t,
                        force,
                      })
                    ),
                  }))
                )
            ),
          };
        } else {
          if (!id)
            return boom.methodNotAllowed(`Missing <id::uuid> in payload`);
          where = { id, user_id: user?.id };
          result = await __destroy("Advert", where, force);
        }
        return { status: Boolean(result), result };
      } catch (error) {
        console.error(error);
        return boom.boomify(error);
      }
    },

    // FIND ------------------------------------------------
    async findByID(req) {
      try {
        const {
          params: { id },
          query,
          pre: {
            permission: { user, fake },
          },
        } = req;
        const queryFilters = await filters({
          query,
          searchFields: ["user_id"],
          extras: {
            id,
          },
        });
        const options = {
          ...queryFilters,
        };

        return fake
          ? Advert?.FAKE(0, options)
          : (await Advert.findOne(options)) ||
              boom.notFound(`Advert with ID ${id} cannot be found!`);
      } catch (err) {
        return boom.isBoom(err) ? err : boom.boomify(err);
      }
    },

    /**
     * @function find - Retrieves multiple advert records
     * @param {Object} req
     */
    async find(req, h) {
      const {
        query,
        pre: {
          permission: { user, fake, sudo },
        },
      } = req;

      try {
        const queryFilters = await filters({
          query,
          // searchFields: ["user_id"],
        });
        const options = {
          order: [
            ["createdAt", "DESC"],
            ["updatedAt", "DESC"],
          ],
          ...queryFilters,
          // logging: console.log,
        };
        const { limit, offset } = queryFilters;

        let queryset = fake
          ? await Advert.FAKE(limit, options)
          : await Advert.findAndCountAll(options);

        return paginator({
          queryset,
          limit,
          offset,
        });
      } catch (err) {
        console.error(err);
        return boom.isBoom(err) ? err : boom.internal(err.message, err);
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
          permission: { user, fake, sudo },
        },
      } = req;

      let fields = ["published"],
        result;
      try {
        // As sudo
        if (sudo) {
          let { ids = [], ...data } = payload;
          if (!ids?.length) return boom.badData(`Missing <ids::array> payload`);

          return {
            result: await sequelize.transaction(
              async (t) =>
                await Promise.all(
                  ids.map(async (id) => ({
                    id,
                    status: await Advert.update(data, {
                      where: { id },
                      fields,
                      transaction: t,
                    }).then(([count]) => Boolean(count)),
                  }))
                )
            ),
          };
        } else {
          // fields to update
          let { id, ...data } = payload;
          fields = [
            ...fields,
            "min_order_qty",
            "max_order_qty",
            "min_order_price",
            "max_order_price",
            "payment_methods",
            "payment_ttl_mins",
            "price",
            "floating_price_margin",
            "qty",
            "remarks",
            "auto_reply_message",
            "trade_conditions",
          ];

          result = await Advert.update(data, {
            where: { user_id: user?.id, id },
            fields,
          });

          return {
            status: Boolean(result),
            id,
            result,
          };
        }
      } catch (err) {
        console.error(err);
        return boom.isBoom ? err : boom.internal(err.message, err);
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
          permission: { user, sudo },
        },
      } = req;

      try {
        let where = {
          id,
          ...(!sudo && { user_id: user?.id }),
        };

        let fields = sudo
            ? ["published"]
            : [
                "published",
                "min_order_qty",
                "max_order_qty",
                "payment_methods",
                "payment_ttl_mins",
                "price",
                "floating_price_margin",
                "qty",
                "total_qty",
                "remarks",
                "auto_reply_message",
                "trade_conditions",
                "crypto",
                "fiat",
              ],
          result = await Advert.update(payload, {
            where,
            fields,
          });

        return {
          status: Boolean(result[0]),
          id,
        };
      } catch (err) {
        console.debug(err);
        return boom.isBoom ? err : boom.internal(err.message, err);
      }
    },
  };
};

module.exports = AdvertController;
