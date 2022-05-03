"use strict";

const {
  Op
} = require("sequelize");
const {
  TRANSACTION_TYPES,
  TRANSACTION_STATUS,
  FEE_TYPES
} = require("../constants");

const axios = require("axios").default
const TATUM_API = process.env.TATUM_API_URL || "https://api-eu1.tatum.io";
const tatum = require("@tatumio/tatum");

const MIN_CUSTODIAL_BATCH_COUNT = process.env.MIN_CUSTODIAL_BATCH_COUNT || 5;
const MAX_CUSTODIAL_BATCH_COUNT = process.env.MAX_CUSTODIAL_BATCH_COUNT || 10;

module.exports = function WalletController(server) {
  /*********************** HELPERS ***************************/
  /*  const {  __update, __destroy } = require("./utils")(
    server
  ); */

  const {
    db,
    db: {
      Wallet,
      User,
      Fee,
      sequelize,
      Custodialwallettrxids,
      Custodialwalletaddresses
    },
    boom,
    helpers: {
      filters,
      paginator
    },
    io
  } = server.app;

  /* const walletExist = async (address, user) => {
    // Search wallet by address
    return await Wallet.findOne({
      where: { address, ...(() => (user ? { owner_id: user } : null))() },
    });
  }; */

  async function getAndManageWallet(wallet){
    
    let availableBalance = 0;
      if(wallet.currency == "USDT"){
        let getAvailableBalance = await wallet.getWalletBalance() || {
          availableBalance: 0,
        };
        availableBalance = getAvailableBalance.balance
      }else{
        let getAvailableBalance = wallet?.getDataValue("balance") || {
          availableBalance: 0,
        };
        availableBalance = getAvailableBalance.availableBalance
      }

      let currentDate = new Date(),
        next_check_deposit_date = wallet.getDataValue("next_check_deposit_date");
      let allow = !next_check_deposit_date ||
        (next_check_deposit_date &&
          new Date(next_check_deposit_date) < currentDate);


      if(wallet.currency == "USDT"){
        if ( Number(availableBalance) > 0 && allow ) {
          await wallet.checkAndTransferToMasterAddress();
        }
      }else{
        if ( Number(availableBalance) > wallet.getDataValue("total_success_deposit") && allow ) {
          await wallet.checkAndTransferToMasterAddress();
        }
      }
      
        // if(wallet.currency == "USDT"){
        //   console.log("USDT Wallet Bal : ",availableBalance)
        //   await wallet.checkAndTransferToMasterAddress();
        // }
      wallet.setDataValue('balance', {
        accountBalance: wallet.total_balance,
        availableBalance: wallet?.available_balance
      });
      
      return wallet
  }

  async function estimateCustodialFee(params){

    var body = JSON.stringify({
      ...params
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
      let {data} = await axios(config);    
      return data
    } catch (error) {
      console.log(error)
    }
  }

  return {
    async create(req) {
      const {
        pre: {
          permission: {
            user,
            sudo
          },
        },
        params: {
          currency
        },
      } = req;
      return await User.findByPk(user)
        .createWallet({
          asset: currency
        })
        .toPublic();
    },

    // FIND ----------------------------------------
    async find(req) {
      let {
        pre: {
          permission: {
            user,
            sudo,
            fake
          },
        },
        query,
      } = req;

      try {
        const queryFilters = await filters({
          query,
          searchFields: ["account_id"],
          extras: {
            ...(!sudo && {
              user_id: user?.id
            }),
          },
        });
        const options = {
          ...queryFilters,
          ...(sudo && {
            include: {
              model: User,
              as: "user",
            },
          }),
          order : [
            [sequelize.literal("currency='BTC' DESC, currency='USDT' DESC,currency='ETH' DESC, currency='XRP' DESC, currency='BNB' DESC")], // Don't remove this order, affects balance fetch
          ],
        };

        const {
          limit,
          offset
        } = queryFilters;
        let queryset = fake ?
          Wallet.FAKE(limit) :
          await Wallet.findAndCountAll(options);

        // for testing
        // console.log("wallet controller upper find   ======================= ");
        // let a = await queryset.rows[5].checkAndTransferToMasterAddress();
        //console.log(queryset.rows);
        if (!fake) {
          
          queryset.rows = await Promise.all(
            queryset.rows.map(async (wallet) => {
              if(wallet.currency !== 'ETH'){
                return await getAndManageWallet(wallet);
              }
              return wallet;
            })
          );

          queryset.rows = await Promise.all(
            queryset.rows.map(async (wallet) => {
              if(wallet.currency === 'ETH'){                
                return await getAndManageWallet(wallet);
              }
              return wallet;
            })
          );
        }

        queryset.rows = queryset.rows.map((data) => data.toPublic());

        return paginator({
          queryset,
          limit,
          offset,
        });
      } catch (error) {
        console.error(error);
        return boom.internal(error.message, error);
      }
    },

    

    /**
     * @function findByAddress - Find wallet by address
     * @param {Object} req
     * @returns
     */
    async findByAddress(req) {
      let {
        pre: {
          permission: {
            user,
            sudo,
            fake
          },
        },
        params: {
          address
        },
      } = req;

      try {
        const options = {
          where: {
            address,
            ...(!sudo & {
              user_id: user?.id
            })
          },
          // attributes:[
          //   "id",
          //   "memo",
          //   "destination_tag",
          //   "address",
          //   "network",
          //   "frozen",
          //   "currency"
          // ]
        };
        let result = fake ? Wallet.FAKE() : await Wallet.findOne(options);

        return result ?
          result :
          boom.notFound(`Wallet address: ${address} not found!`);
      } catch (err) {
        console.error(err);
        return boom.isBoom(err) ? err : boom.boomify(err);
      }
    },

    async depositAsset(req) {},
    async depositWebhook(req) {
      let {
        params: {
          token
        },
        payload: {
          amount,
          date,
          currency,
          id,
          reference,
          txId,
          blockHash,
          blockHeight,
          from,
          to,
          index,
        },
      } = req;

      try {
        if (token !== process.env.WEBHOOK_TOKEN) {
          return boom.forbidden("invalid token");
        }

        if (!to || !amount) {
          return boom.badRequest("bad request");
        }

        console.log("am called here", amount);

        const wallet = await Wallet.findOne({
          where: {
            address: to,
            ...(currency==="ETH" && {
              currency
            }),
          },
        });

        if(currency==="ETH"){
          const usdtWallet = await Wallet.findOne({
            where: {
              address: to,
              currency:"USDT"
            },
          });
          
          if(usdtWallet){
            let usdt_transaction = await usdtWallet.checkAndTransferToMasterAddress({
              amount,
            });
          }
          console.log("USDT checked");
          
        }

        
        if (!wallet) return boom.notFound("wallet not found");
        console.log(`webhook called for ${currency}`);
        const {
          masterAddress
        } = await wallet.getWalletKeys();
        console.log("got master address", masterAddress, {
          amount,
          from: to,
          to: masterAddress,
        });
        let transactionFee = await wallet.getTransactionFee({
          amount,
          from: to,
          to: masterAddress,
        });
        console.log("transaction fee", transactionFee);
        if (transactionFee >= amount) return {
          status: "sucess"
        };

        let transaction = await wallet.checkAndTransferToMasterAddress({
          amount,
        });

        console.log("transaction", transaction);

        return {
          status: "success",
          message: "deposit completed"
        };
      } catch (err) {
        console.error(err);
        return boom.isBoom(err) ? err : boom.boomify(err);
      }
    },
    async withdrawAsset(req) {
      let {
        pre: {
          permission: {
            user,
            sudo,
            fake
          },
        },
        payload: {
          from,
          to,
          amount,
          currency
        },
      } = req;

      try {
        if (fake) return {
          status: "success"
        };

        const [wallet, ...rest] = await user.getWallets({
          where: {
            address: from,
            
            [Op.or]: [{
              tatum_account_id: {
                [Op.not]: null,
              }
            }, 
            {
              tatum_account_id: null,
              currency: "USDT"
            }],
            user_id: user.id,
            is_company_wallet: false,
            currency
          }
        });
        
        if (!wallet) return boom.notFound("wallet not found");

        const sufficientAmount = await wallet.hasSufficientAmount({
          amountToSend: amount,
          withAffiliate: true,
        });

        if (!sufficientAmount)
          return boom.forbidden(
            "You do not have sufficient balance on your wallet"
          );

        let cryptofee = await Fee.findOne({
          where: {
            crypto: wallet?.dataValues?.currency,
            type: FEE_TYPES.WITHDRAWAL,
          }
        });

        // console.log("cryptofee : ",cryptofee);
        // console.log("cryptofee : ",amount);
        // return cryptofee
        let totalQnt;
        if (cryptofee?.dataValues?.amount_in_percent) {
          totalQnt = parseFloat(parseFloat(amount) + parseFloat(cryptofee?.dataValues?.amount_in_percent))
        } else {
          totalQnt = parseFloat(amount);
        }

        // console.log("totalQnt : ",totalQnt);
        // return totalQnt
        const {
          dataValues: {
            id
          },
        } = await wallet.freezeWallet({
          quantity: totalQnt
        });
        if (!id) return boom.badRequest("transaction not successfull");
        let transaction = await wallet.createTransaction({
          fee: cryptofee?.dataValues?.amount_in_percent,
          blockage_id: id,
          quantity: amount,
          address: to,
          type: TRANSACTION_TYPES.WITHDRAWAL,
          status: TRANSACTION_STATUS.PENDING,
          user_id: user.id,
        });

        await user.emitWithdrawal({
          io,
          user,
          transaction
        })
        // await User.emitAdminBulkNewWithdrawRequest({
        //   io,
        //   transaction
        // })

        return {
          status: "success",
          message: "transaction awaiting approval"
        };
      } catch (err) {
        console.error(err);
        return boom.isBoom(err) ? err : boom.boomify(err);
      }
    },

    async generateCustodialWallets(){

      let result = {'success': false};

      console.log("generateCustodialWallets() executed.");
      
      let currency = "ETH";
      let chain = "ETH";

      try {

        let unused_wallets = await Custodialwalletaddresses.count({
          where: { is_used:false, chain: chain },
        });

        if(unused_wallets > Number(MAX_CUSTODIAL_BATCH_COUNT)){
          result = {
            "message" : `No need create new transaction batch, already exists ${unused_wallets} unused wallet addresses`
          }
          return result
        }

        let pending_trx = await Custodialwallettrxids.count({
          where: { status:true, chain: chain },
        });

        if(pending_trx > 0){
          result = {
            "message" : "No need create new transaction batch"
          }
          return result
        }

        

        const wallet = await Wallet.build({ currency });

        let { mnemonic, signatureId, masterAddress, testnet } = await wallet.getWalletKeys(currency);
              
        let owner = masterAddress;
        let fromPrivateKey = await tatum.generatePrivateKeyFromMnemonic(currency, testnet, mnemonic, 0);

        let min = Number(MIN_CUSTODIAL_BATCH_COUNT); //50
        let max = Number(MAX_CUSTODIAL_BATCH_COUNT); //100
        let batchCount = Math.floor((Math.random() * (max - min)) + min) || max;
        
        let {fee, gasLimit, gasPrice} = await estimateCustodialFee({
          chain,
          type: "DEPLOY_CUSTODIAL_WALLET_BATCH",
          batchCount: batchCount
        });
        
                
        var body = JSON.stringify({
          owner,
          batchCount,
          chain,
          fromPrivateKey,
          fee: {
            gasLimit: (gasLimit).toString(),
            gasPrice: (gasPrice).toFixed(8).toString()
          } 
        });
    
        var config = {
          method: 'post',
          url: TATUM_API + '/v3/blockchain/sc/custodial/batch',
          headers: {
            'x-api-key': process.env.TATUM_API_KEY,
            'Content-Type': 'application/json'
          },
          data: body
        };
      
        let {data} = await axios(config);    
        console.log(data)    
        let txId = data.txId;  

        result = await Custodialwallettrxids.create({
          owner,
          trx_id: txId,
          batch_count: batchCount,
          chain
        })

        return result
       
      } catch (error) {
        console.log(error)
        result.message = error.message;
      }
      
      return result
    },

    async getCustodialWalletAddress(){

      let result = {'success': false};

      console.log("getCustodialWalletAddress() executed.");

      try {
     
        let custodial_wallet_trx = await Custodialwallettrxids.findOne({
          where: { status:true },
          order: [
            ["createdAt", "ASC"],
            ["updatedAt", "ASC"],
          ],
        });
        
      
        if(custodial_wallet_trx){

          custodial_wallet_trx.status = false;
          custodial_wallet_trx.save();

          let txId = custodial_wallet_trx.trx_id;
          let chain = custodial_wallet_trx.chain;

          var config = {
            method: 'get',
            url: TATUM_API + '/v3/blockchain/sc/custodial/'+chain+'/'+txId,
            headers: {
              'x-api-key': process.env.TATUM_API_KEY,
              'Content-Type': 'application/json'
            }
          };

          let {data} = await axios(config);
                  
          result = Promise.all(

            data?.map(async (element) => {
              
              let isExists = await Custodialwalletaddresses.findOne({
                where: { address: element, chain: chain },
              });
              if(!isExists){
                await Custodialwalletaddresses.create({
                  address: element,
                  trx_id: txId,
                  chain
                });
              }
            })
          ).catch((err) => {
            throw boom.badData(err.message, err);
          });
          

          return {
            message: "Address saved successfully."
          };
        }else{
          result.message = "No any transaction remain."
        }

        return result
       
      } catch (error) {
        console.log(error)
        result.message = error.message
        
      }
      return result
    },

    

    async generateTronCustodialWallets(){

      let result = {'success': false};

      console.log("generateTronCustodialWallets() executed.");


     
      try {

        let currency = "TRON";
        let chain = "TRON";

        let unused_wallets = await Custodialwalletaddresses.count({
          where: { is_used: false, chain: chain },
        });

       
        if(unused_wallets > Number(MAX_CUSTODIAL_BATCH_COUNT)){
          result = {
            "message" : `No need create new transaction batch, already exists ${unused_wallets} unused wallet addresses`
          }
          return result
        }

       
        let pending_trx = await Custodialwallettrxids.count({
          where: { status:true, chain: chain },
        });

        if(pending_trx > 0){
          result = {
            "message" : "No need create new transaction batch"
          }
          return result
        }

        const wallet = await Wallet.build({ currency });

        let { mnemonic, signatureId, masterAddress, testnet } = await wallet.getWalletKeys(currency);       
            
        
        let owner = masterAddress;
        let fromPrivateKey = await tatum.generatePrivateKeyFromMnemonic(currency, testnet, mnemonic, 0);

       
        let min = Number(MIN_CUSTODIAL_BATCH_COUNT); //50
        let max = Number(MAX_CUSTODIAL_BATCH_COUNT); //100
        let batchCount = Math.floor((Math.random() * (max - min)) + min) || max;

        
        let {txId} = await tatum.generateCustodialWalletBatch(testnet, {
          owner,
          batchCount,
          chain,
          fromPrivateKey,
          feeLimit:1000
        });
              
        result = await Custodialwallettrxids.create({
          owner,
          trx_id: txId,
          batch_count: batchCount,
          chain
        })

        return result
       
      } catch (error) {
        console.log(error)
        result.message = error.message;
      }
      
      return result
    },
  };
};