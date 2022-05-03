"use strict";
const { Model } = require("sequelize");
const _ = require("underscore");
const {
  TABLE_NAMES,
  CURRENCY_TYPES,
  CRYPTO_CURRENCIES,
  FIAT_CURRENCIES,
} = require("../../constants");
const faker = require("faker");
const all_currencies_names = {
  ...FIAT_CURRENCIES,
  ...CRYPTO_CURRENCIES,
};
const all_currencies_codes = Object.keys(all_currencies_names);

module.exports = (sequelize, DataTypes) => {
  class Currency extends Model {
    static searchFields = ["name", "iso_code"];

    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      const { User, Currency, Upload } = models;
      Currency.belongsTo(User);
      Currency.belongsTo(Upload, {
        foreignKey: {
          name: "image_url",
        },
      });
    }

    toPublic() {
      return _.omit(this.toJSON(), ["user_id"]);
    }

    static FAKE(count = 0) {
      let rows = [],
        result = {},
        index = 0;
      let generateFakeData = () => {
        let user_id = faker.datatype.uuid();
        let currencyCode = faker.helpers.randomize(all_currencies_codes);
        let currencyName = all_currencies_names[currencyCode];
        return {
          id: faker.datatype.uuid(),
          name: currencyName,
          iso_code: currencyCode,
          type:
            currencyCode in FIAT_CURRENCIES
              ? CURRENCY_TYPES.FIAT
              : CURRENCY_TYPES.CRYPTO,
          image_url: faker.image.image(),
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
  Currency.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: DataTypes.STRING,
        unique: true,
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      iso_code: {
        type: DataTypes.STRING,
        comment: "Currency code",
        unique: true,
        set(value) {
          this.setDataValue("iso_code", String(value)?.toUpperCase());
        },
        validate: {
          isIn: [all_currencies_codes],
          notEmpty: true,
        },
      },
      type: {
        type: DataTypes.ENUM(Object.values(CURRENCY_TYPES)),
        comment: "Currency type",
        allowNull: false,
        get() {
          return String(this.getDataValue("type"))?.toUpperCase();
        },
        set(value) {
          this.setDataValue("type", String(value)?.toUpperCase());
        },
      },
      image_url: {
        type: DataTypes.UUID,
      },
      archived_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Currency",
      underscored: true,
      tableName: TABLE_NAMES?.CURRENCY || "tbl_currencies",
      paranoid: true,
      deletedAt: "archived_at",
      /* indexes: [
        {
          name: "currency_idx",
          unique: true,
          fields: ["iso_code"],
        },
      ], */
    }
  );
  return Currency;
};
