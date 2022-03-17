import _constants from "../_constants";
import _services from "../_services";

const { auth } = _services;
const { NOTICE, REQUEST, SESSION } = _constants;

const accountUserActions = {
  /**
   * @function login - User login action
   * @param {Object} param
   * @param {String} param.email
   * @param {String} param.password
   * @param {String | "basic"} [param.role]
   * @param {String | "/"} [param.from]
   * @returns
   */
  login(request) {
    return async (dispatch) => {
      dispatch(log({ type: NOTICE.CLEAR }));
      dispatch(log({ type: REQUEST.SESSION_LOGIN }));
      try {
        let { data, error } = await request();
        if (!data) throw new Error(error?.message || "Error in login request");

        return dispatch(log({ type: SESSION.LOGIN, data }));
      } catch (error) {
        return dispatch(
          log({
            type: NOTICE.ERROR,
            data: error?.response?.data?.message || error.toString(),
          })
        );
      }
    };
  },
  /**
   * @function logout - logs user out
   * @returns
   */
  logout() {
    return (dispatch) => {
      dispatch(log({ type: REQUEST.SESSION_LOGOUT }));
      // localStorage.removeItem("user");
      dispatch(log({ type: REQUEST.CLEAR }));
      dispatch(log({ type: NOTICE.CLEAR }));
      dispatch(log({ type: SESSION.LOGOUT }));
    };
  },
  /**
   * @function register - Create or register a new user
   * @param {Object} credentials
   * @returns
   */
  register(request) {
    return async (dispatch) => {
      dispatch(log({ type: NOTICE.CLEAR }));
      dispatch(log({ type: REQUEST.USER_REGISTER }));
      try {
        let { data, error } = await request();
        if (error) throw new Error(error);

        dispatch(log({ type: SESSION.REGISTER, data }));
      } catch (error) {
        console.error(error);
        dispatch(
          log({
            type: NOTICE.ERROR,
            data: error?.response?.data?.message || error.toString(),
          })
        );
      }
    };
  },
  /**
   * @function register - Create or register a new user
   * @param {Object} credentials
   * @returns
   */
  update(data) {
    return (dispatch) => {
      dispatch(log({ type: REQUEST.USER_UPDATE, with: data }));
      dispatch(log({ type: SESSION.UPDATE, data }));
    };
  },
};
export default accountUserActions;

/********************************** FUNCTIONS ********************************************/

/**
 * @function log - action logger
 * @param {Object} param - action object
 * @param {String} [param.type] - Type of action
 * @param {*} [param.data] - Action payload
 * @returns
 */
function log({ type = NOTICE.INFO, data = null }) {
  return { type, data };
}
