import _constants from "../_constants";
const { SERVICE } = _constants;
const initialState = { type: null, with: null };

export default request;

function request(state = initialState, { data = null, type }) {
  switch (type) {
    case SERVICE.SET: {
      return {
        data,
        type,
      };
    }
    case SERVICE.UNSET:
      return initialState;

    default:
      return state;
  }
}
