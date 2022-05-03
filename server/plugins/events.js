const { Socket } = require("socket.io");
const { Model, Op } = require("sequelize");
/**
 *
 * @param {Socket} socket
 * @param {Model} user
 * @param {*} server
 */
module.exports = async (socket, user, server, io) => {
  const { Message, Notification, Upload, User } = server.db;

  let events = {
    "message::send": async function (payload, cb) {
      let { user_id, text, upload_id, order_id } = payload;

      let receiver = await User.findOne({
        where: {
          id: user_id,
        },
      });

      let room = await user.generateRoom([user_id, order_id]);
      let message = await user.createMessage({
        room,
        text,
        upload_id,
        order_id,
      });

      message.setReadStatus();

      message.dataValues.attachment = await message.getAttachment();

      socket.to(room).emit("message::new", message);

      if (typeof cb == "function") {
        cb(message);
      } else {
        socket.emit("message::send::result", message);
      }

      if (receiver) {
        await receiver.emitNewMessage({ io, user_id: user.id, order_id });
      }
    },
    "message::read": async function (payload, cb) {
      let { message_id } = payload;
      let message = await Message.findOne({
        where: {
          id: message_id,
          sender_id: {
            [Op.notIn]: [user.id],
          },
          room: {
            [Op.substring]: user.id,
          },
          read: {
            [Op.not]: {
              [Op.contains]: user.id,
            },
          },
        },
        include: {
          model: Upload,
          as: "attachment",
        },
      });

      if (message) {
        message.read = [...message.read, user.id];
        await message.save();
        message.setReadStatus();
        socket.to(message.room).emit("message::read", message);
        if (typeof cb == "function") {
          cb(message);
        } else {
          socket.emit("message::read::result", message);
        }
      }
    },
    "message::fetch": async function (payload, cb) {
      let { user_id, offset = 0, limit = 20, order_id } = payload;

      let results = { offset, limit };

      let room = await user.generateRoom([user_id, order_id]);
      let { count, rows } = await Message.findAndCountAll({
        where: {
          room,
          ...(order_id && { order_id }),
        },
        include: {
          model: Upload,
          as: "attachment",
        },
        offset,
        limit,
        order: [["created_at", "DESC"]],
      });

      results.rows = rows.map((data) => {
        data.setReadStatus();

        return data;
      });

      results.count = count;

      if (typeof cb == "function") {
        cb(results);
      } else {
        socket.emit("message::fetch::result", results);
      }
    },
    "message::lastread": async function (payload, cb) {
      let { user_id, order_id } = payload;
      let room = await user.generateRoom([user_id, order_id]);
      let message = await Message.findOne({
        where: {
          room,
          read: {
            [Op.ne]: [],
          },
        },
        order: [["updatedAt", "DESC"]],
      });

      let result;
      if (message) {
        result = { last_read: message.updatedAt };
      } else {
        result = { last_read: null };
      }

      if (typeof cb == "function") {
        cb(result);
      } else {
        socket.emit("message::lastread::result", result);
      }
    },
    "notification::fetch": async function (payload, cb) {
      let { limit = 20, offset = 0 } = payload;
      let results = {};
      let room = user.getNotificationRoom();
      let { count, rows } = await Notification.findAndCountAll({
        where: {
          room,
        },
        limit,
        offset,
        order: [["created_at", "DESC"]],
      });


      // results.rows = rows.map((data) => {
      //   data.setReadStatus();
        
      //   return data;
      // });
      results.rows = rows
      results.count = count;

      if (typeof cb == "function") {
        cb(results);
      } else {
        socket.emit("notification::fetch::result", results);
      }
    },

    "notification::adminfetch": async function (payload, cb) {
      let { limit = 20, offset = 0 } = payload;
      let results = {};
      let room = user.getNotificationRoom();

      let { count, rows } = await Notification.findAndCountAll({
        where: {
          // type: "ADMINKYC" ,
          type : {[Op.in]: ["ADMINKYC", "ADMINWITHDRAWAL"]},
          // [Op.not]: {
          //   read: {
          //     [Op.contains]: [user.id],
          //   },
          // },
        },
        limit,
        offset,
        order: [["created_at", "DESC"]],
      });


      results.rows = rows.map((data) => {
        // data.setReadStatus();
        
        return data;
      });

      results.count = count;
      if (typeof cb == "function") {
        cb(results);
        socket.emit("notification::adminkyc", results);
      } else {
        socket.emit("notification::adminkyc", results);
      }
    },

    "notification::join": async function (payload, cb) {
      let room = user.getNotificationRoom();
      socket.join(room);

      let status = { status: "success" };
      if (typeof cb == "function") {
        cb(status);
      } else {
        socket.emit("notification::join::result", status);
      }
    },
    "notification::leave": async function (payload, cb) {
      let room = user.getNotificationRoom();
      socket.leave(room);

      let status = { status: "success" };
      if (typeof cb == "function") {
        cb(status);
      } else {
        socket.emit("notification::leave::result", status);
      }
    },
    "notification::read": async function (payload, cb) {
      let { id } = payload;
      let notification = await Notification.findOne({
        where: {
          id,
          room: {
            [Op.substring]: user.id,
          },
          read: {
            [Op.not]: {
              [Op.contains]: user.id,
            },
          },
        },
      });

      if (notification) {
        notification.read = user.id
        await notification.save();
        if (typeof cb == "function") {
          cb(notification);
        } else {
          socket.emit("notification::read::result", notification);
        }
      }
    },

    "notification::read::admin": async function (payload, cb) {
      // console.log("notification::read::admin");
      // console.log(user.id)
      let { id } = payload;
      // console.log(id)
      let notification = await Notification.findOne({
        where: {
          id,
          // room: {
          //   [Op.substring]: user.id,
          // },
          // read: {
          //   [Op.not]: {
          //     [Op.contains]: user.id,
          //   },
          // },
        },
      });

      // console.log(notification)
      if (notification) {
        notification.read = user.id
        await notification.save();
        if (typeof cb == "function") {
          cb(notification);
        } else {
          socket.emit("notification::read::result", notification);
        }
      }
    },

    "notification::delete::admin": async function (payload, cb) {
      
      let { id } = payload;
      let notification = await Notification.findOne({
        where: {
          id
        },
      });

      if (notification) {

        let where = {
          id
        };
        let force = false;
        
        let destroy = await Notification.destroy({
          where,
          force,
        });
        
        if (typeof cb == "function") {
          cb(notification);
        } else {
          socket.emit("notification::read::result", notification);
        }
      }
    },

    "chat::join": async function (payload, cb) {
      let { user_id, order_id } = payload;
      let room = await user.generateRoom([user_id, order_id]);
      socket.join(room);

      let status = { status: "success" };
      if (typeof cb == "function") {
        cb(status);
      } else {
        socket.emit("caht::join::result", status);
      }
    },
    "chat::leave": async function (payload, cb) {
      let { user_id, order_id } = payload;
      let room = await user.generateRoom([user_id, order_id]);
      socket.leave(room);

      let status = { status: "success" };
      if (typeof cb == "function") {
        cb(status);
      } else {
        socket.emit("chat::leave::result", status);
      }
    },
  };

  Object.entries(events).forEach(([key, func]) => {
    socket.on(key, func);
  });

  return socket;
};
