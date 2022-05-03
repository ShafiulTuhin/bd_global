"use strict";
const { Op } = require("sequelize");
const _ = require("underscore")

const { filterFields } = require("../services/model");
const { uploader, imageFilter } = require("../services/fileUpload");

module.exports = function UploadController(server) {
  const {db,
    db: { Upload },
    consts: { FILE_UPLOAD_PATH },
    helpers: { filters, paginator },
    boom,
  } = server.app;
  /* const queryInterface = sequelize.getQueryInterface();
      const table = Currency.getTableName(); */

  async function createUpload(user, file) {
    const fileOptions = {
      dest: `${FILE_UPLOAD_PATH}/`,
      fileFilter: imageFilter,
    };

    try {
      // save the file
      const fileDetails = await uploader(file, fileOptions);

      if (!Array.isArray(fileDetails)) {
        const upload = await Upload.create({
          mimetype: fileDetails.mimetype,
          original: fileDetails,
          user_id: user.id,
        },{
          attributes:["id", "original","thumbnail", "mimetype", "created_at"]
        });

        
        return {
          ...upload.dataValues,
          original:_.omit(
            upload.dataValues.original,
            "path","size","destination","originalname"
          ),
          thumbnail:_.omit(
            upload.dataValues.thumbnail||{},
            "path","size","destination","originalname"
          )
        }
      } else {
        const uploads = await Upload.bulkCreate(
          fileDetails.map((value) => ({
            mimetype: value.mimetype,
            original: value,
            user_id: user?.id,
          }))
        );

        return await Promise.all(
          uploads.map((value) =>(
            {
              ...value.dataValues,
              original:_.omit(
                value.dataValues.original,
                "path","size","destination","originalname"
              ),
              thumbnail:_.omit(
                value.dataValues.thumbnail||{},
                "path","size","destination","originalname"
              )
            }
          )
          )
        );
      }
    } catch (error) {
      console.error(error);
      throw boom.boomify(error);
    }
  }

  return {
    //   RETRIEVE ---------------------------------------------------
    /**
     * @function get - Gets currency collection
     * @param {Object} req
     * @returns
     */
    async findByID(req) {
      const {
        params: { id },
        query,
        pre: {
          permission: {user, sudo, fake },
        },
      } = req;

      const queryFilters = await filters({
        query,
        extra: {
          id,
          ...(!sudo && { user_id: user?.id }),
        },
      });

      const options = {
        ...queryFilters,
        attributes: {
          exclude: ["user_id", "UserId", "updated_at", "updatedAt"],
        },
      };
      const result = fake ? Upload.FAKE() : await Upload.findOne(options);

      return result
        ? result
        : boom.notFound(`Upload with ID: ${id} not found!`);
    },
    /**
     * @function find
     * @param {Object} req
     * @returns
     */
    async find(req) {
      const {
        query,
        pre: {
          permission: {user, sudo, fake },
        },
      } = req;

      try {
        const queryFilters = await filters({
          query,
          extra: {
            ...(!sudo && { user_id: user?.id }),
          },
        });
        const options = {
          ...queryFilters,
          /* attributes: [
            "id",
            "mimetype",
            "original",
            "thumbnail",
            "description",
            "created_at",
          ], */
        };
        const { limit, offset } = queryFilters;

        const queryset = fake
          ? Upload.FAKE(limit)
          : await Upload.findAndCountAll(options);

        return await paginator({
          queryset,
          limit,
          offset,
        });
      } catch (error) {
        console.error(error);
        throw boom.boomify(error);
      }
    },

    //   CREATE ---------------------------------------------------
    /**
     * @function create
     * @param {Object} req
     * @returns
     */
    async create(req) {
      const {
        payload: { file },
        pre: {
         permission: { user },
        },
      } = req;
      return await createUpload(user, file);
    },
  

    //   REMOVE ---------------------------------------------------

    async removeByID(req) {
      const {
        params: { id },
        payload,
        pre: {
          permission: {user, sudo },
        },
      } = req;
      let force = payload?.force || false;
      const result = await Upload.destroy({
        where: {
          id,
          ...(!sudo && { user_id: user.id }),
        },
        force,
      });

      // if (!result) throw boom.notFound();

      return { status: Boolean(result), id };
    },

    /**
     * @function remove
     * @param {Object} req
     * @returns
     */
    async remove(req) {
      const {
        pre: {
          permission: {user, sudo },
        },
        payload: { ids = [], force = false },
      } = req;

      if (!ids?.length)
        return boom.badData(
          `Required payload, <ids::array> is invalid or missing!`
        );

      const result = await Upload.destroy({
        where: {
          id: {
            [Op.in]: ids,
          },
          ...(!sudo && { user_id: user.id }),
        },
        force,
      });
      return { status: Boolean(result), ids };
    },
  };
};
