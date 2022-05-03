const WalletInterface = require("../wallet.interface");
const cmd = require("../../services/commandline.utils");
const tatum = require("@tatumio/tatum");
const { FEE_TYPES, TRANSACTION_TYPES, TRANSACTION_STATUS, TRANSACTION_REASON } = require("../../constants")
const axios = require("axios").default
const serverFile = require("../../server");
const { v4: uuidv4 } = require("uuid");


let ManagerTransaction;
let boom;
serverFile.then((data) => {
  // console.log("BTC deposite serverFile");
  io = data?.server?.HapiServer?.app?.io;
  // console.log(data?.server?.HapiServer?.app.db)
  ManagerTransaction = data?.server?.HapiServer?.app.db.ManagerTransaction;
  boom = data?.server?.HapiServer?.app?.boom;
})

const TATUM_API = process.env.TATUM_API_URL || "https://api-eu1.tatum.io";
/**
 * @typedef CreateTatumAccountResponse
 * @property {tatum.Account} account
 * @property {tatum.Address} address
 * @property {String} signatureId
 * @property {String} [memo]
 * @property {String} [tag]
 */
let keys;
try {
  keys = require($KEYS_DIR);
} catch (err) {
  keys = {};
}

class BTCWallet extends WalletInterface {
  constructor() {
    super();
    this._name = "BTC";

    return this;
  }


  async getWalletBalance(address = null){

    const wallet_address = address || this.wallet.address;
    let getbalance = await this.Tatum.btcGetBalance(wallet_address);
    let balance = getbalance?.incoming ? getbalance?.incoming : 0.00;

    let wallet_balance = {
      balance : balance
    }
    return wallet_balance;
  }

  async getWalletActualBalance(address = null){

    const wallet_address = address || this.wallet.address;
    let getbalance = await this.Tatum.btcGetBalance(wallet_address);
    let balance = getbalance?.incoming ? (getbalance?.incoming-getbalance?.outgoing) : 0.00;

    let wallet_balance = {
      balance : balance
    }
    return wallet_balance;
  }
  
  async getTransactionFee(from, to) {
    const params = 
    {
      "chain": "BTC",
      "type": "TRANSFER",
      ...from,
      ...to
    }
    var body = JSON.stringify(params);
    var config = {
      method: 'post',
      url: TATUM_API+'/v3/blockchain/estimate',
      headers: {
        'x-api-key': process.env.TATUM_API_KEY,
        'Content-Type': 'application/json'
      },
      data: body
    };
    let { data } = await axios(config)
    return data.medium
  }

  async getWithdrawalTransactionFee(from, to){

    const params = 
    {
      "chain": "BTC",
      "type": "TRANSFER",
      ...from,
      ...to
    }
    var body = JSON.stringify(params);


    var config = {
      method: 'post',
      url: TATUM_API+'/v3/blockchain/estimate',
      headers: {
        'x-api-key': process.env.TATUM_API_KEY,
        'Content-Type': 'application/json'
      },
      data: body
    };
    let { data } = await axios(config)
    return data.medium
  }

  async generatePravetKey({ amount, from, to }) {
    var body = JSON.stringify({
      "chain": "BTC",
      "type": "TRANSFER",
      "fromAddress": [
        from
      ],
      "to": [
        {
          "address": to,
          "value": Number(amount)
        }
      ]
    });
    var config = {
      method: 'post',
      url: TATUM_API+'/v3/blockchain/estimate',
      headers: {
        'x-api-key': process.env.TATUM_API_KEY,
        'Content-Type': 'application/json'
      },
      data: body
    };
    let { data } = await axios(config)
    return data.medium
  }

  // /v3/bitcoin/wallet/priv


  /**
   *
   * @returns {Promsie<CreateTatumAccountResponse>}
   */
  async createTatumAccount() {
    /**
     * @typedef CmdResponse
     * @property {String} signatureId
     * @property {String} xpub
     */

    /**
     * @type {CmdResponse}
     */

    const { xpub } = await this.getWalletKeys()

    const account = await this.Tatum.createAccount(
      {
        currency: this.wallet.currency,
        customer: {
          externalId: this.wallet.user_id || process.env.APP_NAME,
        },
        xpub,
        accountingCurrency: "USD",
      },
      this.testnet
    );

    const address = await this.Tatum.generateDepositAddress(account.id)
    return { account, address };
  }



  /**
   *
   * @param {Number} quantity
   * @param {String} address
   */
  async transferToAddress({ quantity, address }) {
    return

    /**
     * @type {tatum.TransferBtcBasedOffchain}
     */
    let { mnemonic, signatureId, xpub } = await this.getWalletKeys()


    const { txId } = await this.Tatum.sendBitcoinOffchainTransaction(
      this.testnet,

      {
        address,
        senderAccountId: this.wallet.tatum_account_id,
        amount: String(quantity),
        mnemonic,
        xpub,
        signatureId
      }
    )

    return { txId }
  }


  /**
   *
   * @param {Number} quantity
   * @param {String} address
   */
  async checkAndTransferToMasterAddress() {

    const wallet = this?.wallet;
    const user_id = wallet.dataValues.user_id;
    console.log("io     BTC  ======= uid: ", user_id);
    const depositEventFile = await require("../deposit.event");
    const { depositEmitFunc } = depositEventFile;
    // depositEmitFunc(user_id,"BTC");

    let { mnemonic, signatureId, masterAddress } = await this.getWalletKeys()
    let { availableBalance, accountBalance } = await this.Tatum.getAccountBalance(this.wallet.tatum_account_id);

    if (!masterAddress) {
      throw new Error(`there is no master address for ${this.wallet.currency}`)
    }
    // track new deposit from users
    let newDepositamount = Number(availableBalance) - (this.wallet.last_tatum_balance || 0)

    // track amount successfully transfered
    let amountToTransfer = Number(availableBalance) - Number(this.wallet.total_success_deposit + this.wallet.total_fee_pay + this.wallet.total_token_fee_pay)

    console.log("availableBalance", availableBalance)
    console.log("newDepositamount", newDepositamount)
    console.log("last_tatum_balance", this.wallet.last_tatum_balance)
    console.log("all", Number(availableBalance - this.wallet.total_success_deposit + this.wallet.total_fee_pay + this.wallet.total_token_fee_pay))
    console.log("amountToTransfer", amountToTransfer)
    let res = {}
    
    if (Number(amountToTransfer)) {
      try {
        let fee = await this.getTransactionFee({
          fromAddress : [
            {from: this.wallet.address}
          ],
          to: [
            {
              address: masterAddress,
              value: Number(amountToTransfer.toFixed(8))
            }
          ]
        })
        if (fee > amountToTransfer) throw new Error("amountToTransfer not enough for transaction fee")
        let privateKey = await this.Tatum.generatePrivateKeyFromMnemonic(this.wallet.currency, this.testnet, mnemonic, this.wallet.derivation_key)
        console.log("amountToTransfer - fee ", (Number(amountToTransfer)-fee).toFixed(8))
        // console.log("amount remaining",(amountToTransfer - (Number(amountToTransfer)-fee)*0.9))
        // console.log("amount to transacfer",parseFloat(((Number(amountToTransfer)-fee)*0.9).toFixed(8)))
        res = await this.Tatum.sendBitcoinTransaction(
          this.testnet,
          {
            fromAddress: [
              {
                address: this.wallet.address,
                ...(signatureId ? { signatureId } : { privateKey })
              }
            ],
            to: [
              {
                address: masterAddress,
                value: parseFloat((Number(amountToTransfer)-fee).toFixed(8)),
              }
            ]
          }
        )
        this.wallet.total_success_deposit = this.wallet.total_success_deposit + parseFloat((Number(amountToTransfer)-fee).toFixed(8));
        this.wallet.total_fee_pay = Number(this.wallet.total_fee_pay + parseFloat(Number(fee).toFixed(8))).toFixed(8);
        
        console.log(`deposit from ${this.wallet.address} was successfull `, res)
      } catch (error) {
        console.log(error.message)
        console.error("error occurred whill depositing asset to master address for wallet with id ",this.wallet.id," currency ",this.wallet.currency)
        return ;

      }

      let { id = null, txId = null, completed = null } = res

      let date = new Date();
      date.setMinutes(date.getMinutes() + 20);
      this.wallet.next_check_deposit_date = date
      this.wallet.last_tatum_balance = Number(availableBalance)
      await this.wallet.save()

      if (newDepositamount) {
        let transaction = await this.wallet.createTransaction({
          quantity: Number(newDepositamount),
          type: TRANSACTION_TYPES.CREDIT,
          status: TRANSACTION_STATUS.ACTIVE,
          reason: TRANSACTION_REASON.DEPOSIT,
          metadata: { txId, completed }
        });      

        await this.wallet.updateBalance()
        depositEmitFunc(user_id, "BTC");

        return transaction
      }
    }
    return { status: "success" }
  }

  /**
 *
 * @param {Number} quantity
 * @param {String} address
 */
   async MasterToManagerAddress(key, payload) {
    // console.log("BTC plugin MasterToManagerAddress", key);
    console.log("BTC plugin MasterToManagerAddress", payload);

    const TATUM_API = process.env.TATUM_API_URL
    
    let { mnemonic, signatureId, masterAddress } = key
    let  {incoming } = await tatum.btcGetBalance(masterAddress)
    // let amountToTransfer = "0.0001";
    console.log("incoming   : ",incoming);

    let {balance} = await this.getWalletActualBalance(masterAddress);

    let amountToTransfer = payload?.amount;

    let return_amount_master = parseFloat((Number(balance) - amountToTransfer).toFixed(8));

    try {
      let fee = await this.getTransactionFee({
        fromAddress : [
          {from: masterAddress}
        ],
        to: [
          {
            address: payload?.to,
            value: Number(amountToTransfer.toFixed(8))
          },
          {
            address: masterAddress,
            value: Number(return_amount_master.toFixed(8))
          }
        ]
      })

      let new_return_amount_master = parseFloat((Number(return_amount_master)-fee).toFixed(8));

      if (amountToTransfer > incoming) {
        return boom.badRequest(
          "insufficient balance. "
        )
      } else {
        let privateKey = await tatum.generatePrivateKeyFromMnemonic("BTC", this.testnet, mnemonic, 0)
        console.log("privateKey     : ", privateKey)
        console.log("amount ", (amountToTransfer * 0.1).toFixed(8))

        let { id = null, txId = null, completed = null } = await this.Tatum.sendBitcoinTransaction(
          this.testnet,
          {
            fromAddress: [
              {
                address: masterAddress,
                ...(signatureId ? { signatureId } : { privateKey })
              }
            ],
            to: [
              {
                address: payload?.to,
                value: parseFloat(Number(amountToTransfer.toFixed(8)))
              },
              {
                address: masterAddress,
                value: parseFloat(Number(new_return_amount_master.toFixed(8)))
              }
            ],
          }
        )

        //   console.log(id,txId,completed);

        const object = await ManagerTransaction.create({
          address: payload?.to,
          fee: fee,
          crypto: payload?.currency,
          quantity: Number(amountToTransfer),
          type: TRANSACTION_TYPES.DEBIT,
          status: TRANSACTION_STATUS.ACTIVE,
          reason: TRANSACTION_REASON.MANAGER_WITHDRAWAL,
          metadata: { txId, completed }
        });

        return { status: "success",data:object }
      }


    } catch (err) {
      console.log(err)
      return boom.internal(err.message, err);
    }


    // return { status: "success" }
  }


  /**
   *
   * @returns {Promise<Any>} address
   */
  async withdrawToAddress({ amount, address }) {
    console.log("update by id withdrawToAddress")

    let { mnemonic, signatureId, masterAddress } = await this.getWalletKeys()
    this.wallet = await this.wallet.updateBalance()

    if (!masterAddress) {
      throw new Error(`there is no master address for ${this.wallet.currency}`)
    }


    let {balance} = await this.getWalletActualBalance(masterAddress);

    if(amount > balance){
      throw new Error(`Insufficient balance in main wallet for transaction`)
    }
    
    let return_amount = parseFloat((Number(balance) - amount).toFixed(8));

    let fee = await this.getWithdrawalTransactionFee({
      fromAddress : [
        {from: masterAddress}
      ],
      to: [
        {
          address: address,
          value: Number(amount.toFixed(8))
        },
        {
          address: masterAddress,
          value: Number(return_amount.toFixed(8))
        }
      ]
    })

    let new_return_amount = parseFloat((Number(return_amount)-fee).toFixed(8));

    console.log("balance : ",Number(balance).toFixed(8))
    console.log("amount: ",amount)
    console.log("return_amount : ", return_amount)
    console.log("fee : ", fee)
    console.log("new_return_amount : ", new_return_amount)
    // throw new Error(`Insufficient balance in main wallt for transaction`)

    const remain_amount = parseFloat((Number(balance)-fee).toFixed(8));
    if(amount > remain_amount){
      throw new Error(`Insufficient balance in main wallet for transaction`)
    }
    
    return this.sequelize.transaction(async (t) => {
      let privateKey = await this.Tatum.generatePrivateKeyFromMnemonic(this.wallet.currency, this.testnet, mnemonic, 0)
      let { id = null, txId = null, completed = null } = await this.Tatum.sendBitcoinTransaction(
        this.testnet,
        {
          fromAddress: [
            {
              address: masterAddress,
              ...(signatureId ? { signatureId } : { privateKey })
            }
          ],
          to: [
            {
              address: address,
              value: Number(amount.toFixed(8))
            },
            {
              address: masterAddress,
              value: Number(new_return_amount.toFixed(8))
            }
          ],
        }
      )


      let transaction = await this.wallet.createTransaction({
        quantity: Number(amount),
        type: TRANSACTION_TYPES.DEBIT,
        status: TRANSACTION_STATUS.ACTIVE,
        reason: TRANSACTION_REASON.WITHDRAWAL,
        metadata: { txId, completed }
      }, { transaction: t })
      
      console.log('transaction saved for debit')

      let ref = uuidv4();
      let chargeWallets = (await this.wallet.getWalletsForTransactionFee({ amount })) || {};
      const fee_charge = (chargeWallets.WITHDRAWAL && chargeWallets.WITHDRAWAL.fee) ? chargeWallets.WITHDRAWAL.fee : 0;
      if(fee_charge > 0){
        await this.wallet.createTransaction(
          {
            reference: ref,
            quantity: Number(fee_charge),
            type: TRANSACTION_TYPES.DEBIT,
            status: TRANSACTION_STATUS.ACTIVE,
            reason: TRANSACTION_REASON.FEES,
          },
          { transaction: t }
        );
      }

      await this.wallet.updateBalance()
      console.log('balance updated')
      return transaction

    })
    // return { status: "success" }

  }
}

module.exports = BTCWallet;
