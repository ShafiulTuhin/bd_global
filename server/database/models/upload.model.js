"use strict";
const { Model } = require("sequelize");
const del = require("del");
const faker = require("faker");
const { MIME_TYPES, FILE_UPLOAD_PATH, TABLE_NAMES } = require("../../constants");
const _ = require("underscore")
const path = require("path")


module.exports = (sequelize, DataTypes) => {
  class Upload extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    /**
     * del package ref
     * https://www.npmjs.com/package/del
     */

    

    /**
     *
     * @param {String} mediafolder
     */
    static cleanMediaFolder(mediafolder) {
      del.sync([
        `${mediafolder || FILE_UPLOAD_PATH}/**`,
        `!${mediafolder || FILE_UPLOAD_PATH}`,
      ]);
    }

    /**
     *
     * @param {Sting} filepath
     */
    static deleteFile(filepath) {
      if (filepath) {
        del.sync(!Array.isArray(filepath) ? [filepath] : filepath);
      }
    }
    static associate(models) {
      // define association here
      const { User, Upload,Message } = models;

      Upload.belongsTo(User);
      Upload.hasMany(Message);
    }
    static FAKE(count = 0) {
      let rows = [],
        result = {},
        index = 0;
      let generateFakeData = () => {
        let id = faker.datatype.uuid(),
          mimetype = faker.system.mimeType();

        return {
          id,
          mimetype,
          original: {
            fieldname: faker.system.fileName(),
            originalname: faker.system.fileName(),
            filename: faker.system.fileName(),
            mimetype,
            destination: faker.system.filePath(),
            path: faker.system.filePath(),
            size: faker.datatype.number(10000000),
          },
          thumbnail: {
            fieldname: faker.system.fileName(),
            originalname: faker.system.fileName(),
            filename: faker.system.fileName(),
            mimetype,
            destination: faker.system.filePath(),
            path: faker.system.filePath(),
            size: faker.datatype.number(10000000),
          },
          description: faker.lorem.sentence(),
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
     * @returns {original:string,thumbnail:string}
     */
    getFilePaths(){
      return {
        original:path.join(FILE_UPLOAD_PATH,this.original.filename),
        thumbnail:path.join(FILE_UPLOAD_PATH,this.thumbnail.filename)
      }
    }
  }

  Upload.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      mimetype: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      original: {
        type: DataTypes.JSON,
        defaultValue: {
          fieldname: "",
          originalname: '',
          filename:'',
          url:'',
          mimetype: "",
          destination: '',
          path:"",
          size: 0,
        },
        get(){
          return _.pick(this.getDataValue("original"),...[
              "filename",
              "url",
              "mimetype",
              "size"
          ])
        },
        /**
         * @param {Object} value
         * @param {String} filename
         * @param {String} originalname
         * @param {String} fieldname
         * @param {String} mimetype
         * @param {String} destination
         * @param {String} path
         * @param {NUmber} size
         */
        set(value){
          this.setDataValue("original",{...value,url:`/media/${value.filename}`})
        }
        
      },
      thumbnail: {
        type: DataTypes.JSON,
        defaultValue: {
          fieldname: "",
          originalname: '',
          filename:'',
          url:'',
          mimetype: "",
          destination: '',
          path:"",
          size: 0,
        },
        get(){
          return _.pick(this.getDataValue("original"),...[
              "filename",
              "url",
              "mimetype",
              "size"
          ])
        },
        /**
         * @param {Object} value
         * @param {String} filename
         * @param {String} originalname
         * @param {String} fieldname
         * @param {String} mimetype
         * @param {String} destination
         * @param {String} path
         * @param {NUmber} size
         */
        set(value){
          this.setDataValue("original",{...value,url:`/media/${value.filename}`})
        }
      },
      archived_at: DataTypes.DATE,
      description: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Upload",
      tableName: TABLE_NAMES?.UPLOAD || "tbl_uploads",
      underscored: true,
      paranoid: true,
      deletedAt: "archived_at",
    }
  );

  return Upload;
};
