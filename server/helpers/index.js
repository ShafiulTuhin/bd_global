"use strict";
const Sequelize = require("sequelize");
const { Op } = require("sequelize");
const searchBuilder = require("sequelize-search-builder");
const sequelizeQueryFilter = require("@galenjs/sequelize-query-filter");
const { JWT_SCOPES } = require("../constants");
const path = require("path");
const ejs = require("ejs");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const Jwt = require("@hapi/jwt");
const assert = require("assert");
const { nanoid } = require("nanoid");
const glob = require("glob");
const util = require("util");
const permissions = require("../permissions");
const isDev = process.env.NODE_ENV || "development";

const {
  PORT,
  HOSTNAME,
  HTTP_PROTOCOL,
  SMTP_USER,
  SMTP_PASS,
  SMTP_PORT,
  SMTP_HOST,
  SMTP_SECURE,
  SECRET_KEY,
  BASE_URL,
  TATUM_API_KEY,
  COIN_MARKETCAP_API,
  MAIL_FROM_ADDRESS,
  MAIL_POOL,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
} = process.env;
/****************************************************
 * Validate the required configuration information
 ****************************************************/
assert(SMTP_USER, "SMTP_USER env configuration is required.");
assert(SMTP_HOST, "SMTP_HOST env configuration is required.");
assert(SECRET_KEY, "SECRET_KEY env configuration is required.");
assert(PORT, "PORT env configuration is required.");
assert(HOSTNAME, "HOSTNAME env configuration is required.");

/****************************************************
 * JWT helpers
 ****************************************************/
const JWTHelpers = () => {
  /**
   *
   * @param {Object} decodedToken
   * @param {Object} options
   * @param {String} secret
   * @returns
   */
  async function verifyDecodedToken(
    decodedToken,
    options = JWT_SCOPES.authUser,
    secret = SECRET_KEY
  ) {
    try {
      Jwt.token.verify(decodedToken, secret, options);

      return {
        isValid: true,
        decoded: decodedToken.decoded,
      };
    } catch (err) {
      return {
        isValid: false,
        error: err,
      };
    }
  }

  return {
    config: {
      keys: SECRET_KEY,
      verify: false,
      validate: async (artifacts, request) => {
        const {
          server: {
            app: { db },
          },
        } = request;

        let {
          decoded: {
            payload: { user_id, iss },
          },
        } = artifacts;

        if (iss !== JWT_SCOPES?.authUser.iss) return { isValid: false };

        let user =
          user_id && (await db.User.findOne({ where: { id: user_id } }));
        return { isValid: Boolean(user), credentials: { user } };
      },
    },
    verifyDecodedToken,
    decodeAndVerifyToken(token, options, secret) {
      let decodedToken = Jwt.token.decode(token);
      return verifyDecodedToken(decodedToken, options, secret);
    },

    /***********************************************
     * Gets the JWT token from a Hapi request object
     ***********************************************/
    token: (req) => {
      const {
        auth: { token },
      } = req;
      return token;
    },
    /***********************************************
     * Gets user from decoded JWT token
     ***********************************************/
    decodeUser: async (req) => {
      const {
        auth: {
          artifacts: {
            decoded: {
              payload: { user_id },
            },
          },
        },
      } = req;

      return user;
    },
    /**
     *
     * @param {User} user_id
     * @param {Object} [options]
     * @param {Number} options.expires
     * @param {String | JWT_SCOPES?.AUTH_USER} scope
     * @param {String} [secret]
     * @returns
     */
    create(
      user_id,
      scope = JWT_SCOPES?.authUser,
      options = {},
      secret = SECRET_KEY
    ) {
      // Sign the JWT
      return Jwt.token.generate({ user_id, ...scope }, secret, options);
    },
  };
};

/********************************************************
 * Google OAuth
 *******************************************************/
const GoogleOAuthHelpers = () => {
  return {
    config: {
      provider: "google",
      password: SECRET_KEY,
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      isSecure: isDev ? false : true,
      // protocol: "oauth",
      // isSameSite: 'Lax', //Or Strict
      // skipProfile: true //Skips retrieving user profile from provider,
      // forceHttps: true,
    },
  };
};
/********************************************************
 * Server config
 *******************************************************/
const config = {
  hostname: HOSTNAME,
  port: PORT,
  server_url: `${HTTP_PROTOCOL || "http"}://${HOSTNAME}:${PORT}`,
  base_url: BASE_URL || `${HTTP_PROTOCOL || "http"}://${HOSTNAME}:3000`,
  secret: SECRET_KEY,
  jwt: JWTHelpers().config,
  googleOAuth: GoogleOAuthHelpers().config,
  tatum_api_key: TATUM_API_KEY,
  coin_market_cap_api_key: COIN_MARKETCAP_API,
};

/****************************************************
 * Mailer helpers
 *****************************************************/
const MailerHelpers = () => {
  /********************************************************
   * Generates emailTemplates file content mapping object
   * *****************************************************/
  const templateDir = "templates/email";
  const mailerTemplates = {};
  const cwd = path.join(__dirname, "../");
  const defaultSender = MAIL_FROM_ADDRESS || "Cointc <noreply@cointc.com>";

  // get all email templates from the template directory
  let files = glob.sync(`**/*.ejs`, {
    root: cwd,
  });
  
  // let files = glob.sync(`${templateDir}/*.ejs`, {
  //   root: cwd,
  // });

  // Map each file name as key and the content of the file as the value
  // in the email template object
  files.forEach((file) => {
    mailerTemplates[String(path.parse(file).name.toLowerCase())] = path.join(
      cwd,
      file
    );
    /* mailerTemplates[
      String(path.parse(file).name.toLowerCase())
    ] = fs.readFileSync(path.join(cwd, file), { encoding: "utf-8" }); */
  });
  /********************************************************
   * Checks if email template exist
   * *****************************************************/
  function hasEmailTemplate(name) {
    if (!name || !mailerTemplates[name])
      throw new Error(`Email template: ${name} not found or undefined!`);
    return mailerTemplates[name];
  }

  /*************************************
   * Maps email templates literals to specified transform mapping
   *************************************/
  /**
   * @function mailTemplateTransformer
   * @describe - Locate email templates from the template dir and render with transforms
   * @param {Object} options
   * @param {String} options.text
   * @param {String} options.html
   * @param {String} options.to
   * @param {String} options.from
   * @param {String} options.subject
   * @param {Object} options.transforms
   * @param {Object} options.opts
   * @returns
   */
  function mailTemplateTransformer(options) {
    // Transforms have a key value pair replacement for text in the email template
    // ejs data param
    const defaultTransforms = {
      companyName: "Cointc",
      websiteAddress: "https://www.cointc.com",
      companyAddress: "...",
      companyWebSupport: `https://www.cointc.com/support`,
    };
    // default ejs options
    const defaultOpts = {
      views: [path.resolve(cwd)],
      root: [path.resolve(cwd)],
      // debug: true,
    };

    let {
      text,
      template,
      html,
      to,
      from = defaultSender,
      transforms,
      opts,
      subject,
    } = options;

    const _data = {
      ...defaultTransforms,
      ...transforms,
    };
    const _options = { ...defaultOpts, ...opts };
    // render html template using transforms
    if (template)
      ejs.renderFile(
        hasEmailTemplate(template),
        _data,
        _options,
        (err, result) => {
          if (!err) {
            html = result;
            text = encodeURI(html);
            // console.log(result);
          } else console.error(err);
        }
      );

    return {
      from,
      to,
      subject,
      text,
      html,
    };
  }

  return {
    /****************************************************
     * Setup mailer
     ****************************************************/
    setupMailer: async () => {
      try {
        // Use nodemailer test config if in development and SMTP config doesn't exit
        let testHost = "",
          testPort = "",
          testSecure = "",
          testUser = "",
          testPass = "";

        if (!(SMTP_USER && SMTP_PASS) && isDev) {
          let testAccount = await nodemailer.createTestAccount();
          const {
            user,
            pass,
            smtp: { host, port, secure },
          } = testAccount;
          testUser = user;
          testPass = pass;
          testHost = host;
          testPort = port;
          testSecure = secure;
        }
        // setup email transport config
        const mailerOptions = {
          host: SMTP_HOST || testHost,
          port: SMTP_PORT || testPort,
          pool: MAIL_POOL || false,
          auth: {
            user: SMTP_USER || testUser,
            pass: SMTP_PASS || testPass,
          },
          tls: {
            secure: SMTP_SECURE || testSecure,
            requireTLS: true,
          },
        };
        // Set the default mail sender information
        let transporter = nodemailer.createTransport(mailerOptions, {
          from: defaultSender,
        });

        // Verify SMTP connection configuration
        /*  transporter.verify(function(error, success) {
          if (error) {
            console.error(`Mail verification`, error);
          } else {
            console.log("Mailer is ready!");
          }
        }); */

        // Return config and mail helpers
        return {
          sendMail: async (options, cb) => {
            // Send mail
            return await transporter.sendMail(
              mailTemplateTransformer(options),
              cb
            );
          },
          mailerOptions,
          mailerTemplates,
        };
      } catch (err) {
        console.error(`MailError: ${err}`);
      }
    },
  };
};

const generator = {
  referralCode(email) {
    let username = email.split("@")[0];
    let uuid = "";

    for (let i = 0; i < 4; ++i) {
      uuid += username[Math.floor(Math.random() * username.length)];
    }
    return uuid + nanoid(4);
  },
  otp(max = 6) {
    var digits = "0123456789";
    let otp = "";

    for (let i = 0; i < max; i++) {
      otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
  },
  password(len = 8) {
    var chars =
      "ABCDEFGHIJKLMNOPGRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_@$#!~";
    let secret = "";
    for (let i = 0; i < len; i++) {
      secret += chars[Math.floor(Math.random() * chars.length)];
    }
    return secret;
  },
  keypair(passphrase, cb) {
    const { generateKeyPair } = require("crypto");

    return util.promisify(() =>
      generateKeyPair(
        "rsa",
        {
          modulusLength: 4096,
          publicKeyEncoding: {
            type: "spki",
            format: "pem",
          },
          privateKeyEncoding: {
            type: "pkcs8",
            format: "pem",
            cipher: "aes-256-cbc",
            passphrase,
          },
        },
        cb
      )
    );
  },
};

module.exports = {
  config,
  GoogleOAuth: GoogleOAuthHelpers(),
  jwt: JWTHelpers(),
  mailer: MailerHelpers(),

  // wallets: wallets,
  /****************************************************
   * Generates private/public key pair
   ****************************************************/
  async generateKeyPair(passphrase, cb) {
    const { generateKeyPair } = require("crypto");

    return util.promisify(() =>
      generateKeyPair(
        "rsa",
        {
          modulusLength: 4096,
          publicKeyEncoding: {
            type: "spki",
            format: "pem",
          },
          privateKeyEncoding: {
            type: "pkcs8",
            format: "pem",
            cipher: "aes-256-cbc",
            passphrase,
          },
        },
        cb
      )
    );
  },

  /****************************************************
   * Text encryption
   ****************************************************/
  encrypt: async (text) => {
    try {
      assert(text, "text is required");
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(text, salt);
      return hash;
    } catch (err) {
      console.error(err);
    }
  },
  /***********************************************
   * Checks if hash is text
   ***********************************************/
  decrypt: async (text, hash) => {
    try {
      assert(text, "text is required");
      assert(hash, "hash is required");
      return await bcrypt.compare(text, hash);
    } catch (err) {
      console.error(err);
    }
  },

  generator,
  permissions,
  // objectToHex(obj) {
  //   return Buffer.from(JSON.stringify(obj)).toString("hex");
  // },

  // hexToObject(hex) {
  //   return JSON.parse(Buffer.from(hex, "hex"));
  // },

  /*  sluggify: (text) => {
    return text.toLowerCase();
  },

  /***********************************************
   * function helps to convert params to sequlize where clauses
   ***********************************************/
  /**
   *
   * @param {Object} queryObject
   * @param {Object} queryObject.query
   * @param {Object} queryObject.extras
   * @param {String[]} queryObject.searchFields
   * @returns {Object}
   */
  filters: async (queryObject) => {
    const sequelize = require("../database/models");
    let { query = {}, searchFields = [], extras = {} } = queryObject;
    // PARANOID FILTER
    const paranoid = query?.paranoid
      ? Boolean(JSON.parse(query?.paranoid))
      : true;
    delete query.include;
    delete query.sudo;
    delete query.fake;
    delete query.paranoid;
    // Handle search queries
    const q = query.q || undefined; //For search
    let searchQuery, extraWhere;

    q &&
      searchFields.forEach((key) => {
        searchQuery = {
          ...searchQuery,
          [key]: {
            [Op.iLike]: `%${q}%`,
          },
        };
      }) &&
      (extraWhere = {
        [Op.or]: searchQuery,
      });
    // END

    // convert filters to use where
    query = Object.assign({ limit: 10, offset: 0, ...query });

    try {
      let queryBuilder = sequelizeQueryFilter(query, sequelize);
      queryBuilder.where = {
        ...queryBuilder.where,
        ...extraWhere,
        ...extras,
        ...searchQuery,
      };

      if (!Object.values(queryBuilder?.where).length) delete queryBuilder.where;
      // delete queryBuilder.where;
      delete queryBuilder.subQuery;
      /* const search = new searchBuilder(Sequelize, queryBuilder).setConfig({
          "default-limit": 10,
          logging: true,
        }),
        where = search.getWhereQuery(),
        order = search.getOrderQuery(),
        limit = search.getLimitQuery(),
        offset = search.getOffsetQuery();
 */
      return {
        ...queryBuilder,
        /* where,
        order,
        limit,
        offset, */
        paranoid,
      };
    } catch (err) {
      console.error(err);
      return {};
    }
  },
  /**
   *
   * @param {Promise} queryset - return of findAllAndCount
   * @param {Number} limit -
   * @param {Number} offset
   * @returns {Promise}
   */
  paginator: ({ queryset, limit, offset } = { limit: 10, offset: 0 }) => {
    const { rows: result, count, ...meta } = queryset;
    let next, prev;

    if (offset) {
      prev = {
        offset: offset - limit,
      };
    } else {
      prev = null;
    }

    if (offset + limit < count) {
      next = {
        offset: offset + limit,
      };
    } else {
      next = { offset: count - offset };
    }

    return {
      count,
      ...meta,
      next,
      prev,
      offset,
      limit,
      result,
    };
  },
  /**
   * @function validateAndFilterAssociation - Validates and filter allowed reference model associations from a model
   * @param {Array} include - List of models to validate
   * @param {Array} allow - Allowed models
   * @param {Object} Model - Model to get association from
   * @returns
   */
  validateAndFilterAssociation(include = [], allow = [], Model) {
    if (!Array.isArray(include)) include = [include];
    let valid = [];

    include.forEach((item) => {
      let model = String(item);
      // if (typeof (item) === 'object' && item?.model) model = String(item?.model);

      if (Model) {
        let asscNames = Object.keys(Model.associations);
        let name = asscNames.find(
          (name) => String(name)?.toLowerCase() === model?.toLowerCase()
        );
        if (allow.includes(name?.toLowerCase()))
          valid.push({
            association: name,
            duplicating: true,
          });
      }
    });
    return valid;
  },
};
/* 
function renameKey(Obj, from = [], to = []) {
  from.forEach((key, idx) => {
    if (key in Obj) {
      let temp = Obj[key];
      delete Obj[key];
      Obj[to[idx]] = temp;
    }
  });
  return Obj;
} */

// const uppercaseFirst = (str) => `${str[0].toUpperCase()}${str.substr(1)}`;
