"use strict";
let { TABLE_NAMES,TRANSACTION_STATUS,TRANSACTION_TYPES } = require("../../constants");
let table_name = TABLE_NAMES?.UNSPEND_WALLET_BALANCES || "tbl_unspend_wallet_balances";

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
        user_id: {
          type: Sequelize.UUID,
          allowNull: true,
          onDelete: "CASCADE",
          references: { model: TABLE_NAMES?.USER, key: "id" },
        },
        wallet_id: {
          type: Sequelize.UUID,
          allowNull: false,
          onDelete: "CASCADE",
          references: { model: TABLE_NAMES?.WALLET, key: "id" },
        },        
        unspend_amount: {
          type:Sequelize.DOUBLE,
          defaultValue:0
        },
        new_amount: {
          type:Sequelize.DOUBLE,
          defaultValue:0
        },
        chain_balance: {
          type:Sequelize.DOUBLE,
          defaultValue:0
        },
        estimated_fee: {
          type:Sequelize.DOUBLE,
          defaultValue:0
        },
        status: {
          type: Sequelize.STRING,
          defaultValue: true
        },
        reason: {
          type: Sequelize.STRING,
          allowNull: true,
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
