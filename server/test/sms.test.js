require("dotenv").config();
const twilio = require('twilio');

async function sendSMS(message = "Welcome to CoinTC",phone) {
  let phone_ = phone || this?.profile?.phone;

  if(![process.env.TWILLOW_ACCOUNTS_ID, process.env.TWILLOW_AUTH_TOKEN].every(v=>v)){
    throw new Error("TWILLOW_ACCOUNTS_ID, TWILLOW_AUTH_TOKEN and  TWILLOW_PHONE_NUMBER must be provide in the enviroment variable")
  }

  const client = new twilio(process.env.TWILLOW_ACCOUNTS_ID, process.env.TWILLOW_AUTH_TOKEN);
  try {
    await client.messages
      .create({
        body: message,
        to: phone_, // Text this number
        from: process.env.TWILLOW_PHONE_NUMBER, // From a valid Twilio number
      })
    
  } catch (error) {
    console.error(error)
  }
    
    // .then((message) => console.log(message.sid));

  return {status: true}
  }




sendSMS("message to anies","+2348123880944")