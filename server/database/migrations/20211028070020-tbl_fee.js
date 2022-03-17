"use strict";
const { MIME_TYPES, FILE_UPLOAD_PATH } = require("../../constants");

let { TABLE_NAMES,FEE_TYPES, SUPPORTED_TOKENS } = require("../../constants");
let table_name = TABLE_NAMES.FEE;

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Add all table modifications here
      async function modifications(d) {
        await queryInterface.sequelize.transaction(async (t) => {
          return await Promise.all([]);
        });
      }

      // table field definitions
      let fields = {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
          defaultValue: Sequelize.UUIDV4,
        },
        type: {
          type: Sequelize.ENUM(Object.values(FEE_TYPES)),
          allowNull: false,
        },
        amount_in_percent: Sequelize.DOUBLE,
        user_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: TABLE_NAMES?.USER || "tbl_users", key: "id" },
          onDelete: "CASCADE",
        },
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
