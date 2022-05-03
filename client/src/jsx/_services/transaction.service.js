import Services from "./Services";

class TransactionService extends Services {
  constructor(init) {
    super(init);
    this._name = "TRANSACTION";
    return this;
  }
  // FIND ------------------------------------------------------------------
  /**
   * @function find
   * @param {Object} params
   * @returns
   */
  find = async (params) => {
    return await this.decorate(
      async () =>
        await this.axios(`transaction`, {
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
        await this.axios(`transaction/${id}`, {
          method: "GET",
          params,
        })
    );
  };

  /**
   * @function approveByID
   * @description Approve transaction by ID
   * @param {String} id 
   * @param {Object} params 
   * @returns 
   */
  approveByID = async (id, data) => {
    return await this.decorate(
      async () =>
        await this.axios(`/transaction/${id}/approve`, {
          method: "POST",
          data,
        })
    );
  };
  disapproveByID = async (id, data) => {
    return await this.decorate(
      async () =>
        await this.axios(`/transaction/${id}/disapprove`, {
          method: "POST",
          data,
        })
    );
  };
}

export default TransactionService;
