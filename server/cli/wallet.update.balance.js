const tatum = require("@tatumio/tatum");
const {Op} = require("sequelize")
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
    { name: 'id', alias: 'i', type: String,multiple: true,defaultValue: [] }
  ]

const options = commandLineArgs(optionDefinitions)

console.log(options)

console.log("connecting to db")
const db = require("../database/models");

db.Wallet.findAndCountAll({
   ...(options.id.length?{
       where:{
           id:{
               [Op.in]:options.id
           }
       }
   }:{})
}).then(async ({ count, rows }) => {
   
   let res = await Promise.all(rows.map(async (wallet)=>{
       return await wallet.updateBalance()
   }))
   console.log(`wallet balance update completed. count ${count} `);
}).catch(console.error)

console.log("wallet balance update completed")

    