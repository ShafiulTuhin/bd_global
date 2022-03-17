import Services from "./Services";

class AffiliateService extends Services {
  constructor(init) {
    super(init);
    this._name = "AFFILIATE";
    return this;
  }

  // FIND --------------------------------------------------------------------------------

  /**
   * @function find - Gets one or many users (**Admins only**)
   * @param {Object} params
   * @returns
   */
  find = async (params) => {
    return await this.decorate(
      async () =>
        await this.axios(`affiliate`, {
          method: "GET",
          params,
        })
    );
  };
  /**
   * @function findByUserID
   * @param {String} user_id
   * @param {Object} params
   * @returns
   */
  findByUserID = async (user_id, params) => {
    return await this.decorate(
      async () =>
        await this.axios(`affiliate/${user_id}`, {
          method: "GET",
          params,
        })
    );
  };
  commision = async (params) => {
    return await this.decorate(
      async () =>
        await this.axios(`logger`, {
          method: "GET",
          params,
        })
    );
  };

}

export default AffiliateService;
