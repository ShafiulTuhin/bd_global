"use strict";
const { Model } = require("sequelize");
const hooks = require("../hooks/blockage.hook");
const { TABLE_NAMES, TRANSACTION_TYPES,TRANSACTION_STATUS } = require("../../constants");
const faker = require("faker");

module.exports = (sequelize, DataTypes) => {
  class Blockage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      const { Transaction,Wallet,Blockage } = models;
      
      Wallet.hasMany(Blockage,{
        foreignKey: { name: "wallet_id" },
      })
      Blockage.belongsTo(Wallet,{as:"wallet"})
      
    }

    static FAKE(count) {
      let rows = [],
        result = {},
        index = 0;
      let generateFakeData = () => {
        let { User, Advert,Wallet } = sequelize?.models;
        return {
          id: faker.datatype.uuid(),
          created_at: faker.datatype.datetime(),
          updated_at: faker.datatype.datetime(),
          archived_at: faker.datatype.datetime(),
          // user: User.FAKE(),
          address:faker.finance.bitcoinAddress(),
          fee:faker.datatype.number(),
          wallet:Wallet.FAKE(),
          quantity:faker.datatype.number(),
          type:faker.helpers.randomize(Object.values(TRANSACTION_TYPES)),
          status:faker.helpers.randomize(Object.values(TRANSACTION_STATUS)),
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

  Blockage.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      archived_at: DataTypes.DATE,
      quantity: {
        type:DataTypes.DOUBLE,
        defaultValue:0,
        validate:{
          min:0
        }
      },
      fee: {
        type:DataTypes.DOUBLE,
        defaultValue:0,
        validate:{
          min:0
        }
      },
      active: {
        type:DataTypes.BOOLEAN,
        defaultValue:true
      }
    },
    {
      sequelize,
      modelName: "Blockage",
      underscored: true,
      paranoid: true,
      tableName: TABLE_NAMES?.BLOCKAGE || "tbl_blockages",
      hooks,
      deletedAt: "archived_at",
    }
  );
  return Blockage;
};
