"use strict";
let { TABLE_NAMES,TRANSACTION_STATUS,TRANSACTION_TYPES } = require("../../constants");
let table_name = TABLE_NAMES?.TRANSACTION || "tbl_trxs";

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
          type: Sequelize.STRING,
          primaryKey: true
        },
        archived_at: Sequelize.DATE,
        trx_id: Sequelize.STRING,
        reference: Sequelize.STRING,
        blockage_id: Sequelize.STRING,
        quantity: {
          type:Sequelize.DOUBLE,
          defaultValue:0
        },
        fee: {
          type:Sequelize.DOUBLE,
          defaultValue:0
        },
        address: Sequelize.STRING,
        type: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        status: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        reason: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        created_at: Sequelize.DATE,
        updated_at: Sequelize.DATE,
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
        metadata: {
          type: Sequelize.JSON,
          default:{}
        },
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
