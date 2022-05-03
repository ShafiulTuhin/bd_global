"use strict";
let { TABLE_NAMES, SUPPORTED_TOKENS } = require("../../constants");
let table_name = TABLE_NAMES.WALLET || "tbl_wallets";

module.exports = {
  up: async (queryInterface, Sequelize) => {


    return queryInterface.addColumn(
      table_name,
      "last_trx", // new field name
      {
        type: Sequelize.STRING
      }
    );
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  down: async (queryInterface, Sequelize) => {

    return queryInterface.removeColumn(
      table_name,
      'last_trx'
    );
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
