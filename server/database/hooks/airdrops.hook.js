


module.exports = {

    async afterFind(findResult, options) {
        if (!findResult) return;
        if (!Array.isArray(findResult)) findResult = [findResult];
        
        for (const instance of findResult) {
          if (instance instanceof this) {
            let user = await instance?.getUser();        
            // let author = await instance?.getAuther(); 
            instance.dataValues = {
              ...instance?.dataValues,
              user: user?.dataValues,
              // author: author?.dataValues,
            };
          }
        }
      },
      

    // prioryty 1
    // beforeBulkCreate:async (instances,options)=>{
        
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
}
