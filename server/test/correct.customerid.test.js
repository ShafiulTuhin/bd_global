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



/**
 * not solved
 */
async function main() {
    
    const res = await tatum.createAccount({
        currency:tatum.Currency.BTC,
        customer:{

        }
    })
    console.log("res",res)
}

// main().catch(console.error)