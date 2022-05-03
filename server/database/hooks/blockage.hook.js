const _ = require("underscore");
const {
    TRANSACTION_STATUS,
    TRANSACTION_TYPES
  } = require("../../constants");


module.exports = {
  // prioryty 1
  // beforeBulkCreate:async (instances,options)=>{

  // },
  // beforeBulkDestroy:async (options)=>{

  // },
  // beforeBulkUpdate:async (options)=>{

  // },

  // prioryty 4
  /*   async beforeCreate(instance, options) {
    if (!instance) return;
    instance.password = await encrypt(instance.password);
  }, */

//   async afterFind(findResult, options) {
//     if (!findResult) return;
//     if (!Array.isArray(findResult)) findResult = [findResult];

//     for (const instance of findResult) {
//       if (instance instanceof this) {
//         // let user = await instance.getUser();

//         let compiled = {
//           // user: user?.toJSON(),
//           ...instance?.toJSON(),
//         };
//         instance.dataValues = {
//           ...compiled,
//         };
//       }
//     }
//   },
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
    
  //   let instances = []

  //   if(Array.isArray(instance)){
  //     instances=instance
  //   }else{
  //     instances=[instance]
  //   }

  //   await Promise.all(instances.map(async (blockage)=>{
        
  //         let wallet = await blockage.getWallet()
  //         await wallet.updateBalance()
  //         console.log("wallet balance update completed for ",wallet.id)

  //   }))
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
