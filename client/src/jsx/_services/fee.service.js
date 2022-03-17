import Services from "./Services";

class FeeService extends Services {
  constructor(init) {
    super(init);
    this._name = "FEE";
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
        await this.axios(`/fee`, {
          method: "POST",
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
       console.log("updateByID  --")
      return await this.decorate(
        async () =>
          await this.axios(`fee/${id}`, {
            method: "PUT",
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
        await this.axios(`fee`, {
          method: "GET",
          params,
        })
    );
  };

 
}

export default FeeService;
