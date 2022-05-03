"use strict";
const { Model } = require("sequelize");
const hooks = require("../hooks/chat.hook");
const { TABLE_NAMES, LOG_TYPES,NOTIFICATION_TYPE } = require("../../constants");
const faker = require("faker");
const boom = require("@hapi/boom")

module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    // static associate(models) {
    //   // define association here
    //   const { Notification } = models;
    
    // }

    setReadStatus(count){
      let read
      if(Array.isArray(this.getDataValue("read"))){
        read = count?this.getDataValue("read").length>=count : !!this.getDataValue("read").length

      }else{
        read = count>=this.getDataValue("read")
      }
      this.dataValues = {...this.dataValues,read}
    }

    

    static FAKE(count) {
      let rows = [],
        result = {},
        index = 0;
      let generateFakeData = () => {
        let id = faker.datatype.uuid();

        return {
          id,
          room: faker.datatype.uuid(),
          message: faker.lorem.sentence(),
          read: faker.datatype.boolean(),
          link: faker.internet.url(),
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

    /**
     * 
     * @param {import('../../schema/logger.metadata.schema').CHATSSchema} metadata 
     * @returns {Promise<import('../../schema/others').StatusResponse>}
     */
     async logChat(metadata){
      
      /**
       * @type Model
       */
      const Logger = sequelize.models.Logger
      const data = await Logger.create({
        type:LOG_TYPES.CHATS,
        metadata
      })
      
      return {status:"success",message:"chat log has been created",data}
    }
  }

  Notification.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      room: DataTypes.STRING,
      // VIRTUALS
      message: DataTypes.STRING,
      link: DataTypes.STRING,
      read:{
        type:DataTypes.JSONB,
        defaultValue:[],
        get(){
          return this.getDataValue("read")?.length
        },
        set(value){
          this.setDataValue('read', [...(this.getDataValue("read")||[]),value])
        }
      },
      type:{
        type:DataTypes.STRING,
        defaultValue:NOTIFICATION_TYPE.BASIC,
        validate:{
          isValid(value){
            if(!Object.keys(NOTIFICATION_TYPE).includes(value)){
              throw boom.badRequest(`invaid notification type choose one of < ${Object.keys(NOTIFICATION_TYPE).join(" | ")} >`)
            }
          }
        }
      }
    },
    {
      sequelize,
      modelName: "Notification",
      underscored: true,
      tableName: TABLE_NAMES?.NOTIFICATION || "tbl_notifications",
      paranoid: true,
      deletedAt: "archived_at",
      hooks,      
    }
  );

  return Notification;
};
