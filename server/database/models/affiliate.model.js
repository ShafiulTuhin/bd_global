"use strict";
const { Model } = require("sequelize");
const { TABLE_NAMES } = require("../../constants");
const faker = require("faker");
const hooks = require("../hooks/affiliate.hook");

module.exports = (sequelize, DataTypes) => {
  class Affiliate extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      const { User, Affiliate } = models;

      // User.belongsToMany(User, {
      //   through: Referral,
      //   as: "user_id",
      //   // constraint: false,
      //   onDelete: "CASCADE",
      // });

      // invitee
      User.hasOne(Affiliate, {
        as: "affiliate",
        foreignKey: {
          name: "user_id",
          unique: true,
        },
      });
      // User.hasMany(User, {
      //   as: "friend",
      //   foreignKey: "friend_id",
      // });
      // Referral.belongsTo(User, {
      //   through: Referral,
      //   foreignKey: "referred_id",
      //   onDelete: "CASCADE",
      // });
      Affiliate.belongsTo(User, {
        foreignKey: 'user_id'
      });

      // Referral.belongsTo(User, {
      //   foreignKey: "user_id",
      // });
    }

    static FAKE(count) {
      let rows = [],
        result = {},
        index = 0;
      const { User } = sequelize?.models;
      let generateFakeData = () => {
        return {
          id: faker.datatype.uuid(),
          user_id: faker.datatype.uuid(),
          friends: [faker.datatype.uuid()],
          friends_count: 1,
          createdAt: faker.datatype.datetime(),
          updatedAt: faker.datatype.datetime(),
          user: User.FAKE()
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

  Affiliate.init(
    {
      id: {
        primaryKey: true,
        allowNull: false,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      friends: {
        type: DataTypes.JSONB,
        get: function() {
          return this.getDataValue("friends");
        },
        set: function(value) {
          let storedValue = this.getDataValue("friends") || [];
          let updated =
            storedValue?.length &&
            Array.isArray(storedValue) &&
            storedValue?.includes(value)
              ? storedValue
              : [...storedValue, value];
          this.setDataValue("friends", updated);
        },
      },
    },
    {
      sequelize,
      modelName: "Affiliate",
      underscored: true,
      tableName: TABLE_NAMES?.AFFILIATE || "tbl_affiliates",
      hooks,
    }
  );
  return Affiliate;
};
