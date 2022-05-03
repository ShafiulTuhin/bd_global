"use strict";
const { Model } = require("sequelize");
const _ = require("underscore");
const {
  TABLE_NAMES
} = require("../../constants");
const faker = require("faker");
const hooks = require("../hooks/faq.hook");

module.exports = (sequelize, DataTypes) => {
  class Faq extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      const {  User, Faq } = models;

      // Kyc.belongsTo(Upload, {
      //   foreignKey: "uploads",
      //   as: "upload",
      // });

      Faq.belongsTo(User, {
        foreignKey: "user_id",
      });
      User.hasMany(Faq);
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
          question: faker.lorem.sentence(),
          answer: faker.lorem.sentence(),
          category: faker.name.middleName(),
          subcategory: faker.name.middleName(),
          link: faker.internet.url(),
          archived_at: faker.datatype.datetime(),
          createdAt: faker.datatype.datetime(),
          updatedAt: faker.datatype.datetime(),
          
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

  Faq.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      question: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      answer: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue:true
      },
      link: DataTypes.STRING,
      category: DataTypes.STRING,
      subcategory: DataTypes.STRING,
      user_id: DataTypes.UUID,
      archived_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Faq",
      underscored: true,
      tableName: TABLE_NAMES?.FAQ || "tbl_faq",
      deletedAt: "archived_at",
      hooks,
    }
  );

  return Faq;
};
