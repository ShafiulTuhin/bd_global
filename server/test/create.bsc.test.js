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
const keys = require("../keys.json")

let headers = {
    'x-api-key':process.env.TATUM_API_KEY,
    'Content-Type':'application/json'
}




let account1 = {
  account: {
    currency: 'BSC',
    active: true,
    balance: { accountBalance: '0', availableBalance: '0' },
    frozen: false,
    xpub: 'xpub6EcAfwQw4gEVJ5ELkpTLRjpARVA5Bjusr2duyXhhw8XWLar3tXTtRJNLwtrAF5NRaBzC6S9Uu8LCm7BjU21ZQhqdPy59bGkwPrQZyteCmPw',
    accountingCurrency: 'USD',
    id: '61e92f89bda2f999887f3568'
  },
  address: {
    xpub: 'xpub6EcAfwQw4gEVJ5ELkpTLRjpARVA5Bjusr2duyXhhw8XWLar3tXTtRJNLwtrAF5NRaBzC6S9Uu8LCm7BjU21ZQhqdPy59bGkwPrQZyteCmPw',
    derivationKey: 2,
    address: '0xce246fd97932e0391dbf0c43194d00c55c3cdf38',
    currency: 'BSC'
  }
}

let account2 = {
  account: {
    currency: 'BSC',
    active: true,
    balance: { accountBalance: '0', availableBalance: '0' },
    frozen: false,
    xpub: 'xpub6EcAfwQw4gEVJ5ELkpTLRjpARVA5Bjusr2duyXhhw8XWLar3tXTtRJNLwtrAF5NRaBzC6S9Uu8LCm7BjU21ZQhqdPy59bGkwPrQZyteCmPw',
    accountingCurrency: 'USD',
    id: '61e9307afb14200063e1f41a'
  },
  address: {
    xpub: 'xpub6EcAfwQw4gEVJ5ELkpTLRjpARVA5Bjusr2duyXhhw8XWLar3tXTtRJNLwtrAF5NRaBzC6S9Uu8LCm7BjU21ZQhqdPy59bGkwPrQZyteCmPw',
    derivationKey: 3,
    address: '0x09b8aa7552943dd0d8449f9c3dcaa05908d48a8e',
    currency: 'BSC'
  }
}

  let testnet = process.env.NODE_ENV == "development" ? true : false;

  class TestClass{


    static async getTransactionFee({amount,from,to}){
      let {gasLimit} = await tatum.bscEstimateGas({
        amount:String(amount),
        from,
        to
      })
      console.log(gasLimit/100000000)
      return gasLimit/100000000
    }


    /**
     * @returns {Promise<HDWalletKeys|XRPWalletKeys>}
     */
    static async getWalletKeys(){
      return keys[String("BSC").toUpperCase()]
    }


    /**
   *
   * @returns {Promsie<CreateTatumAccountResponse>}
   */
  static async createTatumAccount() {
    /**
     * @typedef CmdResponse
     * @property {String} signatureId
     * @property {String} xpub
     */

    /**
     * @type {CmdResponse}
     */
    const { xpub } = await this.getWalletKeys()

    const account = await tatum.createAccount(
        {
          currency: "BSC",
          xpub,
          accountingCurrency: "USD",
        },
        testnet
      );

      const address = await tatum.generateDepositAddress(account.id)
      console.log( { account,address })
    }


    static async transferToAddress({amount}){
      
      let {mnemonic,masterAddress} = await this.getWalletKeys()
      let fromPrivateKey = await tatum.generatePrivateKeyFromMnemonic(
        "BSC",
        testnet,
        mnemonic,
        account1.address.derivationKey,

      )

      let fee = await this.getTransactionFee({
        amount:String(amount),
        from:account1.address.address,
        to:"0x153fd709cc6ca86afb7a8ae081281fe163ff3601",
      })


      console.log(Number(amount)-fee)

      let tx = await tatum.sendBscOrBep20Transaction({
        amount:String(Number(amount)),
        to:"0x153fd709cc6ca86afb7a8ae081281fe163ff3601",
        currency:"BSC",
        fromPrivateKey
      })

      console.log(tx)
      return tx
    }

  }



  TestClass.transferToAddress({
    amount:0.2,
    // from:"0xce246fd97932e0391dbf0c43194d00c55c3cdf38",
    // to:"0xf59cdfd29c15dee273d0cf554e447fb888a48d4b"
  }).catch(console.error)