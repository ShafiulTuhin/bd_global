import Services from "./Services";

class LoggerService extends Services {
  constructor(init) {
    super(init);
    this._name = "LOGGER";
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
        await this.axios(`logger`, {
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
  findByID = async (id, params) => {
    return await this.decorate(
      async () =>
        await this.axios(`logger/${id}`, {
          method: "GET",
          params,
        })
    );
  };

  // REMOVE --------------------------------------------------------------------------------

  /**
   * @function removeByID - Bulk delete users (**Admins only**)
   * @param {String} id
   * @param {Object} data
   * @param {Boolean | false} data.force
   * @returns
   */
  removeByID = async (id, data) => {
    return await this.decorate(
      async () =>
        await this.axios(`logger/${id}`, {
          method: "DELETE",
          data,
        })
    );
  };

  /**
   * @function remove - Bulk delete users (**Admins only**)
   * @param {Object} data
   * @param {String []} data.ids - Array of IDs to delete from
   * @param {Boolean | false} data.force - Array of IDs to delete from
   * @returns
   */
  remove = async (data) => {
    return await this.decorate(
      async () =>
        await this.axios(`log`, {
          method: "DELETE",
          data,
        })
    );
  };
}

export default LoggerService;
