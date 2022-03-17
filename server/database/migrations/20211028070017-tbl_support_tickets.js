"use strict";
const {
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  TABLE_NAMES,
} = require("../../constants");
let table_name = TABLE_NAMES?.SUPPORT_TICKET || "tbl_support_tickets";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Table fields
      let fields = {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
          defaultValue: Sequelize.UUIDV4,
        },
        priority: {
          type: Sequelize.ENUM(Object.keys(TICKET_PRIORITIES)),
          allowNull: false,
          defaultValue: TICKET_PRIORITIES.LOW,
        },
        subject: {
          type: Sequelize.STRING,
          defaultValue: "<No subject>",
        },
        description: {
          type: Sequelize.STRING,
          defaultValue: "<No description>",
        },
        reason: {
          type: Sequelize.STRING,
          defaultValue: "<No reason>",
        },
        status: {
          type: Sequelize.ENUM(Object.keys(TICKET_STATUSES)),
          allowNull: false,
          defaultValue: TICKET_STATUSES.OPEN,
        },
        created_at: Sequelize.DATE,
        updated_at: Sequelize.DATE,
        images: Sequelize.JSONB,
        user_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: TABLE_NAMES?.USER || "tbl_users", key: "id" },
        },
        order_id: {
          type: Sequelize.STRING,
          allowNull: true,
          references: { model: TABLE_NAMES?.ORDER || "tbl_orders", key: "id" },
        },
        room: Sequelize.STRING,
        admin_id: {
          type: Sequelize.UUID,
          allowNull: true,
          references: { model: TABLE_NAMES?.USER || "tbl_users", key: "id" },
        },
      };

      // Add table modifications here
      async function modifications(d) {
        await queryInterface.sequelize.transaction(async (t) => {
          return await Promise.all([
            !("archived_at" in d) &&
              queryInterface.addColumn(table_name, "archived_at", {
                type: Sequelize.DATE,
              }),
            !("assigned_to" in d) &&
              queryInterface.addColumn(table_name, "assigned_to", {
                type: Sequelize.UUID,
                references: {
                  model: TABLE_NAMES?.USER || "tbl_users",
                  key: "id",
                },
              }),
          ]);
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
