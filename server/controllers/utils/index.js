const model = require("../../services/model");
const { Op } = require("sequelize");
const { ORDER_STATUSES } = require("../../constants");
const tatum = require("@tatumio/tatum");
module.exports = (server) => {
  const {
    db,
    db: { Order, Blockage },
    consts: { roles: _roles },
  } = server.app;

  return {
    async __create(model, payload, options) {
      return await db[model].create(payload, options);
    },
    async __destroy(model, where, force, options = {}) {
      console.log('HERE')
      let a = await db[model].destroy({
        where,
        force,
        ...options,
        // logging: console.log,
      });
      return a
    },

    async __update(model, values, options) {
      let [affectedRowCount, affectedRow] = await db[model]?.update(values, {
        ...options,
        logging: console.log,
      });
      return {
        status: Boolean(affectedRowCount),
      };
    },

    async __upsert(model, values, options) {
      return await db[model]?.upsert(values, options);
    },
    orderScheduler: ({ order_id }) => () => {
      Order.findOne({
        where: {
          id: order_id,
          status: ORDER_STATUSES.PENDING,
          advert_user_confirm: false,
          order_user_confirm: false,
        },
      })
        .then(async (order) => {
          if (order && order.blockage_id) {
            let blockage = await Blockage.findOne({ id: order.blockage_id });
            blockage.active = false;
            await blockage.save();
            let wallet = await blockage.getWallet();
            await wallet.updateBalance();
            order.status = ORDER_STATUSES.CANCELLED;
            console.log("order has been cancel");
            await order.save();
          }
        })
        .catch(console.error);
    },
  };
};
