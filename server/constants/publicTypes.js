const COUNTRIES = require("./countries.json");
const CRYPTO_CURRENCIES = require("cryptocurrencies");
const FIAT_CURRENCIES = require("./fiat_currencies.json");
const MIME_TYPES = require("./mime_types.json");
const SUPPORTED_TOKENS = require("./supported_crypto.json");
const SUPPORTED_FIAT = require("./supported_fiat.json");
const ERROR_CODES = require("./error_codes.json");
const DIAL_CODES = require("./dial_codes.json");
const SUPPORTED_NETWORKS = require("./supported_networks.json");

module.exports = {
  SUPPORTED_NETWORKS,
  SUPPORTED_TOKENS,
  SUPPORTED_FIAT,
  DIAL_CODES,
  ERROR_CODES,
  MIME_TYPES,
  CRYPTO_CURRENCIES,
  COUNTRIES,
  FIAT_CURRENCIES,
  ALL_SUPPORTED_CURRENCIES: {
    ...SUPPORTED_TOKENS,
    ...SUPPORTED_FIAT,
  },
  ALL_CURRENCIES: { ...FIAT_CURRENCIES, ...CRYPTO_CURRENCIES },
  PATTERNS: {
    PASSWORD: new RegExp(/^[a-zA-Z0-9_@$#!~]{6,30}$/),
    PHONE: new RegExp(/^^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-s./0-9]*$/),
    ADVERT_TYPE: new RegExp(/^(buy|sell)$/, "i"),
    ORDER_ID: new RegExp(/^ORD-\d{12,12}/),
  },

  TRADE_TYPES: {
    BUY: "BUY",
    SELL: "SELL",
  },
  TRANSACTION_TYPES: {
    TRANSFER: "TRANSFER",
    WITHDRAWAL: "WITHDRAW",
    DEPOSIT: "DEPOSIT",
    CREDIT: "CREDIT",
    DEBIT: "DEBIT",
  },
  TRANSACTION_STATUS: {
    PENDING: "PENDING",
    ACTIVE: "ACTIVE",
    DECLINED: "DECLINED"
  },
  TRANSACTION_REASON: {
    P2P: "P2P",
    FEES: "FEES",
    DEPOSIT: "DEPOSIT",
    WITHDRAWAL: "WITHDRAWAL",
    COMMISSION: "COMMISSION",
  },
  CHAT_TYPES: {
    DISPUTE: "DISPUTE",
    TRADE: "TRADE",
    CHAT: "CHAT",
  },
  CURRENCY_TYPES: {
    FIAT: "FIAT",
    CRYPTO: "CRYPTO",
  },
  PAYMENT_METHODS: {
    BANK_TRANSFER: "BANK_TRANSFER",
    WECHAT: "WECHAT",
    ALIPAY: "ALIPAY",
  },
  TICKET_PRIORITIES: {
    HIGH: "HIGH",
    LOW: "LOW",
  },
  TICKET_STATUSES: {
    OPEN: "OPEN",
    CLOSE: "CLOSE",
  },
  KYC_STATUSES: {
    PENDING: "PENDING",
    ACCEPTED: "ACCEPTED",
    DENIED: "DENIED",
  },
  KYC_TYPES: {
    EMAIL: "EMAIL",
    SMS: "SMS",
    ID: "ID",
    GOOGLE_AUTH: "GOOGLE_AUTH",
  },
  FEE_TYPES: {
    WITHDRAWAL: "WITHDRAWAL",
    TRANSACTION: "TRANSACTION",
    COMMISSION: "COMMISSION",
  },
  ORDER_STATUSES: {
    PENDING: "PENDING",
    COMPLETED: "COMPLETED",
    DISPUTED: "DISPUTED",
    CANCELLED: "CANCELLED",
  },

  SECESSION_STATUSES: {
    PENDING: "PENDING",
    ACCEPTED: "ACCEPTED",
    DENIED: "DENIED",
  },
  PROFILE_MODES: {
    STANDARD: "STANDARD",
  },
  LOG_TYPES: {
    SESSION: "SESSION",
    TRADES: "TRADES",
    CHATS: "CHATS",
    SMS: "SMS",
    ADVERTS: "ADVERTS",
    TRANSACTIONS: "TRANSACTIONS",
    COMMISSION: "COMMISSION",
  },
  LOG_STATUSES: {
    LOG_IN: "LOG_IN",
    LOG_OUT: "LOG_OUT",
    FAILED: "FAILED",
  },
  NOTIFICATION_TYPE: {
    BASIC: "BASIC",
    MESSAGE: "MESSAGE",
    ORDER: "ORDER",
    TRANSACTION: "TRANSACTION",
    ADMINKYC:"ADMINKYC",
    ADMINWITHDRAWAL:"ADMINWITHDRAWAL",
    SUPPORT:"SUPPORT",
    DEPOSIT:"DEPOSIT"
  },

  FILE_UPLOAD_PATH: process.env.MEDIA_FILE_DIR || "mediafiles",
};
