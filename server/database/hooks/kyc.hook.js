"use strict";

module.exports = {
  async afterFind(findResult, options) {
    const { duplicating } = options;
    if (!findResult) return;
    if (!Array.isArray(findResult)) findResult = [findResult];

    for (const instance of findResult) {
      if (instance instanceof this) {
        let user;
        if (!duplicating) {
          user = await instance?.getUser();
        }
        instance.dataValues = {
          ...instance.dataValues,
          ...(!duplicating && { user: user?.dataValues }),
        };
      }
    }
  },
};
