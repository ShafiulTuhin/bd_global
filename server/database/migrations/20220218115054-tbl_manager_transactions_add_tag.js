"use strict";
let { TABLE_NAMES, SUPPORTED_TOKENS } = require("../../constants");
let table_name = TABLE_NAMES?.MANAGER_TRANSACTION || "tbl_manager_transactions";

module.exports = {
  up: async (queryInterface, Sequelize) => {


    return queryInterface.addColumn(
      table_name,
      "tag", // new field name
      {
        type: Sequelize.STRING,
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
      'tag'
    );
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
