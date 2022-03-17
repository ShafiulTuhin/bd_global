"use strict";
const { Model } = require("sequelize");
const { TABLE_NAMES } = require("../../constants");
const faker = require("faker");

module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      const { User, Message,Upload,Order } = models;
      // Message.belongsTo(User, {});
      Message.belongsTo(User, {
        foreignKey: "sender_id"
      });
      
      Message.belongsTo(Upload, {
        as:"attachment",
        foreignKey: {
          name: "upload_id",
          allowNull: true,
        },
      });

      Message.belongsTo(Order, {
        as:"order",
        foreignKey: {
          name: "order_id",
          allowNull: true,
        },
      });
    
    }


   

    setReadStatus(count){
      let read = count?this.getDataValue("read").length>=count : !!this.getDataValue("read").length
      this.dataValues = {...this.dataValues,read}
    }
    static FAKE(count) {
      let {Order} = sequelize.models
      let rows = [],
        result = {},
        index = 0;
      let generateFakeData = () => {
        let id = faker.datatype.uuid();

        return {
          id,
          room: faker.datatype.uuid(),
          order: Order.FAKE(),
          sender_id: faker.datatype.uuid(),
          text: faker.lorem.sentence(),
          read: faker.datatype.boolean(),
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
  Message.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      sender_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      text: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      read:{
        type:DataTypes.JSONB,
        defaultValue:[]
      },
      room: DataTypes.STRING,
      order_id: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Message",
      underscored: true,
      tableName: TABLE_NAMES?.CHAT_MESSAGE || "tbl_chat_messages",
    }
  );
  return Message;
};
