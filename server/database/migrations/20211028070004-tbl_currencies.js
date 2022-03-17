"use strict";
let {
  TABLE_NAMES,
  FIAT_CURRENCIES,
  CRYPTO_CURRENCIES,
  CURRENCY_TYPES,
} = require("../../constants");
let table_name = TABLE_NAMES?.CURRENCY || "tbl_currencies";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Add all table modifications here
      async function modifications(d) {
        try {
          await queryInterface.sequelize.transaction(async (t) => {
            return await Promise.all([]);
          });
        } catch (err) {
          console.error(err);
        }
      }

      // table field definitions
      let fields = {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
          defaultValue: Sequelize.UUIDV4,
        },
        image_url: {
          type: Sequelize.UUID,
          references: {
            model: TABLE_NAMES?.UPLOAD || "tbl_uploads",
            key: "id",
          },
        },
        name: {
          type: Sequelize.STRING,
          unique: true,
        },
        iso_code: {
          type: Sequelize.STRING,
          validate: {
            isIn: [
              ...Object.keys(FIAT_CURRENCIES),
              ...Object.keys(CRYPTO_CURRENCIES),
            ],
            notEmpty: true,
          },
          unique: true,
        },
        active: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          comment: "Indicates whether currency is active or not",
        },
        type: {
          type: Sequelize.ENUM(Object.values(CURRENCY_TYPES)),
          allowNull: false,
        },
        created_at: Sequelize.DATE,
        updated_at: Sequelize.DATE,
        archived_at: Sequelize.DATE,
        user_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: TABLE_NAMES?.USER || "tbl_users", key: "id" },
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
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.dropTable(table_name, {
          transaction: t,
        }),
      ]);
    });
  },
};
