"use strict";
const { Model } = require("sequelize");
const { TABLE_NAMES} = require("../../constants");

const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class Custodialwalletaddresses extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    
  }

  Custodialwalletaddresses.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      trx_id: DataTypes.STRING,
      address: DataTypes.STRING,
      chain: DataTypes.STRING,
      is_used: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }, 
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      archived_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Custodialwalletaddresses",
      underscored: true,
      paranoid: true,
      tableName: TABLE_NAMES?.CUSTODIAL_WALLET_ADDRESSES || "tbl_custodial_wallet_addresses",
      deletedAt: "archived_at",
    }
  );
  return Custodialwalletaddresses;
};
