const serverFile = require("../server");
const { FEE_TYPES, NOTIFICATION_TYPE, TRANSACTION_TYPES, TRANSACTION_STATUS, TRANSACTION_REASON } = require("../constants")
let io;
let Notification;
serverFile.then((data) => {
    console.log("deposite serverFile");
    // console.log(data?.server?.HapiServer?.app.db.Notification);
    io = data?.server?.HapiServer?.app?.io;
    Notification = data?.server?.HapiServer?.app.db.Notification;
})

module.exports = {
    depositEmitFunc: async (userID, coin) => {

        let room = "notification::" + userID;
        let notification = await Notification.create(
            {
                room: room,
                message: `New ${coin} Deposite`,
                type: NOTIFICATION_TYPE.DEPOSIT,
                link: `/wallet`,
            },
            // { transaction }
        );

        io.emit(userID, notification);
    },
};

