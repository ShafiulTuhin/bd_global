"use strict";

let { TABLE_NAMES, SECESSION_STATUSES } = require("../../constants");
let table_name = TABLE_NAMES?.SECESSION || "tbl_secessions";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Add all table modifications here
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
        level: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 1,
        },
        status: {
          type: Sequelize.ENUM(Object.values(SECESSION_STATUSES)),
          allowNull: false,
          defaultValue: SECESSION_STATUSES.PENDING,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        approval_date: Sequelize.DATE,
        archived_at: Sequelize.DATE,
        created_at: {
          type: Sequelize.DATE,
        },
        updated_at: {
          type: Sequelize.DATE,
        },
        user_id: {
          type: Sequelize.UUID,
          allowNull: false,
          onDelete: "CASCADE",
          references: {
            model: TABLE_NAMES?.USER || "tbl_users",
            key: "id",
          },
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

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable(table_name);
  },
};
