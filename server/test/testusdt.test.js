const config = require("dotenv").config({
    path: "../../.env",
  });
  if (config.error) {
    throw config.error;
  }
  const axios = require("axios").default
  const tatum = require("@tatumio/tatum")

  async function generateWallet() {
      let res = await tatum.generateWallet(tatum.Currency.USDT,false)
      console.log(res)
  }

//   generateWallet()

let wallet = {
    xpub: 'xpub6FBJyD5iYHzbCSYNFkf5kA1Gz2jJ4baWhsckym52pSJtXNJGL9FLSDf5dH8LqCFMq5HNYCCKM1S3r5WkMoZWpHH4Z1NL2Dmbzp9fvWkMsfA',
    mnemonic: 'enroll huge bag damp point poet fee child inner six wonder oyster great grit chaos clog east celery citizen apart swallow medal deny kidney'
  }
let ethAddress = "0x2f20d0c1dd1def31a8294c6c9ee1045e35eb7d80"

let usdtAccount = {
    currency: 'USDT',
    active: true,
    balance: { accountBalance: '0', availableBalance: '0' },
    frozen: false,
    accountingCurrency: 'USD',
    id: '61ba14d2e065bb78ac76ae7a'
  }
let usdtAccountWithAddress = {
    address: '0x2f20d0c1dd1def31a8294c6c9ee1045e35eb7d80',
    currency: 'USDT'
  }

async function generateAddress() {
    try {
        let res = await tatum.generateAddressFromXPub(tatum.Currency.ETH,false,wallet.xpub)
        console.log(res)
    } catch (error) {
        console.error(error)
    }
}


// generateAddress()

async function createAccount() {
    try{
      const res = await tatum.createAccount({
        currency:"USDT",
        accountingCurrency:"USD"

      })
    
      console.log(res)
  
    }catch(e){
      console.error(e)
    }
    
  }
  
// createAccount()

async function linkAccountToAddress(){
    let res = await tatum.assignDepositAddress(usdtAccount.id,ethAddress)
    console.log(res)
}

// linkAccountToAddress()


async function getUSDTAccount(){
    let res = await tatum.getAccountById(usdtAccount.id)
    console.log(res)
}

// getUSDTAccount().catch(console.error)

let usdtgetAccountData = {
    currency: 'USDT',
    active: true,
    balance: { accountBalance: '0', availableBalance: '0' },
    accountCode: null,
    accountNumber: null,
    frozen: false,
    accountingCurrency: 'USD',
    id: '61ba14d2e065bb78ac76ae7a'
  }
  