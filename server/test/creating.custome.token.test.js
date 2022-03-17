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

// async function generateETHWallet(){
//     let res = await tatum.generateAccount({currency:"ETH"},true,true)
//     console.log(res)

// }

// generateETHWallet()

// let ETHAccount = {
//     account: {
//       currency: 'ETH',
//       active: true,
//       balance: { accountBalance: '0', availableBalance: '0' },
//       frozen: false,
//       xpub: 'xpub6EXgbXWPWUDyGrZaQVBymhCn5xduz3Z6vW2az8QfXxHX2Xuo9aM6ZLgFkeuPvULprir7ckiXANUnvyo6xNcsd8bZ1Yjq2VUvCvQurMUJckQ',
//       accountingCurrency: 'EUR',
//       id: '61bba924ae07381130af7d85'
//     },
//     address: {
//       xpub: 'xpub6EXgbXWPWUDyGrZaQVBymhCn5xduz3Z6vW2az8QfXxHX2Xuo9aM6ZLgFkeuPvULprir7ckiXANUnvyo6xNcsd8bZ1Yjq2VUvCvQurMUJckQ',
//       derivationKey: 1,
//       address: '0xf1d816a0a0e2588eb56e773cc9405bbb78ff3615',
//       currency: 'ETH'
//     },
//     wallet: {
//       xpub: 'xpub6EXgbXWPWUDyGrZaQVBymhCn5xduz3Z6vW2az8QfXxHX2Xuo9aM6ZLgFkeuPvULprir7ckiXANUnvyo6xNcsd8bZ1Yjq2VUvCvQurMUJckQ',
//       mnemonic: 'this link nest raise charge squirrel world place short monitor kingdom expose moon derive until gold pencil mad satoshi cigar design truck prefer detect'
//     }
//   }

/**
 * @returns {Promise<{accountId:string,address:string}>}
 */
// async function createCustomToken() {
//       let body = {
//           symbol:"USDT",
//           supply:"100000",
//           description:"USDT Test token",
//           basePair:"USD",
//           decimals:18,
//           address:ETHAccount.address.address,
//       }

     
//       let {data} = await axios.post('https://api-eu1.tatum.io/v3/offchain/ethereum/erc20',body,{headers})
//       console.log(data)
//   }


// createCustomToken()

// let tatumAccountresponse =  {
//     accountId: '61bba9ca0f2afe0c7340baa1',
//     address: '0xf1d816a0a0e2588eb56e773cc9405bbb78ff3615'
// }


// async function getAccount() {
//     let res = await tatum.getAccountById(tatumAccountresponse.accountId)
//     console.log(res)
    
// }

// getAccount()

// async function connectToBlockChain(){
//     try {
//         let symbol = "USDT"
//         // tether contract address
//         let contractAddress = "0x687422eEA2cB73B5d3e242bA5456b782919AFc85"
//         let url = `https://api-eu1.tatum.io/v3/offchain/token/erc20/${symbol}/${contractAddress}`
//         let {data} = await axios.post(url,{},{headers})
//         console.log(data)
        
//     } catch (error) {
//         console.error(error)
//     }
// }

// connectToBlockChain()




async function createWallet() {
  let res = await tatum.generateAccount({currency:tatum.Currency.ETH},true,true)
  console.log(res)
}


// createWallet().catch(console.error)

let account  = {
  account: {
    currency: 'ETH',
    active: true,
    balance: { accountBalance: '0', availableBalance: '0' },
    frozen: false,
    xpub: 'xpub6ER7mrNaG1p89yomvbTMdFUtBH1ZLyD7LvtgD7iCXiMwNMR7vjPwNJf2NpQN9k4hMHFNiaogwexPaLBJk9ENTmPLsSqVcC3Ut3Ea9FQPRno',
    accountingCurrency: 'EUR',
    id: '61be3ddef3271d221e15c7ae'
  },
  address: {
    xpub: 'xpub6ER7mrNaG1p89yomvbTMdFUtBH1ZLyD7LvtgD7iCXiMwNMR7vjPwNJf2NpQN9k4hMHFNiaogwexPaLBJk9ENTmPLsSqVcC3Ut3Ea9FQPRno',
    derivationKey: 1,
    address: '0x18c20a060b55a9e85e78622332ae22f5fb419b7f',
    currency: 'ETH'
  },
  wallet: {
    xpub: 'xpub6ER7mrNaG1p89yomvbTMdFUtBH1ZLyD7LvtgD7iCXiMwNMR7vjPwNJf2NpQN9k4hMHFNiaogwexPaLBJk9ENTmPLsSqVcC3Ut3Ea9FQPRno',
    mnemonic: 'much ivory trim brush noble warrior region dinner capital work kid father round choice riot wealth space box mushroom solar spot true middle speak'
  }
}



async function generatePrivateKey() {
  let res = await tatum.generatePrivateKeyFromMnemonic(tatum.Currency.ETH,true,account.wallet.mnemonic,1)
  console.log("private key ",res)

}


// generatePrivateKey().catch(console.error)

let privateKey = "0xf720384ca9207d3ee5c53b3a477d697c9cc8d37a46b1bdf1679acd0bcf3b2381"


async function createCustomToken() {
      let body = {
          symbol:"USDT",
          chain:tatum.Currency.ETH,
          name:"CointTCUSDT",
          supply:"10000000",
          digits:18,
          address:account.address.address,
          fromPrivateKey:privateKey
          
      }

     
      let {data} = await axios.post('https://api-eu1.tatum.io/v3/blockchain/token/deploy',body,{headers})
      console.log(data)
  }


// createCustomToken().catch((error)=>{
  
//   console.error(JSON.stringify(error.response.data, null, 2))
// })


let transaction = {
  txId: '0xc294c2994d9c1e794be47fadcd6c49e1ad647385c18ab014dc849f3ee1eb87b7'
}



let contractAddress = "0x3477a13392523742f2f801f95f2a04ee58f1e46e"



// async function createAccountWithNewToken(){
//   let res = await tatum.generateAccount({
//     currency:tatum.Currency.USDT
//   })

//   console.log(res)

// }


// createAccountWithNewToken().catch(console.error)



// creating virtual currency in tatum
async function createVirtualCurrecy() {
  try {
    
    let url = 'https://api-eu1.tatum.io/v3/offchain/ethereum/erc20'
    const res = await axios.post(url,{
      symbol: "USDT",
      supply: "10000000",
      description: "Coin Tc Test USDT",
      basePair: "USD",
      decimals: 18,
      address: contractAddress
    },{
      headers
    })
  
    console.log(res)
  } catch (error) {
    console.error(error)
  }
  
  
}



// createVirtualCurrecy().catch(console.error)



async function getVirtualCurrency(token) {

    
    let url = 'https://api-eu1.tatum.io/v3/ledger/virtualCurrency/'+token
    const {data} = await axios.get(url,{headers})
  
    console.log(data)
  
}


getVirtualCurrency("USDT").catch(console.error)




async function getNewTokenTransaction(token) {

    
  let url = `https://api-eu1.tatum.io/v3/ethereum/transaction/${transaction.txId}`
  const {data} = await axios.get(url,{headers})

  console.log(data)

}



// getNewTokenTransaction().catch(console.error)


async function activateVirtualCurrency(token) {

  console.log(headers)
  let url = `https://api-eu1.tatum.io/v3/offchain/token/${token}/${account.address.address}`
  const {data} = await axios.post(url,{headers})

  console.log(data)

}


// activateVirtualCurrency("USDT").catch(console.error)



// tatum.getAccountById("61bba9ca0f2afe0c7340baa1").then(console.log).catch(console.error)

// {
//   name: 'USDT',
//   supply: '100000',
//   description: 'USDT Test token',
//   basePair: 'USD',
//   baseRate: 1,
//   accountId: '61bba9ca0f2afe0c7340baa1',
//   precision: 18,
//   chain: 'ETH',
//   initialAddress: '0xf1d816a0a0e2588eb56e773cc9405bbb78ff3615'
// }
// {
//   balance: { accountBalance: '100000', availableBalance: '0' },
//   active: true,
//   frozen: true,
//   currency: 'USDT',
//   xpub: null,
//   accountingCurrency: 'USD',
//   id: '61bba9ca0f2afe0c7340baa1'
// }




tatum.createAccount({
  currency:"USDT"
}).then(console.log).catch(console.error)





