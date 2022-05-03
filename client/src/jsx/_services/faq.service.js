import Services from "./Services";

class FeeService extends Services {
  constructor(init) {
    super(init);
    this._name = "FAQ";
    return this;
  }

  // CREATE ---------------------------------------------------
  /**
   * @function create
   * @param {Object} data
   * @returns
   */
  create = async (param, data) => {
    console.log(param)
    return await this.decorate(
      async () =>
        await this.axios(`/faq`, {
          method: "POST",
          param,
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
        await this.axios(`faq/${id}`, {
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
  findall = async (params) => {
    return await this.decorate(
      async () =>
        await this.axios(`/faq`, {
          method: "GET",
          params,
        })
    );
  };

  findByID = async (id, params) => {
    console.log("find by id")
    return await this.decorate(
      async () =>
        await this.axios(`faq/${id}`, {
          method: "GET",
          params,
        })
    );
  };


  find = async (payload) => {
    console.log("find")
    return await this.decorate(
      async () =>
        await this.axios(`faq?${payload.query}`, {
          method: "GET"
        })
    );
  };

  deleteById = async (params) => {
    return await this.decorate(
      async () => {
        await this.axios(`faq/${params.id}`, {
          method: "DELETE"
        })
      }
    )
  }
}

export default FeeService;
