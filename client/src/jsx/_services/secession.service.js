import Services from "./Services";

class UserService extends Services {
  constructor(init) {
    super(init);
    this._name = "USER";
    return this;
  }

  // USER --------------------------------------------------------------------------------

  /**
   * @function bulkListUsers - Gets one or many users (**Admins only**)
   * @param {Object} params
   * @param {String} [params.id] - User ID
   * @returns
   */
  find = async (params) => {
    return await this.decorate(
      async () =>
        await this.axios(`secession`, {
          method: "GET",
          params,
        })
    );
  };

  findByID = async (id, params) => {
    return await this.decorate(
      async () =>
        await this.axios(`secession/${id}`, {
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
        await this.axios(`secession/${id}`, {
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
        await this.axios(`secession/${id}`, {
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

export default UserService;
