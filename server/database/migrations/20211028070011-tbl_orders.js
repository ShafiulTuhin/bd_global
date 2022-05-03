"use strict";

let { TABLE_NAMES, ORDER_STATUSES } = require("../../constants");
let table_name = TABLE_NAMES?.ORDER || "tbl_orders";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Add table modifications here
      async function modifications(d) {
        await queryInterface.sequelize.transaction(async (t) => {
          return await Promise.all([
            "from_user_id" in d &&
              queryInterface.renameColumn(
                table_name,
                "from_user_id",
                "user_id",
                {
                  transaction: t,
                }
              ),
          ]);
        });
      }

      // Table field definitions
      let fields = {
        id: {
          type: Sequelize.STRING,
          primaryKey: true,
          defaultValue: () => {
            return `ORD-${Date.now().toString()}`;
          },
        },
        total_amount: {
          type: Sequelize.DOUBLE,
          allowNull: false,
          defaultValue: 0,
          validate: {
            min: 0,
          },
        },
        total_quantity: {
          type: Sequelize.DOUBLE,
          allowNull: false,
          defaultValue: 0,
        },
        advert_user_confirm: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        order_user_confirm: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        media: Sequelize.JSON,
        blockage_id: Sequelize.STRING,
        blockage_expiring_date: Sequelize.DATE,
        appeal: Sequelize.STRING,
        remark: Sequelize.STRING,
        status: {
          type: Sequelize.ENUM(Object.values(ORDER_STATUSES)),
          defaultValue: ORDER_STATUSES.PENDING,
        },
        rating: {
          type: Sequelize.INTEGER,
          validate: {
            isInt: true,
            min: 0,
            max: 5,
          },
          allowNull: true,
        },
        trx_id: Sequelize.STRING,
        archived_at: Sequelize.DATE,
        created_at: Sequelize.DATE,
        updated_at: Sequelize.DATE,
        user_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: TABLE_NAMES?.USER || "tbl_users", key: "id" },
        },
        advert_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: TABLE_NAMES?.ADVERT || "tbl_adverts",
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
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.dropTable(table_name, {
          transaction: t,
        }),
      ]);
    });
  },
};
