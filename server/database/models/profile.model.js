"use strict";
const { Model } = require("sequelize");
const _ = require("underscore");
const hooks = require("../hooks/user.profile.hook");
const { TABLE_NAMES, PROFILE_MODES } = require("../../constants");
const faker = require("faker");

module.exports = (sequelize, DataTypes) => {
  class UserProfile extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      const { Profile, Upload, User } = models;

      Profile.belongsTo(User, {
        foreignKey: "user_id",
        as:"user"
      });

      Profile.belongsTo(Upload, {
        foreignKey: "avatar_upload",
      });
    }

    static FAKE(count) {
      let rows = [],
        result = {},
        index = 0;
      let generateFakeData = () => {
        return {
          profile_id: faker.datatype.uuid(),
          user_id: faker.datatype.uuid(),
          mode: faker.helpers.randomize(["standard"]),
          invite_code: faker.lorem.sentence(),
          email: faker.internet.email(),
          suitability: faker.datatype.number(5),
          gender: faker.datatype.string(),
          date_of_birth: faker.datatype.datetime(),
          phone: faker.phone.phoneNumber(),
          payment_methods: {
            bank_transfer: {
              bank_name: `${faker.name.firstName()} ${faker.helpers.randomize([
                "Holdings",
                "Ltd",
                "Bank",
              ])}`,
              name: faker.name.findName(),
              account_number: faker.finance.iban(),
            },
            wechat: {
              username: faker.name.firstName(),
              id: faker.datatype.uuid(),
            },
            alipay: {
              username: faker.name.firstName(),
              id: faker.datatype.uuid(),
            },
          },
          pname: faker.name.firstName(),
          lname: faker.name.lastName(),
          oname: faker.name.findName(),
          archived_at: faker.datatype.datetime(),
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

    toPublic() {
      return _.omit(this.toJSON(), []);
    }
  }

  UserProfile.init(
    {
      profile_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      user_id: {
        type: DataTypes.UUID,
      },
      gender: DataTypes.STRING,
      mode: {
        type: DataTypes.STRING,
        validate: {
          contains: Object.values(PROFILE_MODES),
        },
        defaultValue: PROFILE_MODES.STANDARD,
        comment: "User mode state: [standard, merchant]",
        set(val) {
          return this.setValue("mode", String(val).toUpperCase());
        },
      },
      invite_code: {
        type: DataTypes.STRING,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
          isEmail: true,
        },
      },
      suitability: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
          max: 5,
        },
      },
      date_of_birth: {
        allowNull: true,
        type: DataTypes.DATEONLY,
      },
      phone: DataTypes.STRING,
      payment_methods: DataTypes.JSONB,
      pname: {
        type: DataTypes.STRING,
        comment: "public name",
        get() {
          let storedValue = this.getDataValue("pname");
          let email = this.getDataValue("email");
          return storedValue || (email ? String(email).split("@")[0] : "");
        },
      },
      lname: { type: DataTypes.STRING, comment: "last name" },
      oname: {
        type: DataTypes.STRING,
        comment: "other names",
      },
      archived_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Profile",
      underscored: true,
      tableName: TABLE_NAMES?.PROFILE || "tbl_profiles",
      paranoid: true,
      deletedAt: "archived_at",
      hooks,
    }
  );

  // UserProfile.addHook("afterFind", async (foundResult) => {
  //   if (!foundResult) return;

  //   // // let consolidated = {};
  //   // if (!Array.isArray(foundResult)) foundResult = [foundResult];
  //   // for (const instance of foundResult) {
  //   //   // Get address

  //   //   if (instance)
  //   //     instance.dataValues = {
  //   //       ...instance?.dataValues,
  //   //     };
  //   // }
  // });

  return UserProfile;
};
