'use strict';
const { TABLE_NAMES } = require("../../constants");
let table_name = TABLE_NAMES?.WALLET || "tbl_wallet_types";

module.exports = {

  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(table_name, 'total_fee_pay', 
        { type: Sequelize.DOUBLE,
          defaultValue: 0, },
      ),
      queryInterface.addColumn(table_name, 'total_token_fee_pay', 
        { type: Sequelize.DOUBLE,
          defaultValue: 0, },
      )
    ]);
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
