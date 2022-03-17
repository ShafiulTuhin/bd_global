import "./me.style.scss";
import React, { useEffect, useState } from "react";
import { Form, Button, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import Moment from "react-moment";
import styled from "styled-components";

// Multi language
import { useTranslation } from "react-i18next";
import { notify } from "../../../../_helpers/notify";

// HOOKS
import useToggler from "../../../../_hooks/toggler.hook";
import useServiceContextHook from "../../../../_hooks/service.context.hook";

// HELPERS
import { routeMap } from "../../routes";

// ASSETS
import icon_password from "../../app-assets/images/icon/icon_password.png";
import icon_recommended from "../../app-assets/images/icon/icon_recommended.png";
import icon_phone from "../../app-assets/images/icon/icon_phone.png";
import icon_email from "../../app-assets/images/icon/icon_email.png";
import icon_verification from "../../app-assets/images/icon/icon_verification.png";
import PaymentMethodModal from "./PaymentMethodModal.component";
import { ModalForm } from "../../../_shared/components/modalForm.component";
import KycForm from "../../components/form/kyc.form";
import UIColors from "../../../_shared/components/colors";
import Loader from "../../../_shared/components/Loader.component";
import FeedbackComponent from "../../../_shared/components/Feedback.component";

const SettingCard = styled.div`
  box-shadow: 0 2px 12px 2px #f3f3f3;
  margin: 20px 0 20px;
  display: flex;
  flex-direction: column;
  /* gap: 20px; */
  background: #fff;
  .setting_container {
    padding: 20px;
  }
  .setting_headline {
    line-height: 1.5;
    font-size: 1.25rem;
    font-weight: 300;
    /* opacity: .5 */
  }
  .setting_table_container {
    overflow-x: auto;
  }
`;

const SettingCardItem = styled.div`
  border-top: 1px solid ${UIColors.gray};
  display: flex;
  justify-content: space-evenly;
  align-items: flex-start;
  gap: 12px;
  padding: 20px;
  margin-bottom: 8px;
  flex-wrap: wrap;
  .setting_img {
    width: 35px;
    margin-bottom: auto;
    height: 35px;
  }
  .setting_info {
    .title {
    }
    .description {
      font-size: 12px;
      color: #888;
    }
  }
  .setting_visual {
    /* margin: 0 auto */
    font-weight: 600;
    color: ${UIColors.secondary};
    min-width: 100px;
    margin-left: auto;
  }
  .setting_actions {
    display: flex;
    gap: 8px;
    align-items: baseline;
    margin-left: auto;
    .trigger {
      border: none;
      min-width: 70px;
      color: ${UIColors.dark};
      /* font-weight: 500; */
      padding: 8px 16px;
      opacity: 0.5;
      border-radius: 4px;
      &:hover {
        background-color: ${UIColors?.primary};
        color: white;
        opacity: 1;
      }
    }
  }
`;

const SettingTable = styled("table")`
  display: table;
  padding: 20px;
  width: 100%;
  tr {
    td {
      border-top: 1px solid #f3f3f3;
    }
    td,
    th {
      padding: 12px;
    }
  }
`;

const UserInfoSection = styled("div")`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 20px;
  .user_initial {
    text-transform: uppercase;
    width: 70px;
    height: 70px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background-color: ${UIColors.gray};
    border-radius: 50%;
    color: #888;
  }
  .user_name {
    .name {
      text-transform: uppercase;
      display: inline-flex;
      align-items: baseline;
      flex-wrap: wrap;
      gap: 8px;
      font-size: 16pt;
      font-weight: 300;
      .verification-icon {
        color: #85c4f9;
      }
    }
    .user_id {
      display: block;
      width: 100%;
      flex: 100%;
      color: #888;
    }
  }

  .edit_btn {
    color: #38f;
    border: none;
    display: inline-flex;
    align-items: baseline;
    gap: 4px;
  }
`;

const ListGrid = styled("ul")`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 0 20px;
  ${(props) =>
    props.spread && `border-top: 1px solid ${UIColors?.gray}; padding: 20px;`}
  justify-content: ${(props) => {
    return props.spread ? `space-between` : `flex-start`;
  }};
  li {
    ${(props) => {
    return props.spread && `flex:1`;
  }};
    min-width: 100px;
    > p {
      color: #acacac;
      font-size: 12px;
    }

    .pronounced {
      font-size: 25px;
      font-weight: bold;
    }
  }
`;

const PaymentCard = styled("li")`
  border: 1px solid #ededed;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 200px;
  max-width: 350px;
  width: auto;
  max-height: 450px;
  overflow: hidden;
  flex-grow: 1;
  position: relative;
  transition: box-shadow 0.35s ease-in-out;
  &:hover {
    box-shadow: 0 5px 10px -5px #88888855;
  }
  .title {
    text-transform: uppercase;
    font-weight: bold;
    padding: 20px;
    border-bottom: 1px solid #ededed;
  }
  .details {
    padding: 20px;
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
    li {
      flex: 50%;
      .label {
        font-size: 12px;
        text-transform: capitalize;
      }
      .label-value {
        font-weight: bold;
        display: block;
      }
    }
  }
  .actions {
    display: flex;
    gap: 10px;
    padding: 8px 20px;
    font-size: 12px;
    width: 100%;
    justify-content: flex-end;
    margin-top: auto;
    position: absolute;
    bottom: 0;
    background: linear-gradient(to top, white 20%, #ffffff55);
    min-height: 60px;
    button {
      border: none;
    }
  }
`;

const CardColumnBreaker = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export default function Me() {
  const {
    session,
    services: { user, auth },
  } = useServiceContextHook();

  const { t } = useTranslation();

  const [userData, setUserData] = useState(null);
  const [dataError, setDataError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session?.user)
      (async () => {
        try {
          setIsLoading(true);
          setDataError(null);
          if (!userData) {
            let { data, error } = await fetchUserData();
            if (error) throw new Error(error);
            setUserData(data);
          }
        } catch (error) {
          console.error(error);
          setDataError(error);
        } finally {
          setIsLoading(false);
        }
      })();
    return user.abort;
  }, [session]);

  async function logout() {
    try {
      setIsLoading(true);
      await user?.endSession();
      setIsLoading(false);
    } catch (err) {
      console.error("Unable to log user out");
    }
  }

  /**
   *
   * @param {Object} filter : ;
   * @returns
   */
  async function fetchUserData(filter = {}) {
    return await user.find(filter);
  }

  return (
    <div id="me" className="top_mast">
      {isLoading ? (
        <div
          style={{
            width: "auto",
            height: "70vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FeedbackComponent.Loading />
        </div>
      ) : dataError ? (
        <div
          className="container mx-auto"
          style={{
            width: "auto",
            height: "70vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FeedbackComponent>
            <div style={{ padding: 30, background: "#fff", flex: "1 auto" }}>
              <header
                className="h4 text-danger"
                style={{
                  display: "inline-flex",
                  gap: 10,
                  fontWeight: "500",
                  marginBottom: 15,
                  alignItems: "baseline",
                }}
              >
                <span className="fas fa-exclamation-circle"></span>
                <h2>Encountered Error!</h2>
              </header>
              <p>Please check your network connection or refresh the page.</p>
              <p>If error persist, contact support</p>
            </div>
          </FeedbackComponent>
        </div>
      ) : session?.user && userData ? (
        <>
          <div className="container p-0">
            <div className="d-flex w-100 justify-content-end pt-2 flex-wrap">
              <button
                onClick={logout}
                aria-label="logout"
                className="btn btn-danger"
                role="button"
              >
                {t("Logout")}
              </button>
            </div>
            <SettingCard aria-label="Profile settings">
              <ProfileSetting />
            </SettingCard>

            {/* NOTIFICATION */}
            <NotificationSetting {...{ userData }} />

            <SettingCard aria-label="Security setting">
              <div className="setting_container">
                <header>
                  <h4 className="setting_headline">{t("Security")}</h4>
                </header>
              </div>
              <ul>
                {/* Login Password */}
                <li className="">
                  <ChangePasswordSetting {...{ userData }} />
                </li>
                {/* Google Auth */}
                <li className="">
                  <GoogleAuthSetting data={userData} />
                </li>
                {/* Phone number */}
                <li className="">
                  <PhoneVerificationSetting />
                </li>
                {/* Email verification */}
                <li className="">
                  <MailVerificationSetting data={userData} />
                </li>
                {/* ID verification */}
                <li className="">
                  <IDVerification />
                </li>
              </ul>
            </SettingCard>

            <SettingCard aria-label="Payment setting">
              <PaymentMethodSetting
                userData={userData?.profile?.payment_methods}
              />
            </SettingCard>
          </div>
        </>
      ) : (
        <div style={{ minHeight: "50vh" }}>Must login</div>
      )}
    </div>
  );
}
/**
 * @description modify user profile data
 * @returns
 */
function ProfileSetting() {
  const { t } = useTranslation();
  const [userData, setUserData] = useState(null);
  const {
    session,
    services: { user },
  } = useServiceContextHook();

  const { toggledPayload, onOpen, onClose, isOpen } = useToggler();

  /**
   * @description fetch profile data
   * @param {Object*} filter : ;
   */
  async function fetchUserData(filter = {}) {
    try {
      let { data, error } = await await user.find(filter);
      if (error) throw new Error(error);
      setUserData(data);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (!userData) fetchUserData();
  }, []);

  function useFormRenderer(formData) {
    return ["Edit Profile", <KycForm.ModifyProfile {...{ formData }} />];
  }

  function Username({ user, user: { profile } }) {
    return (
      <small className="text-muted d-block text-capitalize">
        {!user?.verified && (
          <span
            className="fas fa-check-circle"
            style={{ color: UIColors.secondary }}
          >
            &nbsp;
          </span>
        )}
        <span>
          {profile?.lname && profile?.lname}
          {profile?.oname && `, ${profile?.oname}`}
        </span>
      </small>
    );
  }

  return (
    userData && (
      <div>
        <div
          className="wow animate__animated fadeInDown "
          data-wow-delay="0.2s"
        >
          <CardColumnBreaker>
            <UserInfoSection className="user_info">
              <span className="user_initial">
                {userData?.profile?.pname && userData?.profile?.pname[0]}
              </span>
              <p className="user_name">
                <span className="name">
                  <span>{userData?.profile?.pname}</span>
                  {userData?.verified && (
                    <span className="fas fa-check-circle verification-icon"></span>
                  )}
                </span>
                <Username user={userData} />
                <small className="user_id">
                  <span>{userData?.id}</span>
                </small>
              </p>

              <button
                className="trigger"
                onClick={() => onOpen(userData?.profile)}
                // className="edit_btn"
              >
                <i className="fas fa-edit"></i>
                {t("Edit")}
              </button>
            </UserInfoSection>

            <section>
              <ListGrid>
                {userData?.login_at && (
                  <li>
                    <p className="d-block">{t("Last login time :")}</p>{" "}
                    <span>
                      <Moment format="HH:mm A, Do MMM YYYY">
                        {userData?.login_at}
                      </Moment>
                    </span>
                  </li>
                )}
                {Array.isArray(session?.user?.security?.ip_address) &&
                  session?.user?.security?.ip_address?.length && (
                    <li>
                      <p className="d-block">IP :</p>
                      <span>
                        {
                          session?.user?.security?.ip_address[
                          session?.user?.security?.ip_address.length - 1
                          ]
                        }
                      </span>
                    </li>
                  )}
              </ListGrid>
            </section>

            <section>
              <ListGrid spread>
                <li>
                  <span className="pronounced">{userData?.total_orders}</span>
                  <p>Total orders</p>
                </li>
                <li>
                  <span className="pronounced">
                    {userData?.total_orders &&
                      (userData?.total_completed_orders /
                        userData?.total_orders) *
                      100}
                    %
                  </span>
                  <p>Completion rate</p>
                </li>
                <li>
                  <span className="pronounced">
                    <span className="positive text-success">
                      {userData?.total_positive_reviews}
                    </span>
                    /
                    <span className="negative text-danger">
                      {userData?.total_negative_reviews}
                    </span>
                  </span>
                  <p>Your Reviews</p>
                </li>
              </ListGrid>
            </section>
          </CardColumnBreaker>
        </div>

        <ModalForm
          {...{
            useFormRenderer,
            isOpen,
            onClose() {
              fetchUserData();
              onClose();
            },
            formData: {
              ...toggledPayload,
              onClose() {
                fetchUserData();
                onClose();
              },
            },
          }}
        />
      </div>
    )
  );
}

function NotificationSetting() {
  const {
    services: { security },
  } = useServiceContextHook();
  const { t } = useTranslation();
  const [securityData, setSecurityData] = useState();
  const [confirmations, setConfirmation] = useState({
    login: { email: false, sms: false, otp: false },
    transaction: { email: false, sms: false, otp: false },
  });

  useEffect(() => {
    async function fetchSecurity() {
      let { data } = await security?.find();

      if (data) setSecurityData(data);
      // Transform confirmation array to object format
      const obj = {};
      Object.entries(data?.confirmations || {}).forEach(([key, value]) => {
        let temp = {};
        value.forEach((el) => {
          temp[String(el)?.toLowerCase()] = true;
        });
        obj[key] = { ...confirmations[key], ...temp };
      });
      setConfirmation(obj);
    }

    fetchSecurity();

    return () => {
      security.abort();
    };
  }, []);
  /**
   *
   * @param {String} type - Confirmation type - transaction, login
   */
  async function onConfirmationChange({ type, key, value }) {
    console.log(type,key,value)
    try {
      // send a request to update confirmation
      const newState = {
        ...confirmations,
        [type]: { ...confirmations[type], [key]: value },
      };
      let changes = {};
      // Transform confirmation object to array format
      Object.entries(newState)?.map(([key, value]) => {
        changes[key] = Object.keys(value)
          ?.filter((k) => value[k])
          .map((t) => String(t)?.toUpperCase());
      });

      let { data, error } = await security.updateByID(securityData?.id, {
        confirmations: changes,
      });
      if (error) throw new Error(error.message);
      if (data) {
        notify("Done", "success");
        setConfirmation(newState);
      }
    } catch (err) {
      console.error(err);
      notify(err.message, "error");
    }
  }

  return (
    <SettingCard aria-label="Notification settings">
      <div
        className="setting_container wow animate__animated fadeInDown"
        data-wow-delay="0.4s"
      >
        <header>
          <h4 className="setting_headline">{t("Notification Settings")}</h4>
        </header>
        <div className="setting_table_container">
          <SettingTable>
            <thead>
              <tr>
                <th></th>
                <th>{t("Email")}</th>
                <th>{t("SMS")}</th>
                <th>{t("OTP")}</th>
              </tr>
            </thead>
            <tbody>
              {securityData &&
                confirmations &&
                Object.entries(confirmations).map(([type, tvalue]) => {
                  return (
                    <tr key={type}>
                      <td className="text-capitalize">
                        {t(String(type)?.replace(/_/gi, " "))}
                      </td>

                      {Object.entries(tvalue).map(([key, value]) => (
                        <td key={`${type}-${key}`}>
                          <Form.Check
                            type="switch"
                            id={`switch-${type}-${key}`}
                            name={`${type}-${key}`}
                            className="custom-switch-md "
                            onChange={() => {
                              onConfirmationChange({
                                type,
                                key,
                                value: !value,
                              });
                            }}
                            checked={confirmations[type][key]}
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })}
            </tbody>
          </SettingTable>
        </div>
      </div>
    </SettingCard>
  );
}
/**
 * @description ID verification setting component
 * @returns
 */
function IDVerification() {
  const { t } = useTranslation();
  const {
    services: { kyc },
  } = useServiceContextHook();

  const { toggledPayload, onOpen, onClose, isOpen } = useToggler();
  const [data, setData] = useState(null);

  async function fetchData() {
    try {
      let {
        data,
        error,
        message = "Error fetching KYC.ID data",
      } = await kyc.find({
        "where[type]": "ID",
      });
      if (!data) throw new Error(error?.message || message);
      setData((state) => {
        let filtered = data?.filter(
          (kyc) => String(kyc.type)?.toLowerCase() === "id"
        );
        return filtered?.length ? filtered[0] : [];
      });
    } catch (err) {
      console.error(err);
    }
  }

  function useFormRenderer(formData) {
    return [
      "ID Verification",
      <KycForm
        {...{
          formData,
          onClose: () => {
            fetchData();
            onClose();
          },
        }}
      />,
    ];
  }

  useEffect(() => {
    fetchData();
  }, []);

  function KYCStatus({ data: { status, uploads, updatedAt } }) {
    switch (String(status)?.toLowerCase()) {
      case "accepted": {
        return (
          <>
            <li>
              <Badge variant="success">
                <span className="i fas fa-check-circle"></span> Verified
              </Badge>
            </li>
            <li>
              <small className="text-muted">
                <Moment fromNow interval={60000}>
                  {updatedAt}
                </Moment>
              </small>
            </li>
          </>
        );
      }
      case "denied": {
        return (
          <>
            <li>
              <Badge variant="danger">
                <span className="fas fa-exclamation-triangle"></span>&nbsp;
                Rejected
              </Badge>
            </li>
            <li>
              <small className="text-muted">
                Rejected on:{" "}
                <Moment format="Do MMMM, Y hh:mm A">{updatedAt}</Moment>
              </small>
            </li>
          </>
        );
      }
      case "pending":
      default: {
        return uploads ? (
          <>
            <li>
              <Badge variant="info">
                <span className="fas fa-exclamation-circle"></span>&nbsp;
                Submitted and awaiting approval
              </Badge>
            </li>
            <li>
              <small className="text-muted">
                <Moment fromNow interval={60000}>
                  {updatedAt}
                </Moment>
              </small>
            </li>
          </>
        ) : (
          <li>
            <Badge variant="warning">
              <span className="fas fa-exclamation-circle"></span>&nbsp; You have
              not uploaded any means of Identification yet!
            </Badge>
          </li>
        );
      }
    }
  }
  return (
    <SettingCardItem>
      <img
        className="setting_img"
        src={icon_verification}
        alt="Identity Verification"
      />
      <div className="setting_info">
        <p className="title">{t("Identity Verification")}</p>
        <span className="description">
          {t(
            "Identity Verification can protect your account security and increase transaction limits."
          )}
        </span>
        <ul className="d-block">{data && <KYCStatus data={data} />}</ul>
      </div>
      <div className="setting_actions">
        {!["pending", "accepted"].includes(
          String(data?.status)?.toLowerCase()
        ) && (
            <button onClick={() => onOpen({})} className="trigger">
              {t("Enable")}
            </button>
          )}
      </div>
      <ModalForm
        modalProps={{ size: "lg" }}
        {...{
          useFormRenderer,
          isOpen,
          onClose,
          formData: { ...toggledPayload, onClose },
        }}
      />
    </SettingCardItem>
  );
}

/**
 * @description Change password setting component
 * @returns
 */
function ChangePasswordSetting({ userData }) {
  const { t } = useTranslation();
  const {
    session: { user },
  } = useServiceContextHook();
  return userData ? (
    <SettingCardItem>
      <img className="setting_img" src={icon_password} alt="Login Password" />
      <header className="setting_info">
        <p className="title">{t("Login Password")}</p>
        <div className="description">
          <span>{t("Login password is used to log in to your account.")}</span>
        </div>
        <div>
          {userData?.password_is_unknown && (
            <Badge variant="warning">
              <span className="fas fa-exclamation-circle"></span>&nbsp;
              <span>Set your password</span>
            </Badge>
          )}
        </div>
      </header>
      <div className="setting_actions">
        <Link
          to={{
            pathname: routeMap?.changePassword,
            state: { from: routeMap?.me },
          }}
          className="trigger"
        >
          {t("Change")}
        </Link>
      </div>
    </SettingCardItem>
  ) : null;
}

/**
 * @description Google Auth setting component
 * @returns
 */
function GoogleAuthSetting() {
  const {
    services: { security },
  } = useServiceContextHook();
  const { t } = useTranslation();

  const [securityData, setSecurityData] = useState();

  useEffect(async () => {
    let { data } = await security?.find();
    setSecurityData(data);
  }, []);
  const { toggledPayload, onOpen, onClose, isOpen } = useToggler();

  function useFormRenderer({ ...formData }) {
    return [
      "Google Authentication Verification",
      <KycForm.VerifyGoogleAuth initialValues={formData} onClose={onClose} />,
    ];
  }

  return (
    <SettingCardItem>
      <img
        className="setting_img"
        src={icon_recommended}
        alt="Google Authenticator (Recommended)"
      />
      <header className="setting_info">
        <p className="title">{t("Google Authenticator (Recommended)")}</p>
        <div className="description">
          <p>{t("Protect your account and transactions.")}</p>
          <span>
            <Link to="#">{t("Having trouble?")}</Link>
          </span>
        </div>

        {securityData?.two_factor ? (
          <li>
            <Badge variant="success">
              <span className="fas fa-check-circle"></span> Enabled
            </Badge>
          </li>
        ) : null}
      </header>

      {/*  <button type="button" onClick={() => onOpen()} className="btn_unset">
        <i className="fad fa-plus-circle"></i>
        {t("Unset")}
      </button> */}
      <div className="setting_actions">
        {!securityData?.two_factor && (
          <button type="button" onClick={() => onOpen()} className="trigger">
            {t("Enable")}
          </button>
        )}

        <ModalForm
          {...{ useFormRenderer, isOpen, onClose, formData: { ...toggledPayload, onClose } }}
        />
      </div>
    </SettingCardItem>
  );
}

/**
 * @description Phone number verification setting component
 * @returns
 */
function PhoneVerificationSetting() {
  const {
    session,
    services: { kyc },
  } = useServiceContextHook();
  const { t } = useTranslation();
  const { toggledPayload, onOpen, onClose, isOpen } = useToggler();
  const [data, setData] = useState();

  async function fetchData() {
    try {
      let { data, error, message } = await kyc.find({
        where: {
          type: "SMS",
        },
      });
      if (!data)
        throw new Error(
          error?.message || message || "Error fetching KYC.SMS data"
        );
      setData((state) => {
        let filtered = data?.filter(
          (kyc) => String(kyc.type)?.toLowerCase() === "sms"
        );
        return filtered?.length ? filtered[0] : [];
      });
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  function ConfirmRemove() {
    return <>Are you sure?</>;
  }
  function useFormRenderer(data) {
    let { type, formData } = data;
    const decide = function () {
      switch (type) {
        case "remove": {
          return ["Remove Phone Number", <ConfirmRemove />];
        }
        default: {
          return [
            "Phone Number Verification",
            <KycForm.VerifyPhone initialValues={formData} onClose={onClose} />,
          ];
        }
      }
    };
    return decide();
  }
  function KYCStatus({ data: { status, updatedAt } }) {
    switch (String(status)?.toLowerCase()) {
      case "accepted": {
        return (
          <>
            <li>
              <Badge variant="success">
                <span className="i fas fa-check-circle"></span> Verified
              </Badge>
            </li>
            <li>
              <small>
                Verified{" "}
                <Moment fromNow interval={60000}>
                  {updatedAt}
                </Moment>
              </small>
            </li>
          </>
        );
      }
      case "denied": {
        return (
          <>
            <li>
              <Badge variant="danger">
                <span className="fas fa-exclamation-triangle"></span>&nbsp;
                Rejected
              </Badge>
            </li>
            <li>
              <small className="text-muted">
                Rejected on:{" "}
                <Moment format="Do MMMM, Y hh:mm A">{updatedAt}</Moment>
              </small>
            </li>
          </>
        );
      }
      case "pending":
      default: {
        return (
          <li>
            <Badge variant="warning">
              <span className="fas fa-exclamation-circle"></span>&nbsp; You have
              not added a phone number yet!
            </Badge>
          </li>
        );
      }
    }
  }

  return (
    <SettingCardItem>
      <img
        className="setting_img"
        src={icon_phone}
        alt="Phone Number Verification"
      />
      <header className="setting_info">
        <p className="title">{t("Phone Number Verification")}</p>

        <span className="description">
          {t("Protect your account and transactions.")}
        </span>
        <ul className="d-block">
          {!data ? (
            <li>
              <Badge variant="warning">
                <span className="fas fa-exclamation-circle"></span>&nbsp; You
                have not added a phone number yet!
              </Badge>
            </li>
          ) : (
            <KYCStatus data={data} />
          )}
        </ul>
      </header>

      {/* Data */}
      {/* <p className="setting_visual">
        {data?.profile?.phone && hideText(data?.profile?.phone)}
      </p> */}
      <div className="setting_actions">
        {/* Change button */}
        <div style={{ display: "flex" }}>
          {/* Change/Add button */}
          <button
            className="trigger"
            style={{ flex: "1" }}
            type="button"
            onClick={() =>
              onOpen({
                type: "change",
                formData: { phone: session?.user?.profile?.phone },
              })
            }
          >
            {data && String(data.status).toLowerCase() === "accepted"
              ? t("Change")
              : t("Add")}
          </button>
          {/* Remove button */}
          {/* {session?.user?.profile?.phone ? (
            <button
              type="button"
              onClick={() =>
                onOpen({
                  type: "remove",
                  formData: {},
                })
              }
              className="trigger"
            >
              {t("Remove")}
            </button>
          ) : null} */}
        </div>
      </div>
      <ModalForm
        {...{
          useFormRenderer,
          isOpen,
          onClose() {
            fetchData();
            onClose();
          },
          formData: toggledPayload,
        }}
      />
    </SettingCardItem>
  );
}

/**
 * @description hides a portion of text and replaces it with a dummy text
 * @param {String} text
 * @param {String} at
 * @returns
 */
function hideText(text = "", at = null, replacement = "*") {
  let [first, ...rest] = String(text)?.split(at || ",");
  let transform =
    String(first)?.substring(0, 3) +
    `${String(replacement).repeat(3)}${at}${rest?.join("")}`;
  return transform;
}

/**
 * @description Mail verification setting component
 * @returns
 */
function MailVerificationSetting() {
  const {
    services: { kyc },
    session: { user },
  } = useServiceContextHook();
  const { t } = useTranslation();
  const { onOpen, onClose, isOpen } = useToggler();
  const [userData, setUserData] = useState(user);
  const [data, setData] = useState(user);
  function useFormRenderer(formData) {
    return [
      "Email Address Verification",
      <KycForm.VerifyMail {...{ formData }} />,
    ];
  }
  function KYCStatus({ data: { status, updatedAt } }) {
    switch (String(status)?.toLowerCase()) {
      case "accepted": {
        return (
          <>
            <li>
              <Badge variant="success">
                <span className="i fas fa-check-circle"></span>&nbsp; Verified
              </Badge>
            </li>
            <li>
              <small className="text-muted">
                <Moment fromNow interval={60000}>
                  {updatedAt}
                </Moment>
              </small>
            </li>
          </>
        );
      }
      case "denied": {
        return (
          <>
            <li>
              <Badge variant="danger">
                <span className="fas fa-exclamation-triangle"></span>&nbsp;
                Rejected
              </Badge>
            </li>
            <li>
              <small className="text-muted">
                Rejected on:{" "}
                <Moment format="Do MMMM, Y hh:mm A">{updatedAt}</Moment>
              </small>
            </li>
          </>
        );
      }
      case "pending":
      default: {
        return (
          <li>
            <Badge variant="warning">
              <span className="fas fa-exclamation-circle"></span>&nbsp; You have
              not added an email address yet!
            </Badge>
          </li>
        );
      }
    }
  }

  async function fetchData() {
    try {
      let { data, error, message } = await kyc.find({
        "where[type]": "EMAIL",
      });
      if (!data)
        throw new Error(
          error?.message || message || "Error fetching KYC.EMAIL data"
        );
      setData((state) => {
        let filtered = data?.filter(
          (kyc) => String(kyc.type)?.toLowerCase() === "email"
        );
        return filtered?.length ? filtered[0] : [];
      });
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    setUserData(user);
    fetchData();
  }, [user]);

  return (
    <SettingCardItem>
      <img
        className="setting_img"
        src={icon_email}
        alt="Email Address Verification"
      />
      <header className="setting_info">
        <p className="title">{t("Email Address Verification")}</p>
        <span className="description">
          {t("Protect your account and transactions.")}
        </span>
        <span className="d-block">{data && <KYCStatus data={data} />}</span>
      </header>
      <div className="setting_visual">{hideText(userData?.email, "@")}</div>
      {/*   <div className="setting_actions">
        <button type="button" onClick={() => onOpen()} className="trigger">
          {t("Change")}
        </button>
      </div> */}
      {/* <button type="button" className="btn btn_remove">
        {t("Remove")}
      </button> */}
      <ModalForm
        {...{
          useFormRenderer,
          isOpen,
          onClose,
          formData: {
            onChange(value) {
              onClose();
              setUserData((state) => ({ ...state, ...value }));
            },
            data: { email: userData?.email },
          },
        }}
      />
    </SettingCardItem>
  );
}

/**
 * @description Payment method setting component
 * @param {Object} props
 * @returns
 */
function PaymentMethodSetting({ userData }) {
  const {
    services: { profile },
    session,
  } = useServiceContextHook();
  const { t } = useTranslation();
  const togglePaymentMethodModal = useToggler();
  const [paymentData, setPaymentData] = useState(userData);

  /**
   * @description sends server request to update user data
   * @param {Object} changes
   * @returns
   */
  async function updatePaymentMethod(changes) {
    // Get current user profile ID
    let profile_id = session?.user?.profile?.profile_id;

    if (profile_id)
      return await profile.updateByID(profile_id, {
        payment_methods: changes,
      });
    return { error: new Error("profile ID not found!") };
  }

  /**
   * @description Handles payment method removal event
   * @param {String} key
   */
  async function onRemovePaymentMethod(key) {
    try {
      // Make a clone of the original payment data object
      let clone = Object.assign({}, paymentData);
      delete clone[key]; //Delete the key and its values

      // Make a network request
      let { data: _data, error, message } = await updatePaymentMethod(clone);
      // Handle network request response
      if (!_data) {
        throw new Error(
          error?.message || message || "Server error! Operation not completed"
        );
      }
      // if success
      setPaymentData(clone);
      notify("Done");
    } catch (err) {
      console.error(err);
      notify(err.message, "error");
    }
  }

  /**
   * @description handles the update event
   * @param {Object} changes
   */
  async function onUpdate(changes) {
    try {
      // Make network update request
      let {
        data: _data,
        error,
        message,
      } = await updatePaymentMethod({ ...paymentData, ...changes });
      // handle network request response
      if (!_data) {
        throw new Error(
          error?.message || message || "Server error! Operation not completed"
        );
      }
      // on success
      setPaymentData({ ...paymentData, ...changes });
      notify("Done");
      togglePaymentMethodModal.onClose();
    } catch (err) {
      console.error(err);
      notify(err.message, "error");
    }
  }

  return (
    <section>
      <div
        className="setting_container"
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <header>
          <h4 className="setting_headline">{t("Payment methods")}</h4>
        </header>
        <Button
          className="btn btn-primary"
          onClick={() =>
            togglePaymentMethodModal.onOpen({
              data: paymentData,
              onUpdate,
            })
          }
        >
          + Add Payment
        </Button>
      </div>
      {/* Modal */}
      {togglePaymentMethodModal.isOpen ? (
        <PaymentMethodModal
          {...{ setData: setPaymentData }}
          isOpen={togglePaymentMethodModal.isOpen}
          onClose={togglePaymentMethodModal.onClose}
          payload={togglePaymentMethodModal?.toggledPayload}
        ></PaymentMethodModal>
      ) : null}
      <div className="wow animate__animated fadeInDown" data-wow-delay="0.8s">
        <div
          style={{
            display: "flex",
            width: "100%",
            flexDirection: "column",
            gap: 10,
            padding: "0 15px 15px",
          }}
        >
          <div></div>
          {paymentData ? (
            <ul
              className=""
              style={{ display: "flex", flexWrap: "wrap", gap: 10 }}
            >
              {/* LISTING */}
              {Object.entries(paymentData).map(([key, value]) => (
                <PaymentCard key={key}>
                  <div className="">
                    <h5 className="title">
                      {t(String(key).replace(/_/gi, " "))}
                    </h5>
                  </div>
                  <ul className="details">
                    {Object.entries(value).map(([k, v]) => {

                      return (
                        <li key={k} style={{ maxheight: 450 }}>
                          <span className="label" style={{ maxheight: 450 }}>
                            {String(k).replace(/_/gi, " ")}
                          </span>
                          <span className="label-value">
                            {String(v).replace(/_/gi, " ")}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  <ul className="actions">
                    <li>
                      <button
                        type="button"
                        onClick={() =>
                          togglePaymentMethodModal.onOpen({
                            data: paymentData,
                            type: key,
                            onUpdate,
                          })
                        }
                      >
                        {t("Edit")}
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => onRemovePaymentMethod(key)}
                      >
                        {t("Delete")}
                      </button>
                    </li>
                  </ul>
                </PaymentCard>
              ))}
            </ul>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 200,
                width: "100%",
                marginTop: "auto",
              }}
            >
              You have not added any payment method yet
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
