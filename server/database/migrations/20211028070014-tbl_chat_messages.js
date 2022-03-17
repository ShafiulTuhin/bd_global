"use strict";
let { TABLE_NAMES } = require("../../constants");
let table_name = TABLE_NAMES?.CHAT_MESSAGE || "tbl_chat_messages";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Table field definitions
      let fields = {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
          defaultValue: Sequelize.UUIDV4,
        },
        text: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        read: { type: Sequelize.JSONB, defaultValue: [] },
        room: Sequelize.STRING,
        order_id: Sequelize.STRING,
        created_at: Sequelize.DATE,
        updated_at: Sequelize.DATE,
        sender_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: TABLE_NAMES?.USER || "tbl_users",
            key: "id",
          },
        },
        upload_id: {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: TABLE_NAMES?.UPLOAD || "tbl_uploads",
            key: "id",
          },
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
