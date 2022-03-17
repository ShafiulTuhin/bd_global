import Services from "./Services";

class AddressService extends Services {
  constructor(init) {
    super(init);
    this._name = "ADDRESS";
    return this;
  }

  // CREATE ---------------------------------------------------
  /**
   * @function create
   * @param {Object} data
   * @returns
   */
  create = async (data) => {
    return await this.decorate(
      async () =>
        await this.axios(`address`, {
          method: "POST",
          data,
        })
    );
  };

  // FIND --------------------------------------------------------------------------------

  /**
   * @function find - Gets one or many users (**Admins only**)
   * @param {Object} params
   * @returns
   */
  find = async (params) => {
    return await this.decorate(
      async () =>
        await this.axios(`address`, {
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
        await this.axios(`address/${id}`, {
          method: "GET",
          params,
        })
    );
  };

  // UPDATE --------------------------------------------------------------------------------

  /**
   * @function update - Bulk update users (**Admins only**)
   * @param {Object} data
   * @returns
   */
  update = async (data) => {
    return await this.decorate(
      async () =>
        await this.axios(`address`, {
          method: "PUT",
          data,
        })
    );
  };

  // REMOVE --------------------------------------------------------------------------------

  /**
   * @function remove - Bulk delete users (**Admins only**)
   * @param {Object} data
   * @param {String []} data.ids - Array of IDs to delete from
   * @param {Boolean | false} data.force - Permanently delete
   * @returns
   */
  remove = async (data) => {
    return await this.decorate(
      async () =>
        await this.axios(`address`, {
          method: "DELETE",
          data,
        })
    );
  };
}

export default AddressService;
