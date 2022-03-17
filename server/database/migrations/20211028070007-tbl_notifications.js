"use strict";
let { TABLE_NAMES } = require("../../constants");
let table_name = TABLE_NAMES?.NOTIFICATIONS || "tbl_notifications";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Add all table modifcations here
      async function modifications(d) {
        await queryInterface.sequelize.transaction(async (t) => {
          return await Promise.all([]);
        });
      }

      // Table field definitions
      let fields = {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
          defaultValue: Sequelize.UUIDV4,
        },
        room: Sequelize.STRING,
        // VIRTUALS
        message: Sequelize.STRING,
        link: Sequelize.STRING,
        type: Sequelize.STRING,
        read:{
          type:Sequelize.JSONB,
          defaultValue:[]
        },
        created_at: Sequelize.DATE,
        updated_at: Sequelize.DATE,
        archived_at: Sequelize.DATE,
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
