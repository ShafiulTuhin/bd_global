import Services from "./Services";
import { io, /* Socket */ } from "socket.io-client";

/**
 * Class of all Group services
 * @class
 */
export default class ChatService extends Services {
  constructor(init) {
    super(init);
    this._name = "CHAT";
    return this;
  }
  // FIND --------------------------------------------------------------------------
  /**
   * @function find
   * @returns
   */
  find = async (params) => {
    return await this.decorate(
      async () =>
        await this.axios(`chat`, {
          method: "GET",
          params,
        })
    );
  };
  findByID = async (id, params) => {
    return await this.decorate(
      async () =>
        await this.axios(`chat/${id}`, {
          method: "GET",
          params,
        })
    );
  };
  // UPDATE ---------------------------------------------------------------------

  updateByID = async (id, data) => {
    return await this.decorate(
      async () =>
        await this.axios(`chat/${id}`, {
          method: "PUT",
          data,
        })
    );
  };
  // REMOVE ---------------------------------------------------------------------

  removeByID = async (id, data) => {
    return await this.decorate(
      async () =>
        await this.axios(`chat/${id}`, {
          method: "DELETE",
          data,
        })
    );
  };

  remove = async (data) => {
    return await this.decorate(
      async () =>
        await this.axios(`chat`, {
          method: "DELETE",
          data,
        })
    );
  };
  // CREATE ---------------------------------------------------------------------
  /**
   * @function create
   * @param {Object} data
   * @returns
   */
  create = async (data) => {
    return await this.decorate(
      async () =>
        await this.axios(`chat`, {
          method: "POST",
          data,
        })
    );
  };
  /**
   * @param {Object} args
   * @param {String} args.url
   * @param {Object} args.params
   * @returns {Socket}
   */
  authorizeSocket = (args = {}) => {

    let token = this.getToken()

      const { params } = args;

      const socket = io({
        extraHeaders: {
          authorization: token,
        },
        params,
      });
  
      return socket;
    
  };
}
