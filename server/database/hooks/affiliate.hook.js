"use strict";
const { Sequelize } = require("sequelize");
module.exports = {
  // prioryty 1

  // },
  // beforeBulkDestroy:async (options)=>{

  // },
  // beforeBulkUpdate:async (options)=>{

  // },

  // prioryty 4
  // beforeCreate:async (instance,options)=>{

  // },
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
  // afterUpdate:async (instance,options)=>{

  // },
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
  async afterFind(findResult, options) {
    if (!findResult) return;
    if (!Array.isArray(findResult)) findResult = [findResult];

    let { Op } = Sequelize;

    for (const instance of findResult) {
      let user = await instance?.getUser(),
        friends_count = instance?.friends?.length;

      instance.dataValues = {
        user,
        friends_count,
        ...instance?.toJSON(),
      };
    }
  },
};
