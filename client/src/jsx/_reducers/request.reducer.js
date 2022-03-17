import _constants from "../_constants";
const { REQUEST } = _constants;
const initialState = { type: null, with: null };

export default request;

function request(state = initialState, action) {
  switch (action.type) {
    case REQUEST.SESSION_LOGIN:
    case REQUEST.SESSION_LOGOUT:
    case REQUEST.USER_REGISTER: {
      return {
        with: action.data || null,
        type: action.type,
      };
    }

    case REQUEST.CLEAR:
      return initialState;

    default:
      return state;
  }
}
