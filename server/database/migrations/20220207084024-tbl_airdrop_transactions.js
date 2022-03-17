"use strict";
let { TABLE_NAMES, SUPPORTED_TOKENS } = require("../../constants");
let table_name = TABLE_NAMES?.AIRDROP_TRANSACTION || "tbl_airdrop_transactions";


module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Add all modifications here
      async function modifications(d) {
        await queryInterface.sequelize.transaction(async (t) => {
          return await Promise.all([
            !("created_by" in d) &&
              queryInterface.addColumn(
                table_name,
                "created_by", // new field name
                {
                  type: Sequelize.UUID,
                  allowNull: false,
                  references: {
                    model: TABLE_NAMES?.USER || "tbl_users",
                    key: "id",
                  },
                },
                {
                  transaction: t,
                }
              ),

              !("reason_detail" in d) &&
              queryInterface.addColumn(
                table_name,
                "reason_detail", // new field name
                {
                  type: Sequelize.STRING,
                  allowNull: true,
                },
                {
                  transaction: t,
                }
              ),
          ]);
        });
      }

      // async function modifications(d) {
      //   await queryInterface.sequelize.transaction(async (t) => {
      //     return await Promise.all([
      //       queryInterface.changeColumn(table_name, 'reason', {
      //         allowNull: false
      //       })
      //     ]);
      //   });
      // }



      // Table field definitions
      let fields = {
        id: {
          type: Sequelize.STRING,
          primaryKey: true
        }, 
        user_id: {
          type: Sequelize.UUID,
          allowNull: true,
          onDelete: "CASCADE",
          references: { model: TABLE_NAMES?.USER, key: "id" },
        },
        crypto: {
          type: Sequelize.ENUM(Object.keys(SUPPORTED_TOKENS)),
          allowNull: false,
        },
        amount: {
          allowNull: false,
          type: Sequelize.DOUBLE,
          defaultValue: 0,
          validate: {
            min: 0
          },
        },
        reason: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        created_at: Sequelize.DATE,
        updated_at: Sequelize.DATE,
        archived_at: Sequelize.DATE,
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
