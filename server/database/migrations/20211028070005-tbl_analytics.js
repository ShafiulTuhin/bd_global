"use strict";
let { TABLE_NAMES } = require("../../constants");
let table_name = TABLE_NAMES?.ANALYTICS || 'tbl_analytics';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Add all table modifications here
      async function modifications(d) {
        await queryInterface.sequelize.transaction(async (t) => {
          return await Promise.all([

          ]);
        });
      }

      // Table field definitions
      let fields = {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
          defaultValue: Sequelize.UUIDV4,
        },
        user: {
          type: Sequelize.JSON,
        },
        wallet: { type: Sequelize.JSON },
        support_ticket: { type: Sequelize.JSON },
        kyc: { type: Sequelize.JSON },
        security: { type: Sequelize.JSON },
        created_at: Sequelize.DATE,
        updated_at: Sequelize.DATE,
      };

      // Check if table exist and apply modifications else create and apply modifications
      await queryInterface
        .describeTable(table_name)
        .then(modifications)
        .catch(async () => {
          await queryInterface.createTable(table_name, fields);
          let dfns = await queryInterface.describeTable(table_name);
          modifications(dfns);
        });
    } catch (error) {
      console.error(error);
    }
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.dropTable(table_name, {
          transaction: t,
        }),
      ]);
    });
  },
};
