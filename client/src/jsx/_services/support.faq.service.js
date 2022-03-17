import Services from "./Services";

class SupportFAQService extends Services {
  constructor(init) {
    super(init);
    this._name = "SUPPORTFAQ";
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
        await this.axios(`faq`, {
          method: "GET",
          params,
        })
    );
  };
  

}

export default SupportFAQService;
