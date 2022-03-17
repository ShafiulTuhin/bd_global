"use strict";
const { Model } = require("sequelize");
const { TABLE_NAMES, FIAT_CURRENCIES } = require("../../constants");
const faker = require("faker");

module.exports = (sequelize, DataTypes) => {
  class BankDetail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      const { User, BankDetail } = models;
      
      BankDetail.belongsTo(User, {
        foreignKey: "user_id",
      });
    }
    static FAKE(count = 0) {
      let rows = [],
        result = {},
        index = 0;
      let generateFakeData = () => {
        let user_id = faker.datatype.uuid();
        return {
          id: faker.datatype.uuid(),
          // account_no: faker.finance.iban(),
          bank_name: faker.lorem.slug(3),
          swift_code: faker.finance.bic(),
          // currency: faker.helpers.randomize(Object.keys(FIAT_CURRENCIES)),
          archived_at: faker.datatype.datetime(),
          createdAt: faker.datatype.datetime(),
          updatedAt: faker.datatype.datetime(),
        };
      };
      if (count > 0) {
        for (; index < count; ++index) {
          rows.push(generateFakeData());
        }
        result = { count, rows };
      } else result = { ...generateFakeData() };
      return result;
    }
  }
  BankDetail.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      // account_no: {
      //   type: DataTypes.STRING,
      //   allowNull: false,
      //   unique: true,
      // },

      bank_name: {
        type: DataTypes.STRING,
      },
      swift_code: {
        type: DataTypes.STRING,
        validate: {
          min: 8,
          max: 11,
        },
        allowNull: false,
      },
      // currency: {
      //   type: DataTypes.ENUM(Object.keys(FIAT_CURRENCIES)),
      //   defaultValue: "USD",
      //   allowNull: false,
      //   set(val) {
      //     this.setDataValue("currency", String(val)?.toUpperCase());
      //   },
      // },
    },
    {
      sequelize,
      modelName: "BankDetail",
      tableName: TABLE_NAMES?.BANK_DETAIL || "tbl_bank_details",
      underscored: true,
    }
  );
  return BankDetail;
};
