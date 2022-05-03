"use strict";
const { Model } = require("sequelize");
const { TABLE_NAMES} = require("../../constants");

const hooks = require("../hooks/unspend_wallet_balances.hook");
const faker = require("faker");
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class Unspendwalletbalances extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      const { Unspendwalletbalances, User,Wallet } = models;
      User.hasMany(Unspendwalletbalances, {
        foreignKey: { name: "user_id",allowNull:true },
      });
      Wallet.hasMany(Unspendwalletbalances,{
        foreignKey: { name: "wallet_id" },
      })
      Unspendwalletbalances.belongsTo(Wallet,{as:"wallet"})
      
    }

    // static FAKE(count) {
    //   let rows = [],
    //     result = {},
    //     index = 0;
    //   let generateFakeData = () => {
    //     let { User, Advert,Wallet } = sequelize?.models;
    //     return {
    //       id: faker.datatype.uuid(),
    //       created_at: faker.datatype.datetime(),
    //       updated_at: faker.datatype.datetime(),
    //       archived_at: faker.datatype.datetime(),
    //       // user: User.FAKE(),
    //       address:faker.finance.bitcoinAddress(),
    //       fee:faker.datatype.number(),
    //       wallet:Wallet.FAKE(),
    //       quantity:faker.datatype.number(),
    //       type:faker.helpers.randomize(Object.values(TRANSACTION_TYPES)),
    //       status:faker.helpers.randomize(Object.values(TRANSACTION_STATUS)),
    //     };
    //   };
    //   if (count > 1) {
    //     for (; index < count; ++index) {
    //       rows.push(generateFakeData());
    //     }
    //     result = { count, rows };
    //   } else result = { ...generateFakeData() };
    //   return result;
    // }
  }

  Unspendwalletbalances.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      unspend_amount: {
        type:DataTypes.DOUBLE,
        defaultValue:0,
      },
      new_amount: {
        type:DataTypes.DOUBLE,
        defaultValue:0,
      },
      chain_balance: {
        type:DataTypes.DOUBLE,
        defaultValue:0,
      },
      estimated_fee: {
        type:DataTypes.DOUBLE,
        defaultValue:0,
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: true
      },
      reason: {
        type: DataTypes.STRING,
        allowNull: true
      },
      archived_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Unspendwalletbalances",
      underscored: true,
      paranoid: true,
      tableName: TABLE_NAMES?.UNSPEND_WALLET_BALANCES || "tbl_unspend_wallet_balances",
      hooks,
      deletedAt: "archived_at",
    }
  );
  return Unspendwalletbalances;
};
