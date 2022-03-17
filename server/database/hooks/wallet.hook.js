"use strict";

const Tatum = require("@tatumio/tatum");
const _ = require("underscore");
const walletPlugin = require("../../wallet.plugin");
const blockchain = require("../../constants/blockchain.json");
const boom = require("@hapi/boom")


module.exports = {
  /**
   * @function  beforeValidate
   * @param {Object} instance
   * @param {Object} options
   */
  async beforeValidate(instance, options) {
    try {
      instance.currency = String(instance.currency).toUpperCase();

      // let { mnemonics, xpub, address } = await Tatum?.generateWallet(
      //   instance.currency,
      //   testnet
      // );

      // xpub = (xpub || address) ?? mnemonics;

      // let account = {
      //   currency: instance.currency,
      //   xpub,
      //   customer: {
      //     externalId: instance.user_id,
      //   },
      // };
      // create user account and wallet
      // let newAccount = await Tatum.generateAccount(account);

      /**
       * @type {import('../../wallet.plugin/plugins/BTC').CreateTatumAccountResponse}
       */
      let newAccount = await (new walletPlugin())
        .registerWallet(instance)
        .createTatumAccount();

      // You can gett account back using the following
      /*  let acct = await Tatum.getAccountById(newAccount?.account?.id);
      console.log({acct}) */

      instance["network"] =
        instance.network || blockchain[instance.currency.toUpperCase()];
      instance["tatum_account_id"] =
        instance.tatum_account_id || newAccount?.account?.id;
      
      instance["derivation_key"] =
        instance.derivation_key || newAccount?.address?.derivationKey;
      instance["memo"] = instance.memo || newAccount?.address?.memo;
      instance["destination_tag"] =
        instance.destination_tag || newAccount?.address?.destinationTag;
      instance["address"] = instance.address || newAccount?.address?.address;
      instance["frozen"] = instance.frozen || newAccount?.account?.frozen;

      

      

      if(!instance.address) throw boom.internal("error while creating "+instance.currency+" wallet")
      return instance;
    } catch (err) {
      console.debug(err);
    }
  },

  async afterFind(findResult, options) {
    if (!findResult) return;

    if (!Array.isArray(findResult)) findResult = [findResult];

    for (const instance of findResult) {
      let airdrops = await instance?.getUserAirdrop();
      // console.log(airdrops)
      let account

      let omitList = [
        "id",
        "xpub",
        "accountingCurrency",
        "customerId",
        "accountNumber",
        "accountCode",
        "active",
        "currency",
        "derivation_key",
        "signature_id",
        "mnemonic",
        "is_company_wallet"
      ]

      try {
        
        if(instance.tatum_account_id){
          account = await new walletPlugin()
            .registerWallet(instance)
            .getTatumAccountById();
          
          
        }
        

        instance.dataValues = {
          ...instance.dataValues,
          airdrops: airdrops,
          ..._.omit(account||{}, omitList),
        };
      } catch (error) {
        console.error(error);
      }
    }
  },

  // "signature_id",
  //     "tatum_account_id",
  //     "derivation_key",
  //     "user_id",
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
  afterCreate:async (instance,options)=>{
    let instances = []
    if (!Array.isArray(instance)){
      instances = [instance];
    }else{
      instances = instance
    }


    await Promise.all(instances.map(async(wallet)=>{
      if(wallet["tatum_account_id"]){
        if(!process.env.WEBHOOK_HOST){
          throw new Error("WEBHOOK_HOST must be provided on the enviroment variable")
        }
        if(!process.env.WEBHOOK_TOKEN){
          throw new Error("WEBHOOK_TOKEN must be provided on the enviroment variable")
        }
        try{
          let res = await Tatum.createNewSubscription({
              type:"ACCOUNT_INCOMING_BLOCKCHAIN_TRANSACTION",
              attr:{
                  url:`${process.env.WEBHOOK_HOST}/api/kswh/${process.env.WEBHOOK_TOKEN}`,
                  id:wallet["tatum_account_id"]
              }
          })
  
          console.log(`webhook subscription created for user ${wallet["tatum_account_id"]} webhook host ${process.env.WEBHOOK_HOST} `,res)

        }catch(e){}
        
      }
    }))


  },
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
};
