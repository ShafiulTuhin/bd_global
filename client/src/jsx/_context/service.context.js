import React, { createContext, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Services from "../_services";
import actions from "../_actions";
import helpers from "../_helpers";
import { CircularProgress } from "@material-ui/core";
import useService from "../_hooks/service.hook";
// import { createBrowserHistory } from "history";
import { useHistory, useLocation } from "react-router-dom";
import UIColors from "../_markups/_shared/components/colors";

export const ServiceContext = createContext();

export default function ServiceContextProvider(props) {
  const session = useSelector((state) => state?.session);
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();

  history.listen((payload) => {
    // console.log(payload, history);
    // switch (String(action)?.toLowerCase()) {
    //   case "push": {
    //     // history.push(
    //     //   `${location?.pathname}${location.search}${location.hash}`,
    //     //   location?.state
    //     // );
    //   }
    // }
  });
  const [services, setServices] = useState(null);
  const [socket, setSocket] = useState(null)
  const { user: userAction } = actions;
  useEffect(() => {
    if(session){
      let newService = new Services(
        {
          token: session?.user?.token || "",
          baseURL: "/api",
          timeout: 50000,
        },
        () => dispatch(userAction.logout())
      );
      setServices(newService);
      const socket = newService?.chat?.authorizeSocket();
      socket.on("connect", (_socket) => {
        console.log('connect')
        socket.on("disconnect", () => {
          console.log('socket disconnect')
        });
      });
      setSocket(socket);
  }
  }, [session]);

  if (!socket)
    return <CircularProgress color="primary" /> 
  return (
    <ServiceContext.Provider
      value={{
        services,
        session,
        location,
        history,
        actions,
        helpers,
        useService,
        appName: "Cointc",
        appURL: "http://www.cointc.xyz",
        UIColors,
        socket
      }}
    >
      {props.children}
    </ServiceContext.Provider>
  );
}
