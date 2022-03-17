import Services from "./Services";

/**
 * Class of all Group services
 * @class
 */
export default class AnalyticsServices extends Services {
  constructor(init) {
    super(init);
    this._name = "ANALYTICS";
    return this;
  }
  //USER ---------------------------------------------------------------------
  /**
   * @function user
   * @param {Object} params
   * @returns
   */
  user = async (params) => {
    return await this.decorate(
      async () =>
        await this.axios(`analytics/user`, {
          method: "GET",
          params,
        })
    );
  };

  // SECURITY ---------------------------------------------------------------------

  /**
   * @function security
   * @param {Object} params
   * @returns
   */
  security = async (params) => {
    return await this.decorate(
      async () =>
        await this.axios(`analytics/security`, {
          method: "GET",
          params,
        })
    );
  };

  // KYC ---------------------------------------------------------------------

  /**
   * @function kyc
   * @param {Object} params
   * @returns
   */
  kyc = async (params) => {
    return await this.decorate(
      async () =>
        await this.axios(`analytics/kyc`, {
          method: "GET",
          params,
        })
    );
  };
}
