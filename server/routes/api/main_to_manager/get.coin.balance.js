"use strict";
const qs = require("qs");
const axios = require("axios");
const tatum = require("@tatumio/tatum");
const $PATH = require("path");
const $KEYS_BACKUP_DIRNAME = ".cointc_keys";

const $KEYS_DIR = $PATH.join(
  process.env.KEYS_DIR ||
  $PATH.join(
    process.env.BACKUP_DIR ||
    $PATH.join(__dirname, "..", "..", "..", "..", "..", ".cointc_backup"),
    $KEYS_BACKUP_DIRNAME
  ),
  "keys.json"
);

let keys;
try {
  keys = require($KEYS_DIR);
} catch (err) {
  keys = {};
}

module.exports = (server) => {
  const {
    helpers: { config },
    boom,
  } = server.app;

  // console.log("coinbalance");
  return {
    method: "GET",
    path: "/coinbalance",
    config: {
      handler: async (req) => {
        try {
          const { query } = req;

          if(query?.crypto == "BTC"){
            let currenctKey = await keys[`${String(query?.crypto).toUpperCase()}`]
            let { mnemonic, signatureId, masterAddress } = currenctKey
            let balance  = await tatum.btcGetBalance(masterAddress)
            return { balance: (balance.incoming - balance.outgoing),masterAddress:masterAddress}
          }

          if(query?.crypto == "ETH"){
            let currenctKey = await keys[`${String(query?.crypto).toUpperCase()}`]
            let { mnemonic, signatureId, masterAddress } = currenctKey
            let balance  = await tatum.ethGetAccountBalance(masterAddress)
            // console.log(balance)
            return { balance: balance.balance,masterAddress:masterAddress}
          }

          if(query?.crypto == "XRP"){
            let currenctKey = await keys[`${String(query?.crypto).toUpperCase()}`]
            let { mnemonic, signatureId, masterAddress } = currenctKey
            // console.log(masterAddress);
            let getbalance  = await tatum.xrpGetAccountBalance(masterAddress);
            let balance = getbalance?.balance && getbalance?.balance > 0 ? (getbalance.balance/1000000) : 0.00;
            // console.log(balance)
            return { balance: balance,masterAddress:masterAddress}
          }

          if(query?.crypto == "USDT"){ 

            let currenctKey = await keys[`${String(query?.crypto).toUpperCase()}`]
            let { mnemonic, signatureId, masterAddress } = currenctKey

            let {trc20} = await tatum.tronGetAccount(masterAddress);
            
            let balance = 0;
            trc20 && trc20.map((val) => {
              for (const [key, value] of Object.entries(val)) {
                if(key == process.env.USDT_CONTRACT_ADDRESS){
                  balance = value /  Math.pow(10, process.env.USDT_DIGITS)
                }
              }
            });

            return { balance: balance,masterAddress:masterAddress}

            /*            
            let currenctKey = await keys[`${String(query?.crypto).toUpperCase()}`]
            let { mnemonic, signatureId, masterAddress } = currenctKey
            // let balance  = await tatum.ethGetAccountBalance(masterAddress)
            let getbalance  = await  tatum.ethGetAccountErc20Address(masterAddress, process.env.USDT_CONTRACT_ADDRESS);
            let balance = getbalance?.balance && getbalance?.balance > 0 ? (getbalance?.balance/Math.pow(10, process.env.USDT_DIGITS)) : 0.00;
            console.log(balance)
            return { balance: balance,masterAddress:masterAddress}*/
          }

          if(query?.crypto == "BNB"){
            // let currenctKey = await keys[`${String(query?.crypto).toUpperCase()}`]
            // let { mnemonic, signatureId, masterAddress } = currenctKey
            // console.log(masterAddress);
            // let balance  = await tatum.bnbGetAccount(masterAddress)
            // console.log(balance)
            // return { balance: balance.balance,masterAddress:masterAddress}

            let currenctKey = await keys[`${String(query?.crypto).toUpperCase()}`]
            let { mnemonic, signatureId, masterAddress } = currenctKey
            // console.log(masterAddress);
            let balance  = await tatum.bscGetAccountBalance(masterAddress)
            // console.log(balance)
            return { balance: balance.balance,masterAddress:masterAddress}
          }

         
        } catch (err) {
          console.error(err)
          return boom.isBoom() ? err : boom.boomify(err);
        }
      },
    },
  };
};
