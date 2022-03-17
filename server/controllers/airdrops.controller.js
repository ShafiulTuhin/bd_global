"use strict";
const { filterFields } = require("../services/model");
const { Op } = require("sequelize");

function AirdropsController(server) {
    const { __update, __destroy } = require("./utils")(server);
    const {
        db,
        db: { Airdroptransaction, User, Wallet, sequelize, Profile },
        helpers: { filters, paginator },
        boom,
    } = server.app;
    return {
        // CREATE------------------------------------------------------------
        /**
         * @function create - Create single currency (**Admin only**)
         * @param {Object} req - Request object
         * @param {Object} req.payload
         * @returns
         */
        async create(req) {

            const {
                payload,
                pre: {
                    permission: { user, fake },
                },
            } = req;

            try {

                let users=[];
                if (payload?.airdrop_type === 'all') {
                    users = await User.findAll({
                        where: { access_level: 1 }
                    });
                }else{

                    users = await User.findAll({
                        where: { 
                            access_level: 1 ,
                            id: {
                                [Op.in]: payload?.user_id,
                            },
                        }
                        
                    });
                }
                
                if (!users.length)
                    return boom.badRequest("Users is not available.");
 
                let result = await sequelize.transaction(async (t) =>
                    Promise.all(

                        users?.map(async (element) => {

                            let user_wallet = await Wallet.findOne({
                                where: { user_id: element?.id, currency: payload?.crypto },
                            });
                            if (user_wallet) {

                                const new_balance = user_wallet.total_balance + payload?.amount;
                                // console.log(user_wallet)
                                // console.log(new_balance)
                                if(new_balance >= 0){
                                    user_wallet.total_balance = new_balance;
                                    user_wallet.save();

                                    const object = await Airdroptransaction.create({
                                        ...payload,
                                        user_id: element.id,
                                        created_by: user.id
                                    });

                                    return await filterFields({
                                        object: object.dataValues,
                                        exclude: ["user_id", "deleted_at", "UserId", "user_id", "updatedAt","created_by"],
                                    });
                                }else {
                                    return {
                                        "message": "Wallet balance is low."
                                    }
                                }

                            } else {
                                return {
                                    "message": "Wallet not found for user"
                                }
                            }

                        })
                    ).catch((err) => {
                        throw boom.badData(err.message, err);
                    })
                );
                return {
                    statusCode: 200,
                    message: "Airdrop transactions stored",
                    result
                };

                // } else {

                //     let user_data = await User.findOne({
                //         where: { id: payload?.user_id },
                //     });

                //     if (!user_data)
                //         return boom.badRequest("User is not available.");

                //     let user_wallet = await Wallet.findOne({
                //         where: { user_id: payload?.user_id, currency: payload?.crypto },
                //     });

                //     if (!user_wallet) {
                //         return boom.badRequest("Wallet not found for user");
                //     }  
                //     user_wallet.total_balance += payload?.amount;
                //     user_wallet.save();

                //     const object = await Airdroptransaction.create({
                //         ...payload
                //     });

                //     result = await filterFields({
                //         object: object.dataValues,
                //         exclude: ["user_id", "deleted_at", "UserId", "user_id", "updatedAt"],
                //     });
                   

                //     return {
                //         statusCode: 200,
                //         message: "Airdrop transactions stored",
                //         result
                //     }

                // } 

            } catch (error) {
                console.error(error);
                return boom.isBoom(error) ? error : boom.boomify(error);
            }
        },

        async find(req) {
            const {
                query,
                pre: {
                    permission: { user,fake },
                },
            } = req;

            try {
                // console.log(query)
                var user_filter ={};
                if(query?.where?.user_id){
                    user_filter = {                       
                        
                        [Op.or]: [{
                            "$user.email$": 
                            {
                                [Op.like]: "%"+query?.where?.user_id+"%"
                            }
                        }, 
                        {
                            "$user.profile.pname$": 
                            {
                                [Op.like]: "%"+query?.where?.user_id+"%"
                            }
                        }
                    ]}                    
                    delete query?.where?.user_id;
                    
                }
               
                let queryFilters = await filters({
                    query,     
                });

                queryFilters.where = Object.assign({}, queryFilters.where, user_filter) ;

                const options = {
                    ...queryFilters,
                    include: {
                        model: User,
                        as: "user",
                        where:{
                            'access_level': {
                                [Op.lt]: user?.access_level,
                              },
                        },
                        include: {
                            model:Profile,
                            as: "profile",
                        },
                        
                    },
                    order: [
                        [{ model: User, as: 'user' }, 'created_at', 'DESC']
                    ],
                    // logging:console.log,
                };
                
                const { limit, offset } = queryFilters;
                
                const queryset = fake
                    ? await Wallet.FAKE(options)
                    : await Wallet.findAndCountAll(options);
                    
                return paginator({
                    queryset,
                    limit,
                    offset,
                });
            } catch (error) {
                console.error(error);
                throw boom.boomify(error);
            }
        },

        async history(req) {
            const {
                query,
                pre: {
                    permission: { fake },
                },
            } = req;

            try {

                var user_filter ={};
                if(query?.where?.user_id){
                    user_filter = {                       
                        
                        [Op.or]: [{
                            "$user.email$": 
                            {
                                [Op.like]: "%"+query?.where?.user_id+"%"
                            }
                        }, 
                        {
                            "$user.profile.pname$": 
                            {
                                [Op.like]: "%"+query?.where?.user_id+"%"
                            }
                        }
                    ]}                    
                    delete query?.where?.user_id;
                    
                }

                let queryFilters = await filters({
                    query,
                });

                queryFilters.where = Object.assign({}, queryFilters.where, user_filter) ;
               
                const options = {
                    order: [
                        ["created_at", "DESC"],
                      ],
                      include: [{
                            model: User,
                            as: "author",
                            include: {
                                model:Profile,
                                as: "profile",
                            },
                        },{
                            model: User,
                            as: "user",
                            include: {
                                model:Profile,
                                as: "profile",
                            },
                        }
                    ],
                    
                    raw : true ,
                    nest : true,
                    ...queryFilters
                };
                
                const { limit, offset } = queryFilters;
                // Airdroptransaction.findAll(options).on('sql', console.log);
                const queryset = fake
                    ? await Airdroptransaction.FAKE(options)
                    : await Airdroptransaction.findAndCountAll(options);
                    
                return paginator({
                    queryset,
                    limit,
                    offset,
                });
            } catch (error) {
                console.error(error);
                throw boom.boomify(error);
            }
        },

    };
};
module.exports = AirdropsController;