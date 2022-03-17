'use strict';
let { TABLE_NAMES, SUPPORTED_TOKENS } = require("../../constants");
let table_name = TABLE_NAMES?.BLOCKAGE || "tbl_blockages";

module.exports = {
  up: async (queryInterface, Sequelize) => {

    return queryInterface.addColumn(
      table_name,
      "fee",
      {
        type:Sequelize.DOUBLE,
        defaultValue:0
      },
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
      'fee'
    );
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
