import React from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";

// ASSETS
import _components from "../../components";
import { Dropdown } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import AdminNotification from "./AdminNotification";

// HOOKS
import useServiceContextHook from "../../../../_hooks/service.context.hook";
const { IdenticonAvatar } = _components;

export default function Header() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const {
    session: { user },
    services: { auth },
    socket
  } = useServiceContextHook();

  return (
    <div className="header">
      <div className="header-content">
        <nav className="navbar navbar-expand">
          <div className="collapse navbar-collapse justify-content-between">
            <div className="header-left">
              <div className="input-group search-area right d-lg-inline-flex d-none">
                <input
                  type="text"
                  className="form-control"
                  placeholder={t("Find something here...")}
                />
              </div>
            </div>
            <AdminNotification></AdminNotification>
            {user ? (
              <ul className="navbar-nav header-right main-notification">
                {/* Admin User Avatar */}
                <Dropdown as="li" className="nav-item dropdown header-profile">
                  <Dropdown.Toggle
                    variant=""
                    as="a"
                    className="nav-link i-false c-pointer"
                    // href="#"
                    role="button"
                    data-toggle="dropdown"
                  >
                    <IdenticonAvatar size={50} alt="" id={user?.id} />
                    <div className="header-info">
                      <span
                        style={{
                          maxWidth: 120,
                          overflow: "hidden",
                          display: "block",
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                        }}
                        title={user?.email}
                      >
                        {user?.email}
                      </span>
                      <small className="text-capitalize">
                        {user.access_level > 2
                          ? t("Super Administrator")
                          : t("Administrator")}
                      </small>
                    </div>
                  </Dropdown.Toggle>

                  <Dropdown.Menu align="right" className="mt-2">
                    {/* <Link to="/profile" className="dropdown-item ai-icon">
                    <svg
                      id="icon-user1"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-primary"
                      width={18}
                      height={18}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx={12} cy={7} r={4} />
                    </svg>
                    <span className="ml-2">Profile </span>
                  </Link> */}

                    <button
                      onClick={() => auth.endSession()}
                      className="dropdown-item ai-icon"
                    >
                      <svg
                        id="icon-logout"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-danger"
                        width={18}
                        height={18}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1={21} y1={12} x2={9} y2={12} />
                      </svg>
                      <span className="ml-2">{t("Logout")} </span>
                    </button>
                  </Dropdown.Menu>
                </Dropdown>
              </ul>
            ) : null}
          </div>
        </nav>
      </div>
    </div>
  );
}



