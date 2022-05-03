"use strict";
const { Model } = require("sequelize");
const { TABLE_NAMES } = require("../../constants");
const faker = require("faker");
const { FIAT_CURRENCIES, SUPPORTED_TOKENS, FEE_TYPES } = require("../../constants");

module.exports = (sequelize, DataTypes) => {
  class Fee extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ User, Fee }) {
      Fee.belongsTo(User, {
        foreignKey: {
          name: "user_id",
        },
      });
    }

    static FAKE(count=1) {
      let rows = [],
        result = {},
        index = 0;
      let generateFakeData = () => {
        return {
          id: faker.datatype.uuid(),
          type: faker.helpers.randomize(Object.keys(FEE_TYPES)),
          amount_in_percent: faker.datatype.number(100),
          createdAt: faker.datatype.datetime(),
          updatedAt: faker.datatype.datetime(),
        };
      };
      if (count > 1) {
        for (; index < count; ++index) {
          rows.push(generateFakeData());
        }
        result = { count, rows };
      } else result = { ...generateFakeData() };
      return result;
    }
  }

  Fee.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      type: {
        type: DataTypes.ENUM(Object.values(FEE_TYPES)),
        set(val) {
          this.setDataValue("type", String(val)?.toUpperCase());
        },
      },
      crypto: {
        type: DataTypes.ENUM(Object.keys(SUPPORTED_TOKENS)),
        set(val) {
          this.setDataValue("crypto", String(val)?.toUpperCase());
        },
      },
      amount_in_percent: DataTypes.DOUBLE,
    },
    {
      sequelize,
      modelName: "Fee",
      underscored: true,
      tableName: TABLE_NAMES?.FEE || "tbl_fees",
    }
  );
  return Fee;
};
