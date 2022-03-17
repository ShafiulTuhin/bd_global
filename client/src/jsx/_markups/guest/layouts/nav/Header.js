import React from "react";
import { useSelector, useDispatch } from "react-redux";
// import { useHistory, useLocation } from "react-router-dom";
import _actions from "../../../../_actions";
import { Link } from "react-router-dom";
/// Image
// import profile from "../../../../../images/profile/pic1.jpg";
import _components from "../../components";
import { Dropdown } from "react-bootstrap";

const { IdenticonAvatar } = _components;
const { user } = _actions;

const Header = ({}) => {
  const dispatch = useDispatch();
  const session = useSelector((state) => state?.session);

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
                  placeholder="Find something here..."
                />
                {/* <div className="input-group-append">
                  <span className="input-group-text">
                    <Link to={"#"}>
                      <i className="simple-magnifier"></i>
                    </Link>
                  </span>
                </div> */}
              </div>
            </div>
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
                  <IdenticonAvatar size={50} alt="" id={session?.user?.id} />
                  <div className="header-info">
                    <span>{session?.user?.email}</span>
                    <small className="text-capitalize">
                      {session?.user?.role}
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

                  <Link
                    to="#"
                    onClick={() => dispatch(user.logout())}
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
                    <span className="ml-2">Logout </span>
                  </Link>
                </Dropdown.Menu>
              </Dropdown>
            </ul>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Header;
