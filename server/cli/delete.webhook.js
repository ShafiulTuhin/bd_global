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
    { name: 'contains', alias: 'c', type: String,defaultValue: "ngrok" },
    { name: 'id', alias: 'i', type: String,multiple:true,defaultValue:[]}
  ]

const options = commandLineArgs(optionDefinitions)

console.log(options)

if(!process.env.WEBHOOK_TOKEN){
    throw new Error("WEBHOOK_TOKEN id missing in the enviroment variable")
}


tatum.listActiveSubscriptions()
.then(async (data)=>{
    let res = await Promise.all(data.map(async ({id,attr:{url}})=>{
        if(url.includes(options.contains)||options.id.includes(id)){
            console.log("url ",url)
            return tatum.cancelExistingSubscription(id)
        }
    }))
    console.log("cancel subscriptions ",res)
}).catch(console.error)



