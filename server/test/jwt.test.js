const config = require("dotenv").config({
    path: "../../.env",
  });
let jwt = require("jsonwebtoken")
// const {jwt} = require("../helpers")
const { JWT_SCOPES } = require("../constants");
async function testJwt(){
    let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZjM4ZjYxMGEtMWVhNy00NjdhLTgzNGItNGZhMjU1MWVmZWZjIiwiYXVkIjoiYXVkOmN1cnJlbnQiLCJpc3MiOiJpc3M6YXV0aFVzZXIiLCJzdWIiOiJ1c2VyLWF1dGhlbnRpY2F0aW9uIiwibmJmIjp0cnVlLCJleHAiOnRydWUsIm1heEFnZVNlYyI6MTcyODAwLCJpYXQiOjE2Mzk3Nzc3MzZ9.upEr0LxZzqPs7Em_cwG_0ZSJdyrNr0PN4CEiS-EwhpQ"
    // let res = await jwt.decodeUser(
    //     token,
    //     JWT_SCOPES.authUser,
    //     process.env.SECRET_KEY
    //     )
    // let res = jwt.decode(token)
    let res = jwt.verify(token,process.env.SECRET_KEY,{algorithms:"HS256"})
    console.log(res)
}

testJwt().catch(console.error)