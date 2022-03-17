"use strict";
const { Model } = require("sequelize");
const hooks = require("../hooks/order.hook");
const { TABLE_NAMES, ORDER_STATUSES } = require("../../constants");
const faker = require("faker");

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      const { Order, Advert, User, Message } = models;
      Order.belongsTo(Advert, {
        foreignKey: "advert_id",
        as: "advert",
      });
      Order.belongsTo(User, { as: "user", foreignKey: "user_id" });
      Order.hasMany(Message, { as: "orders" });
    }

    static FAKE(count = 0, options) {
      const where = options && options?.where;
      let rows = [],
        result = {},
        index = 0;
      let generateFakeData = () => {
        let { User, Advert } = sequelize?.models;
        return {
          id: `ORD-${Date.now().toString()}`,
          total_amount: faker.datatype.float(),
          total_quantity: faker.datatype.number(),
          advert_user_confirm: faker.datatype.number(),
          order_user_confirm: faker.datatype.number(),
          appeal: faker.lorem.sentence(),
          remark: faker.lorem.sentence(),
          status: faker.helpers.randomize(Object.values(ORDER_STATUSES)),
          rating: faker.helpers.randomize([1, 2, 3, 4, 5]),
          archived_at: faker.datatype.datetime(),
          trx_id: faker.datatype.uuid(),
          created_at: faker.datatype.datetime(),
          updated_at: faker.datatype.datetime(),
          media: [faker.datatype.uuid()],
          user: User.FAKE(),
          advert: Advert.FAKE(),
          ...where,
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

  Order.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: () => {
          return `ORD-${Date.now().toString()}`;
        },
      },
      total_amount: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      total_quantity: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      advert_user_confirm: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      order_user_confirm: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      blockage_id: DataTypes.STRING,
      blockage_expiring_date: DataTypes.DATE,
      appeal: DataTypes.STRING,
      remark: DataTypes.STRING,
      status: {
        type: DataTypes.ENUM(Object.values(ORDER_STATUSES)),
        defaultValue: ORDER_STATUSES.PENDING,
        set(val) {
          this.setDataValue("status", String(val)?.toUpperCase());
        },
      },
      rating: {
        type: DataTypes.INTEGER,
        validate: {
          isInt: true,
          min: 0,
          max: 5,
        },
        allowNull: true,
      },
      archived_at: DataTypes.DATE,
      trx_id: DataTypes.STRING,
      media: DataTypes.JSON,
    },
    {
      sequelize,
      modelName: "Order",
      underscored: true,
      paranoid: true,
      tableName: TABLE_NAMES?.ORDER || "tbl_orders",
      hooks,
      deletedAt: "archived_at",
    }
  );
  return Order;
};
