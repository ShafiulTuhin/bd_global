import { useState /*  useEffect */ } from "react";
/**
 * @description - Specify the services to your component will be using. Usually (get, post, put and delete) request
 * @typedef {Object} Services
 * @property {Function} get  - get service
 * @property {Function} post  - post service
 * @property {Function} put  - put service
 * @property {Function} drop  - drop/delete service
 * @returns
 */

/**
 * @function useService - Component request services hook
 * @param {Services} services
 * @param {Object} initialPayload - Initial service payload
 * @param {Object | {getImmediate = false}} options - service hook options
 * @returns
 */
function useService(config = {}, toast) {
  const [services /* , setServices */] = useState(config);
  const [_fromStack, _toStack] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [_toast, setToast] = useState(toast);

  /**
   * @function handleResponse
   * @param {Object} response
   * @param {Boolean} save
   * @param {Object} toast
   * @param {Function} toast.success
   * @param {Function} toast.error
   * @returns
   */
  async function handleResponse({ response, save = true, toast = false }) {
    let { message, data, error } = response;
    // debugger;
    if (error) {
      setError(error);
      toast && message && _toast?.error(message) && _toast?.error(message);
    } else {
      if (save) {
        setData(data);
      }
      toast && message && _toast?.success && _toast?.success(message);
    }
    return response;
  }

  /**
   * @function dispatchRequest - request dispatcher
   * @param {Object} request
   * @param {String} request.type - Type of request [GET, POST, PUT, DELETE]
   * @param {Object} request.payload - Request payload
   * @returns
   */
  async function dispatchRequest(request, save = false) {
    try {
      const { type, payload = null, toast = _toast || false } = request;

      setIsFetching(true);

      toast && setToast(toast);

      let lowercased = String(type)?.toLowerCase();
      let response = { error: new Error("Response has error") };

      let fn = () => {
        throw new Error(
          `<${lowercased}> service does not exist!\nThe value of < ${lowercased} > is < ${services[lowercased]} >`
        );
      };

      if (lowercased in services) {
        fn = services[lowercased]
          ? payload
            ? async () => services[lowercased](payload)
            : async () => services[lowercased]()
          : fn();
      }
      response = await fn();
      // Save to the stack
      _toStack((state) => ({
        ...state,
        [lowercased]: request,
      }));
      return handleResponse({ response, save: true, toast: false });
    } catch (error) {
      console.error(error);
    } finally {
      setIsFetching(false);
    }
  }
  /**
   * @function retryDispatch - Retry previous request using a new or the previous payload
   * @param {Object} payload
   * @returns
   */
  const retryDispatch = (type, payload) => {
    if (!type) {
      console.warn(`Must specify dispatch type to perform retry operation`);
      return;
    }
    let lowercased = String(type)?.toLowerCase();
    if (_fromStack[lowercased]) {
      payload = (payload ?? _fromStack[lowercased].payload) || null;
      let requestObj = { type, ..._fromStack[lowercased], payload };
      return dispatchRequest(requestObj);
    }
    console.error(`service type ${String(type)} does not exist`);
    return null;
  };

  return {
    data,
    error,
    isFetching,
    serviceMap: services,
    retryDispatch,
    dispatchRequest,
    _fromStack,
  };
}

useService.displayName = "useServiceHook";
export default useService;
