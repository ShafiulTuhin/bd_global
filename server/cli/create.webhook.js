const tatum = require("@tatumio/tatum");
const commandLineArgs = require('command-line-args')
const fs = require("fs");
const path = require("path")
console.log("cli start")
const config = require("dotenv").config({
    path: path.join(__dirname,"..","..",".env"),
});


if (config.error) {
    throw config.error;
}






const optionDefinitions = [
    { name: 'id', alias: 'i', type: String,multiple: true,defaultValue: [] },
    { name: 'host', alias: 'h', type: String,defaultValue: process.env.WEBHOOK_HOST }
  ]

const options = commandLineArgs(optionDefinitions)

console.log(options)

if(!process.env.WEBHOOK_TOKEN){
    throw new Error("WEBHOOK_TOKEN id missing in the enviroment variable")
}

if(options.id.length){
    Promise.all(options.id.map(async (id)=>{
        return tatum.createNewSubscription({
            type:"ACCOUNT_INCOMING_BLOCKCHAIN_TRANSACTION",
            attr:{
                url:`${options.host}/api/kswh/${process.env.WEBHOOK_TOKEN}`,
                id
            }
        })
    })).then((data)=>{
        console.log("data",data)
    }).catch(console.error)

}else{
    console.log("no id was provided")
}

