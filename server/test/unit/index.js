const helpers = require('./helpers')
const mailer = require('./mailer')
const wallets = require('./wallets')

module.exports = () => {
  describe('Unit tests', () => {

    helpers();
    wallets();
  })
}
