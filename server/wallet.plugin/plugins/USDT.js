const WalletInterface = require("../wallet.interface");
const ETHWallet = require("./ETH")
const {FEE_TYPES,TRANSACTION_TYPES,TRANSACTION_STATUS,TRANSACTION_REASON} = require("../../constants")
const tatum = require("@tatumio/tatum");
const serverFile = require("../../server");

const { v4: uuidv4 } = require("uuid");


let ManagerTransaction;
let boom;
serverFile.then((data) => {
  ManagerTransaction = data?.server?.HapiServer?.app.db.ManagerTransaction;
  boom = data?.server?.HapiServer?.app?.boom;
})

class USDTWallet extends ETHWallet {
  constructor() {
    super();
    this._name = "USDT";
    return this;
  }

  async getTransactionFee({amount,from,to}){
    let {gasLimit,gasPrice} = await this.Tatum.ethEstimateGas({
      amount:String(amount),
      from,
      to
    })
    
    let eth = (gasLimit *(gasPrice/1000000000)) / 1000000000
  // let gwei = (21000 *(10000000000)) / 1000000000
    
    return eth
  }

  
  /**
   *
   * @returns {Promsie<CreateTatumAccountResponse>}
   */
  async createTatumAccount() {
  

    let account = await this.Tatum.createAccount({
      currency:this.Tatum.Currency.USDT,
      accountingCurrency:this.Tatum.Fiat.USD,
    })

    await this.Tatum.assignDepositAddress(account.id,this.wallet.address)
    
  
    
    let address = {
      derivationKey:this.wallet.derivation_key,
      address:this.wallet.address
    }
    
    
    return { account,address };
  }



  /**
   *
   */
   async checkAndTransferToMasterAddress() {
    const wallet = this?.wallet;
    const user_id = wallet.dataValues.user_id;
    console.log("io     USDT  =======", user_id);
    const depositEventFile = await require("../deposit.event");
    const {depositEmitFunc} = depositEventFile;
    

    let {mnemonic,signatureId,masterAddress} = await this.getWalletKeys()
    let {availableBalance} = await this.Tatum.getAccountBalance(this.wallet.tatum_account_id)

    if(!masterAddress){
      throw new Error(`there is no master address for ${this.wallet.currency}`)
    }

    if(this.testnet){
      return {status:"success",message:"no transaction was for USDT IN TESTNET"}
    }
    
    // track new deposit from users
    let newDepositamount =  Number(availableBalance) -  (this.wallet.last_tatum_balance||0)

    // track amount successfully transfered
    let amountToTransfer =  Number(availableBalance) -  this.wallet.total_success_deposit
    let res = {}
    if(Number(amountToTransfer)){
      try{
        let fee = await this.getTransactionFee({
          amount:amountToTransfer,
          from:this.wallet.address,
          to:masterAddress
        })
        if(fee>amountToTransfer) throw new Error("amountToTransfer not enough for transaction fee")
        let privateKey = await this.Tatum.generatePrivateKeyFromMnemonic(this.Tatum.Currency.ETH,this.testnet,mnemonic,this.wallet.derivation_key)
        res = await this.Tatum.sendEthOrErc20Transaction(
          {
            
            amount:String(Number((amountToTransfer-fee)*0.95).toFixed(8)),
            to:masterAddress,
            currency:this.wallet.currency,
            from:this.wallet.address,
            ...(signatureId?{
              signatureId,
              index:this.wallet.derivation_key,
            }:{
              fromPrivateKey:privateKey
            })
          }
        )
        this.wallet.total_success_deposit = this.wallet.total_success_deposit + parseFloat(Number((amountToTransfer-fee)*0.95).toFixed(8))
        console.log(`deposit of ${Number((amountToTransfer-fee)*0.95).toFixed(8)} from ${this.wallet.address} was successfull`)
      }catch(error){
        console.error("error occurred whill depositing asset to master address for wallet with id ",this.wallet.id," currency ",this.wallet.currency)
      }
      let {id=null,txId=null,completed=null} = res

      let date = new Date();
        date.setMinutes(date.getMinutes() + 20);
        this.wallet.next_check_deposit_date = date
        this.wallet.last_tatum_balance = Number(availableBalance)
        await this.wallet.save()
        
                  
        if(newDepositamount){
          let transaction =  await this.wallet.createTransaction({
            quantity:Number(newDepositamount),
            type:TRANSACTION_TYPES.CREDIT,
            status:TRANSACTION_STATUS.ACTIVE,
            reason:TRANSACTION_REASON.DEPOSIT,
            metadata:{txId,completed}
          })
  
          await this.wallet.updateBalance()
          depositEmitFunc(user_id,"USDT");
  
          return transaction

        }

      

    }


    return {status:"success"}
  }



  /**
   *
   * @returns {Promise<Any>} address
   */
   async withdrawToAddress({amount,address}) {
     
    let {mnemonic,signatureId,masterAddress} = await this.getWalletKeys()
    this.wallet = await this.wallet.updateBalance()

    if(!masterAddress){
      throw new Error(`there is no master address for ${this.wallet.currency}`)
    }

    
  
    return this.sequelize.transaction(async (t)=>{
      let privateKey = await this.Tatum.generatePrivateKeyFromMnemonic(this.wallet.currency,this.testnet,mnemonic,0)
      let {id=null,txId=null,completed=null} = await this.Tatum.sendEthOrErc20Transaction(
        {
          amount:String(Number(amount).toFixed(8)),
          to:address,
          currency:this.wallet.currency,
          ...(signatureId?{
            signatureId
          }:{
            fromPrivateKey:privateKey,
            from:masterAddress,
            index:0,

          })
          
        }
      )

      let transaction =  await this.wallet.createTransaction({
        quantity:parseFloat(Number(amount).toFixed(8)),
        type:TRANSACTION_TYPES.DEBIT,
        status:TRANSACTION_STATUS.ACTIVE,
        reason:TRANSACTION_REASON.WITHDRAWAL,
        metadata:{txId,completed}
      },{transaction:t})


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
      return transaction

    })
 
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
        // throw new Error("amountToTransfer not enough for transaction fee")
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
          quantity: Number(amountToTransfer),
          type: TRANSACTION_TYPES.DEBIT,
          status: TRANSACTION_STATUS.ACTIVE,
          reason: TRANSACTION_REASON.WITHDRAWAL,
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


}

module.exports = USDTWallet;
