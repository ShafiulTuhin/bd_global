const config = require("dotenv").config({
    path: "../../.env",
  });
  if (config.error) {
    throw config.error;
  }
const axios = require("axios").default
const tatum = require("@tatumio/tatum")
const walletPlugin = require("../wallet.plugin")
const db = require("../database/models")
const sequelize = db.sequelize
console.log("begining")

let headers = {
    'x-api-key':process.env.TATUM_API_KEY,
    'Content-Type':'application/json'
}




let walletMetadata1 = {
    id: "a45a7b67-0a35-47e3-ad70-7878f709c63e",
    user_id:"61d1e645cfc3b919ad69cd4f",
    signature_id: null,
    tatum_account_id: "61d7538126afc2603772eaa4",
    destination_tag: 347,
    derivation_key: 347,
    address: "rGxg7QvHXe7aUYSXrZq9B4qTTa8ZEGcEDm",
    network: "Ripple",
    frozen: false,
    currency: 'XRP',
    is_company_wallet: false,
  }

let walletMetadata2 = {
    id: "e270c5cf-928c-4e02-a648-196d18702689",
    user_id:"61d1e645dd6c0324abf6682e",
    signature_id: null,
    tatum_account_id: "61d753817efb4d3e3680307f",
    destination_tag: 348,
    derivation_key: 348,
    address: "rGxg7QvHXe7aUYSXrZq9B4qTTa8ZEGcEDm",
    network: "Ripple",
    frozen: false,
    currency: 'XRP',
    is_company_wallet: false,
  }

class Wallet{
    constructor(metadata){
        Object.entries(metadata).forEach(([key,value])=>{
            this[key] = value
        })
    }

    /**
     *
     * @param {Number|String} amount
     * @param {Boolean} [withAffiliate=true]
     * @returns {Promise<Number>}
     */
     getTotalCharges = async ({amount, withAffiliate = true}) => {
      
        return await (new walletPlugin())
        .registerWallet(this)
        .registerSequelize(sequelize)
        .getTotalCharges({
          amount,
          withAffiliate
        });
      };
  
      /**
       * @typedef GetChargesWallet
       * @property {Number|String} amount
       * @property {Model} wallet
       *
       */
  
      /**
       * this function return a list of object containing amount and wallet
       * [{amount:0.03,wallet:Wallet},...]
       * @param {Number|String} amount
       * @param {Boolean} [withAffiliate=true]
       * @returns {Promise<GetChargesWallet[]>}
       */
      getWalletsForTransactionFee = async ({amount, withAffiliate = true}) => {
        return await (new walletPlugin())
        .registerWallet(this)
        .registerSequelize(sequelize)
        .getWalletsForTransactionFee({
          amount,
          withAffiliate
        });
      };
  
      /**
       *
       * @param {Number|String} amountToSend
       * @param {Boolean} [withAffiliate=true]
       * @returns {Promise<Boolean>}
       */
      hasSufficientAmount = async ({amountToSend, withAffiliate = true}) => {
        return await (new walletPlugin())
        .registerWallet(this)
        .registerSequelize(sequelize)
        .hasSufficientAmount({
          amountToSend,
          withAffiliate
        });
      };
  
      /**
       *
       * @param {Number} quantity
       * @param {String} address
       * @returns {Promise<void>}
       */
      transferToAddress = async ({quantity, address}) => {
        // return walletServices.transferToAddress(this, address, quantity);
        return await (new walletPlugin())
        .registerWallet(this)
        .registerSequelize(sequelize)
        .transferToAddress({
          quantity,
          address,
        });
      };
  
      /**
       *
       * @param {Object} params
       * @param {Wallet} params.wallet
       * @param {Number} params.quantity
       * @returns {Promise}
       */
      transferToWallet = async ({ wallet, quantity,noFee=true,testMode=false }) => {
        return await (new walletPlugin())
        .registerWallet(this)
        .registerSequelize(sequelize)
        .transferToWallet({
          wallet,
          quantity,
          noFee,
          testMode
        });
      };
  
      /**
       *
       * @param {Number} quantity
       * @returns {Promise<{id:string}|any>}
       */
      freezeWallet = async ({quantity}) => {
        return await (new walletPlugin())
        .registerWallet(this)
        .registerSequelize(sequelize)
        .freezeWallet({quantity:quantity && quantity.toString()});
      }
  
      unfreezeWallet = async ({blockageId})=> {
        return await (new walletPlugin())
        .registerWallet(this)
        .registerSequelize(sequelize)
        .unfreezeWallet({blockageId});
      }
       
  
      getBalance = async () =>{
        return await (new walletPlugin())
        .registerWallet(this)
        .registerSequelize(sequelize)
        .getBalance();
      }


      createTatumAccount = async () =>{
          
        return await (new walletPlugin())
        .registerWallet(this)
        .registerSequelize(sequelize)
        .createTatumAccount()
      }

}


async function createAccount(){
  let account1 = await new Wallet(walletMetadata1).createTatumAccount()
  let account2 = await new Wallet(walletMetadata2).createTatumAccount()
  console.log("account1",account1)
  console.log("account2",account2)
}

// createAccount().catch(console.error)


async function getBalance() {
  let balance1 = await new Wallet(walletMetadata1).getBalance()
  let balance2 = await new Wallet(walletMetadata2).getBalance()
  console.log("balance1",balance1)
  console.log("balance2",balance2)
  
}

// getBalance().catch(console.error)

// deposit -> done


// transfer to account
async function transferToAddress() {
  let res = await new Wallet(walletMetadata1).transferToAddress({
    quantity:0.04,
    address:walletMetadata2.address
  })
  console.log("transaction",res)
  
}


transferToAddress().catch(console.error)

// withdraw

async function transferToWallet() {
  let res = await new Wallet(walletMetadata1).transferToWallet({
    quantity:0.04,
    wallet:new Wallet(walletMetadata2)
  })
  console.log("transaction",res)
  
}


// transferToWallet().catch(console.error)


