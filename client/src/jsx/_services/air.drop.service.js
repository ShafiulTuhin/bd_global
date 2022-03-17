import Services from "./Services";

class AirDropService extends Services {
  constructor(init) {
    super(init);
    this._name = "AIRDROP";
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
        await this.axios(`airdrops`, {
          method: "GET",
          params,
        })
    );
  };

  create = async (data) => {
    console.log("data  : ")
    console.log(data)
    return await this.decorate(
      async () =>
        await this.axios("airdrops", {
          method: "POST",
          data,
        })
    );
  };

  history = async (params) => {
    return await this.decorate(
      async () =>
        await this.axios(`airdrops/history`, {
          method: "GET",
          params
        })
    );
  };


}

export default AirDropService;
