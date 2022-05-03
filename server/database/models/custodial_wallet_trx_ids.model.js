"use strict";
const { Model } = require("sequelize");
const { TABLE_NAMES} = require("../../constants");

const faker = require("faker");
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class Custodialwallettrxids extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    
  }

  Custodialwallettrxids.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      trx_id: DataTypes.STRING,
      owner: DataTypes.STRING,   
      chain: DataTypes.STRING,
      batch_count: DataTypes.INTEGER,    
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      archived_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Custodialwallettrxids",
      underscored: true,
      paranoid: true,
      tableName: TABLE_NAMES?.CUSTODIAL_WALLET_TRX_IDS || "tbl_custodial_wallet_trx_ids",
      deletedAt: "archived_at",
    }
  );
  return Custodialwallettrxids;
};
