import _constants from "../_constants";

const { NOTICE } = _constants;

const initialState = {
  message: null,
  type: null
};

export default function userReducer(state = initialState, action) {
  switch (action.type) {
    case NOTICE.ERROR:{
      return {
        ...state,
        message: action.data,
        type: 'danger'
      };
    }
    case NOTICE.WARN:{
      return {
        ...state,
        message: action.data,
        type: 'warning'
      };
    }
    case NOTICE.INFO:{
      return {
        ...state,
        message: action.data,
        type: 'info'
      };
    }
    case NOTICE.SUCCESS: {
      return {
        ...state,
        message: action.data,
        type: 'success'
      };
    }
    case NOTICE.CLEAR:
      return initialState;

    default:
      return state;
  }
}
