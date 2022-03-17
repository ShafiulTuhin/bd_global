"use strict";
let { TABLE_NAMES, SECURITY_TYPES } = require("../../constants");
let table_name = TABLE_NAMES?.FAQ || "tbl_faq";

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
          primaryKey: true
        },
        question: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        answer: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        link: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        category: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        subcategory: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        archived_at: Sequelize.DATE,
        created_at: Sequelize.DATE,
        updated_at: Sequelize.DATE,
        user_id: {
          type: Sequelize.UUID,
          allowNull: false,
          onDelete: "CASCADE",
          references: { model: TABLE_NAMES?.USER, key: "id" },
        }
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
