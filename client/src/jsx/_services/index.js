import Service from "./Services";

export default class InitService {
  constructor(
    options = { token: null, timeout: 50000, baseURL: "/api" },
    logout = () => null
  ) {
    let providers = {
      user: require("./user.service").default,
      auth: require("./auth.service").default,
      bank_detail: require("./bank.detail.service").default,
      market: require("./market_trend.service").default,
      currency: require("./currency.service").default,
      chat: require("./chat.service").default,
      wallet: require("./wallet.service").default,
      support_ticket: require("./support.ticket.service").default,
      analytics: require("./analytics.service").default,
      advert: require("./advert.service").default,
      order: require("./order.service").default,
      secession: require("./secession.service").default,
      profile: require("./profile.service").default,
      affiliate: require("./affiliate.service").default,
      kyc: require("./kyc.service").default,
      security: require("./security.service").default,
      type: require("./type.service").default,
      address: require("./address.service").default,
      transaction: require("./transaction.service").default,
      upload: require("./upload.service").default,
      coingecko: require("./coingecko.service").default,
      logger: require("./logger.service").default,
      fee: require("./fee.service").default,
      faq: require("./faq.service").default,
      airdrop:require("./air.drop.service").default,
      mainwallet:require("./master.wallet.service").default
    };

    // LOGOUT
    this.logout = async (invalidated = false) => {
      this.abortAll();

      try {
        if (
          !invalidated &&
          this._readyServices &&
          this._readyServices?.auth &&
          this._readyServices?.auth?.logout
        ) {
          let { data, error, message } =
            await this._readyServices?.auth.logout();
          if (!data)
            throw new Error(
              error.message || message || "Cannot logout at the moment"
            );
        }

        logout();
      } catch (err) {
        console.error(err);
      }
    };

    // SET INITIAL OPTIONS
    this.options = { ...options, logout: this.logout };

    // SET PROVIDERS
    this._provision(providers);
    return this;
  }

  _providers = {};
  _readyServices = {};

  abortAll() {
    // console.log("ABORTING ALL REQUEST...");
    this._readyServices &&
      Object.entries(this._readyServices).forEach(([key, value]) => {
        value.abort();
      });
  }
  /**
   * @function registerService - registers new service
   * @param {Class} Service
   * @param {Object} options
   */
  _provision = (providers) => {
    try {
      Object.keys(providers).forEach((key, idx) => {
        // Ensure they are instances of Service
        if (!providers instanceof Service)
          throw new Error(`Service(${idx}) not a valid service object`);
        // useService proxy name
        let useServiceName = `use${this._camelFirstLetter(key)}Service`;

        this[key] = new providers[key](this.options);
        this._readyServices[key] = this[key];

        // provision a new server using `useServicename`
        const fn = (options = this.options) => new providers[key](options);
        this[useServiceName] = fn;

        // Add to providers collection
        this._providers[useServiceName] = fn;
      });
    } catch (error) {
      console.error(error);
    } finally {
      // console.log("Available providers", this._providers);
    }
  };

  _camelFirstLetter = (name) =>
    name
      .split("_")
      .map(
        (item) => item?.charAt(0).toUpperCase() + item.substr(1).toLowerCase()
      )
      .join("");

  _nameProvider = (Provider) => Provider?._name || Provider?.name;
}
