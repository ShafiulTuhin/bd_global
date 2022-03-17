import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Dropdown } from "react-bootstrap";
import { Link, NavLink, useHistory } from "react-router-dom";
import useServiceContextHook from "../../../_hooks/service.context.hook";
import { routeMap } from "../routes";
import icon_user from "../app-assets/images/icon/icon_user.png";
import { number } from "prop-types";
import session from "redux-persist/lib/storage/session";


// The forwardRef is important!!
// Dropdown needs access to the DOM node in order to position the Menu
function timeDifference(previous) {
  let current = new Date().getTime();
  var msPerMinute = 60 * 1000;
  var msPerHour = msPerMinute * 60;
  var msPerDay = msPerHour * 24;
  var msPerMonth = msPerDay * 30;
  var msPerYear = msPerDay * 365;

  var elapsed = current - previous;

  if (elapsed < msPerMinute) {
    return Math.round(elapsed / 1000) + " seconds ago";
  } else if (elapsed < msPerHour) {
    return Math.round(elapsed / msPerMinute) + " minutes ago";
  } else if (elapsed < msPerDay) {
    return Math.round(elapsed / msPerHour) + " hours ago";
  } else if (elapsed < msPerMonth) {
    return "approximately " + Math.round(elapsed / msPerDay) + " days ago";
  } else if (elapsed < msPerYear) {
    return "approximately " + Math.round(elapsed / msPerMonth) + " months ago";
  } else {
    return "approximately " + Math.round(elapsed / msPerYear) + " years ago";
  }
}
const CustomToggle = React.forwardRef(({ children, onClick, Count }, ref) => (
  <a
    href=""
    ref={ref}
    onClick={(e) => {
      e.preventDefault();
      onClick(e);
    }}
    className="toggler"
  >
    <i className="fas fa-bell" style={{ fontSize: "20px" }}></i>
    {Count > 0 && <span>{Count}</span>}
  </a>
));

// forwardRef again here!
// Dropdown needs access to the DOM of the Menu to measure it
const CustomMenu = React.forwardRef(
  (
    { children, style, className, onScroll, id, "aria-labelledby": labeledBy },
    ref
  ) => {
    const [value, setValue] = useState("");

    return (
      <div
        ref={ref}
        style={style}
        className={className}
        aria-labelledby={labeledBy}
        onScroll={onScroll}
        id={id}
      >
        <ul className="list-unstyled">
          {React.Children.toArray(children).filter(
            (child) =>
              !value || child.props.children.toLowerCase().startsWith(value)
          )}
        </ul>
      </div>
    );
  }
);

export default function UserMenu({ hideNotification = false }) {
  const {
    session: { user },
    socket,
  } = useServiceContextHook();
  // console.log(user.id);

  const { t } = useTranslation();
  const history = useHistory();
  const ref = useRef();
  // const [show, setShow] = useState(false);
  const [connected, setConnected] = useState(false);
  const [notification, setNotification] = useState([]);
  const [readCount, setReadCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const [fetchMore, setFetchMore] = useState(true);
  const onSocketConnection = () => {
    socket.emit("notification::join");
    socket.on("notification::new", (res) => {
      setNotification((prevState) => {
        return [res, ...prevState];
      });
    });
    socket.on(user?.id, (res) => {
      // console.log("notification::Test::BTC  ");
      // console.log(res);
      setNotification((prevState) => {
        return [res, ...prevState];
      });
    });
    getAndSetNotification(fetchMore);
    setFetchMore(false);
  };
  const openNotification = (id, link) => {
    socket.emit("notification::read", { id: id }, (res) => {
      markNotificationAsRead(res);
    });
    if (link) {
      history.push(link);
    }
  };
  function onNotificationClear(id, link) {
    socket.emit("notification::delete::admin", { id: id }, (res) => {
      // console.log(res);
      // markNotificationAsRead(res);
      let obj = notification?.find((o) => o.id == res.id);
      let ind = notification.indexOf(obj);
      const tempArray = [...notification];
      tempArray.splice(ind, 1);
      setNotification(tempArray);
    });
  }
  useEffect(() => {
    if (socket.connected) {
      setConnected(socket.connected);
      onSocketConnection();
    }
  }, [socket.connected]);

  const renderNotificationHeader = (type) => {
    if (type == "MESSAGE") {
      return "New message";
    }
    if (type == "ORDER") {
      return "New order";
    }
  };
  useEffect(() => {
    if (notification.length > 0) {
      handleReadCount();
    }
  }, [notification]);
  const getAndSetNotification = (shouldFetch) => {
    if (!shouldFetch) return false;
    socket.emit(
      "notification::fetch",
      { offset: offset * 20, limit: 20 },
      (res) => {
        console.log(res);
        if (res.rows?.length > 0) {
          res = res;
          setNotification((prevState) => {
            return [...prevState, ...res.rows];
          });
          setOffset((prevState) => {
            return prevState + 1;
          });
          setFetchMore(true);
        }
      }
    );
  };
  const markNotificationAsRead = (read) => {
    setNotification((prevState) => {
      return prevState.map((item) => {
        if (item.id == read.id && read.read == true) item.read = 1;
        return item;
      });
    });
  };
  const onScroll = (e) => {
    let element = e.target;
    var scrollPosition = element.scrollTop;
    if (ref.current && scrollPosition >= ref.current?.scrollTopMax) {
      console.log({ scrollPosition, maxTopScroll: ref.current.scrollTopMax });

      getAndSetNotification(fetchMore);
      setFetchMore(false);
    }
  };
  const handleReadCount = () => {
    let unReadCount = 0;
    notification.map((item) => {
      if (item.read == 0) {
        unReadCount++;
      }
    });
    setReadCount(unReadCount);
  };
  useEffect(() => {
    return () => {
      socket.emit("notification::leave");
    };
  }, []);

  return (
    <div className="user_menu">
      {/* {user && !hideNotification ? (
        <div>
          <Dropdown id="notification_dropdown">
            <Dropdown.Toggle as={CustomToggle} Count={readCount} />

            <Dropdown.Menu
              ref={ref}
              as={CustomMenu}
              onScroll={(e) => onScroll(e)}
              id="notificationBox"
              className="dropdown__container"
            >
              {notification.length > 0 &&
                notification.map((item, idx) => (
                  <Dropdown.Item
                    key={idx}
                    eventKey="2"
                    className={
                      item?.read && item.read == false
                        ? "dropdown__item"
                        : "read"
                    }
                    onClick={() => openNotification(item?.id, item?.link)}
                  >
                    <span className="item__title">
                      {renderNotificationHeader(item?.type)}
                    </span>
                    <span className="item__description text-capitalize">
                      {item?.message}
                    </span>
                    <ul className="item__meta">
                      <li>
                        {timeDifference(new Date(item?.createdAt).getTime())}
                      </li>
                    </ul>
                  </Dropdown.Item>
                  
                ))}
              {notification.length == 0 && (
                <Dropdown.Item eventKey="2" className="dropdown__item">
                  <span className="item__description">
                    No Notification found yet!
                  </span>
                </Dropdown.Item>
              )}
            </Dropdown.Menu>
          </Dropdown>
        </div>
      ) : null} */}

      {user && !hideNotification ? (
        <div>
          <Dropdown id="notification_dropdown" >
            {/* <Dropdown {...this.state.dropdownProps} onToggle={(isOpen, event) => this.onToggleFunction(isOpen, event)} /> */}
            <Dropdown.Toggle as={CustomToggle} Count={readCount} />

            <Dropdown.Menu
              ref={ref}
              as={CustomMenu}
              onScroll={(e) => onScroll(e)}
              id="notificationBox"
              className="dropdown__container"
            >

              {
                // Array(6)
                //   .fill({
                //     title: "Kalika sent a message on order id ORD-1287fW2j898",
                //     description: `Lorem ipsum, dolor sit amet consectetur adipisicing elit. Temporibus molestias totam optio maxime magnam aliquam repellendus sequi aperiam nisi delectus, minima atque corporis, veritatis odio voluptatibus est minus natus modi.`,
                //     createdAt: new Date(),
                //   })
                notification.length > 0 &&
                notification
                  .map((item, idx) => (

                    <Dropdown.Item
                      key={idx}
                      eventKey="2"
                      className={
                        item?.read && item.read === 1
                          ? "read"
                          : "dropdown__item"
                      }
                    // onClick={() => openNotification(item?.id, item?.link)}
                    >
                      <div style={{ display: "flex", "justify-content": "space-between" }}>
                        <span className="item__title" onClick={() => openNotification(item?.id, item?.link)}>
                          {/* {renderNotificationHeader(item?.type)} */}
                          {item?.message}
                        </span>
                        <span className="btn btn-sm" onClick={(e) => { 

                          onNotificationClear(item?.id, item?.link) 
                        }
                          }><i className="fa fa-close "></i></span>
                      </div>
                      {/* <span className="item__description text-capitalize">
                        {item?.description}
                      </span> */}
                      <ul className="item__meta">
                        <li>
                          {timeDifference(new Date(item?.createdAt).getTime())}
                        </li>
                      </ul>
                    </Dropdown.Item>
                    // </Dropdown>
                  )
                  )}
              {notification.length == 0 && (
                <Dropdown.Item eventKey="2" className="dropdown__item">
                  <span className="item__description">
                    No Notification found yet!
                  </span>
                </Dropdown.Item>
              )}
            </Dropdown.Menu>
          </Dropdown>
        </div>
      ) : null}

      <div className="session__board">
        {user ? (
          <NavLink
            activeClassName="on"
            className="nav_link truncate text-capitalize"
            to={routeMap?.me}
          >
            <img
              src={icon_user}
              alt="My page"
              style={{ display: "inline-block", width: 30, height: 30 }}
            />
            <p
              className="truncate"
              title={user?.profile?.pname || t("My page")}
            >
              {user?.profile?.pname || t("My page")}
            </p>
          </NavLink>
        ) : (
          <div
            className=""
            style={{
              display: "flex",
              justifyContent: "center",
              padding: 8,
              gap: 15,
            }}
          >
            <Link to={routeMap?.login} className="btn login__btn text-white">
              {t("Login")}
            </Link>
            <Link to={routeMap?.register} className="btn register__btn">
              {t("Register")}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
