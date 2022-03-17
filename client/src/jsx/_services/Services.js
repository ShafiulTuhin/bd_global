import axios from "axios";
import Qs from "qs";
import helpers from "../_helpers";

export default class Services {
  constructor(init) {
    this._name = "ROOT";
    this.token = init?.token;
    this.baseURL = init?.baseURL;
    this.timeout = init?.timeout || 100000;
    this.endSession = init?.logout;
    this._initializer = init;
    this.headers = this.token && helpers.headers(init?.token);
    this.isFetching = false;
    // axios global config
    this.axiosConfig = {
      headers: this?.headers,
      baseURL: this?.baseURL,
      timeout: this?.timeout,
      paramsSerializer: function (params) {
        return Qs.stringify(params, { arrayFormat: "brackets" });
      },
    };
    this.setupAxios();

    this.decoratorMessage = `${this._name}::SERVICE ERROR`;

    return this;
  }

  setupAxios() {
    this.source = axios.CancelToken.source();
    this.axios = axios.create({
      ...this.axiosConfig,
      cancelToken: this.source.token,
    });
  }

  // ================ OUR TOKEN AND HEADER ===============
  getHeaders = () => this.headers;
  getToken = () => this.token;

  /**
   * @method
   * @param {String | "request has been canceled"} message
   * @returns {String}
   */
  abort = (message = "Request cancelled. Reload page") => {
    this.source.cancel(message.toString());
    this.setupAxios();
  };

  setDecoratorMessage(message) {
    this.decoratorMessage = message;
  }

  /**
   * @method - Request handler decorator
   * @param {Function} request - Request Callback
   * @returns
   */
  decorate = async function (request) {
    let result = { message: "", data: null, error: null, networkError: false };
    this.isFetching = true;
    try {
      let response = await request();
      // console.log({ response });
      let { data } = response;
      return { ...result, data };
    } catch (error) {
      let resp = {};
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        // console.log(error.response.data);
        // console.log({'response Error':error.response})
        if (error.response.status === 401) {
          this.endSession(true);
        }
        resp = { message: "Error in  response", ...error.response.data };
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        // console.log(error.request);
        resp = {
          message: "Encountered network error!",
          ...error.request.data,
          networkError: true,
        };
      }
      return { ...result, error: resp };
      // console.log(error.config);
      // console.log(error.toJSON());
    } finally {
      this.isFetching = false;
    }
  };
}
