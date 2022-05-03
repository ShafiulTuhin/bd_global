"use strict";
const { Model } = require("sequelize");
const {
  TABLE_NAMES,
  SECESSION_STATUSES,
  ACCESS_LEVELS,
} = require("../../constants");
const faker = require("faker");

module.exports = (sequelize, DataTypes) => {
  class Secession extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      const { User, Secession } = models;

      Secession.belongsTo(User);
    }

    static FAKE(count) {
      let rows = [],
        result = {},
        index = 0;
      let generateFakeData = () => {
        const { User } = sequelize?.models;
        return {
          id: faker.datatype.uuid(),
          access_level: faker.helpers.randomize(Object.values(ACCESS_LEVELS)),
          status: faker.helpers.randomize(Object.values(SECESSION_STATUSES)),
          description: faker.lorem.sentence(),
          approval_date: faker.datatype.datetime(),
          due_date: faker.datatype.datetime(),
          archived_at: faker.datatype.datetime(),
          user: User.FAKE(),
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
  Secession.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      level: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          isInt: true,
          max: 3,
        },
        defaultValue: 1,
      },
      status: {
        type: DataTypes.ENUM(Object.values(SECESSION_STATUSES)),
        allowNull: false,
        defaultValue: SECESSION_STATUSES.PENDING,
        set(val) {
          this.setDataValue("status", String(val)?.toUpperCase());
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      approval_date: DataTypes.DATE,
      // due_date: DataTypes.DATE,
      archived_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Secession",
      underscored: true,
      tableName: TABLE_NAMES?.SECESSION || "tbl_secessions",
    }
  );
  return Secession;
};
