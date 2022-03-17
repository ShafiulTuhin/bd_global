"use strict";
const { Model } = require("sequelize");
const _ = require("underscore");
const {
  TABLE_NAMES,
  LOG_TYPES,
  LOG_STATUSES,
  TRADE_TYPES,
} = require("../../constants");
const faker = require("faker");
const metadataSchema = require("../../schema/logger.metadata.schema");
const constants = require("../../constants");
const boom = require("@hapi/boom");

module.exports = (sequelize, DataTypes) => {
  class Logger extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      const { User, Logger } = models;
      Logger.belongsTo(User);
    }

    // helper for creating log

    // static createUserLog(metadata){

    // }

    toPublic() {
      return _.omit(this.toJSON(), ["user_id"]);
    }

    static FAKE(count = 0) {
      let rows = [],
        result = {},
        index = 0;
      let getMetadata = {
        SESSION: () => ({
          duration: faker.date.soon(),
          last_seen: faker.date.past(),
          login: faker.datatype.datetime(),
          logout: faker.datatype.datetime(),
          login_status: faker.helpers.randomize(Object.keys(LOG_STATUSES)),
        }),
        TRADES: () => ({
          buyer_email: faker.internet.email(),
          seller_email: faker.internet.email(),
          post_type: faker.helpers.randomize(["buy", "sell"]),
          currency_pair: `${faker.finance.currencyCode()}/${faker.finance.currencyCode()}`,
          price: faker.datatype.number(10),
          fiat_amount: faker.datatype.number(10000),
          total_crypto: faker.datatype.number(20),
        }),
        CHATS: () => ({
          visitor_email: faker.internet.email(),
          country: faker.address.countryCode(),
          browser: faker.company.suffixes()[0],
          duration: faker.datatype.datetime(),
        }),
        SMS: () => ({
          to: faker.internet.email(),
          message: faker.lorem.sentence(),
          status: faker.helpers.randomize(["success", "failed"]),
          send_time: faker.datatype.datetime(),
        }),
        TRANSACTIONS: () => ({
          txn_date: faker.datatype.datetime(),
          ref: faker.datatype.uuid(),
          description: faker.lorem.sentence(),
          amount: faker.datatype.float({ max: 12 }),
          running_balance: faker.datatype.float(),
          type: faker.helpers.randomize(["debit", "credit"]),
          currency: faker.finance.currencyCode(),
        }),
        ADVERTS: () => ({
          payment: faker.helpers.randomize(["wechat", "paypal"]),
          payment_ttl_mins: faker.datatype.datetime(),
          type: faker.helpers.randomize(Object.keys(TRADE_TYPES)),
          status: faker.helpers.randomize(["PENDING", "SUCCESS", "FAILED"]),
          total: faker.datatype.number(),
        }),
        COMMISSION: () => ({
          order_type: faker.helpers.randomize(Object.keys(TRADE_TYPES)),
          friends_user_id: faker.datatype.uuid(),
          commission_earned: faker.datatype.number(),
          friend_trade_datetime: faker.datatype.datetime(),
          // commission_time: Joi.string().required(),
          distribution_status: faker.helpers.randomize([
            "PENDING",
            "SUCCESS",
            "FAILED",
          ]),
        }),
      };

      let generateFakeData = () => {
        let user_id = faker.datatype.uuid();

        const type = faker.helpers.randomize([
          constants.LOG_TYPES.COMMISSION,
          constants.LOG_TYPES.ADVERTS,
          faker.helpers.randomize(Object.keys(LOG_TYPES)),
        ]);

        return {
          id: faker.datatype.uuid(),
          type,
          metadata: getMetadata[type](),
          archived_at: faker.datatype.datetime(),
          createdAt: faker.datatype.datetime(),
          updatedAt: faker.datatype.datetime(),
          user_id,
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
  Logger.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      type: {
        type: DataTypes.ENUM(Object.keys(LOG_TYPES)),
        set(val) {
          this.setDataValue("type", String(val)?.toUpperCase());
        },
        get() {
          return LOG_TYPES[this.getDataValue("type")];
        },
      },
      metadata: {
        type: DataTypes.JSON,
        validate: {
          isValid(values) {
            let schema = metadataSchema[this.type];
            if (schema) {
              const { error } = schema.validate(values);
              if (error) boom.boomify(new Error(error));
            }
          },
        },
      },
      archived_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Logger",
      underscored: true,
      tableName: TABLE_NAMES.LOGGER || "tbl_logger",
      paranoid: true,
      deletedAt: "archived_at",
    }
  );
  return Logger;
};
