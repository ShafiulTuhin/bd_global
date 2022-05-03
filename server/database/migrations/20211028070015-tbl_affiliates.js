"use strict";
let { TABLE_NAMES } = require("../../constants");
let table_name = TABLE_NAMES?.AFFILIATE || "tbl_affiliates";

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
        friends: {
          type: Sequelize.JSONB,
          get: function() {
            return this.getDataValue("friends");
          },
          set: function(value) {
            let storedValue = this.getDataValue("friends") || [];
            let updated =
              storedValue?.length &&
              Array.isArray(storedValue) &&
              storedValue?.includes(value)
                ? storedValue
                : [...storedValue, value];
            this.setDataValue("friends", updated);
          },
        },
        created_at: Sequelize.DATE,
        updated_at: Sequelize.DATE,
        user_id: {
          type: Sequelize.UUID,
          allowNull: false,
          unique: true,
          onDelete: "CASCADE",
          references: {
            model: TABLE_NAMES?.USER || "tbl_users",
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
