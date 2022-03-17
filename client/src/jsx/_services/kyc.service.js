import Services from "./Services";

class KycService extends Services {
  constructor(init) {
    super(init);
    this._name = "KYC";
    return this;
  }

  // CREATE --------------------------------------------------------------------------------
  /**
   * @function find - Gets one or many users (**Admins only**)
   * @param {Object} data
   * @returns
   */
  create = async (data) => {
    return await this.decorate(
      async () =>
        await this.axios(`kyc`, {
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
        await this.axios(`kyc`, {
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
        await this.axios(`kyc/${id}`, {
          method: "GET",
          params,
        })
    );
  };

  // UPDATE --------------------------------------------------------------------------------

  /**
   * @function update
   * @param {Object} data
   * @param {String []} data.ids - Array of IDs
   * @returns
   */
  update = async (data) => {
    return await this.decorate(
      async () =>
        await this.axios(`kyc`, {
          method: "PUT",
          data,
        })
    );
  };

  /**
   * @function updateByID
   * @param {String} id
   * @param {Object} data
   * @returns
   */
  updateByID = async (id, data) => {
    return await this.decorate(
      async () =>
        await this.axios(`kyc/${id}`, {
          method: "PUT",
          data,
        })
    );
  };
  /**
   * @function updateByUserAndType
   * @param {String} id
   * @param {Object} data
   * @param {String} data.status
   * @returns
   */
  updateByUserAndType = async (user_id, type, data) => {
    return await this.decorate(
      async () =>
        await this.axios(`kyc/user/${user_id}/type/${type}`, {
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
   * @param {Boolean | false} data.force
   * @returns
   */
  removeByID = async (id, data) => {
    return await this.decorate(
      async () =>
        await this.axios(`kyc/${id}`, {
          method: "DELETE",
          data,
        })
    );
  };

  /**
   * @function remove - Bulk delete users (**Admins only**)
   * @param {Object} data
   * @param {String []} data.ids - Array of IDs to delete from
   * @param {Boolean | false} data.force
   * @returns
   */
  remove = async (data) => {
    return await this.decorate(
      async () =>
        await this.axios(`kyc`, {
          method: "DELETE",
          data,
        })
    );
  };
}

export default KycService;
