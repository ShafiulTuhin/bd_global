"use strict";
// const { jwt } = require("../helpers");
const socketEvents = require("./events")
const {Op} = require("sequelize")
let jwt = require("jsonwebtoken")

function chat(server, options, next) {
  
  
  const {
    db: {
      Chat,
      User,
    },
    io,
    boom,
  } = server.app;

  



  /**
   * @function init
   * @describe initializes socket connection
   */
  function init() {
    // initialize chat connection
    
    io.sockets.on("connection", async function(socket) {
      try {
        const { authorization:token } = socket.handshake.headers;
        // Confirm jwt token
        let res
        try {
          res = jwt.decode(token)
        } catch (error) {
          console.error("invalid token",error)
          socket.disconnect()
          return 
        }
        if(!res)
        return

        let user = await User.findOne({
            where:{
              id:res.user_id
            }
        })

        if(user){

         socket = await socketEvents(socket,user,server.app,io)
        }else{
          
          socket.send({status:"error","message":"invalid token"})
          socket.disconnect()
        }

        
       
      } catch (err) {
        console.error(err);
        return boom.isBoom(err) ? err : boom.boomify(err);
      }
    });
  }
  /**
   *
   * @param {String} userId
   * @param {String} receiverId
   * @param {Object} socket
   * @returns
   */
  // async function joinOrCreateRoom(userId, receiverId, socket) {
  //   try {
  //     const room = Chat.makeHash(userId, receiverId);
  //     let chatInbox;

  //     chatInbox = await Chat.findOne({
  //       where: {
  //         inbox_hash: room,
  //       },
  //     });

  //     if (!chatInbox) {
  //       chatInbox = await Chat.create({
  //         to: receiverId,
  //         from: userId,
  //       });
  //     }

  //     socket.join(room);
  //     return room;
  //   } catch (err) {
  //     console.error(err);
  //     return boom.isBoom(err) ? err : boom.boomify(err);
  //   }
  // }

  /**
   * @function createChatMsg
   * @param {String} sender_id
   * @param {String} message
   * @param {String} inbox
   * @returns
   */
  // async function createChatMsg(sender_id, message, inbox) {
  //   try {
  //     if (!inbox) return null;

  //     return await inbox?.createMessage({
  //       sender_id,
  //       text: message,
  //       read: false,
  //     });
  //   } catch (err) {
  //     console.error(err);
  //     return boom.isBoom(err) ? err : boom.boomify(err);
  //   }
  // }

  /**
   *
   * @param {String} userId
   * @param {Object} socket
   * @param {Function} cb
   * @returns
   */
  // async function loadInbox(userId, socket, cb) {
  //   try {
  //     const inboxes = await Chat.findAll({
  //       where: {
  //         inbox_hash: {
  //           [Op.like]: `%${userId.replace(/-/g, "")}%`,
  //         },
  //       },
  //       // includes:{
  //       //   model:Message,
  //       //   limit:20,
  //       //   offset:0
  //       // },
  //       raw: true,
  //     });
  //     // console.log({ inboxes });
  //     inboxes.forEach(({ inbox_hash }) => {
  //       socket.join(inbox_hash);
  //     });

  //     if (cb) return cb(inboxes);
  //     return inboxes;
  //   } catch (err) {
  //     console.error(err);
  //     return boom.isBoom(err) ? err : boom.boomify(err);
  //   }
  // }

  /**
   *
   * @param {String} userId
   * @param {String} receiverId
   * @param {Function} cb
   * @returns
   */
  // async function loadMessages(userId, receiverId, cb) {
  //   try {
  //     const room = Chat.makeHash(userId, receiverId);
  //     // Get chat from room hash
  //     let chat = await Chat.findOne({
  //       where: {
  //         inbox_hash: {
  //           [Op.eq]: room,
  //         },
  //       },
  //     });
  //     // get messages
  //     const messages = await chat.getMessages({
  //       limit: 20,
  //       offset: 0,
  //     });
      
  //     if (cb) return cb(messages || []);
  //     return messages;
  //   } catch (err) {
  //     console.error(err);
  //     return boom.isBoom(err) ? err : boom.boomify(err);
  //   }
  // }

  init();
}

const chatPlugin = {
  name: "chat",
  version: "1.0.0",
  register: chat,
};

module.exports = chatPlugin;