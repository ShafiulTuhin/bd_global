"use strict";
const { Model } = require("sequelize");
const _ = require("underscore");
const { TABLE_NAMES, SECURITY_TYPES } = require("../../constants");
const faker = require("faker");
const hooks = require("../hooks/security.hook");

module.exports = (sequelize, DataTypes) => {
  class Security extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      const { User, Security } = models;

      Security.belongsTo(User, {
        as: "user",
        foreignKey: "user_id",
      });
    }

    static FAKE(count) {
      let rows = [],
        result = {},
        index = 0;
      let generateFakeData = () => {
        const { User } = sequelize?.models;
        return {
          id: faker.datatype.uuid(),
          otp: faker.datatype.float(5),
          otp_ttl: faker.datatype.datetime(),
          two_factor: faker.datatype.boolean(),
          last_verified_token: faker.random.alphaNumeric(50),
          user: User.FAKE(),
          confirmations: {
            login: faker.helpers.randomize(SECURITY_TYPES),
            transaction: faker.helpers.randomize(SECURITY_TYPES),
          },
          ip_address: [faker.internet.ip()],
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

  Security.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      otp: {
        type: DataTypes.STRING,
      },
      otp_ttl: DataTypes.DATE,
      confirmations: {
        type: DataTypes.JSONB,
        defaultValue: {
          login: [SECURITY_TYPES.EMAIL],
          transaction: [SECURITY_TYPES.EMAIL],
        },
        allowNull: false,
      },
      ip_address: {
        type: DataTypes.JSON,
        get: function () {
          return this.getDataValue("ip_address");
        },
        set: function (value) {
          let storedValue = this.getDataValue("ip_address") || [];
          let updated =
            storedValue?.length &&
              Array.isArray(storedValue) &&
              storedValue?.includes(value)
              ? storedValue
              : [...storedValue, value];
          this.setDataValue("ip_address", updated);
        },
      },
      two_factor: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        get(){
          let metadata = this.getDataValue("metadata")||{}
          return Boolean(Object.keys(metadata).length)
        }
      },

      last_verified_token: DataTypes.STRING,
      metadata: {
        type: DataTypes.JSON,
        default: {}
      },
    },
    {
      sequelize,
      modelName: "Security",
      underscored: true,
      hooks,
      tableName: TABLE_NAMES.SECURITY || "tbl_securities",
    }
  );

  return Security;
};
