"use strict";
const { Model } = require("sequelize");
const { TABLE_NAMES, TICKET_PRIORITIES, TICKET_STATUSES } = require("../../constants");
const faker = require("faker");

module.exports = (sequelize, DataTypes) => {
  class SupportTicket extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      const { User, SupportTicket,Order } = models;


      User.hasMany(SupportTicket);

      SupportTicket.belongsTo(User,{
        foreignKey:"user_id",
        as:"user"
      });

      SupportTicket.belongsTo(User,{
        foreignKey:"admin_id",
        as:"admin"
      });

      SupportTicket.belongsTo(Order,{
        foreignKey:"order_id",
        as:"order"
      });

      Order.hasMany(SupportTicket)
    }

    static FAKE(count) {
      let rows = [],
        result = {},
        index = 0;
      let generateFakeData = () => {
        const { User,Order } = sequelize?.models;

        return {
          id: faker.datatype.uuid(),
          priority: faker.helpers.randomize(Object.keys(TICKET_PRIORITIES)),
          subject: faker.lorem.sentence(),
          description: faker.lorem.sentences(),
          status: faker.helpers.randomize(Object.keys(TICKET_STATUSES)),
          archived_at: faker.datatype.datetime(),
          createdAt: faker.datatype.datetime(),
          updatedAt: faker.datatype.datetime(),
          admin: User.FAKE(),
          user: User.FAKE(),
          order:Order.FAKE()
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

  SupportTicket.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      priority: {
        type: DataTypes.ENUM(Object.keys(TICKET_PRIORITIES)),
        allowNull: false,
        defaultValue: TICKET_PRIORITIES.LOW,
        set(val) {
          this.setDataValue(
            "priority",
            String(val)?.toUpperCase()
          );
        },
      },
      subject: {
        type: DataTypes.STRING,
        defaultValue: "<No subject>",
      },
      description: {
        type: DataTypes.STRING,
        defaultValue: "<No description>",
      },
      reason: {
        type: DataTypes.STRING,
        defaultValue: "<No reason>",
      },
      status: {
        type: DataTypes.ENUM(Object.keys(TICKET_STATUSES)),
        allowNull: false,
        defaultValue: TICKET_STATUSES.OPEN,
        set(val) {
          this.setDataValue("status", String(val)?.toUpperCase());
        },
      },
      order_id:{
        type:DataTypes.STRING,
        allowNull:false,
      },
      images:DataTypes.JSONB,
      room:DataTypes.STRING,
      user_id:{
        type: DataTypes.UUID,
        allowNull:false,
      },
      admin_id:{
        type: DataTypes.UUID,
        allowNull:true,
      },
      archived_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "SupportTicket",
      tableName: TABLE_NAMES?.SUPPORT_TICKET || "tbl_support_tickets",
      underscored: true,
      paranoid: true,
      deletedAt: "archived_at",
    }
  );
  return SupportTicket;
};
