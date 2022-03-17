import Services from "./Services";

class OrderService extends Services {
  constructor(init) {
    super(init);
    this._name = "ORDER";
    return this;
  }

  //FIND ----------------------------------------------------------------------
  /**
   * @function find - Gets one or many users (**Admins only**)
   * @param {Object} params
   * @returns
   */
  find = async (params) => {
    return await this.decorate(
      async () =>
        await this.axios(`order`, {
          method: "GET",
          params,
        })
    );
  };

  /**
   * @function findByID
   * @param {Object} id
   * @param {Object} params
   * @returns
   */
  findByID = async (id, params) => {
    return await this.decorate(
      async () =>
        await this.axios(`order/${id}`, {
          method: "GET",
          params,
        })
    );
    /* return await this.decorate(
      async () =>
        await this.axios(`order/${id}`, {
          method: "GET",
          params,
        })
    ); */
  };

  // UPDATE ----------------------------------------------------------------------

  /**
   * @function update - Bulk update
   * @param {Object} data
   * @param {String []} data.ids
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
   * @param {Object} data
   * @param {String} id
   * @returns
   */
  updateByID = async (id, data) => {
    return await this.decorate(
      async () =>
        await this.axios(`order/${id}`, {
          method: "PUT",
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
        await this.axios(`order/${id}`, {
          method: "DELETE",
          data,
        })
    );
  };

  /**
   * @function remove
   * @param {Object} data - Array of IDs to delete from
   * @param {String []} data.ids
   * @param {Boolean | false} data.force
   * @returns
   */
  remove = async (data) => {
    return await this.decorate(
      async () =>
        await this.axios(`order`, {
          method: "DELETE",
          data,
        })
    );
  };

  /**
   * @function create
   * @param {Object} data - amount, quantity, advert id to create order of
   * @param {String []} data.ids
   * @param {Boolean | false} data.force
   * @returns
   */

  create = async (data) => {
    console.log(data)
    return await this.decorate(
      async () =>
        await this.axios(`order`, {
          method: "POST",
          data,
        })
    );
  };

  /**
   * @function confirm
   * @param {Object} data - amount, quantity, advert id to create order of
   * @param {String []} data.ids
   * @param {Boolean | false} data.force
   * @returns
   */

  confirm = async (id) => {
    return await this.decorate(
      async () =>
        await this.axios(`order/${id}/confirm`, {
          method: "POST",
        })
    );
  };

  dispute = async (id,data) => {
    return await this.decorate(
      async () =>
        await this.axios(`order/${id}/dispute`, {
          method: "POST",
          data
        })
    );
  };

}

export default OrderService;
