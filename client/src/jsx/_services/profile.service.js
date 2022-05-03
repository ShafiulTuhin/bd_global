import Services from "./Services";

class ProfileService extends Services {
  constructor(init) {
    super(init);
    this._name = "PROFILE";
    return this;
  }

  // FIND --------------------------------------------------------------------------------

  /**
   * @function find - Gets one or many users (**Admins only**)
   * @param {Object} params
   * @returns
   */
  find = async (params) => {
    return await this.decorate(
      async () =>
        await this.axios(`profile`, {
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
        await this.axios(`profile/${id}`, {
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
        await this.axios(`profile`, {
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
        await this.axios(`profile/${id}`, {
          method: "PUT",
          data,
        })
    );
  };
}

export default ProfileService;
