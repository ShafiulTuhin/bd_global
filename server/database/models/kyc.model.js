"use strict";
const { Model } = require("sequelize");
const _ = require("underscore");
const {
  TABLE_NAMES,
  KYC_STATUSES,
  KYC_TYPES,
  SECURITY_LEVELS,
} = require("../../constants");
const faker = require("faker");
const hooks = require("../hooks/kyc.hook");

module.exports = (sequelize, DataTypes) => {
  class KYC extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      const { Upload, User, Kyc } = models;

      // Kyc.belongsTo(Upload, {
      //   foreignKey: "uploads",
      //   as: "upload",
      // });

      Kyc.belongsTo(User, {
        foreignKey: "user_id",
      });
    }

    static FAKE(count = 0) {
      let rows = [],
        result = {},
        index = 0;

      let generateFakeData = () => {
        let id = faker.datatype.uuid();
        let { User } = sequelize?.models;
        return {
          id,
          type: faker.helpers.randomize(Object.values(KYC_TYPES)),
          status: faker.helpers.randomize(Object.values(KYC_STATUSES)),
          user_id: faker.datatype.uuid(),
          archived_at: faker.datatype.datetime(),
          uploads: faker.datatype.uuid(),
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

    toPublic() {
      return _.omit(this.toJSON(), []);
    }
  }

  KYC.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          includes(value) {
            const list = Object.values(KYC_TYPES).join(",");

            if (!list.includes(value)) {
              throw new Error(`${value} is not included in ${list}`);
            }
            return value;
          },
        },
        set(val) {
          this.setDataValue("type", String(val).toUpperCase());
        },
        // get() {
        //   KYC_TYPES[this.getDataValue("type")];
        // },
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: KYC_STATUSES.PENDING,
        validate: {
          notEmpty: true,
          includes(value) {
            let list = Object.values(KYC_STATUSES).join(",");

            if (!list.includes(value)) {
              throw new Error(`${value} is not included in ${list}`);
            }
            return value;
          },
        },
        set(val) {
          this.setDataValue("status", String(val).toUpperCase());
        },
      },
      security_level: {
        type: DataTypes.VIRTUAL,
        get() {
          let storedValue = this.getDataValue("type");
          return SECURITY_LEVELS[storedValue];
        },
      },
      user_id: DataTypes.UUID,
      archived_at: DataTypes.DATE,
      uploads: DataTypes.JSONB,
    },
    {
      sequelize,
      modelName: "Kyc",
      underscored: true,
      tableName: TABLE_NAMES?.KYC || "tbl_kyc",
      paranoid: true,
      deletedAt: "archived_at",
      hooks,
    }
  );

  return KYC;
};
