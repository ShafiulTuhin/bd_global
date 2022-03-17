import Services from "./Services";

class UtilService extends Services {
  constructor(init) {
    super(init);
    this._name = "TYPE";
    return this;
  }

  /**
   * @function find - Gets one or many users (**Admins only**)
   * @param {Object} params
   * @returns
   */
  find = async (params) => {
    return await this.decorate(
      async () =>
        await this.axios(`type`, {
          method: "GET",
          params,
        })
    );
  };
  /**
   * @function findByID
   * @param {String} id
   * @param {Object} params
   * @returns
   */
  findByName = async (name, params) => {
    return await this.decorate(
      async () =>
        await this.axios(`type/${name}`, {
          method: "GET",
          params,
        })
    );
  };
}

export default UtilService;
