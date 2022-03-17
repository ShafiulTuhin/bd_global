const config = require("dotenv").config({
    path: "../../.env",
  });
  if (config.error) {
    throw config.error;
  }
const axios = require("axios").default
const tatum = require("@tatumio/tatum")
  
  console.log("begining")

let headers = {
    'x-api-key':process.env.TATUM_API_KEY,
    'Content-Type':'application/json'
}


async function generateToken(){
    await tatum.generateBscWallet()
}