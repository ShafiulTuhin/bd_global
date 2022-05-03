const config = require("dotenv").config({
  path: "../../.env",
});
if (config.error) {
  throw config.error;
}
const axios = require("axios").default
const tatum = require("@tatumio/tatum")

0.00204715

21000


async function getTransactionFee(){
  let {gasLimit,gasPrice} = await tatum.bscEstimateGas({
    amount:"0.003",
    from:"0xB71b214Cb885500844365E95CD9942C7276E7fD8",
    to:"0x7De4b38C09FACAd0e2C72a58696db31d935dAd8B"
  })

  console.log(res)

}


getTransactionFee().catch(console.error)