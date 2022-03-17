import Services from "./Services";

/**
 * Class of all Group services
 * @class
 */
export default class CurrencyServices extends Services {
  constructor(init) {
    super(init);
    this._name = "CURRENCY";
    return this;
  }
  /**
   * Currency payload type definition
   * @typedef {Object} currencyPayload
   * @property {String} id - Currency id
   * @property {String} name - Currency name
   * @property {String} type - Currency type
   * @property {String} iso_code - Currency ISO Code
   */
  //  FIND ------------------------------------------------------------------------------
  /**
   * @method find
   * @param {Object} params
   * @param {Number} [params.limit] - Response limit
   * @param {String} [params.name] - Specify the currency name
   * @param {String} [params.type] - Specify the currency name
   * @returns
   */

  find = async (params) => {
    return await this.decorate(
      async () =>
        await this.axios(`currency/`, {
          method: "GET",
          params,
        })
    );
  };

  /**
   * @function findByID
   * @param {Object} payload
   * @param {String} payload.id
   * @param {Object} payload.params
   * @returns
   */
  findByID = async (id, params) => {
    return await this.decorate(
      async () =>
        await this.axios(`currency/${id}`, {
          method: "GET",
          params,
        })
    );
  };
  // CREATE --------------------------------------------------------------------------------

  /**
   * @function create - Creates a currency (**Admin only**)
   * @param {currencyPayload} data
   * @returns
   */
  create = async (data) => {
    return await this.decorate(
      async () =>
        await this.axios(`currency`, {
          method: "POST",
          data,
        })
    );
  };
  // UPDATE --------------------------------------------------------------------------------

  /**
   * @function updateByID
   * @param {Object} payload
   * @param {String} payload.id
   * @param {Object} payload.data
   * @returns
   */
  updateByID = async (id, data) => {
    return await this.decorate(
      async () =>
        await this.axios(`currency/${id}`, {
          method: "PUT",
          data,
        })
    );
  };
  // REMOVE --------------------------------------------------------------------------------
  /**
   * @function remove - Bulk delete users
   * @param {Object} data
   * @param {Array} data.ids - Array of IDs
   * @returns
   */
  remove = async (data) => {
    return await this.decorate(
      async () =>
        await this.axios(`currency`, {
          method: "DELETE",
          data,
        })
    );
  };

  /**
   * @function removeByID - Delete a single currency record
   * @param {Object} payload
   * @param {String} id
   * @param {Object} data
   * @returns
   */
  removeByID = async (id, data) => {
    return await this.decorate(
      async () =>
        await this.axios(`currency/${id}`, {
          method: "DELETE",
          data,
        })
    );
  };

  /**
   * @function restoreByID - Delete a single currency record
   * @param {Object} payload
   * @param {String} id
   * @param {Object} data
   * @returns
   */
  restoreByID = async (id) => {
    return await this.decorate(
      async () =>
        await this.axios(`currency/${id}/restore`, {
          method: "PUT",
        })
    );
  };
}
