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
    user_id:"61d2032421803e63988c3bd6",
    tatum_account_id: "61d62dfcd3fd6e48702cd8c0",
    
    derivation_key: 1,
    address: "mmefaRX2CkuBqonG83BsJfDD6fn2J8p6N2",
    network: "Bitcoin",
    frozen: false,
    currency: 'BTC',
    is_company_wallet: false
  }

let walletMetadata2 = {
    id: "e270c5cf-928c-4e02-a648-196d18702689",
    user_id:"61d20324b68fb6381c0d87fe",
    tatum_account_id: "61d62e447010a87249090203",
    destination_tag: null,
    derivation_key: 2,
    // address: "mu7eFvAkS5uemqfv4e33ASHHsyhw6i5VXz",
    address: "mkTvPsG8cB4QfpvFTaNWziTDGLfWtUF8WC",
    network: "Bitcoin",
    frozen: false,
    currency: 'BTC',
    is_company_wallet: false
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
       * @returns {Promise}
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
       * @param {Boolean} params.testMode
       * @returns {Promise}
       */
      transferToWallet = async ({ wallet, quantity,testMode=true,noFee=true }) => {
        
        return await (new walletPlugin())
        .registerWallet(this)
        .registerSequelize(sequelize)
        .transferToWallet({
          wallet,
          quantity,
          testMode,
          noFee
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
          console.log("currency",this.currency)
        return await (new walletPlugin())
        .registerWallet(this)
        .registerSequelize(sequelize)
        .createTatumAccount()
      }

}


async function transferBetweenWallet(){
    const transaction = await new Wallet(walletMetadata1).transferToWallet({
      quantity:0.0005,
      wallet:new Wallet(walletMetadata2)
    })

   
    console.log("transaction",transaction)
}

transferBetweenWallet().catch(console.error)


async function transferToAddress(){
    const transaction = await new Wallet(walletMetadata1).transferToAddress({
      quantity:0.0005,
      address:walletMetadata2.address
    })

   
    console.log("transaction",transaction)
}


// transferToAddress().catch(console.error)


async function transferOnledger() {
  let res = await tatum.storeTransaction({
    amount:String(0.003),
    senderAccountId:walletMetadata2.tatum_account_id,
    recipientAccountId:walletMetadata1.tatum_account_id
  })
  console.log(res)
}

// transferOnledger().catch(console.error)

// let response = { reference: '026f6a2b-2b35-4410-9974-98791a804b97' }



async function getAccount() {
    const account1 = await tatum.getAccountById(walletMetadata1.tatum_account_id)
    const account2 = await tatum.getAccountById(walletMetadata2.tatum_account_id)
    
    console.log("account1 ",account1)
    console.log("account2 ",account2)
}

// getAccount().catch(console.error)


async function getAddress() {
    const account1 = await tatum.generateAddressFromXPub("BTC",true,walletMetadata1.xpub,1)
    const account2 = await tatum.generateAddressFromXPub("BTC",true,walletMetadata2.xpub,1)
    
    console.log("account1 ",account1)
    console.log("account2 ",account2)

    
}

// getAddress().catch(console.error)


// async function getBalance() {
//     const account1 = await new Wallet(walletMetadata1).getBalance()
//     const account2 = await new Wallet(walletMetadata2).getBalance()
//     console.log("account1 ",account1)
//     console.log("account2 ",account2)

    
// }

// getBalance().catch(console.error)

async function main() {
    const account1 = await new Wallet(walletMetadata1).getBalance()
    const account2 = await new Wallet(walletMetadata2).getBalance()
    console.log("account1 ",account1)
    console.log("account2 ",account2)

    
}


async function generateWallet() {
  res = await tatum.generateWallet(tatum.Currency.BTC,true)
  console.log(res)
  
}



// generateWallet().catch(console.error)

let wallet = {
  mnemonic: 'holiday evolve viable mouse siren tissue garbage satisfy catch provide mouse shoulder they fiscal live suspect vague arrange engage soul august wreck mimic sniff',
  xpub: 'tpubDEdDjWFfyofqVFsio9A1scpFLcNNL69V5xbGprHa9KJ4a5TYF2tBetwv3tH548JxwrvSApuWwCLazUU27iazSemgKon47gqrqNHc3EUghkH'
}


async function createAccount() {
  let res = await tatum.createAccount({
    currency:tatum.Currency.BTC,
    accountingCurrency:tatum.Fiat.USD,
    customer:{
      externalId:"123455633",
    },
    xpub:wallet.xpub
  })


  console.log(res)
  
}

let account1 = {
  currency: 'BTC',
  active: true,
  balance: { accountBalance: '0', availableBalance: '0' },
  frozen: false,
  xpub: 'tpubDEdDjWFfyofqVFsio9A1scpFLcNNL69V5xbGprHa9KJ4a5TYF2tBetwv3tH548JxwrvSApuWwCLazUU27iazSemgKon47gqrqNHc3EUghkH',
  customerId: '61d62dfcd3fd6e9e882cd8c1',
  accountingCurrency: 'USD',
  id: '61d62dfcd3fd6e48702cd8c0'
}

let account2 = {
  currency: 'BTC',
  active: true,
  balance: { accountBalance: '0', availableBalance: '0' },
  frozen: false,
  xpub: 'tpubDEdDjWFfyofqVFsio9A1scpFLcNNL69V5xbGprHa9KJ4a5TYF2tBetwv3tH548JxwrvSApuWwCLazUU27iazSemgKon47gqrqNHc3EUghkH',
  customerId: '61d62dfcd3fd6e9e882cd8c1',
  accountingCurrency: 'USD',
  id: '61d62e447010a87249090203'
}

// createAccount().catch(console.error)

async function generateAddress() {
  let address1,address2
  address1 = await tatum.generateDepositAddress(account1.id)
  address2 = await tatum.generateDepositAddress(account2.id)

  console.log("address1",address1)
  console.log("address2",address2)
  
}


let address1 = {
  xpub: 'tpubDEdDjWFfyofqVFsio9A1scpFLcNNL69V5xbGprHa9KJ4a5TYF2tBetwv3tH548JxwrvSApuWwCLazUU27iazSemgKon47gqrqNHc3EUghkH',
  derivationKey: 1,
  address: 'mmefaRX2CkuBqonG83BsJfDD6fn2J8p6N2',
  currency: 'BTC'
}

let address2 = {
  xpub: 'tpubDEdDjWFfyofqVFsio9A1scpFLcNNL69V5xbGprHa9KJ4a5TYF2tBetwv3tH548JxwrvSApuWwCLazUU27iazSemgKon47gqrqNHc3EUghkH',
  derivationKey: 2,
  address: 'mkTvPsG8cB4QfpvFTaNWziTDGLfWtUF8WC',
  currency: 'BTC'
}

// generateAddress().catch(console.error)



// deposit - done




async function getBalance(){
  let balance1,balance2
  balance1 = await tatum.getAccountBalance(account1.id)
  balance2 = await tatum.getAccountBalance(account2.id)
  console.log("balance1",balance1)
  console.log("balance2",balance2)
}

// getBalance().catch(console.error)

// deposit - done


// async function transferToAddress2(){
  
//   let res = await tatum.sendBitcoinOffchainTransaction(true,{
//     senderAccountId:account1.id,
//     address:address2.address,
//     amount:"0.0052",
//     mnemonic:wallet.mnemonic,
//     xpub:wallet.xpub
//   })
//   console.log("transactin response",res)
// }


// transferToAddress2().catch(console.error)


let transactionResult = {
  txId: 'ad8bec30fc28e3ec1a41976f22ba7a57a530d568d5bcdf6bca2714b72395f968',
  completed: true,
  id: '61d6e78c74e225152a5b947f'
}


/**
 * 0.03832525 => 0.03282525
 */


// transafer to address
// transfer to wallet
// withdraw


// transafer to address
// transfer to wallet
// withdraw



async function generateMasterAddress(){
  let res = await tatum.generateAddressFromXPub(tatum.Currency.BTC,true,wallet.xpub,0)
  console.log("master address",res)
}

// generateMasterAddress().catch(console.error)

let masterAddress = "mzK6krWQ33FmWydm9Ph3uczqkWchhSHRXf"

let withdrawAddress = "mnoZs5eC8tW11QEDZQmrgMgLzpGepAbi5S"



async function withdrawToAddress(){
  
  let res = await tatum.sendBitcoinOffchainTransaction(true,{
    senderAccountId:account2.id,
    address:address2.address,
    amount:"0.0052",
    mnemonic:wallet.mnemonic,
    xpub:wallet.xpub
  })
  console.log("transactin response",res)
}


// withdrawToAddress().catch(console.error)