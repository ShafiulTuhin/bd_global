"use strict";
const { Model } = require("sequelize");
const { TABLE_NAMES, LOG_TYPES } = require("../../constants");
const faker = require("faker");
const {
  SUPPORTED_TOKENS,
} = require("../../constants");
const hooks = require("../hooks/airdrops.hook");

module.exports = (sequelize, DataTypes) => {
  class Airdroptransaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static total = 0;

    static associate(models) {
      // define association here
      const { Airdroptransaction, Order, User } = models;
      Airdroptransaction.belongsTo(User, { foreignKey: "user_id", as: "user" });
      Airdroptransaction.belongsTo(User, { foreignKey: "created_by", as: "author" });

      
    }

    static FAKE(count = 0, options) {
      const where = options && options?.where;
      let rows = [],
        result = {},
        index = 0;

      let generateFakeData = () => {
        let user_id = faker.datatype.uuid();
        let { User } = sequelize?.models;
        let crypto = faker.helpers.randomize(Object.keys(SUPPORTED_TOKENS));
        let amount = faker.datatype.float({ min: 1, max: 1000 });
        

        return {
          id: faker.datatype.uuid(),
          user_id,
          amount,
          crypto,
          reason: faker.lorem.sentence(),
          archived_at: null,
          createdAt: faker.datatype.datetime(),
          updatedAt: faker.datatype.datetime(),
          user: User.FAKE(),
          ...where,
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
     * @param {import('../../schema/logger.metadata.schema').ADVERTSSchema} metadata
     * @returns {Promise<import('../../schema/others').StatusResponse>}
     */
    async logAdvert(metadata) {
      /**
       * @type Model
       */
      const Logger = sequelize.models.Logger;
      await Logger.create({
        type: LOG_TYPES.ADVERTS,
        metadata,
      });

      return { status: "success", message: "commission log has been created" };
    }

    async getAuther(){
      const User = sequelize.models.User;
      const user = await User.findOne({
        where:{
          id: this.dataValues?.created_by
        }
        
      });
      
      return airdrop;
  
    }
  }

  
  
  

  Airdroptransaction.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      user_id: DataTypes.UUID,
      amount: {
        validate: {
          notEmpty: true,
          // min: 0,
        },
        type: DataTypes.DOUBLE,
      },
      crypto: {
        type: DataTypes.STRING,
        comment: "Kind of crypto currency",
        allowNull: false,
        get() {
          return String(this.getDataValue("crypto"))?.toUpperCase();
        },
        set(value) {
          this.setDataValue("crypto", String(value)?.toUpperCase());
        },
      },
      reason: DataTypes.STRING(255),
      reason_detail: DataTypes.STRING(255),
      created_by: DataTypes.UUID,
      archived_at: {
        type: DataTypes.DATE,
        comment: "Indicates whether a record is soft deleted or not",
      },
    },
    {
      sequelize,
      modelName: "Airdroptransaction",
      underscored: true,
      tableName: TABLE_NAMES?.AIRDROPS_TRANSACTIONS || "tbl_airdrop_transactions",
      paranoid: true,
      deletedAt: "archived_at",
      hooks,
    }
  );

  return Airdroptransaction;
};
