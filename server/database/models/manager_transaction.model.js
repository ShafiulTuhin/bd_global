"use strict";
const { Model } = require("sequelize");
const hooks = require("../hooks/transaction.hook");
const { TABLE_NAMES, TRANSACTION_TYPES,TRANSACTION_STATUS,TRANSACTION_REASON } = require("../../constants");
const faker = require("faker");
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class ManagerTransaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    // static associate(models) {
    //   // define association here
    //   const { Transaction, User,Wallet } = models;
    //   User.hasMany(Transaction, {
    //     foreignKey: { name: "user_id",allowNull:true },
    //   });
    //   Wallet.hasMany(Transaction,{
    //     foreignKey: { name: "wallet_id" },
    //   })
    //   Transaction.belongsTo(Wallet,{as:"wallet"})
      
    // }

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

  ManagerTransaction.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: () => {
          return `TRX-${Date.now().toString()}`;
        },
      },
      archived_at: DataTypes.DATE,
      trx_id: DataTypes.STRING,
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
      address: DataTypes.STRING,
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue:TRANSACTION_TYPES.CREDIT,
        set(val) {
          this.setDataValue("type", String(val)?.toUpperCase());
        },
        validate:{
          isValid(value){
            if(!Object.values(TRANSACTION_TYPES).includes(String(value)?.toUpperCase())){
              throw new Error("invalid transaction type, choose one of "+Object.values(TRANSACTION_TYPES).join(" | "))
            }
          }
        }
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        set(val) {
          this.setDataValue("status", String(val)?.toUpperCase());
        },
        defaultValue:TRANSACTION_STATUS.PENDING,
        validate:{
          isValid(value){
            if(!Object.values(TRANSACTION_STATUS).includes(String(value)?.toUpperCase())){
              throw new Error("invalid transaction status choose one of "+Object.values(TRANSACTION_STATUS).join(" | "))
            }
          }
        }
      },
      reason: {
        type: DataTypes.STRING,
        allowNull: false,
        set(val) {
          this.setDataValue("reason", String(val)?.toUpperCase());
        },
        defaultValue:TRANSACTION_REASON.P2P,
        validate:{
          isValid(value){
            if(!Object.values(TRANSACTION_REASON).includes(String(value)?.toUpperCase())){
              throw new Error("invalid transaction reason choose one of "+Object.values(TRANSACTION_REASON).join(" | "))
            }
          }
        }
      },
      tag: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      crypto: {
        type: DataTypes.STRING,
        comment: "Kind of crypto currency",
        allowNull: true,
        get() {
          return String(this.getDataValue("crypto"))?.toUpperCase();
        },
        set(value) {
          this.setDataValue("crypto", String(value)?.toUpperCase());
        },
      },
      metadata: {
        type: DataTypes.JSON,
        default:{}
      },
    },
    {
      sequelize,
      
      modelName: "ManagerTransaction",
      underscored: true,
      paranoid: true,
      tableName: TABLE_NAMES?.MANAGER_TRANSACTION || "tbl_manager_transactions",
      hooks,
      deletedAt: "archived_at",
    }
  );
  return ManagerTransaction;
};
