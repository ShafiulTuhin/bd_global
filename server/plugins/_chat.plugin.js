"use strict";
const { jwt } = require("../helpers");
const {Op} = require("sequelize")

function chat(server, options, next) {
  var io = require("socket.io")(server.listener, { log: true });

  const {
    db: {
      Chat,
      User,
      // Sequelize: { Op },
    },
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
        const { authorization } = socket.handshake.headers;
        // Confirm jwt token
        const { payload } = jwt.decodeAndVerifyToken(authorization);
        let userId;
        // let user = await User.findOne({
        //   where:{
        //     user_id:payload.user
        //   }
        // })
        // get user ID from jwt
        if (payload?.user) {
          userId = payload.user;

          // Load user inboxes
          await loadInbox(userId, socket, (inboxes) =>
            io.to(socket.id).emit("chat::fetch", inboxes)
          );

          // EVENTS LISTENERS ----------------------------------------------------

          // listen to the `fetch user inboxes` event
          socket.on("chat::fetch", async function(cb) {
            const inboxes = await loadInbox(userId, socket, cb);

            if (!cb) return io.to(socket.id).emit("chat::fetch", inboxes);
          });

          // listen to the `initiate new chat or continue existing chat with a particular user` event
          socket.on("chat::start", async function(receiverId, cb) {
            await joinOrCreateRoom(userId, receiverId, socket);

            await loadMessages(userId, receiverId, cb);
            // await loadInbox(
            //   userId,
            //   {
            //     socket,
            //     io,
            //     ChatModel: Chat,
            //   },
            //   cb
            // );
          });

          // listen to the `send message to a specific user` event
          socket.on("chat::message", async function(
            { message, receiverId },
            cb
          ) {
            // create message
            const room = Chat.makeHash(userId, receiverId);
            let chatInbox = await Chat.findOne({
              where: {
                inbox_hash: room,
              },
            });
            //
            const chatDBMessage = await createChatMsg(
              userId,
              message,
              chatInbox
            );

            if (chatDBMessage) {
              // Send message to room
              io.to(room).emit("chat::message", chatDBMessage?.toJSON());

              // fetch message
              if (cb) cb(chatDBMessage);
            }
          });
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
  async function joinOrCreateRoom(userId, receiverId, socket) {
    try {
      const room = Chat.makeHash(userId, receiverId);
      let chatInbox;

      chatInbox = await Chat.findOne({
        where: {
          inbox_hash: room,
        },
      });

      if (!chatInbox) {
        chatInbox = await Chat.create({
          to: receiverId,
          from: userId,
        });
      }

      socket.join(room);
      return room;
    } catch (err) {
      console.error(err);
      return boom.isBoom(err) ? err : boom.boomify(err);
    }
  }

  /**
   * @function createChatMsg
   * @param {String} sender_id
   * @param {String} message
   * @param {String} inbox
   * @returns
   */
  async function createChatMsg(sender_id, message, inbox) {
    try {
      if (!inbox) return null;

      return await inbox?.createMessage({
        sender_id,
        text: message,
        read: false,
      });
    } catch (err) {
      console.error(err);
      return boom.isBoom(err) ? err : boom.boomify(err);
    }
  }

  /**
   *
   * @param {String} userId
   * @param {Object} socket
   * @param {Function} cb
   * @returns
   */
  async function loadInbox(userId, socket, cb) {
    try {
      const inboxes = await Chat.findAll({
        where: {
          inbox_hash: {
            [Op.like]: `%${userId.replace(/-/g, "")}%`,
          },
        },
        // includes:{
        //   model:Message,
        //   limit:20,
        //   offset:0
        // },
        raw: true,
      });
      // console.log({ inboxes });
      inboxes.forEach(({ inbox_hash }) => {
        socket.join(inbox_hash);
      });

      if (cb) return cb(inboxes);
      return inboxes;
    } catch (err) {
      console.error(err);
      return boom.isBoom(err) ? err : boom.boomify(err);
    }
  }

  /**
   *
   * @param {String} userId
   * @param {String} receiverId
   * @param {Function} cb
   * @returns
   */
  async function loadMessages(userId, receiverId, cb) {
    try {
      const room = Chat.makeHash(userId, receiverId);
      // Get chat from room hash
      let chat = await Chat.findOne({
        where: {
          inbox_hash: {
            [Op.eq]: room,
          },
        },
      });
      // get messages
      const messages = await chat.getMessages({
        limit: 20,
        offset: 0,
      });
      
      if (cb) return cb(messages || []);
      return messages;
    } catch (err) {
      console.error(err);
      return boom.isBoom(err) ? err : boom.boomify(err);
    }
  }

  init();
}

const chatPlugin = {
  name: "chat",
  version: "1.0.0",
  register: chat,
};

module.exports = chatPlugin;
