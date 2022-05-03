"use strict";
const { Model } = require("sequelize");
const _ = require("underscore");
const { COUNTRIES, TABLE_NAMES } = require("../../constants");
const faker = require("faker");

module.exports = (sequelize, DataTypes) => {
  class Address extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      const { Address, User } = models;

      Address.belongsTo(User, {
        foreignKey: "user_id",
      });
    }

    toPublic() {
      return _.omit(this.toJSON(), []);
    }
    static FAKE(count = 0) {
      let rows = [],
        result = {},
        index = 0;
      const { User } = sequelize?.models;
      let generateFakeData = () => {
        let user_id = faker.datatype.uuid();
        return {
          id: faker.datatype.uuid(),
          user_id,
          country: faker.address.countryCode(),
          address_line: faker.address.secondaryAddress(),
          archived_at: faker.datatype.datetime(),
          createdAt: faker.datatype.datetime(),
          updatedAt: faker.datatype.datetime(),
          user: User.FAKE(),
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
  Address.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      zipcode: DataTypes.STRING,
      country: {
        type: DataTypes.ENUM(Object.keys(COUNTRIES)),
        /* set(val) {
          this.setDataValue("country", String(val)?.toUpperCase());
        },
        get() {
          return COUNTRIES[this.getDataValue("country")];
        }, */
      },
      address_line: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "Address",
      underscored: true,
      tableName: TABLE_NAMES?.ADDRESS || "tbl_addresses",
    }
  );

  return Address;
};
