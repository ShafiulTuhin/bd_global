import Services from "./Services";

class SupportTicketService extends Services {
  constructor(init) {
    super(init);
    this._name = "USER";
    return this;
  }

  // USER --------------------------------------------------------------------------------

  /**
   * @function find
   * @param {Object} params
   * @returns
   */
  find = async (params) => {
    return await this.decorate(
      async () =>
        await this.axios(`ticket`, {
          method: "GET",
          params,
        })
    );
  };
  /**
   * @function findByID - Bulk update users (**Admins only**)
   * @param {String} id
   * @param {Object} params
   * @returns
   */
  findByID = async (id, params) => {
    return await this.decorate(
      async () =>
        await this.axios(`ticket/${id}`, {
          method: "GET",
          params,
        })
    );
  };

  /**
   * @function update - Bulk update users (**Admins only**)
   * @param {Object} data
   * @returns
   */
  update = async (data) => {
    return await this.decorate(
      async () =>
        await this.axios(`/user`, {
          method: "PUT",
          data,
        })
    );
  };

  /**
   * @function updateByID -  update single users (**Admins only**)
   * @param {String} id
   * @param {String} data
   * @returns
   */
  updateByID = async (id, data) => {
    return await this.decorate(
      async () =>
        await this.axios(`ticket/${id}`, {
          method: "PUT",
          data,
        })
    );
  };

  /**
   * @function removeByID - Bulk delete users (**Admins only**)
   * @param {String} id
   * @returns
   */
  removeByID = async (id, data) => {
    return await this.decorate(
      async () =>
        await this.axios(`ticket/${id}`, {
          method: "DELETE",
          data,
        })
    );
  };

  /**
   * @function remove - Bulk delete users (**Admins only**)
   * @param {String []} data - Array of IDs to delete from
   * @returns
   */
  remove = async (data) => {
    return await this.decorate(
      async () =>
        await this.axios(`ticket`, {
          method: "DELETE",
          data,
        })
    );
  };
}

export default SupportTicketService;
