const WalletInterface = require("../wallet.interface");
const tatumApi = require("../../services/tatumApi");
const cmd = require("../../services/commandline.utils");
const tatum = require("@tatumio/tatum");
const { FEE_TYPES, TRANSACTION_TYPES, TRANSACTION_STATUS, TRANSACTION_REASON } = require("../../constants")
const serverFile = require("../../server");
let ManagerTransaction;
let boom;
serverFile.then((data) => {
  ManagerTransaction = data?.server?.HapiServer?.app.db.ManagerTransaction;
  boom = data?.server?.HapiServer?.app?.boom;
})

const { v4: uuidv4 } = require("uuid");

class ETHWallet extends WalletInterface {
  constructor() {
    super();
    this._name = "ETH";
    return this;
  }


  async getWalletBalance(){
    const wallet_balance = {
      availableBalance: 0,
    }
    return wallet_balance;
  }
  
  async getTransactionFee({ amount, from, to }) {

    let { gasLimit, gasPrice } = await this.Tatum.ethEstimateGas({
      amount: String(amount),
      from,
      to
    })

    let tip = 1000

    let eth = (gasLimit * (gasPrice / 1000000000) + tip) / 1000000000

    console.log({ gasLimit, gasPrice, fee: eth })

    return eth

  }


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

    const account = await tatum.createAccount(
      {
        currency: this.wallet.currency,
        customer: { externalId: this.wallet.user_id || process.env.APP_NAME },
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
    let { mnemonic, signatureId, xpub } = await this.getWalletKeys()

    let { id, txId, completed } = await this.Tatum.sendEthErc20OffchainTransaction(
      this.testnet,
      {
        address,
        amount: String(quantity),
        senderAccountId: this.wallet.tatum_account_id,
        mnemonic,
        signatureId,
        index: this.wallet.derivation_key,
        xpub
      }
    )

    return { txId, id, completed }
  }


  /**
   *
   */
  async checkAndTransferToMasterAddress() {

    const wallet = this?.wallet;
    const user_id = wallet.dataValues.user_id;
    console.log("io   ETH   =======", user_id);
    const depositEventFile = await require("../deposit.event");
    const { depositEmitFunc } = depositEventFile;

    let { mnemonic, signatureId, masterAddress } = await this.getWalletKeys()
    let { availableBalance } = await this.Tatum.getAccountBalance(this.wallet.tatum_account_id)

    if (!masterAddress) {
      throw new Error(`there is no master address for ${this.wallet.currency}`)
    }
    // track new deposit from users
    let newDepositamount = Number(availableBalance) - (this.wallet.last_tatum_balance || 0)

    // track amount successfully transfered
    let amountToTransfer = Number(availableBalance) - (this.wallet.total_success_deposit + this.wallet.total_fee_pay + this.wallet.total_token_fee_pay)

    let res = {}
   
    if (Number(amountToTransfer)) {

      try {
        let fee = await this.getTransactionFee({
          from: this.wallet.address,
          to: masterAddress,
          amount: Number(amountToTransfer).toFixed(8),
        });

        if (Number(fee) > Number(amountToTransfer)) throw new Error("amountToTransfer not enough for transaction fee")
        let privateKey = await this.Tatum.generatePrivateKeyFromMnemonic(this.Tatum.Currency.ETH, this.testnet, mnemonic, this.wallet.derivation_key)
        res = await this.Tatum.sendEthOrErc20Transaction(
          {

            amount: Number((amountToTransfer - fee)).toFixed(8),
            to: masterAddress,
            currency: this.wallet.currency,
            from: this.wallet.address,
            ...(signatureId ? {
              signatureId,
              index: this.wallet.derivation_key,
            } : {
              fromPrivateKey: privateKey
            })
          }
        )
        this.wallet.total_success_deposit = this.wallet.total_success_deposit + parseFloat(Number((amountToTransfer - fee)).toFixed(8))

        this.wallet.total_fee_pay = this.wallet.total_fee_pay + parseFloat(Number(fee).toFixed(8))
        console.log(`deposit of ${Number((amountToTransfer - fee)).toFixed(8)} from ${this.wallet.address} was successfull`)
      } catch (error) {

        console.log(error)
        console.error("error occurred whill depositing asset to master address for wallet with id ",this.wallet.id," currency ",this.wallet.currency)
      
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
        })

        await this.wallet.updateBalance()
        depositEmitFunc(user_id, "ETH");

        return transaction

      }



    }


    return { status: "success" }
  }

  async MasterToManagerAddress(key, payload) {
    // console.log("BTC plugin MasterToManagerAddress", key);
    // console.log("ETH plugin MasterToManagerAddress", payload, key);

    let { mnemonic, signatureId, masterAddress, testnet } = key
    let { balance } = await tatum.ethGetAccountBalance(masterAddress)
    // let amountToTransfer = "0.0001";
    console.log("balance   : ", balance);
    let amountToTransfer = payload?.amount;

    try {
      let fee = await this.getTransactionFee({
        from: masterAddress,
        to: payload?.to,
        amount: amountToTransfer
      })

      // console.log(fee);

      if (amountToTransfer > balance) {
        return boom.badRequest(
          "insufficient balance. "
        )
      } else {
        let privateKey = await tatum.generatePrivateKeyFromMnemonic("ETH", testnet, mnemonic, 0)
        // console.log("privateKey     : ", privateKey)
        // console.log("amount ", (amountToTransfer * 0.1).toFixed(8))

        let { id = null, txId = null, completed = null } = await tatum.sendEthOrErc20Transaction(
          {
            amount: String(Number(amountToTransfer).toFixed(8)),
            to: payload?.to,
            currency: payload?.currency,
            ...(signatureId ? {
              signatureId
            } : {
              fromPrivateKey: privateKey,
              from: masterAddress,
              index: 0,

            })

          }
        )
        console.log("res");
        console.log(id, txId, completed);

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

        // return object;
        return { status: "success", data: object }
      }


    } catch (err) {
      console.log(err);
      throw boom.badData(err.message, err);
    }


    // return { status: "success" }
  }

  /**
   *
   * @returns {Promise<Any>} address
   */
  async withdrawToAddress({ amount, address }) {

    let { mnemonic, signatureId, masterAddress } = await this.getWalletKeys()
    this.wallet = await this.wallet.updateBalance()

    if (!masterAddress) {
      throw new Error(`there is no master address for ${this.wallet.currency}`)
    }



    return this.sequelize.transaction(async (t) => {
      let privateKey = await this.Tatum.generatePrivateKeyFromMnemonic(this.wallet.currency, this.testnet, mnemonic, 0)
      let { id = null, txId = null, completed = null } = await this.Tatum.sendEthOrErc20Transaction(
        {
          amount: String(Number(amount).toFixed(8)),
          to: address,
          currency: this.wallet.currency,
          ...(signatureId ? {
            signatureId
          } : {
            fromPrivateKey: privateKey,
            from: masterAddress,
            index: 0,

          })

        }
      )

      let transaction = await this.wallet.createTransaction({
        quantity: parseFloat(Number(amount).toFixed(8)),
        type: TRANSACTION_TYPES.DEBIT,
        status: TRANSACTION_STATUS.ACTIVE,
        reason: TRANSACTION_REASON.WITHDRAWAL,
        metadata: { txId, completed }
      }, { transaction: t })


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
      console.log("deposit completed")
      return transaction
      
    })

  }


}

module.exports = ETHWallet;
