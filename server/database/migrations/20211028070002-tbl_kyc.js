"use strict";
const { KYC_STATUSES, KYC_TYPES, TABLE_NAMES } = require("../../constants");

let table_name = TABLE_NAMES?.KYC || "tbl_kyc";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Table fields or columns definition
      let fields = {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
          defaultValue: Sequelize.UUIDV4,
        },
        type: {
          type: Sequelize.STRING,
          validate: {
            notEmpty: true,
            includes(value) {
              let list = Object.values(KYC_TYPES).join(",");

              if (!list.includes(value)) {
                throw new Error(`${value} is not included in ${list}`);
              }
              return value;
            },
          },
          allowNull: false,
        },
        status: {
          type: Sequelize.STRING,
          validate: {
            notEmpty: true,
            includes(value) {
              let list = Object.values(KYC_STATUSES).join(",");

              if (!list.includes(value)) {
                throw new Error(`${value} is not included in ${list}`);
              }
              return value;
            },
          },
          allowNull: false,
          defaultValue: KYC_STATUSES.PENDING,
        },
        created_at: Sequelize.DATE,
        updated_at: Sequelize.DATE,
        archived_at: Sequelize.DATE,
        uploads: {
          type: Sequelize.JSONB,
        },
        user_id: {
          type: Sequelize.UUID,
          allowNull: false,
          onDelete: "CASCADE",
          references: { model: TABLE_NAMES?.USER || "tbl_users", key: "id" },
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
