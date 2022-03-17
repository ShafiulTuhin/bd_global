import _constants, { SERVICE } from "../_constants";
import _services from "../_services";
import _helpers from "../_helpers";

export default {
  save(data) {
    return (dispatch) => {
      dispatch({ type: SERVICE.SET, data });
    };
  },
};
