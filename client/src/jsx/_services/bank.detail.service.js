import Services from "./Services";

/**
 * Class of all Group services
 * @class
 */
export default class BankDetailervices extends Services {
  constructor(init) {
    super(init);
    this._name = "BANK_DETAIL";
    return this;
  }
  //BANK DETAIL ---------------------------------------------------------------------
  /**
   * @function create
   * @param {Object} data
   * @returns
   */
  create = async (data) => {
    return await this.decorate(
      async () =>
        await this.axios(`bank-detail`, {
          method: "POST",
          data,
        })
    );
  };
  /**
   * @function find
   * @param {Object} params
   * @returns
   */
  find = async (params) => {
    return await this.decorate(
      async () =>
        await this.axios(`bank-detail`, {
          method: "GET",
          params,
        })
    );
  };

  findByID = async (id, params) => {
    return await this.decorate(
      async () =>
        await this.axios(`bank-detail/${id}`, {
          method: "GET",
          params,
        })
    );
  };

  updateByID = async (id, data) => {
    return await this.decorate(
      async () =>
        await this.axios(`bank-detail/${id}`, {
          method: "PUT",
          data,
        })
    );
  };

  removeByID = async (id, data) => {
    return await this.decorate(
      async () =>
        await this.axios(`bank-detail/${id}`, {
          method: "DELETE",
          data,
        })
    );
  };

  remove = async (data) => {
    return await this.decorate(
      async () =>
        await this.axios(`bank-detail`, {
          method: "DELETE",
          data,
        })
    );
  };
}
