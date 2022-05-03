import Services from "./Services";

export class MarketTrend extends Services {
  constructor(init) {
    super(init);
    this._name = "MARKET_TREND";
    return this;
  }

  //MARKET TREND ----------------------------------------------------------------------
  /**
   * @function  - Get market trends data from coinmarketcap
   * @param {Object} params
   * @returns
   */
  coinmarketcap = async (params) => {
    return await this.decorate(
      async () =>
        await this.axios("market", {
          method: "GET",
          params,
        })
    );
  };
}
export default MarketTrend;