"use strict";
let { TABLE_NAMES, SUPPORTED_TOKENS } = require("../../constants");
let table_name = TABLE_NAMES?.NOTIFICATIONS || "tbl_notifications";

module.exports = {
  up: async (queryInterface, Sequelize) => {


    // return queryInterface.addColumn(
    //   table_name,
    //   "archived_at", // new field name
    //   {
    //     type: Sequelize.DATE,
    //   }
    // );
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  down: async (queryInterface, Sequelize) => {

    // return queryInterface.removeColumn(
    //   table_name,
    //   'archived_at'
    // );
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
