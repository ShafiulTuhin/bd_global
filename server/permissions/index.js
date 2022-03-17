const boom = require("@hapi/boom");

module.exports = {
  /**
   * @function isUser - Check user constraints
   * @param {Request} req
   * @returns {Boolean}
   */
  isUser: async (req) => {
    const {
      auth: { credentials },
    } = req;
    return getQueryConstraints(req) 
  },

  /**
   * @function isAdminOrError - return true if is admin or throw an error
   * @param {Request} req
   * @returns {Boolean}
   */
  isAdminOrError: async (req) => {    
    let {user, fake} = getQueryConstraints(req);
    if (user?.access_level >= 2) return { user, fake, sudo: true };
    throw boom.forbidden("You are not authorized to use this route!");
  },

  /**
   * @function isSuperAdminOrError - return true if user is super-admin or throw an error
   * @param {Object} req - Request Object
   * @returns
   */
  isSuperAdminOrError: async (req) => {
    let {user, sudo, fake} = getQueryConstraints(req);
    if (user?.access_level >= 3)
      return {
        user,
        fake,
        sudo: true,
      };
    throw boom.forbidden("YOu are not authorized to use this route!");
  },
};

function getQueryConstraints(req) {
  const {
    auth: { credentials },
    query,
  } = req;
  const user = credentials && credentials?.user;

  let sudo = query?.sudo && Boolean(JSON.parse(query.sudo)),
    fake = query?.fake && Boolean(JSON.parse(query.fake));

  sudo = sudo && user?.access_level > 1 ? true : false;
  fake = fake ?? false;

  return {
    user,
    sudo,
    fake,
  };
}
