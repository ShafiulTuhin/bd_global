"use strict";
const { Model } = require("sequelize");
const { TABLE_NAMES } = require("../../constants");
const faker = require("faker")


module.exports = (sequelize, DataTypes) => {
  class Analytics extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

    static FAKE(count = 0) {
      let rows = [],
        result = {},
        index = 0;
      let generateFakeData = () => {
        let user_id = faker.datatype.uuid();
        return {
          id: faker.datatype.uuid(),
          user: {
            recent: faker.datatype.number(),
            total: faker.datatype.number(),
            suspended: faker.datatype.number(),
          },
          wallet: { recent: faker.address.secondaryAddress },
          support_ticket: {recent:faker.address.secondaryAddress,
          total: faker.datatype.number(),
        },
          security: {recent:faker.address.secondaryAddress,
          total: faker.datatype.number(),
        },
          kyc: {recent:faker.address.secondaryAddress,
          total: faker.datatype.number(),
        },
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
  Analytics.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      user: {
        type: DataTypes.JSON,
      },
      wallet: { type: DataTypes.JSON },
      support_ticket: { type: DataTypes.JSON },
      kyc: { type: DataTypes.JSON },
      security: { type: DataTypes.JSON },
    },
    {
      sequelize,
      modelName: "Analytics",
      tableName: TABLE_NAMES?.ANALYTICS || "tbl_analytics",
      underscored: true,
    }
  );
  return Analytics;
};
