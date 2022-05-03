require("dotenv").config();
const unit_tests = require("./unit");
const integration_tests = require("./integration");
const database = require("../database/models");

describe("Cryptcon Tests", () => {
  test.only(`Connects to Database`, async () => {
    let connected = false;
    await database.sequelize.authenticate().then(() => (connected = true));
    expect(connected).toBeTruthy();
  });
  unit_tests();
  integration_tests();
});
