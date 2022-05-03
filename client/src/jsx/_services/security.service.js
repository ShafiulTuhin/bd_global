import Services from "./Services";

class SecurityService extends Services {
  constructor(init) {
    super(init);
    this._name = "SECURITY";
    return this;
  }

  // SECURITY --------------------------------------------------------------------------------

  /**
   * @function find - fetch multiple records
   * @param {Object} params
   * @param {String} [params.id] - User ID
   * @returns
   */
  find = async (params) => {
    return await this.decorate(
      async () =>
        await this.axios(`security`, {
          method: "GET",
          params,
        })
    );
  };

  findByID = async (id, params) => {
    return await this.decorate(
      async () =>
        await this.axios(`security/${id}`, {
          method: "GET",
          params,
        })
    );
  };

  /**
   * @function bulkUpdateUsers - Bulk update users (**Admins only**)
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
   * @function updateUser -  update single users (**Admins only**)
   * @param {Object} payload
   * @param {String} payload.id
   * @param {String} payload.data
   * @returns
   */
  updateByID = async (id, data) => {
    return await this.decorate(
      async () =>
        await this.axios(`security/${id}`, {
          method: "PUT",
          data,
        })
    );
  };

  /**
   * @function removeUser - Bulk delete users (**Admins only**)
   * @param {String} id
   * @returns
   */
  removeByID = async (id, data) => {
    return await this.decorate(
      async () =>
        await this.axios(`security/${id}`, {
          method: "DELETE",
          data,
        })
    );
  };

  /**
   * @function bulkRemoveUser - Bulk delete users (**Admins only**)
   * @param {String []} data - Array of IDs to delete from
   * @returns
   */
  remove = async (data) => {
    return await this.decorate(
      async () =>
        await this.axios(`/user`, {
          method: "DELETE",
          data,
        })
    );
  };
}

export default SecurityService;
