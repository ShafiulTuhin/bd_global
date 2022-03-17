let links = [
  {
    name: "dashboard",
    icon: "simple-speedometer",
    path: "",
  },
  // Admin bank details
  {
    name: "admin-bank-details",
    icon: "simple-credit-card",
    path: "admin-bank-details",
  },

  // Currency management
  {
    name: "currency management",
    icon: "themify-glyph-125",
    path: "currency-management",
  },
  // user management
  {
    name: "user-management",
    icon: "simple-people",
    path: "user-management",
    embedded: [
      {
        name: "users",
        path: "user-management",
      },
      {
        name: "sessions",
        path: "user-session-history",
      },
      {
        name: "permissions",
        path: "user-permission",
      },
      {
        name: "secessions",
        path: "user-secession",
      },
      {
        name: "balances",
        path: "user-balance",
      },
      {
        name: "affiliates",
        path: "user-affiliate-management",
      },
    ],
  },
  // Wallet
  {
    name: "transaction-management",
    icon: "simple-wallet",
    path: "admin-wallet-management",
    embedded: [
      {
        name: "deposits",
        path: "transaction-deposits",
      },
      {
        name: "withdrawals",
        path: "transaction-withdrawals",
      },
     
      // 
      /*  {
        name: "withdrawal-request-management",
        path: "transaction-withdrawal-management",
      }, */
      {
        name: "fees",
        path: "transaction-fee-management",
      },
      {
        name: "main-wallet",
        path: "main-wallet",
      },
      // {
      //   name: "airdrops",
      //   path: "transaction-airdrops",
      // },
    ],
  },
  // Authentication management
  {
    name: "securities-management",
    icon: "simple-shield",
    path: "securities-management",
    embedded: [
      {
        name: "securities",
        path: "auth-security-management",
      },
      {
        name: "kyc",
        path: "user-kyc-management",
      },
      {
        name: "settings",
        path: "settings",
      },
    ],
  },
  {
    name: "Air Drop Management",
    icon: "simple-credit-card",
    path: "airdrop-management",
    embedded: [
      {
        name: "Airdrop Create",
        path: "airdrop-management",
      },
      {
        name: "Airdrop History",
        path: "airdrop-history",
      },
    ],
  },

  // Advert management
  {
    name: "trade-management",
    icon: "simple-pin",
    path: "advert-management",
    embedded: [
      { name: "adverts", path: "adverts" },
      { name: "orders", path: "orders" },
      {
        name: "trade-history",
        path: "p2p-trade-history",
      },
      {
        name: "disputes",
        path: "p2p-disputes",
      },
    ],
  },
  /*  // P2P management
  {
    name: "trade-management",
    icon: "simple-puzzle",
    path: "p2p-management",
    embedded: [],
  }, */
  // chat
  {
    name: "chat-management",
    icon: "simple-bubbles",
    path: "chat-management",
    embedded: [
      {
        name: "chat-messenger",
        path: "chat-messenger",
      },
      // {
      //   name: "chat-history",
      //   path: "chat-history",
      // },
    ],
  },
  // support
  {
    name: "support-management",
    icon: "simple-support",
    path: "support",
    embedded: [
      {
        name: "Support",
        path: "support",
      },
      {
        name: "disputes-resolutions",
        path: "support-disputes",
      },
      // {
      //   name: "Support-board",
      //   path: "support-board",
      // },
    ],
  },
];

export default links;
