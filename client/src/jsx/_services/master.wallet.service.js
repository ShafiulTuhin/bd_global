import Services from "./Services";

export class MaterCoinBalance extends Services {
  constructor(init) {
    super(init);
    this._name = "MASTER_COIN_BALANCE";
    return this;
  }

  //MARKET TREND ----------------------------------------------------------------------
  /**
   * @function  - Get market trends data from coinmarketcap
   * @param {Object} params
   * @returns
   */
   coinbalance = async (params) => {
    return await this.decorate(
      async () =>
        await this.axios("coinbalance", {
          method: "GET",
          params,
        })
    );
  };

   mainwithdraw = async (data) => { 
    //  console.log(params)
    return await this.decorate(
      async () =>
        await this.axios("/transaction/maintomanager", {
          method: "POST",
          data,
        })
    );
  };




}
export default MaterCoinBalance;