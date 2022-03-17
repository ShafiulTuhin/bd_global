var smpp = require("smpp");

var server = smpp.createServer(
  {
    debug: true,
  },
  function(session) {
    session.on("error", function(e) {
      // Something ocurred, not listening for this event will terminate the program
      console.log(e)
      if (e.code === "ETIMEOUT") {
        // TIMEOUT
      } else if (e.code === "ECONNREFUSED") {
        // CONNECTION REFUSED
      } else {
        // OTHER ERROR
      }
    });
    session.on("bind_transceiver", function(pdu) {
      // we pause the session to prevent further incoming pdu events,
      // untill we authorize the session with some async operation.
      session.pause();
      checkAsyncUserPass(pdu.system_id, pdu.password, function(err) {
        if (err) {
          session.send(
            pdu.response({
              command_status: smpp.ESME_RBINDFAIL,
            })
          );
          session.close();
          return;
        }
        session.send(pdu.response());
        session.resume();
      });
    });
  }
);

server.listen(2775);
