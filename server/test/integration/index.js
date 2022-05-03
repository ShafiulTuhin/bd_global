const wallet_integration_test = require("./wallet.controller");
const user_controller = require("./user.controller");

module.exports = async () =>
  describe("Integration Tests", () => {
    wallet_integration_test();
    user_controller();
  });
