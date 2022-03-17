const WalletInterface = require("../wallet.interface");
const BNBWallet = require("./BNB")

class BSCWallet extends BNBWallet {
  constructor() {
    super();
    this._name = "BSC";
    return this;
  }

  
  /**
   *
   * @returns {Promsie<CreateTatumAccountResponse>}
   */
  async createTatumAccount() {
    /**
     * @typedef CmdResponse
     * @property {String} signatureId
     * @property {String} xpub
     */

    /**
     * @type {CmdResponse}
     */
    
    const { xpub } = await this.getWalletKeys()

    const account = await this.Tatum.createAccount(
      {
        currency: this.wallet.currency,
        customer: { externalId: this.wallet.user_id||process.env.APP_NAME },
        xpub,
        accountingCurrency: "USD",
      },
      this.testnet
    );

    const address = await this.Tatum.generateDepositAddress(account.id)
    return { account,address };
  }


}

module.exports = BSCWallet;
