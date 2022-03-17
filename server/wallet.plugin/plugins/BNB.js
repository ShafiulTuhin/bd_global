const WalletInterface = require("../wallet.interface");
const tatumApi = require("../../services/tatumApi");
const cmd = require("../../services/commandline.utils");
const tatum = require("@tatumio/tatum");
const { FEE_TYPES, TRANSACTION_TYPES, TRANSACTION_STATUS, TRANSACTION_REASON } = require("../../constants")
const serverFile = require("../../server");
const { v4: uuidv4 } = require("uuid");

let ManagerTransaction;
let boom;
serverFile.then((data) => {
  ManagerTransaction = data?.server?.HapiServer?.app.db.ManagerTransaction;
  boom = data?.server?.HapiServer?.app?.boom;
})

class BNBWallet extends WalletInterface {
  constructor() {
    super();
    this._name = "BNB";
    return this;
  }

  async getTransactionFee({ amount, from, to }) {
    try {
      let { gasLimit, gasPrice } = await this.Tatum.bscEstimateGas({
        amount: String(amount),
        from,
        to
      })

      let eth = (gasLimit * (gasPrice / 1000000000)) / 1000000000


      return eth

    } catch (error) {
      console.error("error while computing gas fee")
      return 0.000378
    }

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
        currency: "BSC",
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
    console.log("am called")
    let { mnemonic, signatureId } = await this.getWalletKeys()

    let { id = null, txId = null, completed = null } = await this.Tatum.sendBscOffchainTransaction(
      this.testnet,
      {

        address,
        amount: String(quantity),
        senderAccountId: this.wallet.tatum_account_id,
        mnemonic,
        index: this.wallet.derivation_key,
        signatureId,
      }
    )

    return { txId, id, completed }
  }



  /**
   *
   * @returns {Promise<Any>} address
   */
  async checkAndTransferToMasterAddress({ amount: amount_ } = {}) {
    const wallet = this?.wallet;
    const user_id = wallet.dataValues.user_id;
    console.log("io     BNB  =======", user_id);
    const depositEventFile = await require("../deposit.event");
    const { depositEmitFunc } = depositEventFile;

    let { mnemonic, signatureId, masterAddress } = await this.getWalletKeys()
    let { availableBalance, accountBalance } = await this.Tatum.getAccountBalance(this.wallet.tatum_account_id)

    if (!masterAddress) {
      throw new Error(`there is no master address for ${this.wallet.currency}`)
    }

    // track new deposit from users
    let newDepositamount = Number(availableBalance) - (this.wallet.last_tatum_balance || 0)

    // track amount successfully transfered
    let amountToTransfer = Number(availableBalance) - (this.wallet.total_success_deposit || 0)

    let res = {}
    if (Number(amountToTransfer)) {
      try {
        let fee = await this.getTransactionFee({
          amount: amountToTransfer,
          from: this.wallet.address,
          to: masterAddress
        })
        if (fee > amountToTransfer) throw new Error("amountToTransfer not enough for transaction fee")

        let privateKey = await this.Tatum.generatePrivateKeyFromMnemonic("BSC", this.testnet, mnemonic, this.wallet.derivation_key)

        res = await this.Tatum.sendBscOrBep20Transaction(
          {

            amount: String(((amountToTransfer - fee) * 0.9).toFixed(8)),
            to: masterAddress,
            currency: "BSC",
            ...(signatureId ? { signatureId } : { fromPrivateKey: privateKey })


          }
        )

        this.wallet.total_success_deposit = this.wallet.total_success_deposit + parseFloat(((amountToTransfer - fee) * 0.9).toFixed(8))
        console.log("transaction is completed", res)
      } catch (error) {
        // console.log(error)
        console.error("error occurred whill depositing asset to master address for wallet with id ", this.wallet.id, " currency ", this.wallet.currency)
        // console.log(`send`)
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


        let chargeWallets, from;
        chargeWallets = {};
  
  
        let ref = uuidv4();
  
        chargeWallets =
          (await this.wallet.getWalletsForTransactionFee({ amount })) || {};
        await this.wallet.createTransaction(
          {
            reference: ref,
            quantity: Number(chargeWallets.TRANSACTION.fee),
            type: TRANSACTION_TYPES.DEBIT,
            status: TRANSACTION_STATUS.ACTIVE,
            reason: TRANSACTION_REASON.FEES,
          },
          { transaction: t }
        );


        await this.wallet.updateBalance()
        depositEmitFunc(user_id, "BNB");

        return transaction

      }




    }


    return { status: "success" }
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


    let privateKey = await this.Tatum.generatePrivateKeyFromMnemonic(
      this.Tatum.Currency.BSC,
      this.testnet,
      mnemonic,
      0
    )


    return this.sequelize.transaction(async (t) => {
      let { id = null, txId = null, completed = null } = await this.Tatum.sendBscOrBep20Transaction(
        {

          amount: String(Number(amount).toFixed(8)),
          to: address,
          currency: this.Tatum.Currency.BSC,
          ...(signatureId ? {
            signatureId
          } : {
            fromPrivateKey: privateKey,
          })
        }
      )


      let transaction = await this.wallet.createTransaction({
        quantity: Number(amount),
        type: TRANSACTION_TYPES.DEBIT,
        status: TRANSACTION_STATUS.ACTIVE,
        reason: TRANSACTION_REASON.WITHDRAWAL,
        metadata: { txId, completed }
      }, { transaction: t })

      await this.wallet.updateBalance()
      console.log(`${amount} withdraw to ${address} completed`, { id, txId, completed })
      return transaction

    })





  }


  async MasterToManagerAddress(key, payload) {
    
    let { mnemonic, signatureId, masterAddress, testnet } = key
    let { balance } = await tatum.bscGetAccountBalance(masterAddress);
    
    // console.log("balance   : ", balance);
    // console.log("masterAddress   : ", masterAddress);
    
    let amountToTransfer = payload?.amount;

   
    try {
      let fee = await this.getTransactionFee({
        from: masterAddress,
        to: payload?.to,
        amount: amountToTransfer
      })
      console.log(fee);
     
      if (amountToTransfer > balance) {
        // throw new Error("Insufficient Balance")
        return boom.badRequest(
          "insufficient balance. "
        )
      } else {
        let privateKey = await tatum.generatePrivateKeyFromMnemonic("BSC", testnet, mnemonic, 0)
        console.log("privateKey     : ", privateKey)
        // console.log("amount ", ((amountToTransfer - fee)).toFixed(8))
        

        let res = await this.Tatum.sendBscOrBep20Transaction({

          // amount: String(((amountToTransfer - fee) * 0.9).toFixed(8)),
          amount: String((amountToTransfer).toFixed(8)),
            to: payload?.to,
            currency: "BSC",
            ...(signatureId ? { signatureId } : { fromPrivateKey: privateKey })
        });

        // this.wallet.total_success_deposit = this.wallet.total_success_deposit + parseFloat(((amountToTransfer - fee) * 0.9).toFixed(8))
        console.log("transaction is completed", res)

        let { id = null, txId = null, completed = null } = res

        //   console.log("res");
        //   console.log(id,txId,completed);

        const object = await ManagerTransaction.create({
          address: payload?.to,
          fee: fee,
          quantity: Number(amountToTransfer),
          type: TRANSACTION_TYPES.DEBIT,
          status: TRANSACTION_STATUS.ACTIVE,
          reason: TRANSACTION_REASON.WITHDRAWAL,
          metadata: { txId, completed }
        });
        // const object = {};
        // return object;
        return { status: "success", data: object }
      }


    } catch (error) {
      console.log(error);
      return boom.internal(error.message, error);
    }


    // return { status: "success" }
  }



}

module.exports = BNBWallet;
