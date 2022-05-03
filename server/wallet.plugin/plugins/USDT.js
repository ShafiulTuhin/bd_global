const WalletInterface = require("../wallet.interface");
// const ETHWallet = require("./ETH")
const { FEE_TYPES, TRANSACTION_TYPES, TRANSACTION_STATUS, TRANSACTION_REASON } = require("../../constants")
const tatum = require("@tatumio/tatum");
const serverFile = require("../../server");

const { v4: uuidv4 } = require("uuid");
const { times } = require("underscore");


let ManagerTransaction;
let boom;
let Wallet;
serverFile.then((data) => {
  ManagerTransaction = data?.server?.HapiServer?.app.db.ManagerTransaction;
  boom = data?.server?.HapiServer?.app?.boom;
  Wallet = data?.server?.HapiServer?.app.db.Wallet;
  Unspendwalletbalances = data?.server?.HapiServer?.app.db.Unspendwalletbalances;
})

const axios = require("axios").default
const TATUM_API = process.env.TATUM_API_URL || "https://api-eu1.tatum.io";

class USDTWallet extends WalletInterface {
  constructor() {
    super();
    this._name = "USDT";
    return this;
  }

  /*async getTransactionFee({amount,from,to}){
    let {gasLimit,gasPrice} = await this.Tatum.ethEstimateGas({
      amount:String(amount),
      from,
      to
    })
    
    let eth = (gasLimit *(gasPrice/1000000000)) / 1000000000
  // let gwei = (21000 *(10000000000)) / 1000000000
    
    return eth
  }*/  

  async getWalletBalance() {
  
    let {trc20} = await this.Tatum.tronGetAccount(this.wallet.address);

    let balance = 0;
    trc20 && trc20.map((val) => {
      for (const [key, value] of Object.entries(val)) {
        if(key == process.env.USDT_CONTRACT_ADDRESS){
          balance = value /  Math.pow(10, process.env.USDT_DIGITS)
        }
      }
    });

    let wallet_balance = {
      balance
    }
    return wallet_balance;
  }
  /*async getWalletBalance() {
    
    let getbalance = await this.Tatum.ethGetAccountErc20Address(this.wallet.address, process.env.USDT_CONTRACT_ADDRESS);
    let balance = getbalance?.balance && getbalance?.balance > 0 ? (getbalance?.balance / Math.pow(10, process.env.USDT_DIGITS)) : 0.00;

    let wallet_balance = {
      balance: balance
    }
    return wallet_balance;
  }*/

  async getTransactionFee({ amount, from, to }) {
    var body = JSON.stringify({
      "chain": "ETH",
      "type": "TRANSFER_ERC20",
      "sender": from,
      "recipient": to,
      "contractAddress": process.env.USDT_CONTRACT_ADDRESS,
      "amount": amount.toString()
    });
    var config = {
      method: 'post',
      url: TATUM_API + '/v3/blockchain/estimate',
      headers: {
        'x-api-key': process.env.TATUM_API_KEY,
        'Content-Type': 'application/json'
      },
      data: body
    };

    try {
      let { data } = await axios(config);
      const gasLimit = Number(data.gasLimit) + 1000;
      const gasPrice = data.gasPrice;
      
      let fee = (gasLimit * (gasPrice)) / 1000000000;

      let estimated = {
        fee,
        gasLimit,
        gasPrice
      }
      return estimated;
    } catch (error) {
      console.log(error)
    }
  }


  /**
   *
   * @returns {Promsie<CreateTatumAccountResponse>}
   */
  async createTatumAccount() {

    let account = await this.Tatum.createAccount({
      currency: this.Tatum.Currency.USDT,
      accountingCurrency: this.Tatum.Fiat.USD,
    })

    await this.Tatum.assignDepositAddress(account.id, this.wallet.address);

    let address = {
      derivationKey: this.wallet.derivation_key,
      address: this.wallet.address
    }

    return { account, address };
  }

  /**
   *
   * @param {Number} quantity
   * @param {String} address
   */
  async transferToAddress({ quantity, address }) {
    return

  }

  /**
   *
   */
  async checkAndTransferToMasterAddress() {

    
    let last_txn = this.wallet.last_trx;
    if(last_txn){
      
      let checkStatus = await this.Tatum.tronGetTransaction(last_txn);
      
      if(checkStatus?.ret && checkStatus?.ret[0]?.contractRet == "SUCCESS"){
        this.wallet.last_trx = null;
        await this.wallet.save()
      }else{
        console.log(`Last transaction not completed: ${last_txn}`);
        return false
      }
    } 


    const wallet = this?.wallet;
    const user_id = wallet.dataValues.user_id;
    console.log("io     USDT  =======", user_id);
    const depositEventFile = await require("../deposit.event");
    const { depositEmitFunc } = depositEventFile;


    let { mnemonic, signatureId, masterAddress } = await this.getWalletKeys();

    let { balance } = await this.getWalletBalance();
    let availableBalance = balance;
    console.log("availableBalanceUSDT: ", availableBalance);
    console.log("last_tatum_balance: ", this.wallet.last_tatum_balance);

    if (!masterAddress) {
      throw new Error(`there is no master address for ${this.wallet.currency}`)
    }

    // track new deposit from users
    // let newDepositamount =  availableBalance
    let newDepositamount = Number(availableBalance) - (this.wallet.last_tatum_balance || 0)

    // track amount successfully transfered
    // let amountToTransfer =  availableBalance
    let amountToTransfer = Number(availableBalance) - (this.wallet.total_success_deposit + this.wallet.total_fee_pay + this.wallet.total_token_fee_pay)
    let res = {}

    let is_unspent = true;

    //const getChainBalance = await this.Tatum.ethGetAccountBalance(this.wallet.address);
    const chainBalance = 0; //getChainBalance.balance;

    let last_tatum_balance = availableBalance;
    let total_success_deposit = this.wallet.total_success_deposit;
    let reason = null;

    console.log("newDepositamount: ",newDepositamount)
    console.log("amountToTransfer: ",amountToTransfer)

    if (Number(amountToTransfer)) {
      let fee = 0;
      /*let {fee,gasLimit, gasPrice} = await this.getTransactionFee({
        amount: amountToTransfer,
        from: this.wallet.address,
        to: masterAddress
      });*/
      

      try {        

        let fromPrivateKey = await this.Tatum.generatePrivateKeyFromMnemonic(this.Tatum.Currency.TRON, this.testnet, mnemonic, 0);
        
        // const aa = await this.Tatum.sendCustodialWallet(this.testnet,{
        //   chain: "TRON",
        //   custodialAddress: this.wallet.address,
        //   tokenAddress: process.env.USDT_CONTRACT_ADDRESS,
        //   contractType: 0,
        //   recipient: masterAddress,
        //   amount: (amountToTransfer).toFixed(8).toString(),
        //   fromPrivateKey,
        //   feeLimit:100
        // })
        // console.log(aa)
        // return
        
        var body = JSON.stringify({
          chain: "TRON",
          custodialAddress: this.wallet.address,
          tokenAddress: process.env.USDT_CONTRACT_ADDRESS,
          contractType: 0,
          recipient: masterAddress,
          amount: (amountToTransfer).toFixed(8).toString(),
          fromPrivateKey,
          feeLimit:1000
        });

        var config = {
          method: 'post',
          url: TATUM_API + '/v3/blockchain/sc/custodial/transfer',
          headers: {
            'x-api-key': process.env.TATUM_API_KEY,
            'Content-Type': 'application/json'
          },
          data: body
        };

        let {data} = await axios(config);
        res = data;

        total_success_deposit = 0;
        last_tatum_balance = 0;

        is_unspent = false;        

        console.log(`deposit of ${Number(amountToTransfer).toFixed(8)} from ${this.wallet.address} was successfull`)

      } catch (error) {
        console.log(error)
        reason = error.message;
        console.error("error occurred whill depositing asset to master address for wallet with id ", this.wallet.id, " currency ", this.wallet.currency)

      }

      // let txId = res?.data && res?.data?.txId ? res?.data?.txId : null;
      console.log(res)
      let { id = null, txId = null, completed = null } = res;

      let date = new Date();
      date.setMinutes(date.getMinutes() + 20);
      this.wallet.next_check_deposit_date = date
      this.wallet.total_success_deposit = Number(total_success_deposit)
      this.wallet.last_tatum_balance = Number(last_tatum_balance);
      if(txId){
        this.wallet.last_trx = txId;
      }

      await this.wallet.save()

      if (newDepositamount) {

        let transaction = await this.wallet.createTransaction({
          quantity: Number(newDepositamount),
          type: TRANSACTION_TYPES.CREDIT,
          status: TRANSACTION_STATUS.ACTIVE,
          reason: TRANSACTION_REASON.DEPOSIT,
          metadata: { txId }
        })

        if (is_unspent == true) {
          await Unspendwalletbalances.create({
            wallet_id: this.wallet.id,
            user_id: this.wallet.user_id,
            unspend_amount: Number(amountToTransfer),
            new_amount: Number(newDepositamount),
            chain_balance: Number(chainBalance),
            estimated_fee: Number(fee),
            reason,
          })
        }

        await this.wallet.updateBalance()
        depositEmitFunc(user_id, "USDT");

        return transaction
      }

    }

    return { status: "success" }
  }

  // async checkAndTransferToMasterAddress() {

    
  //   let last_txn = this.wallet.last_trx;
  //   if(last_txn){
  //     // console.log('need calculation');
  //     // return false
  //     let checkStatus = await this.Tatum.ethGetTransaction(last_txn);
  //     if(checkStatus?.status){
  //       this.wallet.last_trx = null;
  //       await this.wallet.save()
  //     }else{
  //       console.log(`Last transaction not completed: ${last_txn}`);
  //       return false
  //     }
  //   }


  //   const wallet = this?.wallet;
  //   const user_id = wallet.dataValues.user_id;
  //   console.log("io     USDT  =======", user_id);
  //   const depositEventFile = await require("../deposit.event");
  //   const { depositEmitFunc } = depositEventFile;


  //   let { mnemonic, signatureId, masterAddress } = await this.getWalletKeys()
  //   // let {availableBalance} = await this.Tatum.getAccountBalance(this.wallet.tatum_account_id);
  //   // console.log("availableBalance ETH: ",availableBalance);

  //   let { balance } = await this.Tatum.ethGetAccountErc20Address(this.wallet.address, process.env.USDT_CONTRACT_ADDRESS);
  //   let availableBalance = balance && balance > 0 ? (balance / Math.pow(10, process.env.USDT_DIGITS)) : 0.00;
  //   console.log("availableBalanceUSDT: ", availableBalance);
  //   console.log("last_tatum_balance: ", this.wallet.last_tatum_balance);

  //   if (!masterAddress) {
  //     throw new Error(`there is no master address for ${this.wallet.currency}`)
  //   }

  //   // track new deposit from users
  //   // let newDepositamount =  availableBalance
  //   let newDepositamount = Number(availableBalance) - (this.wallet.last_tatum_balance || 0)

  //   // track amount successfully transfered
  //   // let amountToTransfer =  availableBalance
  //   let amountToTransfer = Number(availableBalance) - (this.wallet.total_success_deposit + this.wallet.total_fee_pay + this.wallet.total_token_fee_pay)
  //   let res = {}

  //   let is_unspent = true;

  //   const getChainBalance = await this.Tatum.ethGetAccountBalance(this.wallet.address);
  //   const chainBalance = getChainBalance.balance;

  //   let last_tatum_balance = availableBalance;
  //   let total_success_deposit = this.wallet.total_success_deposit;
  //   let reason = null;

  //   console.log("newDepositamount: ",newDepositamount)
  //   console.log("amountToTransfer: ",amountToTransfer)

  //   // return false
  //   if (Number(amountToTransfer)) {
  //     let {fee,gasLimit, gasPrice} = await this.getTransactionFee({
  //       amount: amountToTransfer,
  //       from: this.wallet.address,
  //       to: masterAddress
  //     });
      

  //     try {
  //       // throw new Error(`there is no master address for ${this.wallet.currency}`)


  //       // if (fee > chainBalance) {
  //       //   console.log(`Chain has not enough fees`)
  //       // }
  //       // if (fee > chainBalance) {
  //       //   throw new Error("amountToTransfer not enough for transaction fee");
  //       // }
        

  //       let fromPrivateKey = await this.Tatum.generatePrivateKeyFromMnemonic(this.wallet.currency, this.testnet, mnemonic, 0)
        
  //       var body = JSON.stringify({
  //         chain: "ETH",
  //         custodialAddress: this.wallet.address,
  //         tokenAddress: process.env.USDT_CONTRACT_ADDRESS,
  //         contractType: 0,
  //         recipient: masterAddress,
  //         amount: (amountToTransfer).toFixed(8).toString(),
  //         fromPrivateKey,
  //         // fee: {
  //         //   gasLimit: (gasLimit).toString(),
  //         //   gasPrice: (gasPrice).toFixed(8).toString()
  //         // } // Don't add fee object, It will not work
  //       });

  //       var config = {
  //         method: 'post',
  //         url: TATUM_API + '/v3/blockchain/sc/custodial/transfer',
  //         headers: {
  //           'x-api-key': process.env.TATUM_API_KEY,
  //           'Content-Type': 'application/json'
  //         },
  //         data: body
  //       };

  //       let {data} = await axios(config);
  //       res = data;
        

  //       /*let privateKey = await this.Tatum.generatePrivateKeyFromMnemonic(this.Tatum.Currency.ETH, this.testnet, mnemonic, this.wallet.derivation_key)

  //       var body = JSON.stringify({
  //         "chain": "ETH",
  //         "to": masterAddress,
  //         "amount": (amountToTransfer).toFixed(8).toString(),
  //         "contractAddress": process.env.USDT_CONTRACT_ADDRESS,
  //         "digits": Number(process.env.USDT_DIGITS),
  //         "fromPrivateKey": privateKey,
  //         "fee":{
  //           gasLimit: (gasLimit).toString(),
  //           gasPrice: (gasPrice).toFixed(8).toString()
  //         }
  //       });

  //       var config = {
  //         method: 'post',
  //         url: TATUM_API + '/v3/blockchain/token/transaction',
  //         headers: {
  //           'x-api-key': process.env.TATUM_API_KEY,
  //           'Content-Type': 'application/json'
  //         },
  //         data: body
  //       };

  //       res = await axios(config);*/

  //       total_success_deposit = 0;
  //       last_tatum_balance = 0;

  //       is_unspent = false;

  //       // to save token fees in eth
  //       /*let dateEth = new Date();
  //       dateEth.setMinutes(dateEth.getMinutes() + 20);
  //       let getEthWallet = await Wallet.findOne({
  //         where: {
  //           user_id,
  //           currency: "ETH"
  //         }
  //       });
  //       getEthWallet.total_token_fee_pay = Number(getEthWallet.total_token_fee_pay + fee).toFixed(8);        
  //       getEthWallet.next_check_deposit_date = dateEth
  //       await getEthWallet.save();*/

  //       console.log(`deposit of ${Number(amountToTransfer).toFixed(8)} from ${this.wallet.address} was successfull`)


  //     } catch (error) {
  //       console.log(error)
  //       reason = error.message;
  //       console.error("error occurred whill depositing asset to master address for wallet with id ", this.wallet.id, " currency ", this.wallet.currency)

  //     }

  //     // let txId = res?.data && res?.data?.txId ? res?.data?.txId : null;
  //     console.log(res)
  //     let { id = null, txId = null, completed = null } = res;

  //     let date = new Date();
  //     date.setMinutes(date.getMinutes() + 20);
  //     this.wallet.next_check_deposit_date = date
  //     this.wallet.total_success_deposit = Number(total_success_deposit)
  //     this.wallet.last_tatum_balance = Number(last_tatum_balance);
  //     if(txId){
  //       this.wallet.last_trx = txId;
  //     }

  //     await this.wallet.save()

  //     if (newDepositamount) {

  //       let transaction = await this.wallet.createTransaction({
  //         quantity: Number(newDepositamount),
  //         type: TRANSACTION_TYPES.CREDIT,
  //         status: TRANSACTION_STATUS.ACTIVE,
  //         reason: TRANSACTION_REASON.DEPOSIT,
  //         metadata: { txId }
  //       })

  //       if (is_unspent == true) {
  //         await Unspendwalletbalances.create({
  //           wallet_id: this.wallet.id,
  //           user_id: this.wallet.user_id,
  //           unspend_amount: Number(amountToTransfer),
  //           new_amount: Number(newDepositamount),
  //           chain_balance: Number(chainBalance),
  //           estimated_fee: Number(fee),
  //           reason,
  //         })
  //       }

  //       await this.wallet.updateBalance()
  //       depositEmitFunc(user_id, "USDT");

  //       return transaction
  //     }

  //   }

  //   return { status: "success" }
  // }

  /* */



  /**
   *
   * @returns {Promise<Any>} address
   */
  async withdrawToAddress({ amount, address }) {
    let res = {}
    let { mnemonic, signatureId, masterAddress, testnet } = await this.getWalletKeys()
    this.wallet = await this.wallet.updateBalance()

    if (!masterAddress) {
      throw new Error(`there is no master address for ${this.wallet.currency}`)
    }



    return this.sequelize.transaction(async (t) => {
      let privateKey = await this.Tatum.generatePrivateKeyFromMnemonic(this.Tatum.Currency.TRON, testnet, mnemonic, 0);

      res = await tatum.sendTronTrc20Transaction(testnet, {
        fromPrivateKey: privateKey,
        tokenAddress: process.env.USDT_CONTRACT_ADDRESS,
        to: address,
        amount: (amount).toFixed(8).toString(),
        feeLimit: 1000
      })
      
      /*var body = JSON.stringify({
        "chain": "ETH",
        "to": address,
        "amount": (amount).toFixed(8).toString(),
        "contractAddress": process.env.USDT_CONTRACT_ADDRESS,
        "digits": Number(process.env.USDT_DIGITS),
        "fromPrivateKey": privateKey,
      });
      var config = {
        method: 'post',
        url: TATUM_API + '/v3/blockchain/token/transaction',
        headers: {
          'x-api-key': process.env.TATUM_API_KEY,
          'Content-Type': 'application/json'
        },
        data: body
      };
      res = await axios(config);*/

      let txId = res?.data && res?.data?.txId ? res?.data?.txId : null;

      let transaction = await this.wallet.createTransaction({
        quantity: parseFloat(Number(amount).toFixed(8)),
        type: TRANSACTION_TYPES.DEBIT,
        status: TRANSACTION_STATUS.ACTIVE,
        reason: TRANSACTION_REASON.WITHDRAWAL,
        metadata: { txId }
      }, { transaction: t })


      let ref = uuidv4();
      let chargeWallets = (await this.wallet.getWalletsForTransactionFee({ amount })) || {};
      const fee_charge = (chargeWallets.WITHDRAWAL && chargeWallets.WITHDRAWAL.fee) ? chargeWallets.WITHDRAWAL.fee : 0;
      if (fee_charge > 0) {
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
      return transaction

    })

  }


  async MasterToManagerAddress(key, payload) {

    let { mnemonic, signatureId, masterAddress, testnet } = key;
    
    let { balance } = await tatum.tronGetAccount(masterAddress);
    let TRON_Balance = balance && balance > 0 ? (balance / Math.pow(10, process.env.TRON_DIGITS)) : 0.00;
    
    let res = {}
    // let amountToTransfer = "0.0001";
    console.log("TRON_Balance   : ", TRON_Balance);
    let amountToTransfer = payload?.amount;

    try {     

      if (amountToTransfer > TRON_Balance) {
        return boom.badRequest("insufficient balance.");
      } else {
        let privateKey = await tatum.generatePrivateKeyFromMnemonic(this.Tatum.Currency.TRON, testnet, mnemonic, 0)
        // console.log("privateKey     : ", privateKey)
        // console.log("amount ", (amountToTransfer).toFixed(8))

        res = await tatum.sendTronTrc20Transaction(testnet, {
          fromPrivateKey: privateKey,
          tokenAddress: process.env.USDT_CONTRACT_ADDRESS,
          to: payload?.to,
          amount: (amountToTransfer).toFixed(8).toString(),
          feeLimit: 1000
        })
        
        /*var body = JSON.stringify({
          "chain": "ETH",
          "to": payload?.to,
          "amount": (amountToTransfer).toFixed(8).toString(),
          "contractAddress": process.env.USDT_CONTRACT_ADDRESS,
          "digits": Number(process.env.USDT_DIGITS),
          "fromPrivateKey": privateKey,
        });
        var config = {
          method: 'post',
          url: TATUM_API + '/v3/blockchain/token/transaction',
          headers: {
            'x-api-key': process.env.TATUM_API_KEY,
            'Content-Type': 'application/json'
          },
          data: body
        };
        res = await axios(config);*/
        
        console.log(res);
        let txId = res?.data && res?.data?.txId ? res?.data?.txId : null;

        const object = await ManagerTransaction.create({
          address: payload?.to,
          crypto: payload?.currency,
          quantity: Number(amountToTransfer),
          type: TRANSACTION_TYPES.DEBIT,
          status: TRANSACTION_STATUS.ACTIVE,
          reason: TRANSACTION_REASON.MANAGER_WITHDRAWAL,
          metadata: { txId }
        });
        
        return { status: "success", data: object }
      }


    } catch (err) {
      console.log(err);
      throw boom.badData(err.message, err);
    }


    // return { status: "success" }
  }


}

module.exports = USDTWallet;
