"use strict";
const { Model } = require("sequelize");
const { TABLE_NAMES, TRADE_TYPES, LOG_TYPES } = require("../../constants");
const faker = require("faker");
const {
  FIAT_CURRENCIES,
  CRYPTO_CURRENCIES,
  SUPPORTED_TOKENS,
} = require("../../constants");
const hooks = require("../hooks/advert.hook");

module.exports = (sequelize, DataTypes) => {
  class Advert extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static total = 0;

    static associate(models) {
      // define association here
      const { Advert, Order, User } = models;
      Advert.belongsTo(User, { foreignKey: "user_id", as: "user" });

      Advert.hasMany(Order, {
        as: "orders",
        foreignKey: {
          name: "advert_id",
          allowNull: false,
        },
      });
    }

    static FAKE(count = 0, options) {
      const where = options && options?.where;
      let rows = [],
        result = {},
        index = 0;

      let generateFakeData = () => {
        let user_id = faker.datatype.uuid();
        let { User } = sequelize?.models;
        let fiat = faker.finance.currencyCode();
        let crypto = faker.helpers.randomize(Object.keys(SUPPORTED_TOKENS));
        let price = faker.datatype.float({ min: 20, max: 1000 });
        let total_qty = faker.datatype.number({ min: 1, max: 1000 });
        let max_order_qty = faker.datatype.number({ min: 1, max: total_qty });
        let min_order_qty = faker.datatype.number({
          min: 1,
          max: max_order_qty,
        });
        let min_order_price = price;
        let max_order_price = price * max_order_qty;
        let available_qty = faker.datatype.float({
          min: min_order_qty,
          max: max_order_qty,
        });

        return {
          id: faker.datatype.uuid(),
          user_id,
          min_order_qty,
          max_order_qty,
          price,
          available_qty,
          total_qty,
          fiat,
          crypto,
          payment_methods: [faker.helpers.randomize(["wechat", "alipay"])],
          type: faker.helpers.randomize(["buy", "sell"]),
          payment_ttl_mins: faker.datatype.number(),
          floating_price_margin: faker.datatype.float(),
          remarks: faker.lorem.sentence(),
          auto_reply_message: faker.lorem.sentence(),
          // trade_conditions: faker.lorem.sentence(),
          published: faker.datatype.boolean(),
          archived_at: null,
          createdAt: faker.datatype.datetime(),
          updatedAt: faker.datatype.datetime(),
          total_orders: faker.datatype.number(),
          total_completed_orders: faker.datatype.number(),
          currency_pair: `${crypto}/${fiat}`,
          user: User.FAKE(),
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

    /**
     *
     * @param {import('../../schema/logger.metadata.schema').ADVERTSSchema} metadata
     * @returns {Promise<import('../../schema/others').StatusResponse>}
     */
    async logAdvert(metadata) {
      /**
       * @type Model
       */
      const Logger = sequelize.models.Logger;
      await Logger.create({
        type: LOG_TYPES.ADVERTS,
        metadata,
      });

      return { status: "success", message: "commission log has been created" };
    }
  }

  Advert.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      user_id: DataTypes.UUID,
      min_order_qty: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      max_order_qty: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      payment_methods: {
        type: DataTypes.JSONB,
        allowNull: false,
        get: function() {
          let res = this.getDataValue("payment_methods");
          return !res ? res : JSON.parse(res);
        },
        set: function(value) {
          this.setDataValue("payment_methods", JSON.stringify(value));
        },
      },
      type: {
        type: DataTypes.ENUM(Object.values(TRADE_TYPES)),
        set(val) {
          this.setDataValue("type", String(val)?.toUpperCase());
        },
        allowNull: false,
        comment:
          "Advert type where a buyer ad requires a seller to initiate an order. A seller ad requires a buyer to inititate an order",
      },
      payment_ttl_mins: {
        type: DataTypes.INTEGER,
        defaultValue: 90,
        validate: {
          isInt: true,
        },
        comment: "Time limit in minutes within which order should be completed",
      },
      price: {
        validate: {
          notEmpty: true,
          min: 0,
        },
        type: DataTypes.DOUBLE,
      },
      market_price: {
        type: DataTypes.DOUBLE,
        validate: {
          min: 0,
        },
      },
      floating_price_margin: {
        type: DataTypes.DOUBLE,
        validate: {
          min: 0,
        },
        comment: "(80 - 200%) Price = market_price * currency * floating_price",
      },

      total_qty: {
        allowNull: false,
        type: DataTypes.DOUBLE,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      available_qty: {
        allowNull: false,
        type: DataTypes.DOUBLE,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      crypto: {
        type: DataTypes.STRING,
        comment: "Kind of crypto currency",
        allowNull: false,
        get() {
          return String(this.getDataValue("crypto"))?.toUpperCase();
        },
        set(value) {
          this.setDataValue("crypto", String(value)?.toUpperCase());
        },
      },
      fiat: {
        type: DataTypes.STRING,
        comment: "Kind of fiat currency",
        allowNull: false,
        get() {
          return String(this.getDataValue("fiat"))?.toUpperCase();
        },
        set(value) {
          this.setDataValue("fiat", String(value)?.toUpperCase());
        },
      },
      remarks: DataTypes.STRING(255),
      auto_reply_message: {
        type: DataTypes.STRING(255),
        comment: "Message to be sent after order is placed",
      },
      counter_party_conditions: {
        type: DataTypes.JSON,
      },
      published: {
        allowNull: false,
        defaultValue: false,
        type: DataTypes.BOOLEAN,
        comment: "Indicates whether advert is published or not",
      },
      archived_at: {
        type: DataTypes.DATE,
        comment: "Indicates whether a record is soft deleted or not",
      },
      currency_pair: {
        type: DataTypes.VIRTUAL,
        // get() {
        //   return `${this.getDataValue(crypto)}/${this.getDataValue("fiat")}`;
        // },
      },
    },
    {
      sequelize,
      modelName: "Advert",
      underscored: true,
      tableName: TABLE_NAMES?.ADVERT || "tbl_adverts",
      paranoid: true,
      deletedAt: "archived_at",
      hooks,
    }
  );

  return Advert;
};
