"use strict";
const Tatum = require("@tatumio/tatum")
const boom = require("@hapi/boom")


module.exports = function TestController(server) {
  const {
    db: {
      User,
      Profile,
      Kyc,
      Wallet,
      sequelize,
      // Sequelize: { Op },
    },
    boom,
    config: { base_url },
    consts: { KYC_STATUSES, KYC_TYPES },
    helpers: {
      decrypt,
      jwt,
      generator,
      paginator,
      filters,
      encrypt,
      validateAndFilterAssociation,
    },
    mailer,
    io
  } = server.app;

  return {
    async sendOTP(req) {
      const {
        pre: {
         permission: { user },
        },
        payload: { email, phone },
      } = req;
      return {}
      return user.sendOTP({ email });
    },
    async wallet(req) {
      const {
        pre: {
          user: { user },
        },
        payload
        
      } = req;
      
      // return await user.createSupportedWallet()
      //  return await user.createWallet({
        //   currency:"USDT"
        // })
        
        // let user = await User.findByPk(payload.user_id)
        let room = user.getNotificationRoom()
     
        // io.send({message:"testing"})
        
        try {
          
          // return await Wallet.generateCompanyWallets()
        // return await user.verifyGoogleAuthenticator({user_id:"6d881208-d99a-4b17-bbc7-94a951995da0",token:"hhaggafa"})

        
        // let [wallet,...rest] = await user.getWallets({
        //   where:{
        //     currency:"BTC"
        //   }
        // })
        
        // let balance =  await wallet.getBalance()
        // let freeze =  await wallet.freezeWallet(20)
        // let unfreeze =  await wallet.unfreezeWallet()
        // let sufficient =  await wallet.hasSufficientAmount(20)

        // let chargesWallets = await wallet.getWalletsForTransactionFee(20)
        // let getTotalCharges = await  wallet.getTotalCharges(20)

        // return wallet
        return {}
      } catch (error) {
        console.debug(error)
        return boom.boomify(error)
      }
    },
  };
};
