import { useRef, useEffect, useState } from "react";
import { Row, Col, Card } from "react-bootstrap";
import styled from "styled-components";
import PerfectScrollbar from "react-perfect-scrollbar";
import useScrollPosition from "use-scroll-position";
import { formatDistance } from "date-fns";
import { useSelector } from "react-redux";

// CONSTANTS
import { SERVICE } from "../../../_constants";

// COMPONENTS
import PageTitle from "../layouts/PageTitle";
import _components from "../components";

import { useTranslation } from "react-i18next";
import useServiceContextHook from "../../../_hooks/service.context.hook";

const { IdenticonAvatar, Empty } = _components;
const ChatBox = styled(Card)`
  .chat-type-header {
    padding: 20px;
    background-color: #fff;
    font-weight: 600;
    border-top-left-radius: inherit;
    border-top-right-radius: inherit;
    color: #333;
    /* border-bottom: 1px solid #e6e6e6; */
  }
`;
const ChatGrid = styled.section`
  border-radius: inherit;
  min-height: 500px;
  max-height: 600px;
  display: grid;
  grid-template-columns: 300px 1fr;
  grid-template-rows: 1fr auto auto;
  @media screen and (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ChatContacts = styled.div`
  background: #fff;
  border-bottom-left-radius: inherit;
  grid-area: span 2;
  /* position: sticky;
  top: 0; */
  .contacts {
    .contact-first-letter {
      padding: 7px 1rem;
    }
    .contact_single {
      align-items: center;
      border-top: 1px solid #f3f3f3;
      &:hover {
        background: #ececec55;
        cursor: pointer;
      }
      .contact_single_info {
        display: flex;
        gap: 10px;
        padding: 8px 1rem;
        align-items: center;

        .img_cont {
          height: 40px;
          width: 40px;
          position: relative;
          img {
            width: 100%;
          }
          .online_icon {
            background: #68cf29;
            position: absolute;
            width: 12px;
            height: 12px;
            border-radius: 15px;
            right: -1px;
            bottom: 0;
            border: 2px solid #fff;
            &.offline {
              background: #ff4c41;
            }
          }
        }
        .user_info {
          overflow: hidden;
          span {
            font-size: 15px;
            color: #000;
            font-weight: 500;
            margin-bottom: 5px;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
            display: block;
          }
          p {
            font-size: 13px;
            margin-bottom: 0;
            line-height: 1;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
            display: block;
            max-width: 170px;
          }
        }
      }
    }
  }
  @media screen and (max-width: 768px) {
    display: none;
    &.active {
      position: absolute;
      display: block;
    }
  }
`;

const ChatForm = styled.section`
  display: flex;
  background: #f6f6f677;
  flex-direction: row;
  gap: 10px;
  padding: 10px;
  align-items: center;
  .chat-message-input {
    flex-grow: 1;
    > input.message_box {
      width: 100%;
      padding: 1rem 1.5rem;
      border-radius: 32px;
      border: 1px solid #ededed;
      outline: none;
    }
  }
  button {
    border: none;
    background: none;
    padding: 1rem;
    position: relative;
    z-index: 1;
    &::before {
      content: "";
      position: absolute;
      width: 95%;
      height: 95%;
      z-index: -1;
      top: 2.5%;
      left: 2.5%;
      display: block;
      background: #ededed;
      border-radius: 100%;
      transform: scale(0);
      transition: transform 0.25s ease-in;
    }
    &:hover {
      &::before {
        transform: scale(1);
      }
    }
    span {
      z-index: 1;
      display: block;
    }
  }
`;

const ChatMessagesBox = styled.section`
  max-height: 100%;
  background: #fbfbfb;
  display: flex;
  flex-direction: column;
`;

const ChatMessages = styled.section`
  overflow-y: auto;
  padding: 1rem;
  flex-grow: 1;
`;

const ChatBubble = styled.div`
  --bg: ${(prop) => (prop.send ? `#85c4f940` : `var(--primary)`)};
  --color: ${(prop) => (prop.send ? `#222` : `#fff`)};
  display: flex;
  margin-bottom: 20px;
  flex-direction: ${(prop) => (prop.send ? `row-reverse` : `row`)};
  gap: 10px;
  .img_cont_msg {
    width: 30px;
    height: 30px;
    display: block;
    max-width: 30px;
    min-width: 30px;
    img {
      width: 100%;
    }
  }
  .msg_container {
    background-color: var(--bg);
    margin-left: 10px;
    max-width: 320px;
    border-radius: ${(prop) =>
      prop.send
        ? `1.375rem 0 1.375rem 1.375rem`
        : `0 1.375rem 1.375rem 1.375rem`};
    padding: 10px 15px;
    color: var(--color);
    position: relative;

    &:after {
      content: "";
      position: absolute;
      border-bottom: 10px solid transparent;
      border-top: 0 solid;
      top: 0;
      ${(prop) =>
        prop.send
          ? `right: -10px;
          border-left: 10px solid transparent`
          : `
          left: -10px;
          border-right: 10px solid transparent;
          border-right-color: var(--bg);
          border-top-color: var(--bg)`}
    }
    .msg_time {
      display: block;
      font-size: 11px;
      color: var(--color);
      margin-top: 5px;
      opacity: 0.5;
    }
  }
`;

function ChatMessenger() {
  const { t } = useTranslation();
  return (
    <>
      <PageTitle activeMenu="Messenger" motherMenu="Chat management" />
      <header className="mb-4">
        <h3>{t("Chat Messenger")}</h3>
      </header>
      <Row style={{ marginBottom: 20, width: "100%" }}>
        <Col>
          <ChatBox>
            <Messenger />
          </ChatBox>
        </Col>
      </Row>
    </>
  );
}

function Messenger() {
  const { t } = useTranslation();
  const {
    services: { user, chat },
    useService,
  } = useServiceContextHook();

  let contacts = useService({
    [SERVICE?.BULK_RETRIEVE]: user.find,
  });
  // const api = useAPI();

  const { user: _user } = useSelector((state) => state.session);
  const ref = useRef();
  // let scrollPosition = useScrollPosition();
  const [toggleChatBox, setToggleChatBox] = useState(true);
  const [isChatting, setChatting] = useState(false);
  const [messages, setMessages] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const onStartChart = (id) => {
    let socket;
    if (!isChatting) {
      setChatting(true);
    }

    if (ref.current) {
      socket = ref.current;
      if (selectedUser) {
        socket?.emit("chat::end", selectedUser);
      }
      socket?.emit("chat::start", id, (inboxes) => {
        setMessages(inboxes);
      });
      setSelectedUser(id);
    }
  };

  const onMsgChange = (e) => {
    e.target.value && setMessageText(e.target.value);
  };

  const onSocketConnection = () => {
    // socket.on("connect", (_socket) => {
    //   ref.current = socket;
    //   socket.on("disconnect", () => {
    //     console.log("user disconnected");
    //   });
    // });
    // return socket;
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      if (ref.current && selectedUser) {
        ref.current.emit(
          "chat::message",
          {
            message: messageText,
            receiverId: selectedUser,
          },
          (message) => {
            setMessages((prev) => (prev ? [...prev, message] : [message]));
          }
        );
      }
      setMessageText("");
    }
  };

  useEffect(() => {
    contacts.dispatchRequest({
      type: [SERVICE?.BULK_RETRIEVE],
      payload: { sudo: true /* , fake: true  */ },
    });
  }, []);

  useEffect(() => {
    const socket = onSocketConnection();
    return () => {
      // user.abort();
      // chat.abort();
      socket && socket.disconnect();
    };
  }, []);

  return (
    <div className="">
      <div className="chat-type-header">{t("Type")}</div>
      <ChatGrid>
        {/* Chat users */}
        <ChatContacts className="chat-users contacts_card dz-chat-user-box">
          <PerfectScrollbar>
            <ul className="contacts">
              {/* <li className="contact-first-letter">A</li> */}
              {contacts &&
                contacts?.data &&
                contacts?.data?.result?.map((contact, key) => {
                  return (
                    <li
                      key={key}
                      className="contact_single"
                      onClick={() => onStartChart(contact?.id)}
                    >
                      <div className="contact_single_info bd-highlight">
                        <div className="img_cont ">
                          <div className="img_cont rounded-circle user_img overflow-hidden">
                            <IdenticonAvatar
                              size={50}
                              alt=""
                              id={contact?.id}
                            />
                          </div>
                          <span
                            className={`online_icon ${
                              contact?.online ? "online" : "offline"
                            }`}
                          ></span>
                        </div>

                        <div className="user_info">
                          <span>
                            {contact?.nicknamme || contact?.email || "Unamed"}
                          </span>
                          <p>{contact?.online ? "online" : "offline"}</p>
                        </div>
                      </div>
                    </li>
                  );
                })}
            </ul>
          </PerfectScrollbar>
        </ChatContacts>

        {/* Chat list*/}
        <ChatMessagesBox>
          {isChatting ? (
            <>
              <ChatMessages>
                <PerfectScrollbar
                  className={`card-body contacts_body p-0 dz-scroll  ${
                    toggleChatBox ? "ps ps--active-y" : ""
                  }`}
                >
                  {messages ? (
                    messages.map((message, index, arr) => {
                      let content = (
                        <>
                          <div className="img_cont_msg">
                            <IdenticonAvatar size={50} alt="" id={user?.id} />
                          </div>
                          <div className="msg_container">
                            {message.text}
                            <span className="msg_time">
                              {formatDistance(
                                new Date(message.createdAt),
                                new Date(),
                                {
                                  addSuffix: true,
                                }
                              )}
                            </span>
                            {/* <span class="msg_time">8:40 AM, Today</span> */}
                          </div>
                        </>
                      );
                      let isSender = message?.sender_id == user?.id;

                      return (
                        <ChatBubble
                          send={isSender}
                          key={message.id}
                          ref={(ref) => {
                            index + 1 === arr.length && ref?.scrollIntoView();
                          }}
                        >
                          {message ? content : null}
                        </ChatBubble>
                      );
                    })
                  ) : (
                    <Empty></Empty>
                  )}
                </PerfectScrollbar>
              </ChatMessages>

              <ChatForm>
                <div>
                  <button type="botton">
                    <span className="simple-paper-clip"></span>
                  </button>
                </div>
                <div className="chat-message-input">
                  <input
                    onChange={onMsgChange}
                    value={messageText}
                    type="text"
                    name="message_box"
                    id="message_box"
                    className="message_box"
                    placeholder="Enter message here..."
                    onKeyDown={onKeyDown}
                  />
                </div>
                <div>
                  <button type="botton">
                    <span className="simple-microphone"></span>
                  </button>
                </div>
              </ChatForm>
            </>
          ) : (
            <Empty.Chat></Empty.Chat>
          )}
        </ChatMessagesBox>
      </ChatGrid>
    </div>
  );
}

export default ChatMessenger;
