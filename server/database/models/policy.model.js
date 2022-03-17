"use strict";
const { Model } = require("sequelize");
const { TABLE_NAMES } = require("../../constants");
const faker = require("faker");

module.exports = (sequelize, DataTypes) => {
  class Policy extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ User, Policy }) {
      // define association here
      Policy.belongsTo(User, {
        foreignKey: {
          name: "user_id",
        },
      });
    }

    static FAKE(count) {
      let rows = [],
        result = {},
        index = 0;
      let generateFakeData = () => {
        return {
          escrow_fee: faker.datatype.float(),
          buyer_ad_fee: faker.datatype.float(),
          seller_ad_fee: faker.datatype.float(),
          min_confirmation_block: faker.datatype.number(),
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
  Policy.init(
    {
      escrow_fee: DataTypes.DOUBLE,
      buyer_ad_fee: DataTypes.DOUBLE,
      seller_ad_fee: DataTypes.DOUBLE,
      min_confirmation_block: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      modelName: "Policy",
      underscored: true,
      tableName: TABLE_NAMES?.POLICY || "tbl_policies",
    }
  );

  return Policy;
};
