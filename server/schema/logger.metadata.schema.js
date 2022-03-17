const Joi = require("joi");
const { LOG_TYPES } = require("../constants");

let results = {};

/**
 * @typedef SESSIONSchema
 * @property {String} duration
 * @property {String} last_seen
 * @property {Date} login
 * @property {Date} logout
 * @property {String} login_status
 */


/**
 * @type {SESSIONSchema}
 */
results[LOG_TYPES.SESSION] = Joi.object({
  duration: Joi.string().allow(null),
  //   .error(boom.badRequest("Required input <iso_code::string> is invalid")),
  last_seen: Joi.date().allow(null),
  login: Joi.date().allow(null),
  logout: Joi.date().allow(null),
  login_status: Joi.string().required(),
});

//   trade history
/**
 * @typedef TRADESSchema
 * @property {String} buyer_email
 * @property {String} seller_email
 * @property {"buy"|"sell"} post_type
 * @property {String} currency_pair
 * @property {String} price
 * @property {String} fiat_amount
 * @property {String} total_crypto
 */


/**
 * @type {TRADESSchema}
 */
results[LOG_TYPES.TRADES] = Joi.object({
  buyer_email: Joi.string()
    .email()
    .required(),
  seller_email: Joi.string()
    .email()
    .required(),
  post_type: Joi.string().valid(...["buy", "sell"]),
  currency_pair: Joi.string().required(),
  price: Joi.string().required(),
  fiat_amount: Joi.string().required(),
  total_crypto: Joi.string().required(),
});

// chat history
/**
 * @typedef CHATSSchema
 * @property {String} visitor_email
 * @property {String} country
 * @property {String} browser
 * @property {String} duration
 */


/**
 * @type {CHATSSchema}
 */
results[LOG_TYPES.CHATS] = Joi.object({
  visitor_email: Joi.string()
    .email()
    .required(),
  country: Joi.string().required(),
  browser: Joi.string().required(),
  duration: Joi.string().required(),
});


// sms history
/**
 * @typedef SMSSchema
 * @property {String} to
 * @property {String} message
 * @property {String} status
 * @property {Date} send_time
 */


/**
 * @type {SMSSchema}
 */
results[LOG_TYPES.SMS] = Joi.object({
  to: Joi.string().required(),
  message: Joi.string().required(),
  status: Joi.string().required(),
  send_time: Joi.date().required(),
});


//   deposit and withdraw
/**
 * @typedef TRANSACTIONSSchema
 * @property {Date} txn_date
 * @property {String} ref
 * @property {String} description
 * @property {String} debit_amount
 * @property {String} credit_amount
 * @property {String} running_balance
 */


/**
 * @type {TRANSACTIONSSchema}
 */
results[LOG_TYPES.TRANSACTIONS] = Joi.object({
  txn_date: Joi.date().required(),
  ref: Joi.string().required(),
  description: Joi.string().required(),
  debit_amount: Joi.string().required(),
  credit_amount: Joi.string().required(),
  running_balance: Joi.string().required(),
});


/**
 * @typedef ADVERTSSchema
 * @property {String} payment
 * @property {String} payment_ttl_mins
 * @property {String} type
 * @property {String} status
 * @property {String} total
 */

/**
 * @type {ADVERTSSchema}
 */
results[LOG_TYPES.ADVERTS] = Joi.object({
  payment: Joi.string().required(),
  payment_ttl_mins: Joi.string().required(),
  type: Joi.string().required(),
  status: Joi.string().required(),
  total: Joi.string().required(),
});


/**
 * @typedef COMMISSIONSchema
 * @property {String} order_type
 * @property {String} friends_user_id
 * @property {String} commission_earned
 * @property {Date} friend_trade_datetime
 * @property {String} distribution_status
 */


/**
 * @type {COMMISSIONSchema}
 */
results[LOG_TYPES.COMMISSION] = Joi.object({
  order_type: Joi.string().required(),
  friends_user_id: Joi.string().uuid().required(),
  commission_earned: Joi.string().required(),
  friend_trade_datetime: Joi.date().required(),
  // commission_time: Joi.string().required(),
  distribution_status:Joi.string().required()
});

module.exports = results;
