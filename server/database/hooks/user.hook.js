const { encrypt } = require("../../helpers");
const _ = require("underscore");
const { ORDER_STATUSES } = require("../../constants");
const { Sequelize } = require("sequelize");
module.exports = {
  // prioryty 1
  // beforeBulkCreate:async (instances,options)=>{

  // },
  // beforeBulkDestroy:async (options)=>{

  // },
  // beforeBulkUpdate:async (options)=>{

  // },

  // prioryty 4
  async beforeCreate(instance, options) {
    if (!instance) return;
    instance.password = await encrypt(instance.password);
  },

  /**
   *
   * @param {Array | Object} findResult
   * @param {Object} options
   * @returns
   */
  async afterFind(findResult, options) {
    if (!findResult) return;
    let trim = options?.trim ?? true;
    if (!Array.isArray(findResult)) findResult = [findResult];

    let { Op } = Sequelize;
    for (const instance of findResult) {
      let profile = await instance.getProfile();
      let security = await instance.getSecurity({
        attributes:[
          "two_factor",
          "ip_address",
          "metadata"
        ]
      });
      let total_orders = await instance?.countOrders();

      let total_completed_orders = await instance?.countOrders({
        where: { status: ORDER_STATUSES?.COMPLETED },
      });

      let total_adverts = await instance?.countAdverts();
      let total_positive_reviews = await instance?.countOrders({
        where: { status: ORDER_STATUSES?.COMPLETED, rating: { [Op.gt]: 2 } },
      });
      let total_negative_reviews = await instance?.countOrders({
        where: { status: ORDER_STATUSES?.COMPLETED, rating: { [Op.lt]: 3 } },
      });
      let address = await instance.getAddress();
      let kyc = await instance.getKyc({ duplicating: true });
      let compiled = {}
      
      try{
        compiled = {
          profile: profile?.toJSON(),
          security:security?.toJSON(),
          ...(trim
            ? _.omit(instance?.toJSON(), ["password"])
            : instance?.toJSON()),
          total_adverts,
          total_orders,
          total_completed_orders,
          total_positive_reviews,
          total_negative_reviews,
          address,
          kyc,
        };

      }catch(error){
        
      }
      instance.dataValues = {
        ...compiled,
      };
    }
  },
  // beforeDestroy:async (instance,options)=>{

  // },
  // beforeUpdate:async (instance,options)=>{

  // },
  // beforeSave:async (instance,options)=>{

  // },
  // beforeUpsert:async (values,options)=>{

  // },

  // prioryty 5
  // afterCreate:async (instance,options)=>{

  // },
  // afterDestroy:async (instance,options)=>{

  // },
  //   afterUpdate: async (instance, options) => {
  //     let profile = await instance.getProfile();

  //     if (instance)
  //       instance.dataValues = {
  //         ...profile?.dataValues,
  //         ...instance?.dataValues,
  //       };
  //   },
  // afterSave:async (instance,options)=>{

  // },
  // afterUpsert:async (created,options)=>{

  // },

  // priority 6

  // afterBulkCreate:async (instances,options)=>{

  // },
  // afterBulkDestroy:async (options)=>{

  // },
  // afterBulkUpdate:async (options)=>{

  // },
};
