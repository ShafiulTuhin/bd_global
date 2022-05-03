import _constants from "../_constants";

const { SESSION, REQUEST } = _constants;
// let user = JSON.parse(localStorage.getItem("user")) || null;

const initialState = {
  user: null
};

export default function userReducer(state = initialState, action) {
  switch (action.type) {
    case SESSION.REGISTER:
      return {
        ...state,
        user: action.data,
      };

    case REQUEST.USER_UPDATE: {
      const update = {
        ...state,
        user: {
          ...state?.user,
          UPDATE: { ...action.data },
        },
      };
      // console.log({ update, state });
      return update;
    }

    case SESSION.LOGIN:
      return {
        ...state,
        user: action.data,
      };
    

    case SESSION.LOGOUT:
      return initialState;

    default:
      return state;
  }
}
