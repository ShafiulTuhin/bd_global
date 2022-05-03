import Services from "./Services";

class AdvertService extends Services {
  constructor(init) {
    super(init);
    this._name = "ADVERT";
    return this;
  }

  //FIND ----------------------------------------------------------------------
  /**
   * @function login - log user to platform
   * @param {Object} data
   * @returns
   */
  find = async (params) => {
    return await this.decorate(
      async () =>
        await this.axios("ad", {
          method: "GET",
          params,
        })
    );
  };

  findByID = async (id, params) => {
    return await this.decorate(
      async () =>
        await this.axios(`ad/${id}`, {
          method: "GET",
          params,
        })
    );
  };

  // CREATE ---------------------------------------------------
  /**
   * @function create
   * @param {Object} data
   * @returns
   */
  create = async (data) => {
    return await this.decorate(
      async () =>
        await this.axios(`ad`, {
          method: "POST",
          data,
        })
    );
  };

  // REMOVE ---------------------------------------------------

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
        await this.axios(`ad`, {
          method: "DELETE",
          data,
        })
    );
  };

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
        await this.axios(`ad/${id}`, {
          method: "DELETE",
          data,
        })
    );
  };

  // UPDATE ---------------------------------------------------

  /**
   * @function update
   * @param {Object} data
   * @param {String []} data.ids - Array of IDS
   * @returns
   */
  update = async (data) => {
    return await this.decorate(
      async () =>
        await this.axios(`ad`, {
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
        await this.axios(`ad/${id}`, {
          method: "PUT",
          data,
        })
    );
  };
}

export default AdvertService;
