"use strict";
let { TABLE_NAMES} = require("../../constants");
let table_name = TABLE_NAMES?.CUSTODIAL_WALLET_ADDRESSES || "tbl_custodial_wallet_addresses";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Add all modifications here
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
        trx_id: Sequelize.STRING,
        address: Sequelize.STRING,
        is_used: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        }, 
        status: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
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

  down: async (queryInterface) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.dropTable(table_name, {
          transaction: t,
        }),
      ]);
    });
  },
};

