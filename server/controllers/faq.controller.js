"use strict";
function FaqController(server) {
  const { __update, __destroy } = require("./utils")(server);
  const {
    db: { Kyc, sequelize, Faq,User },
    boom,
    consts: { KYC_TYPES, KYC_STATUSES },
    helpers: { filters, paginator },
  } = server.app;
  return {
    // CREATE ---------------------------------------------------------

    /**
     * @function create
     * @param {Object} req
     * @returns
     */
    async create(req) {
      const {
        pre: {
         permission: { user },
        },
        payload,
      } = req;
      try {
       
        return await user.createFaq(payload)
       
      } catch (error) {
        console.error(error);
        return boom.internal(error.message, error);
      }
    },
    // REMOVE ---------------------------------------------------------

    /**
     * @function remove - remove a single record
     * @param {Object} req
     * @returns
     */
    async remove(req) {
      const {
        payload: { ids = [], force = false },
        pre: {
         permission: { user },
        },
      } = req;

      try {

       return await Faq.destroy({
         where:{
           id:{
             [Op.in]:ids
           }
         },
         force
       })

      } catch (error) {
        console.error(error);
        return boom.boomify(error);
      }
    },

    // FIND ---------------------------------------------------------

    /**
     * @function findByID
     * @param {Object} req
     * @returns
     */
    async findByID(req) {
      const {
        query,
        params: { id },
        pre: {
          permission: {user, sudo, fake },
        },
      } = req;
      try {
        

        const options = {
          where:{
            id,
          },
          ...(sudo?{
            include:{
              model:User,
              attributes:[
                "id",
                "email"
              ]
            }
          }:{})
          
        };

        let result = fake ? await Faq.FAKE() : await Faq.findOne(options);
        return result
          ? result
          : boom.notFound(
              `Faq with ID; ${id}  not found!`
            );
      } catch (error) {
        console.error(error);
        return boom.internal(error.message, error);
      }
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
          permission: {fake, sudo },
        },
      } = req;

      try {
        const queryFilters = await filters({
          query,
          searchFields: ["question", "answer","link","category",...(sudo?["user_id"]:[])],
          extras:{
            ...(sudo?{}:{active:true})
          }
        });

        const options = {
          ...queryFilters,
          order: [
            ["createdAt", "DESC"],
            ["updatedAt", "DESC"],
          ],
          attributes:[
            "id",
            "question",
            "answer",
            "link",
            "category",
            "subcategory",
            "created_at",
            "updated_at",
            ...(sudo?["active"]:[])
          ],
          ...(sudo?{
            include:{
              model:User,
              attributes:[
                "id",
                "email"
              ]
            }
          }:{})
        };

        const { limit, offset } = queryFilters;

        let queryset = fake
          ? await Faq.FAKE(limit)
          : await Faq.findAndCountAll(options);

        

        return paginator({
          queryset,
          limit,
          offset,
        });
      } catch (error) {
        console.error(error);
        return boom.isBoom(error) ? error : boom.boomify(error);
      }
    },

    // UPDATE ---------------------------------------------------------

 
    /**
     * @function updateByID
     * @param {Object} req
     * @returns
     */
    async updateByID(req) {
      const {
        payload,
        params: { id },
        pre: {
          permission: {user, fake, sudo },
        },
      } = req;

      try {
        
        let  options = { 
            where:{id}
           };

        let result = fake
          ? Faq.FAKE()
          : await Faq.update(payload, options).then(([count]) => count);

        return {
          status: Boolean(result),
          result,
        };
      } catch (error) {
        console.error(error);
        throw boom.boomify(error);
      }
    },
    /**
     * @function removeByID
     * @param {Object} req
     * @returns
     */
    async removeByID(req) {
      const {
        params: { id,force=false },
        pre: {
          permission: { fake },
        },
      } = req;

      try {
        

        if(fake) return null

        return await Faq.destroy({
          where:{
            id
          },
          force
        })

      } catch (error) {
        console.error(error);
        throw boom.boomify(error);
      }
    },
  };
}

module.exports = FaqController;
