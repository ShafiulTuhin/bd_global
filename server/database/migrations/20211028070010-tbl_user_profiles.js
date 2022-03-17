"use strict";

let { TABLE_NAMES, PROFILE_MODES } = require("../../constants");
let table_name = TABLE_NAMES?.PROFILE || "tbl_user_profiles";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      //  Add all table modifications here
      async function modifications(d) {
        await queryInterface.sequelize
          .transaction(async (t) => {
            return await Promise.all([
              !("date_of_birth" in d) &&
                queryInterface.addColumn(
                  table_name,
                  "date_of_birth", // new field name
                  {
                    allowNull: true,
                    type: Sequelize.DATEONLY,
                  },
                  {
                    transaction: t,
                  }
                ),
              !("phone" in d) &&
                queryInterface.addColumn(
                  table_name,
                  "phone", // new field name
                  {
                    type: Sequelize.STRING,
                  },
                  {
                    transaction: t,
                  }
                ),
              !("avatar_upload" in d) &&
                queryInterface.addColumn(
                  table_name,
                  "avatar_upload", // new field name
                  {
                    type: Sequelize.UUID,
                    references: {
                      model: TABLE_NAMES?.UPLOAD || "tbl_uploads",
                      key: "id",
                    },
                  },
                  {
                    transaction: t,
                  }
                ),
            ]);
          })
          .catch(console.error);
      }

      // table field definitions
      let fields = {
        profile_id: {
          type: Sequelize.UUID,
          primaryKey: true,
          defaultValue: Sequelize.UUIDV4,
        },
        mode: {
          type: Sequelize.ENUM,
          values: Object.values(PROFILE_MODES),
          defaultValue: PROFILE_MODES.STANDARD,
          comment: "User mode state: [standard, merchant]",
        },
        gender: Sequelize.STRING,
        invite_code: {
          type: Sequelize.STRING,
        },
        suitability: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
          validate: {
            min: 0,
            max: 5,
          },
        },
        payment_methods: Sequelize.JSON,
        pname: { type: Sequelize.STRING, comment: "public name" },
        lname: {
          type: Sequelize.STRING,
          comment: "last name",
        },
        oname: {
          type: Sequelize.STRING,
          comment: "other names",
        },
        created_at: Sequelize.DATE,
        updated_at: Sequelize.DATE,
        archived_at: Sequelize.DATE,
        user_id: {
          type: Sequelize.UUID,
          onDelete: "CASCADE",
          references: { model: TABLE_NAMES?.USER || "tbl_users", key: "id" },
        },
        email: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
          validate: {
            notEmpty: true,
            isEmail: true,
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
