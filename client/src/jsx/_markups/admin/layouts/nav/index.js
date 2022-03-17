import React, { Fragment, useState } from "react";
import SideBar from "./SideBar";
import NavHeader from "./NavHeader";
import Header from "./Header";
// import ChatBox from "../ChatBox";

const JobieNav = ({ title, onClick: ClickToAddEvent, onClick2, onClick3 }) => {
  const [toggle, setToggle] = useState("");
  const onClick = (name) => setToggle(toggle === name ? "" : name);
  return (
    <>
      <NavHeader />
      {/* <ChatBox onClick={() => onClick("chatbox")} toggle={toggle} /> */}
      <Header
        onNote={() => onClick("chatbox")}
        onNotification={() => onClick("notification")}
        onProfile={() => onClick("profile")}
        toggle={toggle}
        title={title}
        onBox={() => onClick("box")}
        onClick={() => ClickToAddEvent()}
      />
      <SideBar />
    </>
  );
};

export default JobieNav;
