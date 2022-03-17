const tatum = require("@tatumio/tatum");
const commandLineArgs = require('command-line-args')
const fs = require("fs");
const path = require("path")
const axios = require("axios").default
console.log("cli start")
const config = require("dotenv").config({
    path: path.join(__dirname,"..","..",".env"),
});


if (config.error) {
    throw config.error;
}






const optionDefinitions = [
    // { name: 'model', alias: 'm', type: String,multiple: true,defaultValue: ["Wallet"] },
    // { name: 'backup',alias: 'b', type: String, defaultValue: path.join(__dirname,"..",".backup") },
    // { name: 'overwrite', alias: 'o', type: Boolean,defaultValue:true}
  ]

const options = commandLineArgs(optionDefinitions)

console.log(options)
// db.sequelize
// model-backup --filename=./ --model=User,Wallet --overwrite=true


// //--overwrite --

// console.log(process.argv[2])


// if (!fs.existsSync(options.backup)) {
//     fs.mkdirSync(options.backup);
// }
console.log("connecting to db")
const {Wallet} = require("../database/models");


class Sandbox{
    address="rGxg7QvHXe7aUYSXrZq9B4qTTa8ZEGcEDm"
    XRP_data = {
        address: 'rGxg7QvHXe7aUYSXrZq9B4qTTa8ZEGcEDm',
        secret: 'b8a75311-bc51-4bbb-a2f4-aa2cad113039'
      }

    async run(){
        
        // await this.deleteAccounts()
        // await this.createAccount()
        // await this.deactivateAllXrpOldAddress()
        await this.createXrpWallet()
        console.log("am called")
    }


    async getUnspentOutput({address,network}={}){
        let network_ = network||"BTCTEST"
        let url = `https://sochain.com/api/v2/get_tx_unspent/${network_}/${address}`
        let {data} = await axios.get(url)
        console.log(JSON.stringify(data))
        return data
    }


    async getAccounts(){
        let data = await tatum.getAllAccounts()
        console.log("accounts",data)
        return data
    }

    async deactivateAllXrpOldAddress(){
        let data = await this.getAccounts()
        let res = await Promise.all(data.map(async(account)=>{
            // console.log(account)
            if(account.currency=="XRP"){
                console.log("removed",{id:account.id,address:account.xpub})
                let res = await tatum.removeDepositAddress(account.id,account.xpub)
                console.log('res',res)
            }
            
        }))
        
        console.log("res",res)
    }


    async sendTransaction({privateKey,from,to,amount}){
        const sochain_network = "BTCTEST";
        let {
            status,
            data:{
                txs=[],
                address
            }
        } = await this.getUnspentOutput({address:from,network:sochain_network})
        let inputs = txs.map(data=>({
            satoshis:Math.floor(Number(data.value) * 100000000),
            script:data.script_hex,
            address,
            txId:data.txid,
            outputIndex:data.output_no

        }))
        let totalAmountAvailable = inputs.map(data=>data.satoshis).reduce((prev,curr)=>prev+curr,0)
        let inputCount = inputs.length;
        const transaction = new bitcore.Transaction();
        transaction.from(inputs);

        const sourceAddress =from
        const satoshiToSend = amountToSend * 100000000; 
        let fee = 0; 
        let outputCount = 2;

        let transactionSize = inputCount * 180 + outputCount * 34 + 10 - inputCount;
    }


    async createAccount(){
        // let wallet = tatum.generateXrpWallet()
        let account =  await tatum.createAccount({
            currency:"XRP",
            xpub:this.XRP_data.address,
            accountingCurrency: "USD"
        },false)
        
        let address = await tatum.generateDepositAddress(account.id)
        console.log(address)
        
    }


    async createXrpWallet(){
        console.log("enviroment",process.env.NODE_ENV)
        let {Wallet} = require("../database/models")
        let wallet = await Wallet.create({currency:"XRP",user_id:"64ecbbaa-0d42-44cb-ad81-acb0b47cc7d3"})
        console.log("wallet",wallet.dataValues)
    }


    

}


new Sandbox().run().catch(console.error)
