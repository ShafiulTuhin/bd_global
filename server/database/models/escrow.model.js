"use strict";
const { Model } = require("sequelize");
const { TABLE_NAMES } = require("../../constants");
const faker = require("faker");

module.exports = (sequelize, DataTypes) => {
  class Escrow extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      const { Escrow, Order, User } = models;

      Order.hasOne(Escrow, {
        foreignKey: {
          name: "order_id",
        },
      });

      Escrow.belongsTo(User, {
        foreignKey: "buyer_id",
      });

      Escrow.belongsTo(User, {
        foreignKey: "seller_id",
      });
    }

    static FAKE(count) {
      let rows = [],
        result = {},
        index = 0;
      let generateFakeData = () => {
        let id = faker.datatype.uuid();

        return {
          id,
          order_id: faker.datatype.uuid(),
          fiat_amount_in_hold: faker.datatype.float(),
          seller_id: faker.datatype.uuid(),
          buyer_id: faker.datatype.uuid(),
          fee: faker.datatype.float(),
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
  Escrow.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      order_id: DataTypes.STRING,
      fiat_amount_in_hold: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        validate: {
          min: 0,
          isInt: true,
        },
      },
      seller_id: DataTypes.UUID,
      buyer_id: DataTypes.UUID,
      fee: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        validate: {
          min: 0,
          isInt: true,
        },
      },
    },
    {
      sequelize,
      modelName: "Escrow",
      underscored: true,
      tableName: TABLE_NAMES?.ESCROW || "tbl_escrows",
    }
  );

  return Escrow;
};
