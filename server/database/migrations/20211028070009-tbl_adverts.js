"use strict";
let { TABLE_NAMES, TRADE_TYPES } = require("../../constants");
let table_name = TABLE_NAMES?.ADVERT || "adverts";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Add all table modifications here
      async function modifications(d) {
        await queryInterface.sequelize.transaction(async (t) => {
          return await Promise.all([
            "crypto_currency" in d &&
              queryInterface.renameColumn(
                table_name,
                "crypto_currency",
                "crypto",
                { transaction: t }
              ),
            "fiat_currency" in d &&
              queryInterface.renameColumn(table_name, "fiat_currency", "fiat", {
                transaction: t,
              }),
          ]);
        });
      }

      // Table field definitions
      let fields = {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
          defaultValue: Sequelize.UUIDV4,
        },
        min_order_qty: {
          type: Sequelize.DOUBLE,
          allowNull: false,
          validate: {
            min: 0,
          },
        },
        max_order_qty: {
          type: Sequelize.DOUBLE,
          allowNull: false,
          validate: {
            min: 0,
          },
        },
        payment_methods: {
          type: Sequelize.JSONB,
          allowNull: false,
        },
        type: {
          type: Sequelize.ENUM(Object.values(TRADE_TYPES)),
          allowNull: false,
          comment:
            "Advert type where a buyer ad requires a seller to initiate an order. A seller ad requires a buyer to inititate an order",
        },
        payment_ttl_mins: {
          type: Sequelize.INTEGER,
          defaultValue: -1,
          validate: {
            isInt: true,
          },
          comment:
            "Time limit in minutes within which order should be completed",
        },
        price: {
          validate: {
            notEmpty: true,
            min:0
          },
          type: Sequelize.DOUBLE,
        },
        floating_price_margin: {
          type: Sequelize.DOUBLE,
          comment:
            "(80 - 200%) Price = market_price * currency * floating_price",
        },

        market_price: {
          type: Sequelize.DOUBLE,
        },
        total_qty: {
          allowNull: false,
          type: Sequelize.DOUBLE,
          defaultValue: 0,
          validate: {
            min: 0
          },
        },
        available_qty: {
          allowNull: false,
          type: Sequelize.DOUBLE,
          defaultValue: 0,
          validate: {
            min: 0
          },
        },
        crypto: {
          type: Sequelize.STRING,
          comment: "Kind of crypto currency",
          allowNull: false,
        },
        fiat: {
          type: Sequelize.STRING,
          comment: "Kind of fiat currency",
          allowNull: false,
        },
        remarks: Sequelize.STRING(255),
        auto_reply_message: {
          type: Sequelize.STRING(255),
          comment: "Message to be sent after order is placed",
        },
        counter_party_conditions: {
          type: Sequelize.JSON,
        },
        published: {
          allowNull: false,
          defaultValue: false,
          type: Sequelize.BOOLEAN,
          comment: "Indicates whether advert is published or not",
        },
        archived_at: {
          type: Sequelize.DATE,
          comment: "Indicates whether a record is soft deleted or not",
        },
        created_at: Sequelize.DATE,
        updated_at: Sequelize.DATE,
        user_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: TABLE_NAMES?.USER || "users", key: "id" },
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
