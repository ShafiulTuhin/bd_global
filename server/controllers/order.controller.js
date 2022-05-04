"use strict";
const boom = require("@hapi/boom");
const { Op } = require("sequelize");
const {
  TRADE_TYPES,
  KYC_TYPES,
  ERROR_CODES,
  TRANSACTION_STATUS,
  TRANSACTION_TYPES,
  ORDER_STATUSES,
  TICKET_STATUSES,
} = require("../constants");
const tatum = require("@tatumio/tatum");

function OrderController(server) {
  const { __destroy, orderScheduler } = require("./utils")(server);
  const {
    db: {
      Order,
      Advert,
      User,
      Wallet,
      Kyc,
      Blockage,
      sequelize,
      SupportTicket,
      Fee
    },
    helpers: { filters, paginator },
    consts: { KYC_STATUSES },
    io,
  } = server.app;

  return {
    // CREATE ---------------------------------------------------------

    /**
     * @function create - create single order record
     * @param {Object} req
     * @returns
     */
    async create(req) {
      const {
        pre: {
          permission: { user, fake },
        },
        payload,
      } = req;

      const { advert_id, total_quantity, total_amount } = payload;

      // Check if user's KYC has been approved first
      let approvedKyc = await user.getKyc({
        where: {
          type: KYC_TYPES?.ID,
          status: KYC_STATUSES?.ACCEPTED,
        },
      });

      if (!approvedKyc) {
        return {
          status: false,
          message: `Please complete ID verification KYC in order to proceed`,
          code: ERROR_CODES["ERKYC01"],
        };
      }

      if (!advert_id) {
        throw boom.badRequest("Missing advert_id in request");
      }

      try {
        // find advert
        let ad = await Advert.findByPk(advert_id);

        let sellersWallet;

        if (ad) {
          // create order using the user info
          let result;

          if (fake) {
            result = await Order.FAKE();
          } else if (ad.published) {
            if (total_quantity > ad?.available_qty)
              return boom.notAcceptable(
                `The total amount value: ${total_amount} is greater that the total available asset`
              );
            let seller_id =
              String(ad.type)?.toLowerCase() ===
                String(TRADE_TYPES?.SELL)?.toLowerCase()
                ? ad.user_id
                : user.id;

            sellersWallet = await Wallet.findOne({
              where: {
                user_id: seller_id,
                currency: ad.crypto,
              },
            });

            if (!sellersWallet)
              return boom.notFound("seller do not have a wallet");

            // check if order is a sell order i.e advert is a buy advert
            // verify that seller has sufficient balance
            // if (
            //   String(ad.type)?.toLowerCase() ===
            //   String(TRADE_TYPES?.BUY)?.toLowerCase()
            // ) {

            //   /*  TODO: ERROR: TypeError: Cannot destructure property 'Fee' of 'sequelize.models' as it is undefined.\n    at WalletPlugin.getTotalCharges (/home/lil-armstrong/Desktop/project/Gines Global/code/server/wallet.plugin/index.js:43:13)\n    at WalletPlugin.hasSufficientAmount (/home/lil-armstrong/Desktop/project/Gines Global/code/server/wallet.plugin/index.js:189:32)\n    at processTicksAndRejections (internal/process/task_queues.js:95:5)\n    at async Wallet.hasSufficientAmount (/home/lil-armstrong/Desktop/project/Gines Global/code/server/database/models/wallet.model.js:149:14)\n    at async create (/home/lil-armstrong/Desktop/project/Gines Global/code/server/controllers/order.controller.js:84:30)\n    at async exports.Manager.execute (/home/lil-armstrong/Desktop/project/Gines Global/code/server/node_modules/@hapi/hapi/lib/toolkit.js:60:28)\n    at async Object.internals.handler (/home/lil-armstrong/Desktop/project/Gines Global/code/server/node_modules/@hapi/hapi/lib/handler.js:46:20)\n    at async exports.execute (/home/lil-armstrong/Desktop/p… … */
            //   }

            const status = await sellersWallet.hasSufficientAmount({
              amountToSend: total_quantity,
            });
            if (!status) {
              return boom.badRequest("seller does not have sufficient balance");
            }
            // get total charges
            let amountAndCharges = await sellersWallet.getTotalCharges({
              amount: total_quantity,
            });

            // console.log("amountAndCharges : ", amountAndCharges);

            // let cryptofee = await Fee.findOne({
            //   where: {
            //     crypto: wallet?.dataValues?.currency,
            //     type: 'TRANSFER',
            //   }
            // });

            // console.log("cryptofee : ",cryptofee);
            // console.log("cryptofee : ",amount);
            // return cryptofee

            // let totalQnt;
            // if (cryptofee?.dataValues?.amount_in_percent) {
            //   totalQnt = parseFloat(parseFloat(amount) + parseFloat(cryptofee?.dataValues?.amount_in_percent))
            // } else {
            //   totalQnt = parseFloat(amount);
            // }

            let {
              dataValues: { id },
            } = await sellersWallet.freezeWallet({
              quantity: parseFloat(parseFloat(total_quantity) + parseFloat(amountAndCharges)),
            });

            let date = new Date();

            // amount blockage expires after 30 minutes
            date.setMinutes(date.getMinutes() + 90);

            result = await user.createOrder({
              ...payload,
              blockage_id: id,
              blockage_expiring_date: date,
              // user_id:user.id,
            });

            // schedule order
            setTimeout(orderScheduler({ order_id: result.id }), 90 * 60 * 1000);

            let adUser = await ad.getUser();
            await adUser.emitNewOrder({ io, order: result });
          } else {
            throw boom.methodNotAllowed("Operation not permitted");
          }
          return result ? { status: true, id: result?.id } : boom.internal();
        } else {
          throw boom.notFound("Order not created. Advert not found!");
        }
      } catch (error) {
        console.debug(error);
        return boom.isBoom(error) ? error : boom.boomify(error.message, error);
      }
    },
    // REMOVE ---------------------------------------------------------

    /**
     * @function removeByID - remove a single record
     * @param {Object} req
     * @returns
     */
    async removeByID(req) {
      const {
        params: { id },
        payload,
        pre: {
          permission: { user, sudo },
        },
      } = req;
      const { force = false } = payload;
      try {
        let where = {
          id,
          // status: {
          //   [Op.in]: [ORDER_STATUSES.CANCELLED, ORDER_STATUSES.COMPLETED],
          // },
        };
        let destroy = await Order.destroy({
          where,
          ...(sudo ? force : false),
          logging: console.log,
        });
        return {
          deleted: Boolean(destroy),
        };
      } catch (error) {
        console.error(error);
        return boom.isBoom(error) ? error : boom.boomify(error);
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
          permission: { user, fake, sudo },
        },
      } = req;
      try {
        let userInclude = {
          model: User,
          as: "user",
          attributes: [
            "id",
            "email",
            "active",
            "verified",
            "permission",
            "archived_at",
            "last_seen",
            "login_at",
            "access_level",
            "online",
            "isBasic",
            "isAdmin",
            "isSuperAdmin",
            "createdAt",
            "updatedAt",
          ],
        };

        const options = {
          where: {
            id,
            ...(!sudo & { user_id: user?.id }),
          },
          include: [userInclude],
          // logging: true,
          attributes: [
            "id",
            "total_amount",
            "total_quantity",
            "advert_user_confirm",
            "order_user_confirm",
            "appeal",
            "remark",
            "status",
            "rating",
            "archived_at",
            "trx_id",
            "created_at",
            "updated_at",
            "media",
            "advert_id",
            "user_id",
            "blockage_expiring_date",
            // "advert.payment_methods",
            // "advert.remarks",
            // "advert.type"
          ],
        };

        let result;

        if (fake) {
          result = await Order.FAKE();
        } else {
          let order = await Order.findOne(options);
          if (order) {
            let options = {};
            let advert = await order.getAdvert(options);

            order.dataValues.advert = advert;
          }

          result = order;
        }
        return result
          ? result
          : boom.notFound(`Order with ID: ${id} does not exist!`);
      } catch (error) {
        console.error(error);
        return boom.isBoom(error) ? error : boom.boomify(error.message, error);
      }
    },

    /**
     * @function find
     * @param {Object} req
     * @returns
     */
    async find(req) {
      console.log("controller find")
      const {
        query,
        pre: {
          permission: { user, fake, sudo },
        },
      } = req;

      try {
        let userInclude = {
          association: "user",
          attributes: [
            "id",
            "email",
            "active",
            "verified",
            "permission",
            "archived_at",
            "last_seen",
            "login_at",
            "access_level",
            "online",
            "isBasic",
            "isAdmin",
            "isSuperAdmin",
            "createdAt",
            "updatedAt",
          ],
          include: [
            {
              association: "profile",
              attributes: { exclude: ["email"] },
            },
          ],
        };

        const queryFilters = await filters({
          query,
          searchFields: ["user_id"],
          /*  extras: {
            ...(!sudo && {
              [Op.or]: [
                { user_id: user?.id },
                { "$advert.user_id$": user?.id },
              ],
            }),
          }, */
        });
        const options = {
          ...queryFilters,
          include: [
            { association: "user" },
            {
              model: Advert,
              as: "advert",
              attributes: [
                "id",
                "user_id",
                "min_order_qty",
                "max_order_qty",
                "price",
                "available_qty",
                "total_qty",
                "fiat",
                "crypto",
                "payment_methods",
                "type",
                "payment_ttl_mins",
                "floating_price_margin",
                "remarks",
                "auto_reply_message",
                "published",
                "archived_at",
                "createdAt",
                "updatedAt",
                "currency_pair",
              ],
              include: userInclude,
            },
          ],
          // logging: console.log,
          attributes: [
            "id",
            "total_amount",
            "total_quantity",
            "advert_user_confirm",
            "order_user_confirm",
            "appeal",
            "remark",
            "status",
            "rating",
            "archived_at",
            "trx_id",
            "created_at",
            "updated_at",
            "media",
            "user_id",
            // "advert.payment_methods",
            // "advert.remarks",
            // "advert.type"
          ],
          order: [
            ["createdAt", "DESC"],
          ]
        };
        const { limit, offset } = queryFilters;

        const queryset = fake
          ? await Order.FAKE(limit, options)
          : await Order.findAndCountAll(options);

        return await paginator({
          queryset,
          limit,
          offset,
        });
      } catch (error) {
        console.debug({ error });
        return boom.isBoom(error) ? error : boom.boomify(error);
      }
    },

    // UPDATE -------------------------------------------------------------------------------------------
    /**
     * @function updateByID
     * @param {Object} req
     * @returns
     */
    async disputeOrderByID(req) {
      const {
        params: { id },
        pre: {
          permission: { user },
        },
        payload: { description, images, reason },
      } = req;

      let where = {
        id,
        [Op.or]: [{ "$advert.user_id$": user?.id }, { user_id: user?.id }],
      };

      try {
        let order = await Order.findOne({
          where,
          include: {
            model: Advert,
            as: "advert",
          },
        });

        if (!order) return boom.notFound(`order with ${id} does not exist`);

        let opp_user_id =
          user.id === order.user_id ? order?.advert?.user_id : order?.user_id;

        let room = user.generateRoom([order.id, opp_user_id]);

        let [supportTicket, ...rest] = await order.getSupportTickets({
          where: {
            status: TICKET_STATUSES.OPEN,
          },
        });

        if (supportTicket) {
          return boom.forbidden(
            `ticket already open for order with ID:${order.id}`
          );
        }

        // if user create a dispute
        let support_ticket = await SupportTicket.create({
          user_id: user.id,
          order_id: order.id,
          room,
          subject: `dispute on order`,
          description,
          images,
          reason,
        });

        await User.emitAdminBulkNewDispute({
          io,
          support_ticket,

        })

        order.status = ORDER_STATUSES.DISPUTED
        await order.save()


        return support_ticket
      } catch (error) {
        console.error(error);
        return boom.isBoom(error) ? error : boom.boomify(error.message, error);
      }
    },
    /**
     * @function updateByID
     * @param {Object} req
     * @returns
     */
    async updateByID(req) {
      const {
        params: { id },
        payload,
        pre: {
          permission: { user, sudo },
        },
      } = req;

      try {
        let fields = sudo
          ? ["status"]
          : ["status", "rating", "trx_id", "appeal", "remark", "media"],
          result,
          where = {
            id,
            ...(!sudo && { user_id: user?.id }),
          };
        let order = await Order.findOne({
          where,
          include: {
            model: Advert,
            as: "advert",
          },
        });
        if (!order) return boom.notFound(`Order with ${id} does not exist`);

        if (
          payload.status === ORDER_STATUSES.CANCELLED &&
          (order.order_user_confirm || order.advert_user_confirm)
        )
          return boom.forbidden(
            "order cannot be cancelled in the confirmation stage"
          );

        // make sure order status is not activated after been cancelled
        if (order.status === ORDER_STATUSES.CANCELLED) {
          payload.status = ORDER_STATUSES.CANCELLED;
        }

        result = await sequelize.transaction(async (t) => {
          let result_;
          result_ = await Order.update(payload, {
            where,
            fields,
            returning: true,
            transaction: t,
          }).then(([count]) => count);

          if (payload.status === ORDER_STATUSES.CANCELLED && Boolean(result_)) {
            let blockage = await Blockage.findByPk(order.blockage_id);
            if (blockage) {
              blockage.active = false;
              await blockage.save({ transaction: t });
              let wallet = await blockage.getWallet();
              await wallet.updateBalance({ transaction: t });
            }
          }

          return result_;
        });

        return {
          id,
          status: Boolean(result),
        };
      } catch (error) {
        console.error(error);
        return boom.isBoom(error) ? error : boom.boomify(error.message, error);
      }
    },

    // CONFIRM ---------------------------------------------------------
    /**
     * @function confirmByID
     * @description Confirms an order by ID
     * @param {Object} req
     * @returns
     */
    async confirmByID(req) {
      const {
        params: { id },
        pre: {
          permission: { user, fake, sudo },
        },
      } = req;
      try {
        let result;
        if (fake) {
          result = await Order.FAKE();
        } else {
          let buyersId, sellersId;

          // get order by id
          const order = await Order.findOne({
            where: {
              id,
            },
          });

          if (!order) {
            return boom.notFound("order was not found");
          }

          if (order.status === ORDER_STATUSES.CANCELLED) {
            return boom.badRequest("order was cancelled");
          }

          // get advert from order
          const advert = await order.getAdvert();

          // check if user is permitted to confirm order
          let permitted =
            order.user_id === user.id || advert.user_id == user.id || sudo;

          // throw error if user is not permitted
          if (!permitted) {
            return boom.badRequest(
              "You do not have permission to confirm this order"
            );
          }

          if (order.order_user_confirm && order.advert_user_confirm) {
            return boom.badRequest("Order has already been confirmed");
          }

          result = await sequelize.transaction(async (t) => {
            // set order confirm
            if (order.user_id === user.id) {
              order.order_user_confirm = true;
              let advertUser = await advert.getUser();
              await advertUser.emitOrderConfirm({ io, order, transaction: t });
            } else if (advert.user_id == user.id) {
              order.advert_user_confirm = true;
              let orderUser = await order.getUser();
              await orderUser.emitOrderConfirm({ io, order, transaction: t });
            } else if (sudo) {
              order.advert_user_confirm = true;
              order.order_user_confirm = true;

              let advertUser = await advert.getUser();
              await advertUser.emitOrderConfirm({ io, order, transaction: t });

              let orderUser = await order.getUser();
              await orderUser.emitOrderConfirm({ io, order, transaction: t });
            } else {
              throw boom.forbidden("Unauthorized user");
            }

            // save order after confirm
            await order.save({ transaction: t });

            // set buyers and sellers id
            if (
              String(advert.type)?.toLowerCase() ===
              String(TRADE_TYPES?.BUY)?.toLowerCase()
            ) {
              buyersId = advert.user_id;
              sellersId = order.user_id;
            } else {
              buyersId = order.user_id;
              sellersId = advert.user_id;
            }

            // unfreeze sellers Wallet if both buyer and seller confirms order
            if (order.order_user_confirm && order.advert_user_confirm) {
              const sellerWallet = await Wallet.findOne({
                where: {
                  user_id: sellersId,
                  currency: advert.crypto,
                },
              });

              const buyersWallet = await Wallet.findOne({
                where: {
                  user_id: buyersId,
                  currency: advert.crypto,
                },
              });

              // unfreeze sellers wallet
              if (order.blockage_id) {
                await sellerWallet.unfreezeWallet({
                  blockageId: order.blockage_id,
                });
              }

              // let fee = await sellerWallet.getTotalCharges({
              //   amount: order.total_quantity,
              // });

              // // create transactions
              // let sellerTrxn = await sellerWallet.createTransaction(
              //   {
              //     fee,
              //     status: TRANSACTION_STATUS.PENDING,
              //     type: TRANSACTION_TYPES.TRANSFER,
              //     quantity: order.total_quantity,
              //     address: buyersWallet.address,
              //   },
              //   {
              //     transaction: t,
              //   }
              // );

              // let buyerTrxn = await buyersWallet.createTransaction(
              //   {
              //     fee: 0,
              //     status: TRANSACTION_STATUS.PENDING,
              //     type: TRANSACTION_TYPES.DEPOSIT,
              //     quantity: order.total_quantity,
              //     address: sellerWallet.address,
              //   },
              //   {
              //     transaction: t,
              //   }
              // );

              // send fund to buyer
              let trnx = await sellerWallet.transferToWallet({
                wallet: buyersWallet,
                quantity: order.total_quantity,
              });

              // activate transactions
              // sellerTrxn.status = TRANSACTION_STATUS.ACTIVE;
              // buyerTrxn.status = TRANSACTION_STATUS.ACTIVE;

              order.status = ORDER_STATUSES.COMPLETED;

              await order.save({ transaction: t });
              await sellerWallet.updateBalance();
              await buyersWallet.updateBalance();
            }

            return order;
          });
        }

        return result;
      } catch (error) {
        console.error(error);
        return boom.isBoom(error) ? error : boom.boomify(error.message, error);
      }
    },
  };
}

module.exports = OrderController;
