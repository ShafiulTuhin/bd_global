"use strict";
let { TABLE_NAMES } = require("../../constants");
let table_name = TABLE_NAMES?.ESCROW || 'tbl_escrows';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
          // Table fields definitions
          let fields = {
            id: {
              type: Sequelize.UUID,
              primaryKey: true,
              defaultValue: Sequelize.UUIDV4,
            },
            fiat_amount_in_hold: {
              type: Sequelize.DOUBLE,
              allowNull: false,
              validate: {
                min: 0,
                isInt: true,
              },
            },
            fee: {
              type: Sequelize.DOUBLE,
              allowNull: false,
              validate: {
                min: 0,
                isInt: true,
              },
            },
            created_at: Sequelize.DATE,
            updated_at: Sequelize.DATE,
            seller_id: {
              type: Sequelize.UUID,
              allowNull: false,
              references: { model: TABLE_NAMES?.USER || 'tbl_users', key: "id" },
            },
            order_id: {
              type: Sequelize.STRING,
              allowNull: false,
              references: { model: TABLE_NAMES?.ORDER || 'tbl_orders', key: "id" },
            },
            buyer_id: {
              type: Sequelize.UUID,
              allowNull: false,
              references: { model: TABLE_NAMES?.USER || 'tbl_users', key: "id" },
            },
          };

          // Add table modifications here
          async function modifications(d) {
            await queryInterface.sequelize.transaction(async (t) => {
              return await Promise.all([]);
            });
          }

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
