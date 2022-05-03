"use strict";
let { TABLE_NAMES, SUPPORTED_TOKENS } = require("../../constants");
let table_name = TABLE_NAMES?.MANAGER_TRANSACTION || "tbl_manager_transactions";

module.exports = {
  up: async (queryInterface, Sequelize) => {


    return queryInterface.addColumn(
      table_name,
      "crypto",
      {
        type: Sequelize.ENUM(Object.keys(SUPPORTED_TOKENS)),
        allowNull: true,
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
      'crypto'
    );
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
