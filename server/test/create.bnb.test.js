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

async function createBscWalletAndAccount(){
    let res = await tatum.generateAccount({
        currency:tatum.Currency.BSC
    },true,true)

    console.log(res)
}


createBscWalletAndAccount().catch(console.error)


let addressAndWallet = {
    account: {
      currency: 'BSC',
      active: true,
      balance: { accountBalance: '0', availableBalance: '0' },
      frozen: false,
      xpub: 'xpub6FGL9qbDrzh7rpQfb9gp7mJfq9GLyML24kCxi97G2nfqXWyXwiEATeqHcUHvZENWcsbgxHmtsH4qb226jnM3MiyGBsfpZUssVPpcXXpRGxD',
      accountingCurrency: 'EUR',
      id: '61c81fbd2b1b9f85f602c0c2'
    },
    address: {
      xpub: 'xpub6FGL9qbDrzh7rpQfb9gp7mJfq9GLyML24kCxi97G2nfqXWyXwiEATeqHcUHvZENWcsbgxHmtsH4qb226jnM3MiyGBsfpZUssVPpcXXpRGxD',
      derivationKey: 1,
      address: '0x294b3d2c10b3c44f40d2db7fde58640609ad186b',
      currency: 'BSC'
    },
    wallet: {
      xpub: 'xpub6FGL9qbDrzh7rpQfb9gp7mJfq9GLyML24kCxi97G2nfqXWyXwiEATeqHcUHvZENWcsbgxHmtsH4qb226jnM3MiyGBsfpZUssVPpcXXpRGxD',
      mnemonic: 'disagree liberty eternal protect ecology sibling fiction ugly cake camp kidney oven garbage galaxy doll belt august vanish family morning scatter swap spray innocent'
    }
  }




  tatum.bnb
