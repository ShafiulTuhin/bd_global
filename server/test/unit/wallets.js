const { eth, btc, bnb} = require("../../shared");

module.exports = async ()=>{
  describe ('Wallet helpers', () => {
    test.only('ETH wallet setup', ()=>{
      expect().toStrictEqual(expect.objectContaining({
        version: '1.0.0',
        name: 'ether',
        symbol: 'ETH',
      }))
    });

    test('BTC wallet setup', ()=>{

    });

    test('Tether wallet setup', ()=>{

    });

    test('BNB wallet setup', ()=>{

    });
  })
}
