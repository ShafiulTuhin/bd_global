import Services from "./Services";

class UploadService extends Services {
  constructor(init) {
    super(init);
    this._name = "UPLOAD";
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
        await this.axios(`media`, {
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
        await this.axios(`media`, {
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
        await this.axios(`media/${id}`, {
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
        await this.axios(`media`, {
          method: "PUT",
          data,
        })
    );
  };

  /**
   * @function updateByID -  update single users (**Admins only**)
   * @param {String} id
   * @param {Object} data
   * @returns
   */
  updateByID = async (id, data) => {
    return await this.decorate(
      async () =>
        await this.axios(`media/${id}`, {
          method: "PUT",
          data,
        })
    );
  };

  // REMOVE --------------------------------------------------------------------------------

  /**
   * @function removeByID - Bulk delete users (**Admins only**)
   * @param {String} id
   * @param {Object} data
   * @returns
   */
  removeByID = async (id, data) => {
    return await this.decorate(
      async () =>
        await this.axios(`media/${id}`, {
          method: "DELETE",
          data,
        })
    );
  };

  /**
   * @function remove - Bulk delete users
   * @param {Object} data
   * @param {Array} data.ids - Array of IDs
   * @returns
   */
  remove = async (data) => {
    return await this.decorate(
      async () =>
        await this.axios(`media`, {
          method: "DELETE",
          data,
        })
    );
  };
}

export default UploadService;
